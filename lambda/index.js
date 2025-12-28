// Support Centre API - Lambda Handler
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
    DynamoDBDocumentClient, 
    GetCommand, 
    PutCommand, 
    UpdateCommand, 
    QueryCommand,
    ScanCommand 
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE;
const COMMENTS_TABLE = process.env.COMMENTS_TABLE;
const INTERACTIONS_TABLE = process.env.INTERACTIONS_TABLE;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Visitor-Id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const { httpMethod, routeKey } = event.requestContext || {};
    const method = httpMethod || routeKey?.split(' ')[0];
    const path = event.rawPath || event.path || '';
    const pathParams = event.pathParameters || {};
    const visitorId = event.headers?.['x-visitor-id'] || event.headers?.['X-Visitor-Id'] || 'anonymous';
    
    try {
        // Route handling
        if (path.startsWith('/feedback') && !path.includes('/vote')) {
            if (pathParams.resourceId) {
                // GET /feedback/{resourceId}
                return await getFeedback(pathParams.resourceId, visitorId);
            } else {
                // GET /feedback - get all feedback
                return await getAllFeedback();
            }
        }
        
        if (path.includes('/vote') && method === 'POST') {
            // POST /feedback/{resourceId}/vote
            const body = JSON.parse(event.body || '{}');
            return await submitVote(pathParams.resourceId, visitorId, body.vote);
        }
        
        if (path.startsWith('/comments')) {
            if (method === 'GET') {
                // GET /comments/{resourceId}
                return await getComments(pathParams.resourceId);
            }
            if (method === 'POST') {
                // POST /comments/{resourceId}
                const body = JSON.parse(event.body || '{}');
                return await addComment(pathParams.resourceId, visitorId, body.text);
            }
        }
        
        return response(404, { error: 'Not found' });
        
    } catch (error) {
        console.error('Error:', error);
        return response(500, { error: 'Internal server error', message: error.message });
    }
};

// Get feedback for a resource
async function getFeedback(resourceId, visitorId) {
    // Get feedback counts
    const feedbackResult = await dynamodb.send(new GetCommand({
        TableName: FEEDBACK_TABLE,
        Key: { resourceId }
    }));
    
    // Get user's vote
    const interactionResult = await dynamodb.send(new GetCommand({
        TableName: INTERACTIONS_TABLE,
        Key: { visitorId, resourceId }
    }));
    
    // Get comment count
    const commentsResult = await dynamodb.send(new QueryCommand({
        TableName: COMMENTS_TABLE,
        KeyConditionExpression: 'resourceId = :rid',
        ExpressionAttributeValues: { ':rid': resourceId },
        Select: 'COUNT'
    }));
    
    const feedback = feedbackResult.Item || { likes: 0, dislikes: 0 };
    const userVote = interactionResult.Item?.vote || null;
    const commentCount = commentsResult.Count || 0;
    
    return response(200, {
        resourceId,
        likes: feedback.likes || 0,
        dislikes: feedback.dislikes || 0,
        userVote,
        commentCount
    });
}

// Get all feedback (for initial page load)
async function getAllFeedback() {
    const result = await dynamodb.send(new ScanCommand({
        TableName: FEEDBACK_TABLE
    }));
    
    const feedbackMap = {};
    (result.Items || []).forEach(item => {
        feedbackMap[item.resourceId] = {
            likes: item.likes || 0,
            dislikes: item.dislikes || 0
        };
    });
    
    // Get comment counts
    const commentsResult = await dynamodb.send(new ScanCommand({
        TableName: COMMENTS_TABLE,
        ProjectionExpression: 'resourceId'
    }));
    
    const commentCounts = {};
    (commentsResult.Items || []).forEach(item => {
        commentCounts[item.resourceId] = (commentCounts[item.resourceId] || 0) + 1;
    });
    
    // Merge comment counts
    Object.keys(commentCounts).forEach(resourceId => {
        if (!feedbackMap[resourceId]) {
            feedbackMap[resourceId] = { likes: 0, dislikes: 0 };
        }
        feedbackMap[resourceId].commentCount = commentCounts[resourceId];
    });
    
    return response(200, { feedback: feedbackMap });
}

// Submit a vote
async function submitVote(resourceId, visitorId, vote) {
    if (!['like', 'dislike', null].includes(vote)) {
        return response(400, { error: 'Invalid vote. Must be "like", "dislike", or null' });
    }
    
    // Get existing user interaction
    const existingInteraction = await dynamodb.send(new GetCommand({
        TableName: INTERACTIONS_TABLE,
        Key: { visitorId, resourceId }
    }));
    
    const previousVote = existingInteraction.Item?.vote || null;
    
    // If same vote, toggle off
    const newVote = previousVote === vote ? null : vote;
    
    // Update interaction record
    if (newVote) {
        await dynamodb.send(new PutCommand({
            TableName: INTERACTIONS_TABLE,
            Item: {
                visitorId,
                resourceId,
                vote: newVote,
                timestamp: new Date().toISOString(),
                expiresAt: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
            }
        }));
    } else {
        // Remove interaction if vote is null
        await dynamodb.send(new PutCommand({
            TableName: INTERACTIONS_TABLE,
            Item: {
                visitorId,
                resourceId,
                vote: null,
                timestamp: new Date().toISOString(),
                expiresAt: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
            }
        }));
    }
    
    // Calculate delta for feedback counts
    let likeDelta = 0;
    let dislikeDelta = 0;
    
    if (previousVote === 'like') likeDelta--;
    if (previousVote === 'dislike') dislikeDelta--;
    if (newVote === 'like') likeDelta++;
    if (newVote === 'dislike') dislikeDelta++;
    
    // Update feedback counts
    if (likeDelta !== 0 || dislikeDelta !== 0) {
        try {
            await dynamodb.send(new UpdateCommand({
                TableName: FEEDBACK_TABLE,
                Key: { resourceId },
                UpdateExpression: 'SET likes = if_not_exists(likes, :zero) + :likeDelta, dislikes = if_not_exists(dislikes, :zero) + :dislikeDelta, updatedAt = :now',
                ExpressionAttributeValues: {
                    ':likeDelta': likeDelta,
                    ':dislikeDelta': dislikeDelta,
                    ':zero': 0,
                    ':now': new Date().toISOString()
                }
            }));
        } catch (err) {
            // If item doesn't exist, create it
            await dynamodb.send(new PutCommand({
                TableName: FEEDBACK_TABLE,
                Item: {
                    resourceId,
                    likes: newVote === 'like' ? 1 : 0,
                    dislikes: newVote === 'dislike' ? 1 : 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            }));
        }
    }
    
    // Return updated feedback
    return getFeedback(resourceId, visitorId);
}

// Get comments for a resource
async function getComments(resourceId) {
    const result = await dynamodb.send(new QueryCommand({
        TableName: COMMENTS_TABLE,
        KeyConditionExpression: 'resourceId = :rid',
        ExpressionAttributeValues: { ':rid': resourceId },
        ScanIndexForward: false // newest first
    }));
    
    const comments = (result.Items || []).map(item => ({
        id: item.commentId,
        text: item.text,
        timestamp: item.timestamp,
        helpful: item.helpful || 0
    }));
    
    return response(200, { resourceId, comments });
}

// Add a comment
async function addComment(resourceId, visitorId, text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return response(400, { error: 'Comment text is required' });
    }
    
    if (text.length > 500) {
        return response(400, { error: 'Comment must be 500 characters or less' });
    }
    
    // Basic content moderation - filter obvious profanity/spam
    const sanitizedText = text.trim();
    
    const commentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const comment = {
        resourceId,
        commentId,
        text: sanitizedText,
        visitorId: hashVisitorId(visitorId), // Store hashed for privacy
        timestamp: new Date().toISOString(),
        helpful: 0
    };
    
    await dynamodb.send(new PutCommand({
        TableName: COMMENTS_TABLE,
        Item: comment
    }));
    
    return response(201, {
        id: commentId,
        text: sanitizedText,
        timestamp: comment.timestamp,
        helpful: 0
    });
}

// Simple hash function for visitor ID privacy
function hashVisitorId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Response helper
function response(statusCode, body) {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(body)
    };
}
