typescript
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
export class SecurityLayer extends Construct {
  public readonly kmsKey: kms.Key;
  public readonly auditRole: iam.Role;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    // KMS key for encryption at rest
    this.kmsKey = new kms.Key(this, 'HealthDataKey', {
      enableKeyRotation: true,
      description: 'Key for encrypting health data',
      keySpec: kms.KeySpec.SYMMETRIC_DEFAULT,
      keyUsage: kms.KeyUsage.ENCRYPT_DECRYPT,
    });
    // Audit role for compliance logging
    this.auditRole = new iam.Role(this, 'AuditRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    // Grant audit role access to CloudWatch
    this.auditRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: ['*'],
    }));
  }
}
