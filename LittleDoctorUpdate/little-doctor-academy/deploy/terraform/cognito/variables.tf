variable "aws_region" {
  description = "AWS region to deploy the Cognito user pool into"
  type        = string
  default     = "us-east-1"
}

variable "common" {
  description = "Common tagging/naming variables, matching the shape expected by the AWS-Cognito module"
  type = object({
    global           = bool
    tags             = map(string)
    account_name     = string
    region_prefix    = string
    account_name_abr = optional(string, "")
  })
}

variable "callback_urls" {
  description = "Allowed callback URLs for the web app client. Only used if you later switch the UI to the Cognito Hosted UI; the current custom LoginScreen signs in directly via SRP and does not use these."
  type        = list(string)
  default     = []
}
