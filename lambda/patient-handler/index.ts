import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const PATIENT_TABLE = process.env.PATIENT_TABLE_NAME!;
const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME!;

interface Patient {
  patientId: string;
  recordType: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathParameters = event.pathParameters;

    // Log audit trail
    await logAuditTrail(event, method, path);

    switch (method) {
      case 'GET':
        if (pathParameters?.patientId) {
          return await getPatient(pathParameters.patientId);
        } else {
          return await listPatients(event.queryStringParameters);
        }
      case 'POST':
        return await createPatient(JSON.parse(event.body || '{}'));
      case 'PUT':
        if (pathParameters?.patientId) {
          return await updatePatient(pathParameters.patientId, JSON.parse(event.body || '{}'));
        }
        break;
      case 'DELETE':
        if (pathParameters?.patientId) {
          return await deletePatient(pathParameters.patientId);
        }
        break;
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Not Found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

async function getPatient(patientId: string): Promise<APIGatewayProxyResult> {
  const command = new GetCommand({
    TableName: PATIENT_TABLE,
    Key: { patientId, recordType: 'PATIENT_INFO' },
  });

  const result = await docClient.send(command);
  
  if (!result.Item) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Patient not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ data: result.Item }),
  };
}

async function listPatients(queryParams: any): Promise<APIGatewayProxyResult> {
  const command = new ScanCommand({
    TableName: PATIENT_TABLE,
    FilterExpression: 'recordType = :recordType',
    ExpressionAttributeValues: {
      ':recordType': 'PATIENT_INFO',
    },
    Limit: parseInt(queryParams?.limit || '50'),
  });

  const result = await docClient.send(command);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      data: {
        patients: result.Items || [],
        count: result.Count || 0,
      },
    }),
  };
}

async function createPatient(patientData: any): Promise<APIGatewayProxyResult> {
  const patientId = uuidv4();
  const now = new Date().toISOString();

  const patient: Patient = {
    patientId,
    recordType: 'PATIENT_INFO',
    firstName: patientData.firstName,
    lastName: patientData.lastName,
    dateOfBirth: patientData.dateOfBirth,
    email: patientData.email,
    phone: patientData.phone,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  const command = new PutCommand({
    TableName: PATIENT_TABLE,
    Item: patient,
  });

  await docClient.send(command);

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      data: {
        patientId,
        message: 'Patient created successfully',
        createdAt: now,
      },
    }),
  };
}

async function updatePatient(patientId: string, updateData: any): Promise<APIGatewayProxyResult> {
  const now = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: PATIENT_TABLE,
    Key: { patientId, recordType: 'PATIENT_INFO' },
    UpdateExpression: 'SET firstName = :firstName, lastName = :lastName, email = :email, phone = :phone, updatedAt = :updatedAt, version = version + :inc',
    ExpressionAttributeValues: {
      ':firstName': updateData.firstName,
      ':lastName': updateData.lastName,
      ':email': updateData.email,
      ':phone': updateData.phone,
      ':updatedAt': now,
      ':inc': 1,
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      data: {
        patientId,
        message: 'Patient updated successfully',
        updatedAt: now,
        version: result.Attributes?.version,
      },
    }),
  };
}

async function deletePatient(patientId: string): Promise<APIGatewayProxyResult> {
  const command = new DeleteCommand({
    TableName: PATIENT_TABLE,
    Key: { patientId, recordType: 'PATIENT_INFO' },
  });

  await docClient.send(command);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      data: {
        patientId,
        message: 'Patient deleted successfully',
        deletedAt: new Date().toISOString(),
      },
    }),
  };
}

async function logAuditTrail(event: APIGatewayProxyEvent, method: string, path: string): Promise<void> {
  const auditRecord = {
    auditId: uuidv4(),
    timestamp: new Date().toISOString(),
    method,
    path,
    sourceIp: event.requestContext.identity.sourceIp,
    userAgent: event.requestContext.identity.userAgent,
    requestId: event.requestContext.requestId,
  };

  const command = new PutCommand({
    TableName: AUDIT_TABLE,
    Item: auditRecord,
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}
