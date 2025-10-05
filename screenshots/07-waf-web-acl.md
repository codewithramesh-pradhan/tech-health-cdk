# WAF Web ACL Configuration

**Screenshot**: `07-waf-web-acl.png`

## What to Capture
AWS Console → WAF & Shield → Web ACLs → TechHealthWebACL

## Validation Checklist
- ✅ Web ACL name: Contains "TechHealth"
- ✅ Scope: Regional
- ✅ Default action: Allow
- ✅ Rules: 3-4 rules configured
- ✅ Associated resource: API Gateway stage
- ✅ CloudWatch metrics enabled

## Expected Rules Configuration
```
1. RateLimitRule: 2000 requests/5min per IP
2. AWSManagedRulesCommonRuleSet: OWASP Top 10
3. AWSManagedRulesKnownBadInputsRuleSet: Malicious inputs
4. GeoBlockingRule: Optional country blocking
```

## Screenshot Requirements
- Show WAF Web ACL overview
- Rules list with priorities
- Associated resources section
- CloudWatch metrics configuration
- Rule details and actions visible

## Validation Notes
This screenshot confirms:
- Web application firewall protection
- Security rule implementation
- API Gateway integration
- Threat mitigation setup
