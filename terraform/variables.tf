variable "aws_region" {
  description = "AWS region for resources (S3, etc.)"
  type        = string
  default     = "eu-west-2"
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = "lifechanged.click"
}

variable "website_bucket_name" {
  description = "S3 bucket name for website hosting (must be globally unique)"
  type        = string
  default     = "supportcentre-lifechanged-click"
}
