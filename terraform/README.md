# Support Centre - AWS Terraform Deployment

This Terraform configuration deploys the Support Centre website to AWS using:

- **S3** - Static website hosting
- **CloudFront** - CDN for global distribution and HTTPS
- **ACM** - SSL/TLS certificate for HTTPS
- **Route53** - DNS management for `lifechanged.click`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Route53 DNS                                   │
│            lifechanged.click → CloudFront                        │
│        www.lifechanged.click → CloudFront                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CloudFront CDN                                 │
│          - Global edge locations                                 │
│          - HTTPS with ACM certificate                            │
│          - Caching & compression                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    S3 Bucket                                     │
│          supportcentre-lifechanged-click                         │
│          - index.html, css/, js/                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Terraform** v1.0+ installed
3. **Route53 Hosted Zone** for `lifechanged.click` must already exist in your AWS account

## Quick Start

### 1. Initialize Terraform

```powershell
cd d:\source\supportcentre\terraform
terraform init
```

### 2. Review the Plan

```powershell
terraform plan
```

### 3. Apply the Configuration

```powershell
terraform apply
```

Type `yes` when prompted. This will create:
- S3 bucket for website files
- ACM certificate (with automatic DNS validation)
- CloudFront distribution
- Route53 DNS records

**Note:** Certificate validation and CloudFront distribution creation can take 10-30 minutes.

### 4. Upload Website Files

After Terraform completes, upload the website files:

```powershell
# Using the deploy script
.\scripts\deploy.ps1

# Or manually with AWS CLI
aws s3 sync . s3://supportcentre-lifechanged-click --exclude "terraform/*" --exclude "scripts/*" --exclude ".git/*" --exclude "*.md"
```

### 5. Access Your Website

Once deployed, your website will be available at:
- https://lifechanged.click
- https://www.lifechanged.click

## Files

| File | Description |
|------|-------------|
| `main.tf` | Main Terraform configuration with all resources |
| `variables.tf` | Variable definitions |
| `terraform.tfvars` | Variable values for this deployment |
| `outputs.tf` | Output values (bucket name, CloudFront ID, etc.) |

## Resources Created

| Resource | Purpose |
|----------|---------|
| `aws_s3_bucket` | Website file storage |
| `aws_s3_bucket_website_configuration` | S3 static website hosting |
| `aws_s3_bucket_policy` | Public read access for CloudFront |
| `aws_acm_certificate` | SSL/TLS certificate for HTTPS |
| `aws_cloudfront_distribution` | CDN with HTTPS |
| `aws_route53_record` | DNS A/AAAA records for domain |

## Updating the Website

To update the website content:

```powershell
# Run the deploy script
.\scripts\deploy.ps1

# This will:
# 1. Upload files to S3
# 2. Invalidate CloudFront cache
```

## Destroying Resources

To tear down all AWS resources:

```powershell
cd terraform
terraform destroy
```

**Warning:** This will delete all resources including the S3 bucket and its contents.

## Costs

Estimated monthly costs (low traffic):
- **S3**: ~$0.02 (storage) + $0.01 (requests)
- **CloudFront**: Free tier covers 1TB/month
- **Route53**: $0.50/hosted zone + $0.40/million queries
- **ACM**: Free

**Total: ~$0.50-1.00/month** for a low-traffic static site.

## Troubleshooting

### Certificate Validation Taking Too Long

ACM certificate validation requires DNS records. Terraform creates these automatically, but propagation can take up to 30 minutes.

### 403 Forbidden Errors

If you get 403 errors after deployment:
1. Ensure files are uploaded to S3
2. Check S3 bucket policy allows CloudFront access
3. Wait for CloudFront distribution to fully deploy (Status: Deployed)

### DNS Not Resolving

Route53 changes propagate quickly, but can take up to 48 hours in some cases. Try:
```powershell
nslookup lifechanged.click
```

## Security Features

- ✅ HTTPS enforced (HTTP redirects to HTTPS)
- ✅ TLS 1.2 minimum
- ✅ CloudFront Origin Access Control (OAC)
- ✅ S3 bucket not directly accessible
- ✅ IPv6 enabled
