typescript
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
interface PatientApiProps {
  patientTable: dynamodb.Table;
  auditTable: dynamodb.Table;
  kmsKey: kms.Key;
  userPool: cognito.UserPool;
}
export class PatientApi extends Construct {
  public readonly restApi: apigateway.RestApi;
  public readonly patientHandler: lambda.Function;
  constructor(scope: Construct, id: string, props: PatientApiProps) {
    super(scope, id);
    // CloudWatch log group for API
    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      retention: logs.RetentionDays.ONE_YEAR,
    });
    // Lambda function for patient operations
    this.patientHandler = new lambda.Function(this, 'PatientHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/patient-handler'),
      environment: {
        PATIENT_TABLE_NAME: props.patientTable.tableName,
        AUDIT_TABLE_NAME: props.auditTable.tableName,
        KMS_KEY_ID: props.kmsKey.keyId,
        LOG_GROUP_NAME: logGroup.logGroupName,
      },
      timeout: cdk.Duration.seconds(30),
    });
    // Grant Lambda permissions to DynamoDB tables
    props.patientTable.grantReadWriteData(this.patientHandler);
    props.auditTable.grantWriteData(this.patientHandler);
    props.kmsKey.grantEncryptDecrypt(this.patientHandler);
    // Grant CloudWatch logging permissions
    logGroup.grantWrite(this.patientHandler);
    // Add specific IAM policy for HIPAA compliance
    this.patientHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'dynamodb:Scan'
      ],
      resources: [
        props.patientTable.tableArn,
        `${props.patientTable.tableArn}/index/*`,
        props.auditTable.tableArn
      ],
    }));
    // API Gateway REST API
    this.restApi = new apigateway.RestApi(this, 'TechHealthApi', {
      restApiName: 'Tech Health  Patient API',
      description: 'API for managing patient records',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization'],
      },
      cloudWatchRole: true,
    });
    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(this.patientHandler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });
    // API resources and methods
    const patients = this.restApi.root.addResource('patients');
    patients.addMethod('GET', lambdaIntegration); // List patients
    patients.addMethod('POST', lambdaIntegration); // Create patient
    const patient = patients.addResource('{patientId}');
    patient.addMethod('GET', lambdaIntegration); // Get patient
    patient.addMethod('PUT', lambdaIntegration); // Update patient
    patient.addMethod('DELETE', lambdaIntegration); // Delete patient
    // Medical records sub-resource
    const records = patient.addResource('records');
    records.addMethod('GET', lambdaIntegration); // Get patient records
    records.addMethod('POST', lambdaIntegration); // Add medical record
  }
}
// Additional functions for update, list, and medical records...