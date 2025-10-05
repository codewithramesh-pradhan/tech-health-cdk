# Authentication Flow Testing

**Screenshot**: `12-authentication-flow.png`

## What to Capture
Cognito authentication test or JWT token validation

## Validation Checklist
- ✅ User login successful with MFA
- ✅ JWT token received and valid
- ✅ Token contains proper claims
- ✅ Token expiration set correctly
- ✅ Refresh token functionality working

## Expected Token Claims
```json
{
  "sub": "user-uuid",
  "email": "healthcare.provider@hospital.com",
  "cognito:groups": ["healthcare-providers"],
  "exp": timestamp,
  "iat": timestamp
}
```

## Screenshot Requirements
- Show authentication process
- JWT token structure visible
- Token claims displayed
- Expiration time shown
- MFA challenge completion

## Validation Notes
This screenshot confirms:
- Authentication system functionality
- Token-based security
- User group assignments
- Session management
