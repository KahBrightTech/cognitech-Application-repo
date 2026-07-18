#--------------------------------------------------------------------
# Cognito User Pool for Little Doctor Academy
#
# Manages parent/guardian sign-up and sign-in for the app. The React
# LoginScreen talks to this pool directly over SRP (no Hosted UI, no
# backend API yet), so only a public app client is created here.
#--------------------------------------------------------------------
module "cognito" {
  source = "git::https://github.com/KahBrightTech/Cognitech-terraform-iac-modules.git//terraform/modules/AWS-Cognito?ref=main"

  common = var.common

  cognito = {
    name = "little-doctor-academy"

    # Parents sign in with their email address
    username_attributes      = ["email"]
    auto_verified_attributes = ["email"]

    # Keep sign-in low-friction for a consumer/parent audience, but let
    # parents opt into an authenticator app if they want it.
    mfa_configuration           = "OPTIONAL"
    software_token_mfa_enabled  = true

    # No card-holder or health record data is collected here (see the
    # app's COPPA/privacy roadmap in its README) - advanced security is
    # left off to avoid the extra per-MAU cost until that review happens.
    advanced_security_mode = "OFF"

    password_policy = {
      minimum_length     = 10
      require_lowercase  = true
      require_uppercase  = true
      require_numbers    = true
      require_symbols    = true
    }

    # Self-registration is enabled (matches the "Create an Account" flow
    # already built into LoginScreen.jsx) - admins do not need to
    # pre-create parent accounts.
    admin_create_user_config = {
      allow_admin_create_user_only = false
    }

    # Single public client for the SPA. No secret (a browser can't keep
    # one), SRP only so the password itself is never sent over the wire.
    clients = [
      {
        name                 = "web-app"
        generate_secret      = false
        explicit_auth_flows  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
        callback_urls        = var.callback_urls
        refresh_token_validity = 30
        access_token_validity  = 60
        id_token_validity      = 60
      }
    ]

    tags = {
      App = "little-doctor-academy"
    }
  }
}
