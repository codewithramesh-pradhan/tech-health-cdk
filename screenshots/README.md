# Screenshots Validation Guide

## 📸 Required Screenshots for Tech Health CDK Validation

This directory contains screenshots that validate the successful deployment and configuration of the Tech Health CDK infrastructure.

### Screenshot Requirements

#### AWS Console Screenshots (18 total)

1. **CloudFormation Stack Status**
   - Stack Status: CREATE_COMPLETE
   - All resources successfully created
   - Outputs tab with 4 values

2. **API Gateway Configuration**
   - REST API showing "Tech Health Patient API"
   - Resources tree with /patients endpoints
   - Methods: GET, POST, PUT, DELETE
   - Stage deployment status

3. **Lambda Function Details**
   - Lambda console showing PatientHandler function
   - Runtime: Node.js 18.x
   - Environment variables configured
   - IAM role attached

4. **DynamoDB Tables**
   - DynamoDB console showing both tables
   - PatientRecords and AuditTrail tables
   - Encryption: Customer managed
   - Point-in-time recovery enabled

5. **Cognito User Pool**
   - Cognito console showing user pool
   - MFA settings: Required
   - Password policy configuration
   - User groups created

6. **KMS Key Details**
   - KMS console showing customer managed key
   - Key rotation: Enabled
   - Key policy configured
   - Usage by services shown

7. **WAF Web ACL**
   - WAF console showing Web ACL
   - Rules configured and active
   - Associated with API Gateway
   - CloudWatch metrics enabled

8. **CloudWatch Dashboard**
   - CloudWatch dashboard with metrics
   - API Gateway, Lambda, DynamoDB metrics
   - Custom widgets configured
   - Real-time data displayed

9. **CloudWatch Alarms**
   - CloudWatch alarms list
   - All alarms in OK state
   - Proper thresholds configured
   - SNS actions configured

10. **SNS Topic Setup**
    - SNS console showing alert topic
    - Email subscription confirmed
    - Topic policy configured
    - Encryption settings

### Validation Checklist

#### For Each Screenshot:
- [ ] High resolution (1920x1080 minimum)
- [ ] Clear visibility of all relevant information
- [ ] No sensitive data visible (account IDs, keys, etc.)
- [ ] Timestamp visible when relevant
- [ ] Proper AWS console navigation visible

#### Content Validation:
- [ ] All expected resources present
- [ ] Configuration matches documentation
- [ ] Status indicators show success
- [ ] No error states visible
- [ ] Proper naming conventions used

#### Security Validation:
- [ ] No credentials or secrets visible
- [ ] Account information redacted if necessary
- [ ] Only public/demo data shown
- [ ] Compliance requirements met

### Screenshot Naming Convention

Format: `##-descriptive-name.png`
- Use 2-digit numbering (01, 02, etc.)
- Use lowercase with hyphens
- Include service or feature name
- Use .png format for clarity

### Taking Screenshots

#### Best Practices:
1. **Full Browser Window**: Capture entire browser window
2. **Clear Navigation**: Show AWS service navigation
3. **Relevant Tabs**: Focus on important configuration tabs
4. **Zoom Level**: Use 100% zoom for clarity
5. **Clean Interface**: Close unnecessary browser tabs/windows

#### Tools Recommended:
- **macOS**: Cmd+Shift+4 (selection) or Cmd+Shift+3 (full screen)
- **Windows**: Snipping Tool or Win+Shift+S
- **Linux**: gnome-screenshot or scrot
- **Browser Extensions**: Awesome Screenshot, Lightshot

### Validation Process

#### Step 1: Pre-Screenshot
- Deploy infrastructure completely
- Verify all services are running
- Test API endpoints
- Confirm monitoring is active

#### Step 2: Capture Screenshots
- Follow the numbered sequence
- Validate each screenshot against checklist
- Retake if quality is insufficient
- Ensure no sensitive data is visible

#### Step 3: Post-Screenshot
- Review all screenshots for completeness
- Verify against validation requirements
- Update documentation if needed
- Store in version control

### Integration with Documentation

These screenshots should be referenced in:
- `PROJECT_DOCUMENTATION.md` - Main validation guide
- `docs/DEPLOYMENT_GUIDE.md` - Deployment verification
- `docs/ARCHITECTURE.md` - Architecture validation
- `README.md` - Quick validation reference

### Compliance Notes

For HIPAA compliance:
- Ensure no PHI (Protected Health Information) is visible
- Use only test/demo data in screenshots
- Redact any sensitive configuration details
- Follow organizational screenshot policies

### Troubleshooting Screenshot Issues

#### Common Problems:
1. **Blurry Images**: Increase resolution, use 100% zoom
2. **Missing Information**: Expand panels, scroll to show all content
3. **Wrong Configuration**: Verify deployment before screenshots
4. **Security Concerns**: Review and redact sensitive information

#### Solutions:
- Use browser developer tools to adjust display
- Take multiple screenshots if content doesn't fit
- Use annotation tools to highlight important areas
- Implement screenshot review process

---

**Note**: This directory structure and validation guide ensures comprehensive documentation of the Tech Health CDK deployment for audit, compliance, and operational purposes.
