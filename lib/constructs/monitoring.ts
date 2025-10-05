import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface MonitoringProps {
  restApi: apigateway.RestApi;
  lambdaFunction: lambda.Function;
  patientTable: dynamodb.Table;
  alertEmail: string;
}

export class Monitoring extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'HealthAlerts', {
      displayName: 'Tech Health API Alerts'
    });

    // Email subscription for alerts
    this.alertTopic.addSubscription(
      new snsSubscriptions.EmailSubscription(props.alertEmail)
    );

    // CloudWatch Alarms
    const apiErrorAlarm = new cloudwatch.Alarm(this, 'APIErrorAlarm', {
      metric: props.restApi.metricClientError(),
      threshold: 10,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });
    apiErrorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alertTopic));

    const lambdaErrorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      metric: props.lambdaFunction.metricErrors(),
      threshold: 5,
      evaluationPeriods: 2
    });
    lambdaErrorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alertTopic));

    const lambdaDurationAlarm = new cloudwatch.Alarm(this, 'LambdaDurationAlarm', {
      metric: props.lambdaFunction.metricDuration(),
      threshold: 10000, // 10 seconds
      evaluationPeriods: 3
    });
    lambdaDurationAlarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alertTopic));

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'HealthDashboard', {
      dashboardName: 'TechHealthAPI'
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway Metrics',
        left: [props.restApi.metricLatency()],
        right: [props.restApi.metricCount()]
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda Metrics',
        left: [props.lambdaFunction.metricDuration()],
        right: [props.lambdaFunction.metricInvocations()]
      }),
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Metrics',
        left: [props.patientTable.metricConsumedReadCapacityUnits()],
        right: [props.patientTable.metricConsumedWriteCapacityUnits()]
      })
    );
  }
}
