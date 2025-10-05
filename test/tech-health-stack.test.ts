import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { TechHealthStack } from '../lib/tech-health-stack';

describe('TechHealthStack', () => {
  test('Stack creates required resources', () => {
    const app = new cdk.App();
    const stack = new TechHealthStack(app, 'TestTechHealthStack');
    const template = Template.fromStack(stack);

    // Test that DynamoDB tables are created
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
    });

    // Test that Lambda function is created
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
    });

    // Test that API Gateway is created
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'Tech Health  Patient API',
    });

    // Test that Cognito User Pool is created
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolName: 'tech-health-users',
    });

    // Test that KMS Key is created
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });
  });

  test('Stack outputs are defined', () => {
    const app = new cdk.App();
    const stack = new TechHealthStack(app, 'TestTechHealthStack');
    const template = Template.fromStack(stack);

    // Check that outputs are defined
    template.hasOutput('ApiEndpoint', {});
    template.hasOutput('UserPoolId', {});
    template.hasOutput('UserPoolClientId', {});
    template.hasOutput('KMSKeyId', {});
  });
});
