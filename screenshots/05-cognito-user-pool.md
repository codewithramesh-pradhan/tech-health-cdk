# Cognito User Pool Configuration

**Screenshot**: `05-cognito-user-pool.png`

## What to Capture
AWS Console → Cognito → User Pools → tech-health-users

## Validation Checklist
- ✅ User pool name: "tech-health-users"
- ✅ MFA: Required
- ✅ Password policy: Strong (12+ chars, complexity)
- ✅ Self-signup: Disabled
- ✅ User groups: healthcare-providers created
- ✅ App client configured without secret

## Expected Configuration
```
Pool Name: tech-health-users
MFA: REQUIRED (SMS + TOTP)
Password Policy: 12 chars min, uppercase, lowercase, numbers, symbols
Sign-up: Admin only
Groups: healthcare-providers
App Client: Web/mobile (no secret)
```

## Screenshot Requirements
- Show Cognito User Pool overview
- MFA settings visible
- Password policy configuration shown
- User groups section visible
- App client configuration displayed

## Validation Notes
This screenshot confirms:
- Authentication security setup
- HIPAA-compliant access controls
- User management configuration
- Application integration settings
