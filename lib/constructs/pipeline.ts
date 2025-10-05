import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface PipelineProps {
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
}

export class CICDPipeline extends Construct {
  public readonly pipeline: codepipeline.Pipeline;

  constructor(scope: Construct, id: string, props: PipelineProps) {
    super(scope, id);

    // S3 Bucket for artifacts
    const artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // CodeBuild project for testing and building
    const buildProject = new codebuild.Project(this, 'BuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '18'
            },
            commands: [
              'npm install -g aws-cdk',
              'npm ci'
            ]
          },
          pre_build: {
            commands: [
              'npm run test',
              'npm run build'
            ]
          },
          build: {
            commands: [
              'npx cdk synth'
            ]
          }
        },
        artifacts: {
          'base-directory': 'cdk.out',
          files: ['**/*']
        }
      })
    });

    // Grant necessary permissions to CodeBuild
    buildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'sts:AssumeRole',
        'cloudformation:*',
        'iam:*',
        's3:*',
        'lambda:*',
        'apigateway:*',
        'dynamodb:*',
        'kms:*',
        'cognito-idp:*',
        'wafv2:*',
        'logs:*',
        'cloudwatch:*',
        'sns:*'
      ],
      resources: ['*']
    }));

    // Pipeline artifacts
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // Create the pipeline
    this.pipeline = new codepipeline.Pipeline(this, 'TechHealthPipeline', {
      artifactBucket: artifactsBucket,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipelineActions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: props.githubOwner,
              repo: props.githubRepo,
              oauthToken: cdk.SecretValue.plainText(props.githubToken),
              output: sourceOutput,
              branch: 'main'
            })
          ]
        },
        {
          stageName: 'Build',
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: 'Build',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput]
            })
          ]
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipelineActions.CloudFormationCreateUpdateStackAction({
              actionName: 'Deploy',
              templatePath: buildOutput.atPath('TechHealthCdkStack.template.json'),
              stackName: 'TechHealthCdkStack',
              adminPermissions: true
            })
          ]
        }
      ]
    });
  }
}
