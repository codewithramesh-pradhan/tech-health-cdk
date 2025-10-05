# KMS Key Management

**Screenshot**: `06-kms-key.png`

## What to Capture
AWS Console → KMS → Customer managed keys → HealthDataKey

## Validation Checklist
- ✅ Key type: Customer managed
- ✅ Key spec: SYMMETRIC_DEFAULT
- ✅ Key usage: ENCRYPT_DECRYPT
- ✅ Key rotation: Enabled (annual)
- ✅ Key policy: Proper permissions for Lambda and DynamoDB

## Expected Key Configuration
```
Key Type: Customer managed
Description: Key for encrypting health data
Rotation: Enabled (annual)
Usage: DynamoDB, Lambda, CloudWatch Logs
Key Policy: Allows service access
Status: Enabled
```

## Screenshot Requirements
- Show KMS key details page
- Key rotation settings visible
- Key policy information shown
- Usage by services displayed
- Key status and metadata visible

## Validation Notes
This screenshot validates:
- Encryption key management
- HIPAA compliance for data protection
- Automatic key rotation setup
- Service integration permissions
