import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityLayer } from './constructs/security-layer';
import { PatientDatabase } from './constructs/patient-database';
import { PatientApi } from './constructs/patient-api';
import { CognitoAuth } from './constructs/cognito-auth';
import { WAFProtection } from './constructs/waf-protection';
import { Monitoring } from './constructs/monitoring';

export interface TechHealthCdkStackProps extends cdk.StackProps {
  alertEmail?: string;
  enableWaf?: boolean;
  enableMonitoring?: boolean;
}

export class TechHealthCdkStack extends cdk.Stack {
  public readonly apiEndpoint: string;
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;

  constructor(scope: Construct, id: string, props: TechHealthCdkStackProps = {}) {
    super(scope, id, props);

    // Default configuration
    const config = {
      alertEmail: props.alertEmail || process.env.ALERT_EMAIL || 'admin@techhealth.com',
      enableWaf: props.enableWaf ?? true,
      enableMonitoring: props.enableMonitoring ?? true,
    };

    // Authentication layer
    const auth = new CognitoAuth(this, 'CognitoAuth');
    
    // Security and encryption layer
    const security = new SecurityLayer(this, 'SecurityLayer');
    
    // Patient database with encryption
    const database = new PatientDatabase(this, 'PatientDatabase', {
      encryptionKey: security.kmsKey,
    });
    
    // API Gateway and Lambda functions
    const api = new PatientApi(this, 'PatientApi', {
      patientTable: database.table,
      auditTable: database.auditTable,
      kmsKey: security.kmsKey,
      userPool: auth.userPool,
    });

    // WAF protection (optional)
    if (config.enableWaf) {
      new WAFProtection(this, 'WAFProtection', {
        restApi: api.restApi,
      });
    }
    
    // Monitoring and alerting (optional)
    if (config.enableMonitoring) {
      new Monitoring(this, 'Monitoring', {
        restApi: api.restApi,
        lambdaFunction: api.patientHandler,
        patientTable: database.table,
        alertEmail: config.alertEmail,
      });
    }

    // Store outputs for external access
    this.apiEndpoint = api.restApi.url;
    this.userPoolId = auth.userPool.userPoolId;
    this.userPoolClientId = auth.userPoolClient.userPoolClientId;
    
    // CloudFormation outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.apiEndpoint,
      description: 'Tech Health API Endpoint',
      exportName: `${this.stackName}-ApiEndpoint`,
    });
    
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${this.stackName}-UserPoolId`,
    });
    
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${this.stackName}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: security.kmsKey.keyId,
      description: 'KMS Key ID for encryption',
      exportName: `${this.stackName}-KMSKeyId`,
    });
  }
}

// Keep backward compatibility with the original class name
export { TechHealthCdkStack as TechHealthStack };
