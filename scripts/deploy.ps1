#!/usr/bin/env pwsh
# Support Centre Deployment Script
# Deploys the Support Centre website and infrastructure to AWS

param(
    [switch]$InfraOnly,        # Only deploy infrastructure (Terraform)
    [switch]$WebsiteOnly,      # Only deploy website files (S3 sync)
    [switch]$SkipInvalidation, # Skip CloudFront cache invalidation
    [switch]$Plan,             # Only show Terraform plan, don't apply
    [string]$Profile = "",     # AWS CLI profile to use
    [switch]$Help              # Show help
)

$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$TerraformDir = Join-Path $ProjectRoot "terraform"
$LambdaDir = Join-Path $ProjectRoot "lambda"

# Will be populated from Terraform outputs
$S3Bucket = ""
$CloudFrontDistributionId = ""
$ApiEndpoint = ""

# AWS profile argument
$AwsProfile = if ($Profile) { @("--profile", $Profile) } else { @() }

# Colors for output
function Write-Step { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[X] $msg" -ForegroundColor Red }

# Show help
if ($Help) {
    Write-Host @"

Support Centre Deployment Script
=================================

Deploys the Support Centre website and infrastructure to AWS.

Usage: .\deploy.ps1 [options]

Options:
    -InfraOnly          Only deploy infrastructure (Terraform)
    -WebsiteOnly        Only deploy website files (S3 sync)
    -SkipInvalidation   Skip CloudFront cache invalidation
    -Plan               Only show Terraform plan, don't apply
    -Profile <name>     AWS CLI profile to use
    -Help               Show this help message

Examples:
    .\deploy.ps1                        # Full deployment (infrastructure + website)
    .\deploy.ps1 -WebsiteOnly           # Only sync website files to S3
    .\deploy.ps1 -InfraOnly -Plan       # Preview infrastructure changes
    .\deploy.ps1 -Profile production    # Use specific AWS profile

Infrastructure includes:
    - S3 bucket for static website hosting
    - CloudFront CDN distribution
    - ACM SSL certificate
    - Route53 DNS records
    - DynamoDB tables for feedback/comments
    - Lambda function for API
    - API Gateway for REST API

"@
    exit 0
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $missing = @()
    
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        $missing += "AWS CLI (https://aws.amazon.com/cli/)"
    }
    
    if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
        $missing += "Terraform (https://terraform.io/downloads)"
    }
    
    if ($missing.Count -gt 0) {
        Write-Err "Missing required tools:"
        $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        exit 1
    }
    
    # Check AWS credentials
    try {
        $identity = aws sts get-caller-identity @AwsProfile 2>&1 | ConvertFrom-Json
        Write-OK "AWS credentials valid (Account: $($identity.Account))"
    } catch {
        Write-Err "AWS credentials not configured or expired"
        Write-Host "  Run 'aws configure' to set up credentials" -ForegroundColor Yellow
        exit 1
    }
    
    Write-OK "All prerequisites met"
}

# Get Terraform outputs
function Get-TerraformOutputs {
    Push-Location $TerraformDir
    try {
        $script:S3Bucket = terraform output -raw s3_bucket_name 2>$null
        $script:CloudFrontDistributionId = terraform output -raw cloudfront_distribution_id 2>$null
        $script:ApiEndpoint = terraform output -raw api_endpoint 2>$null
        
        if (-not $script:S3Bucket) {
            return $false
        }
        return $true
    } finally {
        Pop-Location
    }
}

# Deploy infrastructure with Terraform
function Deploy-Infrastructure {
    Write-Step "Deploying infrastructure with Terraform..."
    
    Push-Location $TerraformDir
    try {
        # Initialize Terraform
        Write-Host "  Initializing Terraform..." -ForegroundColor Gray
        $initOutput = terraform init -upgrade 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Terraform init failed"
            Write-Host $initOutput
            exit 1
        }
        
        if ($Plan) {
            Write-Host "`n  Terraform Plan:" -ForegroundColor Yellow
            terraform plan
            return $false
        }
        
        # Apply Terraform
        Write-Host "  Applying Terraform configuration..." -ForegroundColor Gray
        terraform apply -auto-approve
        
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Terraform apply failed"
            exit 1
        }
        
        # Get outputs
        Get-TerraformOutputs | Out-Null
        
        Write-OK "Infrastructure deployed successfully"
        Write-Host "    S3 Bucket:    $script:S3Bucket" -ForegroundColor Gray
        Write-Host "    CloudFront:   $script:CloudFrontDistributionId" -ForegroundColor Gray
        Write-Host "    API Endpoint: $script:ApiEndpoint" -ForegroundColor Gray
        
        return $true
    }
    finally {
        Pop-Location
    }
}

# Sync website files to S3
function Sync-Website {
    Write-Step "Syncing website files to S3..."
    
    if (-not $script:S3Bucket) {
        if (-not (Get-TerraformOutputs)) {
            Write-Err "Could not get S3 bucket name. Run with -InfraOnly first or check Terraform state."
            exit 1
        }
    }
    
    # Files and folders to exclude
    $excludeArgs = @(
        "--exclude", "terraform/*",
        "--exclude", ".terraform/*",
        "--exclude", "*.tfstate*",
        "--exclude", ".terraform.lock.hcl",
        "--exclude", "lambda/*",
        "--exclude", ".git/*",
        "--exclude", "*.zip",
        "--exclude", "scripts/*",
        "--exclude", "node_modules/*",
        "--exclude", ".gitignore",
        "--exclude", "*.md"
    )
    
    Write-Host "  Syncing to s3://$script:S3Bucket ..." -ForegroundColor Gray
    
    $syncOutput = aws s3 sync $ProjectRoot "s3://$script:S3Bucket" @excludeArgs --delete @AwsProfile 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Err "S3 sync failed"
        Write-Host $syncOutput
        exit 1
    }
    
    # Count uploaded files
    $uploadedFiles = ($syncOutput | Select-String -Pattern "upload:").Count
    $deletedFiles = ($syncOutput | Select-String -Pattern "delete:").Count
    
    if ($uploadedFiles -gt 0 -or $deletedFiles -gt 0) {
        Write-OK "$uploadedFiles file(s) uploaded, $deletedFiles file(s) deleted"
    } else {
        Write-OK "Website files are up to date"
    }
}

# Invalidate CloudFront cache
function Invoke-CloudFrontInvalidation {
    Write-Step "Invalidating CloudFront cache..."
    
    if (-not $script:CloudFrontDistributionId) {
        if (-not (Get-TerraformOutputs)) {
            Write-Warn "Could not get CloudFront distribution ID. Skipping invalidation."
            return
        }
    }
    
    try {
        $invalidation = aws cloudfront create-invalidation `
            --distribution-id $script:CloudFrontDistributionId `
            --paths "/*" @AwsProfile 2>&1 | ConvertFrom-Json
        
        $invalidationId = $invalidation.Invalidation.Id
        Write-OK "Cache invalidation created: $invalidationId"
        Write-Host "    Changes will be live within 1-2 minutes" -ForegroundColor Gray
    } catch {
        Write-Warn "CloudFront invalidation failed: $_"
    }
}

# Main deployment flow
function Start-Deployment {
    $startTime = Get-Date
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Magenta
    Write-Host "       Support Centre Deployment Script         " -ForegroundColor Magenta
    Write-Host "================================================" -ForegroundColor Magenta
    
    Test-Prerequisites
    
    $deployedInfra = $false
    
    if ($WebsiteOnly) {
        Sync-Website
        if (-not $SkipInvalidation) {
            Invoke-CloudFrontInvalidation
        }
    }
    elseif ($InfraOnly) {
        $deployedInfra = Deploy-Infrastructure
    }
    else {
        # Full deployment
        $deployedInfra = Deploy-Infrastructure
        
        if ($deployedInfra) {
            Sync-Website
            if (-not $SkipInvalidation) {
                Invoke-CloudFrontInvalidation
            }
        }
    }
    
    $elapsed = (Get-Date) - $startTime
    
    if (-not $Plan -and ($deployedInfra -or $WebsiteOnly)) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "          Deployment Complete!                  " -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "  Website:     https://lifechanged.click" -ForegroundColor White
        Write-Host "  Website:     https://www.lifechanged.click" -ForegroundColor White
        if ($script:ApiEndpoint) {
            Write-Host "  API:         $script:ApiEndpoint" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "  Completed in $([math]::Round($elapsed.TotalSeconds, 1)) seconds" -ForegroundColor Gray
        Write-Host ""
    } elseif ($Plan) {
        Write-Host ""
        Write-Host "  Plan complete. Run without -Plan to apply changes." -ForegroundColor Yellow
        Write-Host ""
    }
}

# Run deployment
Start-Deployment
