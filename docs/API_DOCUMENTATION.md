# Tech Health API Documentation

## 🔗 Base URL
```
https://api.techhealth.com/v1
```

## 🔐 Authentication

All API endpoints require JWT authentication via Amazon Cognito.

### Getting an Access Token
```bash
# Login to get JWT token
curl -X POST https://cognito-idp.us-east-1.amazonaws.com/ \
  -H "Content-Type: application/x-amz-json-1.1" \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth" \
  -d '{
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "your-client-id",
    "AuthParameters": {
      "USERNAME": "healthcare.provider@hospital.com",
      "PASSWORD": "SecurePassword123!"
    }
  }'
```

### Using the Token
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     https://api.techhealth.com/v1/patients
```

## 📋 API Endpoints

### 1. List Patients
```http
GET /patients
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 50, max: 100)
- `nextToken` (optional): Pagination token
- `recordType` (optional): Filter by record type

**Example Request:**
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     "https://api.techhealth.com/v1/patients?limit=10&recordType=PATIENT_INFO"
```

**Example Response:**
```json
{
  "statusCode": 200,
  "data": {
    "patients": [
      {
        "patientId": "patient-123",
        "recordType": "PATIENT_INFO",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1985-06-15",
        "email": "john.doe@email.com",
        "phone": "+1-555-0123",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "nextToken": "eyJwYXRpZW50SWQiOiJwYXRpZW50LTEyMyJ9",
    "count": 1
  }
}
```

### 2. Create Patient
```http
POST /patients
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-03-22",
  "email": "jane.smith@email.com",
  "phone": "+1-555-0456",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  },
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "+1-555-0789"
  }
}
```

**Example Request:**
```bash
curl -X POST https://api.techhealth.com/v1/patients \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1990-03-22",
    "email": "jane.smith@email.com",
    "phone": "+1-555-0456"
  }'
```

**Example Response:**
```json
{
  "statusCode": 201,
  "data": {
    "patientId": "patient-456",
    "message": "Patient created successfully",
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

### 3. Get Patient by ID
```http
GET /patients/{patientId}
```

**Path Parameters:**
- `patientId`: Unique patient identifier

**Example Request:**
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     https://api.techhealth.com/v1/patients/patient-123
```

**Example Response:**
```json
{
  "statusCode": 200,
  "data": {
    "patientId": "patient-123",
    "recordType": "PATIENT_INFO",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1985-06-15",
    "email": "john.doe@email.com",
    "phone": "+1-555-0123",
    "address": {
      "street": "456 Oak Ave",
      "city": "Somewhere",
      "state": "NY",
      "zipCode": "67890"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1-555-0321"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "version": 1
  }
}
```

### 4. Update Patient
```http
PUT /patients/{patientId}
```

**Path Parameters:**
- `patientId`: Unique patient identifier

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe.updated@email.com",
  "phone": "+1-555-9999",
  "version": 1
}
```

**Example Request:**
```bash
curl -X PUT https://api.techhealth.com/v1/patients/patient-123 \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe.updated@email.com",
    "phone": "+1-555-9999",
    "version": 1
  }'
```

**Example Response:**
```json
{
  "statusCode": 200,
  "data": {
    "patientId": "patient-123",
    "message": "Patient updated successfully",
    "updatedAt": "2024-01-15T12:00:00Z",
    "version": 2
  }
}
```

### 5. Delete Patient (Soft Delete)
```http
DELETE /patients/{patientId}
```

**Path Parameters:**
- `patientId`: Unique patient identifier

**Example Request:**
```bash
curl -X DELETE https://api.techhealth.com/v1/patients/patient-123 \
  -H "Authorization: Bearer <jwt-token>"
```

**Example Response:**
```json
{
  "statusCode": 200,
  "data": {
    "patientId": "patient-123",
    "message": "Patient deleted successfully",
    "deletedAt": "2024-01-15T13:00:00Z"
  }
}
```

### 6. Get Patient Medical Records
```http
GET /patients/{patientId}/records
```

**Path Parameters:**
- `patientId`: Unique patient identifier

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)
- `recordType` (optional): Filter by record type

**Example Request:**
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     "https://api.techhealth.com/v1/patients/patient-123/records?startDate=2024-01-01&endDate=2024-01-31"
```

**Example Response:**
```json
{
  "statusCode": 200,
  "data": {
    "patientId": "patient-123",
    "records": [
      {
        "recordId": "record-789",
        "recordType": "MEDICAL_RECORD",
        "date": "2024-01-15",
        "provider": "Dr. Smith",
        "diagnosis": "Hypertension",
        "treatment": "Prescribed medication",
        "notes": "Patient responding well to treatment",
        "createdAt": "2024-01-15T14:00:00Z"
      }
    ],
    "count": 1
  }
}
```

### 7. Add Medical Record
```http
POST /patients/{patientId}/records
```

**Path Parameters:**
- `patientId`: Unique patient identifier

**Request Body:**
```json
{
  "recordType": "MEDICAL_RECORD",
  "date": "2024-01-15",
  "provider": "Dr. Johnson",
  "diagnosis": "Annual Checkup",
  "treatment": "Routine examination",
  "notes": "Patient in good health",
  "vitals": {
    "bloodPressure": "120/80",
    "heartRate": 72,
    "temperature": 98.6,
    "weight": 165
  }
}
```

**Example Request:**
```bash
curl -X POST https://api.techhealth.com/v1/patients/patient-123/records \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "MEDICAL_RECORD",
    "date": "2024-01-15",
    "provider": "Dr. Johnson",
    "diagnosis": "Annual Checkup"
  }'
```

**Example Response:**
```json
{
  "statusCode": 201,
  "data": {
    "recordId": "record-101112",
    "patientId": "patient-123",
    "message": "Medical record added successfully",
    "createdAt": "2024-01-15T15:00:00Z"
  }
}
```

## 🚨 Error Responses

### Error Format
```json
{
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-15T16:00:00Z",
  "requestId": "req-123456789"
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "error": {
    "code": "NOT_FOUND",
    "message": "Patient not found"
  }
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "error": {
    "code": "CONFLICT",
    "message": "Patient already exists"
  }
}
```

#### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests"
  }
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## 📊 Rate Limits

- **Per User**: 1000 requests per hour
- **Per IP**: 2000 requests per hour
- **Burst**: 100 requests per minute

## 🔒 Security Headers

All responses include security headers:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## 📝 Request/Response Examples

### Complete Patient Creation Flow

#### 1. Authenticate
```bash
# Get JWT token
TOKEN=$(curl -s -X POST https://cognito-idp.us-east-1.amazonaws.com/ \
  -H "Content-Type: application/x-amz-json-1.1" \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth" \
  -d '{
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "your-client-id",
    "AuthParameters": {
      "USERNAME": "provider@hospital.com",
      "PASSWORD": "SecurePass123!"
    }
  }' | jq -r '.AuthenticationResult.AccessToken')
```

#### 2. Create Patient
```bash
curl -X POST https://api.techhealth.com/v1/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "dateOfBirth": "1988-12-10",
    "email": "alice.johnson@email.com",
    "phone": "+1-555-1234",
    "address": {
      "street": "789 Pine St",
      "city": "Healthcare City",
      "state": "TX",
      "zipCode": "75001"
    }
  }'
```

#### 3. Add Medical Record
```bash
curl -X POST https://api.techhealth.com/v1/patients/patient-789/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "MEDICAL_RECORD",
    "date": "2024-01-15",
    "provider": "Dr. Williams",
    "diagnosis": "Routine Physical",
    "treatment": "Annual wellness exam",
    "vitals": {
      "bloodPressure": "118/76",
      "heartRate": 68,
      "temperature": 98.4,
      "weight": 140
    }
  }'
```

## 🧪 Testing

### Postman Collection
Import the Postman collection for easy API testing:
```json
{
  "info": {
    "name": "Tech Health API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  }
}
```

### Environment Variables
```json
{
  "api_base_url": "https://api.techhealth.com/v1",
  "cognito_client_id": "your-client-id",
  "jwt_token": "your-jwt-token"
}
```

## 📚 SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class TechHealthAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getPatients(limit = 50) {
    const response = await this.client.get(`/patients?limit=${limit}`);
    return response.data;
  }

  async createPatient(patientData) {
    const response = await this.client.post('/patients', patientData);
    return response.data;
  }

  async getPatient(patientId) {
    const response = await this.client.get(`/patients/${patientId}`);
    return response.data;
  }
}

// Usage
const api = new TechHealthAPI('https://api.techhealth.com/v1', 'your-jwt-token');
const patients = await api.getPatients();
```

### Python
```python
import requests

class TechHealthAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_patients(self, limit=50):
        response = requests.get(
            f'{self.base_url}/patients?limit={limit}',
            headers=self.headers
        )
        return response.json()
    
    def create_patient(self, patient_data):
        response = requests.post(
            f'{self.base_url}/patients',
            json=patient_data,
            headers=self.headers
        )
        return response.json()

# Usage
api = TechHealthAPI('https://api.techhealth.com/v1', 'your-jwt-token')
patients = api.get_patients()
```

## 🔍 Monitoring & Debugging

### Request Tracing
Each request includes a unique `X-Request-ID` header for tracing:
```
X-Request-ID: req-1234567890abcdef
```

### CloudWatch Logs
Monitor API usage in CloudWatch:
- API Gateway access logs
- Lambda execution logs
- Error tracking and alerting

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T16:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "authentication": "healthy",
    "encryption": "healthy"
  }
}
```
