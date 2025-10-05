# Tech Health CDK - AWS Architecture Documentation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Details](#component-details)
3. [Security Architecture](#security-architecture)
4. [Data Flow](#data-flow)
5. [HIPAA Compliance](#hipaa-compliance)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Deployment Architecture](#deployment-architecture)
8. [Cost Optimization](#cost-optimization)

## 🏗️ Architecture Overview

The Tech Health CDK implements a **HIPAA-compliant, serverless healthcare API** using AWS managed services. The architecture follows the **AWS Well-Architected Framework** principles with emphasis on security, reliability, and cost optimization.

### Key Architectural Principles
- **Security First**: Multi-layered security with encryption at rest and in transit
- **Serverless**: No infrastructure management, automatic scaling
- **Event-Driven**: Asynchronous processing and real-time monitoring
- **Immutable Infrastructure**: Infrastructure as Code with CDK
- **Zero Trust**: Every request authenticated and authorized

## 🔧 Component Details

### 1. Security Perimeter

#### AWS WAF (Web Application Firewall)
```typescript
// Configuration
rateLimitPerMinute: 2000
enableGeoBlocking: true
blockedCountries: ['CN', 'RU'] // Optional
```

**Features:**
- **Rate Limiting**: 2000 requests per minute per IP
- **OWASP Top 10 Protection**: SQL injection, XSS, etc.
- **Known Bad Inputs**: Malicious payload detection
- **Geo-blocking**: Country-based access control (optional)
- **Real-time Monitoring**: CloudWatch integration

**Security Rules:**
1. `RateLimitRule` - Prevents DDoS attacks
2. `AWSManagedRulesCommonRuleSet` - OWASP protection
3. `AWSManagedRulesKnownBadInputsRuleSet` - Malicious input blocking
4. `GeoBlockingRule` - Geographic restrictions (optional)

### 2. Identity & Access Management

#### Amazon Cognito User Pool
```typescript
// Security Configuration
passwordPolicy: {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireDigits: true,
  requireSymbols: true
}
mfa: REQUIRED
```

**Features:**
- **Multi-Factor Authentication**: SMS + TOTP required
- **Strong Password Policy**: 12+ characters with complexity
- **Healthcare Provider Groups**: Role-based access control
- **Self-signup Disabled**: Admin-only user creation
- **Account Recovery**: Email-only for security

**User Groups:**
- `healthcare-providers`: Full patient data access
- `administrators`: System management access
- `auditors`: Read-only audit access

### 3. API Management

#### Amazon API Gateway
```typescript
// API Configuration
restApiName: 'Tech Health Patient API'
defaultCorsPreflightOptions: {
  allowOrigins: Cors.ALL_ORIGINS,
  allowMethods: Cors.ALL_METHODS
}
```

**Endpoints:**
- `GET /patients` - List all patients (paginated)
- `POST /patients` - Create new patient record
- `GET /patients/{id}` - Retrieve specific patient
- `PUT /patients/{id}` - Update patient information
- `DELETE /patients/{id}` - Soft delete patient record
- `GET /patients/{id}/records` - Get medical records
- `POST /patients/{id}/records` - Add medical record

**Features:**
- **Request Validation**: Input sanitization and validation
- **Throttling**: Rate limiting per API key
- **CORS Support**: Cross-origin resource sharing
- **CloudWatch Integration**: Comprehensive logging
- **Custom Domain**: SSL/TLS termination

### 4. Serverless Compute

#### AWS Lambda Function
```typescript
// Runtime Configuration
runtime: NODEJS_18_X
timeout: 30 seconds
memorySize: 512 MB
```

**Environment Variables:**
- `PATIENT_TABLE_NAME`: DynamoDB table name
- `AUDIT_TABLE_NAME`: Audit trail table name
- `KMS_KEY_ID`: Encryption key identifier
- `LOG_GROUP_NAME`: CloudWatch log group

**Features:**
- **Automatic Scaling**: Handles concurrent requests
- **Error Handling**: Comprehensive error responses
- **Audit Logging**: All operations logged
- **Input Validation**: Request payload validation
- **Response Formatting**: Consistent API responses

### 5. Data Storage

#### Amazon DynamoDB

##### Patient Records Table
```typescript
// Table Schema
partitionKey: 'patientId' (String)
sortKey: 'recordType' (String)
encryption: CUSTOMER_MANAGED
billingMode: PAY_PER_REQUEST
```

**Attributes:**
- `patientId`: Unique patient identifier
- `recordType`: Type of record (PATIENT_INFO, MEDICAL_RECORD, etc.)
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp
- `data`: Encrypted patient data
- `version`: Record version for optimistic locking

**Global Secondary Index:**
- `DateIndex`: Query records by date range
- Partition Key: `recordType`
- Sort Key: `createdAt`

##### Audit Trail Table
```typescript
// Audit Schema
partitionKey: 'auditId' (String)
sortKey: 'timestamp' (String)
```

**Audit Fields:**
- `auditId`: Unique audit identifier
- `timestamp`: ISO timestamp
- `userId`: User who performed action
- `action`: Operation performed (CREATE, READ, UPDATE, DELETE)
- `resourceId`: Resource affected
- `ipAddress`: Client IP address
- `userAgent`: Client user agent
- `result`: Success/failure status

### 6. Encryption Management

#### AWS KMS (Key Management Service)
```typescript
// KMS Configuration
enableKeyRotation: true
keySpec: SYMMETRIC_DEFAULT
keyUsage: ENCRYPT_DECRYPT
```

**Features:**
- **Customer Managed Keys**: Full control over encryption keys
- **Automatic Rotation**: Annual key rotation
- **Audit Trail**: All key usage logged in CloudTrail
- **Fine-grained Permissions**: IAM-based access control
- **Multi-Region Support**: Cross-region replication

**Encryption Scope:**
- DynamoDB tables (at rest)
- Lambda environment variables
- CloudWatch logs
- S3 artifacts (if used)

## 🔒 Security Architecture

### Defense in Depth Strategy

#### Layer 1: Network Security
- **AWS WAF**: Application-layer protection
- **API Gateway**: Request validation and throttling
- **VPC Endpoints**: Private network communication (optional)

#### Layer 2: Identity & Access
- **Cognito**: Multi-factor authentication
- **IAM**: Least privilege access control
- **JWT Tokens**: Stateless authentication

#### Layer 3: Application Security
- **Input Validation**: Sanitization and validation
- **Output Encoding**: XSS prevention
- **Error Handling**: Information disclosure prevention

#### Layer 4: Data Security
- **Encryption at Rest**: KMS-managed encryption
- **Encryption in Transit**: TLS 1.2+ everywhere
- **Field-level Encryption**: Sensitive data protection

#### Layer 5: Monitoring & Response
- **CloudWatch**: Real-time monitoring
- **CloudTrail**: Audit logging
- **SNS**: Incident alerting

### Security Controls Matrix

| Control | Implementation | HIPAA Requirement |
|---------|---------------|-------------------|
| Access Control | Cognito + IAM | §164.312(a)(1) |
| Audit Controls | CloudTrail + CloudWatch | §164.312(b) |
| Integrity | KMS + Checksums | §164.312(c)(1) |
| Transmission Security | TLS 1.2+ | §164.312(e)(1) |
| Encryption | KMS + AES-256 | §164.312(a)(2)(iv) |

## 📊 Data Flow

### 1. Authentication Flow
```
User → WAF → API Gateway → Cognito → JWT Token → Lambda
```

### 2. API Request Flow
```
Client → WAF → API Gateway → Lambda → DynamoDB → Response
                    ↓
              Audit Trail → Audit Table
```

### 3. Monitoring Flow
```
All Components → CloudWatch Logs → CloudWatch Metrics → Alarms → SNS
```

### 4. Encryption Flow
```
Data → Lambda → KMS Encrypt → DynamoDB (Encrypted)
Data ← Lambda ← KMS Decrypt ← DynamoDB (Encrypted)
```

## 🏥 HIPAA Compliance

### Administrative Safeguards
- **Security Officer**: Designated security responsibility
- **Workforce Training**: Security awareness program
- **Access Management**: User access procedures
- **Incident Response**: Security incident procedures

### Physical Safeguards
- **AWS Data Centers**: SOC 2 Type II certified
- **Facility Access**: Multi-factor authentication
- **Workstation Security**: Secure access controls
- **Media Controls**: Secure data handling

### Technical Safeguards
- **Access Control**: Unique user identification
- **Audit Controls**: Hardware, software, and procedural mechanisms
- **Integrity**: PHI alteration/destruction protection
- **Transmission Security**: End-to-end encryption

### Implementation Details

#### Access Control (§164.312(a))
```typescript
// Cognito Configuration
selfSignUpEnabled: false  // Admin-only registration
mfa: REQUIRED            // Multi-factor authentication
passwordPolicy: {        // Strong password requirements
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireDigits: true,
  requireSymbols: true
}
```

#### Audit Controls (§164.312(b))
```typescript
// Comprehensive Logging
- API Gateway access logs
- Lambda execution logs
- DynamoDB access patterns
- Authentication events
- Failed access attempts
```

#### Integrity (§164.312(c))
```typescript
// Data Integrity Measures
- KMS encryption with checksums
- DynamoDB conditional writes
- Version control for records
- Immutable audit trail
```

#### Transmission Security (§164.312(e))
```typescript
// Encryption in Transit
- TLS 1.2+ for all communications
- Certificate-based authentication
- Perfect Forward Secrecy
- HSTS headers
```

## 📈 Monitoring & Alerting

### CloudWatch Metrics

#### API Gateway Metrics
- `4XXError`: Client errors
- `5XXError`: Server errors
- `Count`: Request count
- `Latency`: Response time
- `IntegrationLatency`: Backend latency

#### Lambda Metrics
- `Duration`: Execution time
- `Errors`: Function errors
- `Throttles`: Concurrent execution limits
- `ConcurrentExecutions`: Active executions

#### DynamoDB Metrics
- `ConsumedReadCapacityUnits`: Read capacity usage
- `ConsumedWriteCapacityUnits`: Write capacity usage
- `ThrottledRequests`: Throttled operations
- `SystemErrors`: Service errors

### Custom Alarms

#### High Priority Alarms
```typescript
// Critical Security Events
- Failed authentication attempts > 10/minute
- API error rate > 5%
- Lambda errors > 1%
- DynamoDB throttling events

// Performance Alarms
- API latency > 2 seconds
- Lambda duration > 25 seconds
- DynamoDB consumed capacity > 80%
```

#### Medium Priority Alarms
```typescript
// Operational Monitoring
- API request count anomalies
- Lambda cold start frequency
- CloudWatch log errors
- KMS key usage spikes
```

### Alerting Channels
- **Email**: Critical security events
- **SMS**: High-priority operational issues
- **Slack**: Development team notifications
- **PagerDuty**: On-call escalation

## 🚀 Deployment Architecture

### Environment Strategy
```
Development → Staging → Production
     ↓           ↓         ↓
   Dev Stack  Stage Stack Prod Stack
```

### CI/CD Pipeline
```typescript
// GitHub Actions Workflow
1. Code Commit → GitHub
2. Automated Tests → Jest + CDK Synth
3. Security Scan → CDK Nag + SAST
4. Deploy to Staging → Automated
5. Integration Tests → Automated
6. Deploy to Production → Manual Approval
```

### Infrastructure as Code
```typescript
// CDK Stack Configuration
new TechHealthStack(app, 'TechHealthStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  alertEmail: process.env.ALERT_EMAIL,
  enableWaf: true,
  enableMonitoring: true
});
```

## 💰 Cost Optimization

### Serverless Benefits
- **No Idle Costs**: Pay only for actual usage
- **Automatic Scaling**: No over-provisioning
- **Managed Services**: Reduced operational overhead

### Cost Breakdown (Estimated Monthly)

#### Low Usage (< 1M requests/month)
- API Gateway: $3.50
- Lambda: $0.20
- DynamoDB: $1.25
- CloudWatch: $2.00
- KMS: $1.00
- **Total: ~$8/month**

#### Medium Usage (10M requests/month)
- API Gateway: $35.00
- Lambda: $2.00
- DynamoDB: $12.50
- CloudWatch: $10.00
- KMS: $1.00
- **Total: ~$60/month**

#### High Usage (100M requests/month)
- API Gateway: $350.00
- Lambda: $20.00
- DynamoDB: $125.00
- CloudWatch: $50.00
- KMS: $1.00
- **Total: ~$546/month**

### Cost Optimization Strategies
1. **DynamoDB On-Demand**: Pay per request
2. **Lambda Provisioned Concurrency**: For predictable workloads
3. **CloudWatch Log Retention**: Optimize retention periods
4. **API Gateway Caching**: Reduce backend calls
5. **Reserved Capacity**: For consistent high usage

## 📚 Additional Resources

### AWS Documentation
- [AWS HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)

### Security Resources
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

### Compliance Resources
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [AWS HIPAA Whitepaper](https://d1.awsstatic.com/whitepapers/compliance/AWS_HIPAA_Compliance_Whitepaper.pdf)
- [Healthcare on AWS](https://aws.amazon.com/health/)
