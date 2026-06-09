variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix used for all resource names"
  type        = string
  default     = "kiro-sre-guide"
}

variable "site_bucket_name" {
  description = "Globally unique S3 bucket name for static site files"
  type        = string
  # Bucket names must be globally unique — change this before applying
  default     = "kiro-sre-guide-site"
}

variable "ecr_repo_name" {
  description = "ECR repository name for the Docker image"
  type        = string
  default     = "kiro-sre-guide"
}

variable "common_tags" {
  description = "Tags applied to every resource"
  type        = map(string)
  default = {
    Project     = "kiro-sre-guide"
    Team        = "sre"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
