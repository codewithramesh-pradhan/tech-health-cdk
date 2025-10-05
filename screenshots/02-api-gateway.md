# API Gateway Configuration

**Screenshot**: `02-api-gateway.png`

## What to Capture
AWS Console → API Gateway → TechHealthApi → Resources

## Validation Checklist
- ✅ REST API name: "Tech Health Patient API"
- ✅ Resources: `/patients`, `/patients/{patientId}`, `/patients/{patientId}/records`
- ✅ Methods: GET, POST, PUT, DELETE configured
- ✅ CORS enabled with proper headers
- ✅ CloudWatch logging enabled

## Expected Configuration
```
API Name: Tech Health Patient API
Stage: prod
Resources: 3 main resources with 7 methods
Throttling: 10,000 requests per second
CORS: Enabled for all origins
```

## Screenshot Requirements
- Show API Gateway resources tree
- All endpoints and methods visible
- Stage deployment information
- CORS configuration visible
- No error states shown

## Validation Notes
This screenshot validates:
- Proper API structure
- Endpoint configuration
- Security settings
- Production readiness
