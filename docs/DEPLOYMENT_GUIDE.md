# Tech Health CDK - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Steps](#deployment-steps)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Screenshots & Visual Guide](#screenshots--visual-guide)

## 🔧 Prerequisites

### Required Tools
- **Node.js**: Version 18.x or later
- **AWS CLI**: Version 2.x configured with appropriate credentials
- **AWS CDK**: Version 2.100.0 or later
- **Git**: For repository management

### AWS Account Requirements
- AWS account with administrative privileges
- Sufficient service limits for:
  - Lambda functions
  - DynamoDB tables
  - API Gateway APIs
  - Cognito User Pools
  - KMS keys

### Installation Commands
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install CDK CLI
npm install -g aws-cdk

# Verify installations
node --version    # Should be 18.x+
aws --version     # Should be 2.x+
cdk --version     # Should be 2.100.0+
```

## 🌍 Environment Setup

### 1. AWS Configuration
```bash
# Configure AWS credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

### 2. Environment Variables
Create a `.env` file in the project root:
```bash
# Environment Configuration
ENVIRONMENT=dev
AWS_REGION=us-east-1
ALERT_EMAIL=admin@yourdomain.com

# Optional: Custom configuration
ENABLE_WAF=true
ENABLE_MONITORING=true
RATE_LIMIT_PER_MINUTE=2000
```

### 3. CDK Bootstrap
```bash
# Bootstrap CDK in your AWS account (one-time setup)
cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# Example:
cdk bootstrap aws://123456789012/us-east-1
```

## 🚀 Deployment Steps

### Step 1: Clone and Setup Repository
```bash
# Clone the repository
git clone https://github.com/your-org/tech-health-cdk.git
cd tech-health-cdk

# Install dependencies
npm install

# Build the project
npm run build
```

### Step 2: Validate Configuration
```bash
# Lint the code
npm run lint

# Run tests
npm test

# Synthesize CloudFormation template
npm run synth
```

### Step 3: Deploy Infrastructure
```bash
# Deploy to development environment
ENVIRONMENT=dev npm run deploy

# For production deployment
ENVIRONMENT=prod npm run deploy

# Deploy with specific parameters
cdk deploy TechHealthStack \
  --parameters AlertEmail=admin@yourdomain.com \
  --parameters Environment=prod \
  --require-approval never
```

### Step 4: Monitor Deployment Progress
The deployment will show progress in the terminal:
```
✨  Synthesis time: 5.23s

TechHealthStack: deploying...
[0%] start: Publishing assets
[25%] success: Published assets
[50%] start: Creating CloudFormation changeset
[75%] success: Created CloudFormation changeset
[100%] success: Deployed TechHealthStack

✅  TechHealthStack

Outputs:
TechHealthStack.ApiEndpoint = https://abc123def.execute-api.us-east-1.amazonaws.com/prod/
TechHealthStack.UserPoolId = us-east-1_ABC123DEF
TechHealthStack.UserPoolClientId = 1234567890abcdef
TechHealthStack.KMSKeyId = arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012

Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/TechHealthStack/12345678-1234-1234-1234-123456789012
```

## ⚙️ Post-Deployment Configuration

### 1. Cognito User Pool Setup

#### Create Healthcare Provider User
```bash
# Create a user in Cognito User Pool
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_ABC123DEF \
  --username healthcare.provider@hospital.com \
  --user-attributes Name=email,Value=healthcare.provider@hospital.com \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Add user to healthcare-providers group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id us-east-1_ABC123DEF \
  --username healthcare.provider@hospital.com \
  --group-name healthcare-providers
```

#### Set Permanent Password
```bash
# Set permanent password (user must change on first login)
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_ABC123DEF \
  --username healthcare.provider@hospital.com \
  --password SecurePassword123! \
  --permanent
```

### 2. API Gateway Custom Domain (Optional)
```bash
# Create custom domain
aws apigateway create-domain-name \
  --domain-name api.yourdomain.com \
  --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012

# Create base path mapping
aws apigateway create-base-path-mapping \
  --domain-name api.yourdomain.com \
  --rest-api-id abc123def \
  --stage prod
```

### 3. CloudWatch Dashboard Setup
```bash
# Create custom dashboard (optional)
aws cloudwatch put-dashboard \
  --dashboard-name TechHealthDashboard \
  --dashboard-body file://dashboard-config.json
```

## ✅ Verification & Testing

### 1. Health Check
```bash
# Test API endpoint
curl https://abc123def.execute-api.us-east-1.amazonaws.com/prod/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T16:00:00Z",
  "version": "1.0.0"
}
```

### 2. Authentication Test
```bash
# Test Cognito authentication
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id 1234567890abcdef \
  --auth-parameters USERNAME=healthcare.provider@hospital.com,PASSWORD=SecurePassword123!
```

### 3. API Functionality Test
```bash
# Get JWT token from Cognito response
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test patient creation
curl -X POST https://abc123def.execute-api.us-east-1.amazonaws.com/prod/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "dateOfBirth": "1990-01-01",
    "email": "test.patient@email.com"
  }'
```

### 4. Security Verification
```bash
# Test WAF protection (should be blocked)
for i in {1..2100}; do
  curl -s https://abc123def.execute-api.us-east-1.amazonaws.com/prod/health > /dev/null
done

# Test without authentication (should return 401)
curl https://abc123def.execute-api.us-east-1.amazonaws.com/prod/patients
```

## 🔍 Monitoring Setup

### 1. CloudWatch Alarms Verification
```bash
# List created alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix TechHealth

# Test alarm notification
aws sns publish \
  --topic-arn arn:aws:sns:us-east-1:123456789012:TechHealthAlerts \
  --message "Test notification from Tech Health API"
```

### 2. Log Groups Verification
```bash
# List log groups
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/TechHealthStack

# View recent logs
aws logs tail /aws/lambda/TechHealthStack-PatientHandler --follow
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. CDK Bootstrap Error
```bash
# Error: Need to perform AWS CDK bootstrap
# Solution:
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

#### 2. Insufficient Permissions
```bash
# Error: User is not authorized to perform action
# Solution: Ensure IAM user has required permissions
aws iam attach-user-policy \
  --user-name your-username \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

#### 3. Lambda Function Timeout
```bash
# Error: Task timed out after 30.00 seconds
# Solution: Check CloudWatch logs and optimize function
aws logs filter-log-events \
  --log-group-name /aws/lambda/TechHealthStack-PatientHandler \
  --filter-pattern "Task timed out"
```

#### 4. DynamoDB Throttling
```bash
# Error: ProvisionedThroughputExceededException
# Solution: Check CloudWatch metrics and consider on-demand billing
aws dynamodb describe-table \
  --table-name TechHealthStack-PatientRecords
```

#### 5. API Gateway 403 Errors
```bash
# Error: Missing Authentication Token
# Solution: Verify Cognito configuration and JWT token
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_ABC123DEF
```

### Debugging Commands
```bash
# View CloudFormation stack events
aws cloudformation describe-stack-events \
  --stack-name TechHealthStack

# Check stack resources
aws cloudformation describe-stack-resources \
  --stack-name TechHealthStack

# View CDK diff before deployment
cdk diff TechHealthStack

# Destroy stack (for testing)
cdk destroy TechHealthStack
```

## 📸 Screenshots & Visual Guide

### AWS Console Screenshots

#### 1. CloudFormation Stack Status
**Location**: AWS Console → CloudFormation → Stacks → TechHealthStack
- ✅ Stack Status: CREATE_COMPLETE
- ✅ All resources created successfully
- ✅ Outputs tab shows API endpoint and Cognito details

#### 2. API Gateway Configuration
**Location**: AWS Console → API Gateway → TechHealthApi
- ✅ REST API created with proper resources
- ✅ CORS configuration enabled
- ✅ WAF association active
- ✅ CloudWatch logging enabled

#### 3. Lambda Function Details
**Location**: AWS Console → Lambda → TechHealthStack-PatientHandler
- ✅ Runtime: Node.js 18.x
- ✅ Environment variables configured
- ✅ IAM role with proper permissions
- ✅ CloudWatch logs integration

#### 4. DynamoDB Tables
**Location**: AWS Console → DynamoDB → Tables
- ✅ PatientRecords table with encryption
- ✅ AuditTrail table with proper schema
- ✅ Global Secondary Index configured
- ✅ Point-in-time recovery enabled

#### 5. Cognito User Pool
**Location**: AWS Console → Cognito → User Pools
- ✅ User pool with MFA enabled
- ✅ Strong password policy configured
- ✅ Healthcare provider groups created
- ✅ App client configured

#### 6. KMS Key Management
**Location**: AWS Console → KMS → Customer managed keys
- ✅ Customer managed key created
- ✅ Key rotation enabled
- ✅ Proper key policy configured
- ✅ Usage by DynamoDB and Lambda

#### 7. CloudWatch Monitoring
**Location**: AWS Console → CloudWatch → Dashboards
- ✅ Custom dashboard created
- ✅ API Gateway metrics displayed
- ✅ Lambda performance metrics
- ✅ DynamoDB capacity metrics

#### 8. WAF Web ACL
**Location**: AWS Console → WAF & Shield → Web ACLs
- ✅ Web ACL associated with API Gateway
- ✅ Rate limiting rule active
- ✅ OWASP protection enabled
- ✅ Request sampling configured

### CLI Output Examples

#### Successful Deployment Output
```
✨  Synthesis time: 5.23s

TechHealthStack: deploying...
[0%] start: Publishing assets to cdk-hnb659fds-assets-123456789012-us-east-1
[25%] success: Published assets to cdk-hnb659fds-assets-123456789012-us-east-1
[50%] start: Publishing assets to cdk-hnb659fds-assets-123456789012-us-east-1
[75%] success: Published assets to cdk-hnb659fds-assets-123456789012-us-east-1
[100%] success: Published assets to cdk-hnb659fds-assets-123456789012-us-east-1

TechHealthStack: creating CloudFormation changeset...
 ✅  TechHealthStack

Outputs:
TechHealthStack.ApiEndpoint = https://abc123def.execute-api.us-east-1.amazonaws.com/prod/
TechHealthStack.KMSKeyId = arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012
TechHealthStack.UserPoolClientId = 1234567890abcdef
TechHealthStack.UserPoolId = us-east-1_ABC123DEF

Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/TechHealthStack/12345678-1234-1234-1234-123456789012

✨  Total time: 180.45s
```

#### API Test Response
```bash
$ curl -H "Authorization: Bearer $TOKEN" https://abc123def.execute-api.us-east-1.amazonaws.com/prod/patients

{
  "statusCode": 200,
  "data": {
    "patients": [],
    "count": 0,
    "nextToken": null
  },
  "timestamp": "2024-01-15T16:00:00Z",
  "requestId": "req-123456789"
}
```

### Architecture Diagrams Generated

1. **Main Architecture Diagram**: `/home/pradh/generated-diagrams/tech-health-architecture.png`
   - Shows complete system architecture
   - Includes all AWS services and data flow
   - Highlights security boundaries

2. **Data Flow Diagram**: `/home/pradh/generated-diagrams/tech-health-data-flow.png`
   - Detailed data flow and processing
   - Security controls and encryption
   - Monitoring and logging integration

3. **Security Architecture**: `/home/pradh/generated-diagrams/tech-health-security.png`
   - HIPAA compliance controls
   - Defense-in-depth strategy
   - Threat mitigation measures

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI configured with proper credentials
- [ ] CDK CLI installed and bootstrapped
- [ ] Environment variables configured
- [ ] Code reviewed and tested locally
- [ ] Security scan completed

### Deployment
- [ ] CDK synthesis successful
- [ ] CloudFormation stack deployed
- [ ] All resources created successfully
- [ ] Outputs captured and documented
- [ ] No deployment errors or warnings

### Post-Deployment
- [ ] Cognito users created and configured
- [ ] API endpoints tested and functional
- [ ] Authentication working properly
- [ ] Database tables accessible
- [ ] Monitoring and alerting configured
- [ ] Security controls verified
- [ ] Documentation updated

### Production Readiness
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates installed
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented
- [ ] Performance benchmarks established
- [ ] Security audit completed

## 🔄 Continuous Deployment

### GitHub Actions Workflow
The repository includes automated deployment via GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy Tech Health CDK
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy
        run: npm run deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Required Secrets
Configure these secrets in GitHub repository settings:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ALERT_EMAIL`

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- Monitor CloudWatch metrics and alarms
- Review security logs and audit trails
- Update dependencies and security patches
- Backup configuration and test recovery
- Review and rotate access credentials

### Getting Help
- Check CloudWatch logs for error details
- Review AWS service health dashboard
- Consult AWS documentation and forums
- Contact AWS support for service issues
- Review project documentation and README
