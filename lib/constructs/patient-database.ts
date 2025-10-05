typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
interface PatientDatabaseProps {
  encryptionKey: kms.Key;
}
export class PatientDatabase extends Construct {
  public readonly table: dynamodb.Table;
  public readonly auditTable: dynamodb.Table;
  constructor(scope: Construct, id: string, props: PatientDatabaseProps) {
    super(scope, id);
    // Main patient records table
    this.table = new dynamodb.Table(this, 'PatientRecords', {
      partitionKey: { name: 'patientId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'recordType', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For demo only
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    // Global Secondary Index for querying by date
    this.table.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: { name: 'recordType', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });
    // Audit trail table for compliance
    this.auditTable = new dynamodb.Table(this, 'AuditTrail', {
      partitionKey: { name: 'auditId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
