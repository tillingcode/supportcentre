# Support Centre API Documentation

This document describes the REST API endpoints for the Support Centre website.

## Base URL

```
https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com
```

## Authentication

The API uses anonymous visitor tracking via the `X-Visitor-Id` header. This ID is automatically generated and stored in the browser to track individual user votes.

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` for POST requests |
| `X-Visitor-Id` | Recommended | Anonymous visitor ID for vote tracking |

---

## Endpoints

### Feedback

#### Get All Feedback

Retrieves feedback data for all resources.

```http
GET /feedback
```

**Response:**

```json
{
  "feedback": {
    "mind-org": {
      "resourceId": "mind-org",
      "likes": 15,
      "dislikes": 2,
      "commentCount": 5
    },
    "samaritans": {
      "resourceId": "samaritans",
      "likes": 23,
      "dislikes": 0,
      "commentCount": 8
    }
  }
}
```

---

#### Get Resource Feedback

Retrieves feedback for a specific resource.

```http
GET /feedback/{resourceId}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `resourceId` | string | URL-encoded resource identifier |

**Response:**

```json
{
  "resourceId": "mind-org",
  "likes": 15,
  "dislikes": 2,
  "userVote": "like",
  "commentCount": 5
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `resourceId` | string | The resource identifier |
| `likes` | number | Total number of likes |
| `dislikes` | number | Total number of dislikes |
| `userVote` | string\|null | Current user's vote (`"like"`, `"dislike"`, or `null`) |
| `commentCount` | number | Number of comments on this resource |

---

#### Submit Vote

Submit a like or dislike vote for a resource.

```http
POST /feedback/{resourceId}/vote
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `resourceId` | string | URL-encoded resource identifier |

**Request Body:**

```json
{
  "vote": "like"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vote` | string | Yes | Vote type: `"like"` or `"dislike"` |

**Response:**

```json
{
  "resourceId": "mind-org",
  "likes": 16,
  "dislikes": 2,
  "userVote": "like",
  "commentCount": 5
}
```

**Behavior:**

- If the user hasn't voted, their vote is recorded
- If the user votes the same way again, their vote is removed (toggle)
- If the user votes differently, their previous vote is removed and new vote is recorded

---

### Comments

#### Get Comments

Retrieves all comments for a specific resource.

```http
GET /comments/{resourceId}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `resourceId` | string | URL-encoded resource identifier |

**Response:**

```json
{
  "resourceId": "mind-org",
  "comments": [
    {
      "commentId": "1703548800000-abc123",
      "text": "This resource really helped me understand my situation.",
      "timestamp": "2025-12-26T12:00:00.000Z",
      "helpful": 3
    },
    {
      "commentId": "1703462400000-def456",
      "text": "Very informative and supportive.",
      "timestamp": "2025-12-25T12:00:00.000Z",
      "helpful": 5
    }
  ]
}
```

**Comment Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `commentId` | string | Unique comment identifier |
| `text` | string | Comment text content |
| `timestamp` | string | ISO 8601 timestamp |
| `helpful` | number | Number of "helpful" votes |

---

#### Add Comment

Add a new anonymous comment to a resource.

```http
POST /comments/{resourceId}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `resourceId` | string | URL-encoded resource identifier |

**Request Body:**

```json
{
  "text": "This resource was very helpful for understanding my options."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Comment text (max 500 characters) |

**Response:**

```json
{
  "id": "1703548800000-abc123",
  "text": "This resource was very helpful for understanding my options.",
  "timestamp": "2025-12-26T12:00:00.000Z",
  "helpful": 0
}
```

---

## Error Responses

All endpoints return standard HTTP status codes.

### Error Format

```json
{
  "error": "Error message description"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource or endpoint not found |
| 500 | Internal Server Error |

### Example Error Response

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid vote value. Must be 'like' or 'dislike'"
}
```

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for the following origins:

- `https://lifechanged.click`
- `https://www.lifechanged.click`
- `http://localhost:8080`

### CORS Headers

```http
Access-Control-Allow-Origin: https://lifechanged.click
Access-Control-Allow-Headers: Content-Type, X-Visitor-Id
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## Rate Limiting

Currently, there are no rate limits applied. This may change in the future based on usage patterns.

---

## Examples

### cURL Examples

**Get all feedback:**
```bash
curl https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/feedback
```

**Submit a like vote:**
```bash
curl -X POST \
  https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/feedback/mind-org/vote \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Id: visitor-123" \
  -d '{"vote": "like"}'
```

**Get comments:**
```bash
curl https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/comments/mind-org
```

**Add a comment:**
```bash
curl -X POST \
  https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/comments/mind-org \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Id: visitor-123" \
  -d '{"text": "This was very helpful!"}'
```

### JavaScript Examples

**Fetch with async/await:**
```javascript
// Get feedback
const response = await fetch('https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/feedback/mind-org');
const data = await response.json();
console.log(data);

// Submit vote
const voteResponse = await fetch('https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/feedback/mind-org/vote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Visitor-Id': 'visitor-123'
  },
  body: JSON.stringify({ vote: 'like' })
});
const voteData = await voteResponse.json();
console.log(voteData);
```

### PowerShell Examples

**Get all feedback:**
```powershell
Invoke-RestMethod -Uri "https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/feedback"
```

**Submit a vote:**
```powershell
$body = @{ vote = 'like' } | ConvertTo-Json
Invoke-RestMethod -Uri "https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com/feedback/mind-org/vote" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{ "X-Visitor-Id" = "visitor-123" }
```

---

## Data Storage

### DynamoDB Tables

#### supportcentre-feedback

Stores aggregated feedback (likes/dislikes) per resource.

| Attribute | Type | Key | Description |
|-----------|------|-----|-------------|
| `resourceId` | String | PK | Resource identifier |
| `likes` | Number | - | Total likes count |
| `dislikes` | Number | - | Total dislikes count |
| `votes` | Map | - | Map of visitorId → vote |

#### supportcentre-comments

Stores individual comments.

| Attribute | Type | Key | Description |
|-----------|------|-----|-------------|
| `resourceId` | String | PK | Resource identifier |
| `commentId` | String | SK | Unique comment ID |
| `text` | String | - | Comment text |
| `timestamp` | String | - | ISO 8601 timestamp |
| `helpful` | Number | - | Helpful votes count |
| `visitorId` | String | - | Anonymous visitor ID |

#### supportcentre-interactions

Stores user click tracking data (for recommendations).

| Attribute | Type | Key | Description |
|-----------|------|-----|-------------|
| `visitorId` | String | PK | Anonymous visitor ID |
| `resourceId` | String | SK | Resource identifier |
| `clicks` | Number | - | Click count |
| `lastClick` | String | - | Last click timestamp |
| `expiresAt` | Number | - | TTL timestamp |

---

## Lambda Function

The API is powered by a single Lambda function (`supportcentre-api`) that handles all routes:

- **Runtime:** Node.js 18.x
- **Memory:** 256 MB
- **Timeout:** 10 seconds
- **Handler:** `index.handler`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `FEEDBACK_TABLE` | DynamoDB feedback table name |
| `COMMENTS_TABLE` | DynamoDB comments table name |
| `INTERACTIONS_TABLE` | DynamoDB interactions table name |
| `ALLOWED_ORIGIN` | Primary allowed CORS origin |
