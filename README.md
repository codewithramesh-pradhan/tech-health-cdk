# Tech Health CDK

A production-ready, HIPAA-compliant healthcare API infrastructure built with AWS CDK, featuring enterprise-grade security, monitoring, and scalability.

## 🏗️ Architecture

- **API Gateway** with request validation and throttling
- **AWS Lambda** for serverless compute
- **DynamoDB** with encryption at rest
- **Cognito** for authentication and authorization
- **WAF** for web application firewall protection
- **CloudWatch** for monitoring and alerting
- **KMS** for encryption key management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI configured
- CDK CLI installed (`npm install -g aws-cdk`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tech-health-cdk

# Install dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
npm run deploy
```

### Environment Variables

Create a `.env` file (optional):

```bash
# Environment Configuration
ENVIRONMENT=dev
ALERT_EMAIL=your-email@example.com
AWS_REGION=us-east-1
```

## 📋 Available Scripts

- `npm run build` - Compile TypeScript
- `npm run test` - Run tests
- `npm run deploy` - Deploy to AWS
- `npm run destroy` - Remove from AWS
- `npm run synth` - Generate CloudFormation template
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Stack Configuration

```typescript
new TechHealthStack(app, 'TechHealthStack', {
  alertEmail: 'admin@example.com',
  enableWaf: true,
  enableMonitoring: true,
});
```

## 🔒 Security Features

- ✅ Encryption at rest (DynamoDB, S3)
- ✅ Encryption in transit (HTTPS/TLS)
- ✅ KMS key management with rotation
- ✅ WAF protection with managed rule sets
- ✅ Cognito authentication with MFA support
- ✅ IAM least privilege access
- ✅ CloudTrail logging for audit

## 📊 Monitoring

- CloudWatch dashboards
- Custom metrics and alarms
- SNS notifications for critical alerts
- Comprehensive audit logging

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📚 API Documentation

### Endpoints

- `GET /patients` - List patients
- `POST /patients` - Create new patient
- `GET /patients/{id}` - Get patient information
- `PUT /patients/{id}` - Update patient information
- `DELETE /patients/{id}` - Delete patient (soft delete)

### Authentication

All endpoints require JWT token from Cognito:

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     https://api.example.com/patients
```

## 🏥 HIPAA Compliance

This infrastructure implements HIPAA security requirements:

- **Access Control**: Cognito with MFA
- **Audit Controls**: CloudTrail logging
- **Integrity**: Data validation and checksums
- **Transmission Security**: TLS encryption
- **Encryption**: KMS encryption at rest

## 🚀 Deployment

### Development

```bash
npm run deploy
```

### Production

```bash
ENVIRONMENT=prod npm run deploy
```

## 📁 Project Structure

```
├── bin/                    # CDK app entry point
├── lib/                    # CDK constructs
│   ├── constructs/         # Reusable constructs
│   └── tech-health-stack.ts
├── lambda/                 # Lambda function code
├── test/                   # Unit tests
├── docs/                   # Documentation
├── screenshots/            # Validation screenshots
├── generated-diagrams/     # Architecture diagrams
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue in GitHub
- Check the [documentation](docs/)
- Review [architecture diagrams](generated-diagrams/)

## 📖 Documentation

- [Complete Project Documentation](PROJECT_DOCUMENTATION.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
