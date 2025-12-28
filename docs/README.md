# Support Centre

A mental health and support services website providing resources for individuals dealing with mental health challenges, degenerative conditions, grief, loss, and financial difficulties.

**Live Site:** https://lifechanged.click

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Contributing](#contributing)

---

## Overview

Support Centre is a static website hosted on AWS that provides curated resources and support services. The site features:

- **Mental Health Resources** - Links to organizations like Mind, Samaritans, CALM, and more
- **Professional Guidance** - NICE guidelines, NHS resources, and professional bodies
- **Grief & Loss Support** - Bereavement services and counseling resources
- **Degenerative Conditions** - Information on Alzheimer's, Parkinson's, MS, and MND
- **Financial Support** - Benefits information, debt advice, and charity resources
- **Interactive Features** - Search, like/dislike feedback, and anonymous comments

---

## Features

### User Features
- 🔍 **Search** - Full-text search across all resources
- 👍 **Feedback System** - Like/dislike buttons on resource cards
- 💬 **Anonymous Comments** - Share experiences without registration
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ♿ **Accessibility** - Skip links, ARIA labels, keyboard navigation
- 🎨 **Modern UI** - Glassmorphism effects, smooth animations

### Technical Features
- ⚡ **Fast Loading** - Static files served via CloudFront CDN
- 🔒 **HTTPS** - SSL/TLS encryption with AWS ACM
- 📊 **Persistent Data** - DynamoDB backend for feedback and comments
- 🌐 **Custom Domain** - Configured with Route53 DNS
- 🚀 **Infrastructure as Code** - Full Terraform configuration

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Internet                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Route53 DNS (lifechanged.click)                  │
│                                                                      │
│   lifechanged.click ─────────────► CloudFront Distribution           │
│   www.lifechanged.click ─────────► CloudFront Distribution           │
│   api.lifechanged.click ─────────► API Gateway (pending)             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     CloudFront (CDN)          │   │      API Gateway (HTTP)       │
│     Distribution ID:          │   │      REST API Endpoints       │
│     EQPISO3RVIAYY             │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│         S3 Bucket             │   │     Lambda Function           │
│  supportcentre-lifechanged-   │   │     supportcentre-api         │
│  click                        │   │     Node.js 18.x              │
│                               │   │                               │
│  - index.html                 │   │  Handles:                     │
│  - css/styles.css             │   │  - GET/POST /feedback         │
│  - js/main.js                 │   │  - GET/POST /comments         │
└───────────────────────────────┘   └───────────────────────────────┘
                                                │
                                                ▼
                                ┌───────────────────────────────────┐
                                │         DynamoDB Tables           │
                                │                                   │
                                │  supportcentre-feedback           │
                                │  - resourceId (PK)                │
                                │  - likes, dislikes, votes         │
                                │                                   │
                                │  supportcentre-comments           │
                                │  - resourceId (PK)                │
                                │  - commentId (SK)                 │
                                │  - text, timestamp, helpful       │
                                │                                   │
                                │  supportcentre-interactions       │
                                │  - visitorId (PK)                 │
                                │  - resourceId (SK)                │
                                │  - click tracking data            │
                                └───────────────────────────────────┘
```

---

## Project Structure

```
supportcentre/
├── index.html              # Main HTML page
├── css/
│   └── styles.css          # All CSS styles (1700+ lines)
├── js/
│   └── main.js             # JavaScript functionality (1300+ lines)
├── lambda/
│   ├── index.js            # Lambda API handler
│   └── package.json        # Lambda dependencies
├── terraform/
│   ├── main.tf             # Terraform configuration
│   ├── outputs.tf          # Terraform outputs
│   ├── variables.tf        # Terraform variables
│   └── terraform.tfvars    # Variable values
├── scripts/
│   └── deploy.ps1          # PowerShell deployment script
└── docs/
    ├── README.md           # This file
    └── API.md              # API documentation
```

---

## Getting Started

### Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) - Configured with valid credentials
- [Terraform](https://terraform.io/downloads) - Version 1.0 or later
- [PowerShell](https://docs.microsoft.com/en-us/powershell/) - Version 5.1 or later
- A registered domain in Route53 (or modify Terraform for your DNS provider)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd supportcentre
   ```

2. **Start a local server:**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

> **Note:** The feedback/comments API won't work locally unless you set up the backend infrastructure or mock the API responses.

---

## Deployment

### Quick Deploy

Run the PowerShell deployment script:

```powershell
cd supportcentre
.\scripts\deploy.ps1
```

### Deployment Options

```powershell
# Full deployment (infrastructure + website)
.\scripts\deploy.ps1

# Preview infrastructure changes only
.\scripts\deploy.ps1 -InfraOnly -Plan

# Deploy infrastructure only
.\scripts\deploy.ps1 -InfraOnly

# Deploy website files only (after infrastructure exists)
.\scripts\deploy.ps1 -WebsiteOnly

# Skip CloudFront cache invalidation
.\scripts\deploy.ps1 -SkipInvalidation

# Use a specific AWS profile
.\scripts\deploy.ps1 -Profile production

# Show help
.\scripts\deploy.ps1 -Help
```

### Manual Deployment

1. **Initialize Terraform:**
   ```bash
   cd terraform
   terraform init
   ```

2. **Review the plan:**
   ```bash
   terraform plan
   ```

3. **Apply infrastructure:**
   ```bash
   terraform apply
   ```

4. **Sync website files:**
   ```bash
   aws s3 sync .. s3://supportcentre-lifechanged-click \
     --exclude "terraform/*" \
     --exclude "lambda/*" \
     --exclude ".git/*" \
     --delete
   ```

5. **Invalidate CloudFront cache:**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id EQPISO3RVIAYY \
     --paths "/*"
   ```

---

## API Reference

See [API.md](./API.md) for detailed API documentation.

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/feedback` | Get all feedback data |
| GET | `/feedback/{resourceId}` | Get feedback for a specific resource |
| POST | `/feedback/{resourceId}/vote` | Submit a like/dislike vote |
| GET | `/comments/{resourceId}` | Get comments for a resource |
| POST | `/comments/{resourceId}` | Add a new comment |

### API Base URL

```
https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com
```

---

## Configuration

### Terraform Variables

Edit `terraform/terraform.tfvars`:

```hcl
domain_name = "lifechanged.click"
aws_region  = "eu-west-2"
```

### JavaScript Configuration

The API endpoint is configured in `js/main.js`:

```javascript
const API_CONFIG = {
    endpoint: 'https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com',
    visitorId: getOrCreateVisitorId()
};
```

### CORS Configuration

CORS is configured in the API Gateway to allow:
- `https://lifechanged.click`
- `https://www.lifechanged.click`
- `http://localhost:8080` (for local development)

---

## AWS Resources

### Created Resources

| Resource | Name/ID | Description |
|----------|---------|-------------|
| S3 Bucket | `supportcentre-lifechanged-click` | Static website hosting |
| CloudFront | `EQPISO3RVIAYY` | CDN distribution |
| ACM Certificate | `f2767f37-fe45-*` | SSL/TLS certificate |
| Route53 Records | A, AAAA | DNS records |
| DynamoDB | `supportcentre-feedback` | Feedback storage |
| DynamoDB | `supportcentre-comments` | Comments storage |
| DynamoDB | `supportcentre-interactions` | Click tracking |
| Lambda | `supportcentre-api` | API handler |
| API Gateway | `85otm9zzyj` | HTTP API |

### Estimated Costs

With AWS Free Tier:
- **S3**: Free (< 5GB storage, < 20K requests)
- **CloudFront**: Free (< 1TB data transfer)
- **DynamoDB**: Free (< 25GB, < 25 WCU/RCU)
- **Lambda**: Free (< 1M requests, < 400K GB-seconds)
- **API Gateway**: Free (< 1M requests)

After Free Tier, expect ~$1-5/month for low traffic sites.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is provided as-is for educational purposes.

---

## Support

For issues or questions, please open an issue on the repository.
