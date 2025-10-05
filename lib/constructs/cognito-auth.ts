import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CognitoAuth extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly authorizer: cognito.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // User Pool with strong security policies
    this.userPool = new cognito.UserPool(this, 'HealthUserPool', {
      userPoolName: 'tech-health-users',
      selfSignUpEnabled: false, // Admin-only registration for healthcare
      signInAliases: {
        email: true,
        username: true
      },
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: {
        sms: true,
        otp: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY // For dev only
    });

    // User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'HealthUserPoolClient', {
      userPool: this.userPool,
      generateSecret: false, // For web/mobile apps
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE, cognito.OAuthScope.EMAIL]
      }
    });

    // Add healthcare provider group
    new cognito.CfnUserPoolGroup(this, 'HealthcareProviders', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'healthcare-providers',
      description: 'Healthcare providers with patient data access'
    });
  }
}
