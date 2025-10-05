# DynamoDB Tables Configuration

**Screenshot**: `04-dynamodb-tables.png`

## What to Capture
AWS Console → DynamoDB → Tables

## Validation Checklist
- ✅ Two tables created: PatientRecords and AuditTrail
- ✅ Encryption: Customer managed (KMS)
- ✅ Billing mode: On-demand
- ✅ Point-in-time recovery: Enabled
- ✅ Global Secondary Index on PatientRecords table

## Expected Table Schema
```
PatientRecords Table:
- Partition Key: patientId (String)
- Sort Key: recordType (String)
- GSI: DateIndex (recordType, createdAt)
- Encryption: Customer managed KMS
- Billing: On-demand

AuditTrail Table:
- Partition Key: auditId (String)
- Sort Key: timestamp (String)
- Encryption: Customer managed KMS
- Billing: On-demand
```

## Screenshot Requirements
- Show DynamoDB tables list
- Both tables visible with status
- Encryption settings visible
- Billing mode information shown
- GSI information for PatientRecords

## Validation Notes
This screenshot validates:
- Database structure implementation
- Security encryption setup
- Cost optimization settings
- Backup and recovery configuration
