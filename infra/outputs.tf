output "site_url" {
  description = "Live CloudFront URL of the deployed site"
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket name — set as AWS_S3_BUCKET in GitLab CI variables"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — set as AWS_CF_DISTRIBUTION_ID in GitLab CI"
  value       = aws_cloudfront_distribution.site.id
}

output "ecr_repository_url" {
  description = "Full ECR repository URL (use as ECR_REGISTRY/ECR_REPO in CI)"
  value       = aws_ecr_repository.docs.repository_url
}

output "aws_account_id" {
  description = "AWS account ID — set as AWS_ACCOUNT_ID in GitLab CI"
  value       = split(".", aws_ecr_repository.docs.repository_url)[0]
}

output "cicd_access_key_id" {
  description = "IAM access key ID — set as AWS_ACCESS_KEY_ID in GitLab CI"
  value       = aws_iam_access_key.cicd.id
}

output "cicd_secret_access_key" {
  description = "IAM secret key — set as AWS_SECRET_ACCESS_KEY in GitLab CI (masked)"
  value       = aws_iam_access_key.cicd.secret
  sensitive   = true
}
