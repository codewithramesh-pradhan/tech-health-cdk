import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface WAFProtectionProps {
  restApi: apigateway.RestApi;
  rateLimitPerMinute?: number;
  enableGeoBlocking?: boolean;
  blockedCountries?: string[];
}

export class WAFProtection extends Construct {
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: WAFProtectionProps) {
    super(scope, id);

    const rateLimitPerMinute = props.rateLimitPerMinute || 2000;
    const enableGeoBlocking = props.enableGeoBlocking ?? false;
    const blockedCountries = props.blockedCountries || [];

    // Create WAF rules
    const rules: wafv2.CfnWebACL.RuleProperty[] = [
      // Rate limiting rule
      {
        name: 'RateLimitRule',
        priority: 1,
        statement: {
          rateBasedStatement: {
            limit: rateLimitPerMinute,
            aggregateKeyType: 'IP'
          }
        },
        action: { block: {} },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'RateLimitRule'
        }
      },
      // AWS Managed Core Rule Set
      {
        name: 'AWSManagedRulesCommonRuleSet',
        priority: 2,
        overrideAction: { none: {} },
        statement: {
          managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesCommonRuleSet'
          }
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'CommonRuleSetMetric'
        }
      },
      // Known Bad Inputs Rule Set
      {
        name: 'AWSManagedRulesKnownBadInputsRuleSet',
        priority: 3,
        overrideAction: { none: {} },
        statement: {
          managedRuleGroupStatement: {
            vendorName: 'AWS',
            name: 'AWSManagedRulesKnownBadInputsRuleSet'
          }
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'KnownBadInputsRuleSetMetric'
        }
      }
    ];

    // Add geo-blocking rule if enabled
    if (enableGeoBlocking && blockedCountries.length > 0) {
      rules.push({
        name: 'GeoBlockingRule',
        priority: 4,
        statement: {
          geoMatchStatement: {
            countryCodes: blockedCountries
          }
        },
        action: { block: {} },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'GeoBlockingRule'
        }
      });
    }

    // Create Web ACL
    this.webAcl = new wafv2.CfnWebACL(this, 'WebACL', {
      scope: 'REGIONAL',
      defaultAction: { allow: {} },
      rules,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'TechHealthWebACL'
      },
      tags: [
        {
          key: 'Name',
          value: 'TechHealth-WAF'
        }
      ]
    });

    // Associate Web ACL with API Gateway
    new wafv2.CfnWebACLAssociation(this, 'WebACLAssociation', {
      resourceArn: `arn:aws:apigateway:${cdk.Stack.of(this).region}::/restapis/${props.restApi.restApiId}/stages/${props.restApi.deploymentStage.stageName}`,
      webAclArn: this.webAcl.attrArn
    });
  }
}
