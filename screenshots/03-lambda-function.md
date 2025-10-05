# Lambda Function Configuration

**Screenshot**: `03-lambda-function.png`

## What to Capture
AWS Console → Lambda → TechHealthCdkStack-PatientHandler

## Validation Checklist
- ✅ Function name: `TechHealthCdkStack-PatientHandler-XXXXX`
- ✅ Runtime: Node.js 18.x
- ✅ Timeout: 30 seconds
- ✅ Memory: 512 MB
- ✅ Environment variables: 4 variables set
- ✅ IAM role with proper permissions

## Expected Environment Variables
```
PATIENT_TABLE_NAME: TechHealthCdkStack-PatientRecords-XXXXX
AUDIT_TABLE_NAME: TechHealthCdkStack-AuditTrail-XXXXX
KMS_KEY_ID: arn:aws:kms:region:account:key/key-id
LOG_GROUP_NAME: /aws/lambda/TechHealthCdkStack-PatientHandler-XXXXX
```

## Screenshot Requirements
- Show Lambda function configuration tab
- Environment variables section expanded
- Runtime and basic settings visible
- IAM role information shown
- No error indicators

## Validation Notes
This screenshot confirms:
- Proper Lambda configuration
- Environment variable setup
- Runtime and resource allocation
- Security role assignment
