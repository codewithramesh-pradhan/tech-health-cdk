#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TechHealthStack } from '../lib/tech-health-stack';

const app = new cdk.App();

// Get environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create the main stack
new TechHealthStack(app, 'TechHealthStack', {
  env,
  description: 'HIPAA-compliant healthcare API infrastructure',
  tags: {
    Project: 'TechHealth',
    Environment: process.env.ENVIRONMENT || 'dev',
    Owner: 'Healthcare-Team',
  },
});

app.synth();
