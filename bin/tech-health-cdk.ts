#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TechHealthCdkStack } from '../lib/tech-health-cdk-stack';

const app = new cdk.App();

// Get environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create the main stack with GitHub naming but enhanced functionality
new TechHealthCdkStack(app, 'TechHealthCdkStack', {
  env,
  description: 'HIPAA-compliant healthcare API infrastructure',
  alertEmail: process.env.ALERT_EMAIL,
  enableWaf: true,
  enableMonitoring: true,
  tags: {
    Project: 'TechHealth',
    Environment: process.env.ENVIRONMENT || 'dev',
    Owner: 'Healthcare-Team',
  },
});

app.synth();
