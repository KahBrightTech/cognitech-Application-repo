output "user_pool_id" {
  description = "Cognito User Pool ID - set this as VITE_COGNITO_USER_POOL_ID when building the app"
  value       = module.cognito.user_pool_id
}

output "web_app_client_id" {
  description = "App client ID for the web-app client - set this as VITE_COGNITO_CLIENT_ID when building the app"
  # The module marks its whole `clients` map sensitive (it also carries
  # client secrets for clients that have one). This client has no secret
  # and its ID is meant to ship inside the public frontend bundle, so it's
  # safe to unwrap here for easy consumption in CI.
  value = nonsensitive(module.cognito.clients["web-app"].id)
}

output "aws_region" {
  description = "AWS region the pool was created in - set this as VITE_COGNITO_REGION when building the app"
  value       = var.aws_region
}

output "user_pool_arn" {
  description = "ARN of the Cognito user pool"
  value       = module.cognito.user_pool_arn
}
