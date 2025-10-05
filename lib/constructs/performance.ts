import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface PerformanceProps {
  lambdaFunction: lambda.Function;
  patientTable: dynamodb.Table;
  restApi: apigateway.RestApi;
}

export class Performance extends Construct {
  constructor(scope: Construct, id: string, props: PerformanceProps) {
    super(scope, id);

    // Lambda Layer for shared dependencies
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset('layers/shared'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Shared dependencies for healthcare functions'
    });

    // Add layer to existing Lambda function
    props.lambdaFunction.addLayers(sharedLayer);

    // Lambda Provisioned Concurrency for consistent performance
    const alias = props.lambdaFunction.addAlias('live');
    alias.addAutoScaling({
      maxCapacity: 10,
      minCapacity: 2
    }).scaleOnUtilization({
      utilizationTarget: 0.7
    });

    // DynamoDB Auto Scaling
    const readScaling = props.patientTable.autoScaleReadCapacity({
      minCapacity: 5,
      maxCapacity: 100
    });
    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 70
    });

    const writeScaling = props.patientTable.autoScaleWriteCapacity({
      minCapacity: 5,
      maxCapacity: 100
    });
    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: 70
    });

    // API Gateway Caching
    const deployment = props.restApi.latestDeployment;
    if (deployment) {
      const stage = deployment.stage;
      if (stage) {
        stage.addMethodOptions('/*/*', {
          cachingEnabled: true,
          cacheTtl: cdk.Duration.minutes(5),
          cacheKeyParameters: ['method.request.path.patientId']
        });
      }
    }
  }
}
