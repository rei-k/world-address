# ZKP Incident Response Plan

Comprehensive incident response procedures for the World Address ZKP Protocol. Defines incident classification, escalation procedures, response playbooks, and post-incident activities.

## Quick Reference

**Emergency Contact**: security@vey.example  
**Incident Hotline**: +1-XXX-XXX-XXXX  
**PagerDuty**: https://vey.pagerduty.com  
**Status Page**: https://status.vey.example

### Severity Classification

| Level | Response Time | Example |
|-------|---------------|---------|
| **P0 - Critical** | 15 minutes | Circuit compromise, mass data breach |
| **P1 - High** | 1 hour | Service outage, proof forgery detected |
| **P2 - Medium** | 4 hours | Performance degradation, minor bug |
| **P3 - Low** | 24 hours | Feature request, documentation update |

---

## Incident Response Team

### Roles and Responsibilities

#### Incident Commander (IC)
**Primary**: Security Lead  
**Backup**: Engineering Manager

**Responsibilities**:
- Overall incident coordination
- Decision-making authority
- Stakeholder communication
- Resource allocation
- Incident closure authorization

#### Technical Lead (TL)
**Primary**: Principal Engineer  
**Backup**: Senior ZKP Engineer

**Responsibilities**:
- Technical investigation
- Mitigation implementation
- System recovery
- Technical documentation

#### Communications Lead (CL)
**Primary**: Product Manager  
**Backup**: Customer Success Manager

**Responsibilities**:
- Status page updates
- Customer communications
- Internal notifications
- Post-mortem communication

#### Security Analyst
**Primary**: Security Engineer  
**Backup**: DevOps Engineer

**Responsibilities**:
- Forensic analysis
- Security assessment
- Evidence collection
- Compliance notification

---

## Incident Classification

### P0 - Critical Incidents 🔴

**Definition**: Catastrophic security breach or total service failure

**Examples**:
- Trusted setup compromise detected
- Circuit vulnerability allowing proof forgery
- Mass PID to address linkage breach
- Complete service outage (>99% error rate)
- Cryptographic key compromise
- Regulatory compliance violation

**Response SLA**: 15 minutes to acknowledgment, immediate action

**Escalation**: Immediate notification to C-level, board if necessary

**Communication**: Real-time updates every 30 minutes

---

### P1 - High Incidents 🟠

**Definition**: Significant security issue or major service disruption

**Examples**:
- Individual circuit vulnerability (limited scope)
- Partial service outage (50-99% error rate)
- Privacy leak affecting <100 users
- DDoS attack in progress
- Revocation list manipulation
- Signing key suspected compromise

**Response SLA**: 1 hour to acknowledgment, action within 2 hours

**Escalation**: Notification to VP Engineering, Security Officer

**Communication**: Updates every 2 hours

---

### P2 - Medium Incidents 🟡

**Definition**: Moderate impact on security or service quality

**Examples**:
- Performance degradation (proof gen >2s)
- Minor privacy concern (metadata leakage)
- Failed proof verification spike
- Abnormal error rate (10-50%)
- Dependency vulnerability (CVSS 4-7)
- Configuration drift

**Response SLA**: 4 hours to acknowledgment, resolution within 24 hours

**Escalation**: Notification to team leads

**Communication**: Daily updates if ongoing

---

### P3 - Low Incidents 🟢

**Definition**: Minor issue with minimal impact

**Examples**:
- Documentation error
- Performance optimization opportunity
- Non-security bug
- Feature enhancement request
- Dependency update (no CVE)

**Response SLA**: 24 hours to acknowledgment, resolution as scheduled

**Escalation**: None required

**Communication**: Standard ticket updates

---

## Incident Response Process

### Phase 1: Detection and Triage (0-15 minutes)

#### 1.1 Incident Detection

**Automated Detection**:
- Monitoring alerts (Datadog, Prometheus)
- Anomaly detection triggers
- Error rate thresholds exceeded
- Security scanning results
- User-reported issues (support tickets)

**Manual Detection**:
- Security researcher disclosure
- Bug bounty submission
- External audit finding
- Internal security review

#### 1.2 Initial Assessment

**Actions**:
1. **Acknowledge Alert** (2 min)
   - Assign incident number (INC-YYYYMMDD-NNN)
   - Create incident channel (#incident-NNN)
   - Page on-call responder

2. **Quick Triage** (5 min)
   - Determine severity (P0-P3)
   - Identify affected components
   - Estimate impact scope
   - Preliminary root cause hypothesis

3. **Assemble Team** (8 min)
   - Page Incident Commander
   - Notify Technical Lead
   - Alert Communications Lead
   - Engage Security Analyst if security-related

#### 1.3 Escalation Decision

**Escalation Matrix**:
```
P0 → Immediate page to IC, TL, CL, Security, C-level
P1 → Page to IC, TL, CL, Security
P2 → Slack notification to team leads
P3 → Standard ticket assignment
```

---

### Phase 2: Containment (15-60 minutes)

#### 2.1 Immediate Containment

**Goal**: Stop the bleeding, prevent further damage

**Actions by Incident Type**:

**Circuit Vulnerability**:
- [ ] Disable affected circuit version
- [ ] Reject proofs from vulnerable circuit
- [ ] Enable fallback verification
- [ ] Notify dependent services

**Service Outage**:
- [ ] Activate disaster recovery
- [ ] Failover to backup infrastructure
- [ ] Enable degraded mode if necessary
- [ ] Redirect traffic if applicable

**Privacy Breach**:
- [ ] Identify affected PIDs
- [ ] Revoke compromised proofs
- [ ] Trigger PID rotation
- [ ] Isolate compromised systems

**DDoS Attack**:
- [ ] Enable rate limiting
- [ ] Activate DDoS protection (CDN)
- [ ] Block malicious IPs/ranges
- [ ] Scale up infrastructure

**Key Compromise**:
- [ ] Revoke compromised key immediately
- [ ] Rotate to new key
- [ ] Invalidate signatures from old key
- [ ] Update verification keys

#### 2.2 Communication

**Internal**:
- Post situation update in #incident channel
- Notify affected teams (engineering, support, sales)
- Update incident ticket with timeline

**External** (P0/P1 only):
- Update status page (https://status.vey.example)
- Email affected customers (if identifiable)
- Social media update (if public-facing)

---

### Phase 3: Investigation (Parallel with Containment)

#### 3.1 Forensic Data Collection

**Logs to Collect**:
- [ ] Application logs (past 24 hours)
- [ ] Access logs (authentication events)
- [ ] Proof generation logs
- [ ] Network traffic captures
- [ ] System metrics (CPU, memory, network)
- [ ] Audit trail (who did what when)

**Preservation**:
- Copy logs to secure, immutable storage
- Hash log files for integrity verification
- Document chain of custody
- Restrict access to investigation team

#### 3.2 Root Cause Analysis

**Investigation Steps**:
1. **Timeline Construction**
   - When did incident start?
   - What triggered it?
   - What changed recently (deployments, config)?

2. **Hypothesis Testing**
   - Reproduce issue in staging
   - Test suspected root causes
   - Eliminate false leads

3. **Technical Analysis**
   - Code review of affected components
   - Circuit analysis (if applicable)
   - Dependency review
   - Configuration audit

#### 3.3 Impact Assessment

**Quantify**:
- Number of affected users
- Duration of impact
- Data exposed (if any)
- Financial impact
- Reputation impact

**Document**:
- Affected PIDs list
- Compromised proofs (if applicable)
- Failed transactions
- Customer complaints

---

### Phase 4: Eradication (1-4 hours)

#### 4.1 Fix Development

**Process**:
1. **Develop Fix**
   - Write patch/update
   - Code review (expedited but thorough)
   - Security review
   - Unit tests

2. **Testing**
   - Deploy to staging
   - Functional testing
   - Security testing
   - Performance testing
   - Rollback test

3. **Approval**
   - Incident Commander sign-off
   - Security team approval
   - Change management (expedited)

#### 4.2 Deployment

**Deployment Strategy**:
- **P0**: Emergency deployment, all hands
- **P1**: Expedited deployment, extended monitoring
- **P2**: Standard deployment with monitoring
- **P3**: Regular release cycle

**Deployment Steps**:
1. Pre-deployment checklist
2. Staged rollout (canary → 10% → 50% → 100%)
3. Monitor metrics during rollout
4. Automated rollback if errors spike
5. Verification testing post-deployment

---

### Phase 5: Recovery (2-8 hours)

#### 5.1 Service Restoration

**Verification**:
- [ ] All systems operational
- [ ] Error rates back to baseline
- [ ] Performance metrics normal
- [ ] Security tests passing
- [ ] User experience verified

**Cleanup**:
- [ ] Remove temporary mitigations
- [ ] Restore degraded services
- [ ] Clear incident channel
- [ ] Archive incident logs

#### 5.2 User Notification

**Affected Users**:
- Email notification with details
- Offer PID rotation (if privacy affected)
- Provide incident reference number
- Customer support contact info

**General Users**:
- Status page all-clear
- Blog post (for P0/P1)
- Social media update
- Documentation updates

---

### Phase 6: Post-Incident Activities (24-72 hours)

#### 6.1 Post-Mortem

**Schedule**: Within 72 hours of resolution

**Participants**:
- Incident Commander
- Technical Lead
- All responders
- Stakeholders

**Agenda**:
1. Timeline review
2. What went well
3. What went poorly
4. Root cause analysis
5. Action items (with owners and deadlines)

**Post-Mortem Template**:
```markdown
# Incident Post-Mortem: INC-YYYYMMDD-NNN

## Summary
- **Incident**: [Description]
- **Severity**: P[0-3]
- **Duration**: [Start - End]
- **Impact**: [Users affected, downtime, etc.]

## Timeline
| Time | Event |
|------|-------|
| ... | ... |

## Root Cause
[Technical explanation]

## What Went Well
- [Item 1]
- [Item 2]

## What Went Poorly
- [Item 1]
- [Item 2]

## Action Items
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| ... | ... | ... | ... |

## Lessons Learned
[Key takeaways]
```

#### 6.2 Action Item Tracking

**Process**:
1. Create tickets for each action item
2. Assign owners and deadlines
3. Track in project management tool
4. Weekly status reviews
5. Close when complete

**Categories**:
- **Immediate** (1 week): Critical fixes
- **Short-term** (1 month): Important improvements
- **Long-term** (3 months): Systemic changes

#### 6.3 Documentation Updates

**Update**:
- [ ] Runbooks (incident-specific procedures)
- [ ] Monitoring alerts (adjust thresholds)
- [ ] Architecture diagrams (if changed)
- [ ] Security documentation
- [ ] User documentation (if user-facing)

---

## Incident Runbooks

### Runbook 1: Circuit Vulnerability Detected

**Scenario**: ZK circuit vulnerability allows proof forgery

**Actions**:
1. **Immediate** (0-5 min)
   ```bash
   # Disable vulnerable circuit version
   ./scripts/disable-circuit.sh --circuit=membership --version=1.0
   
   # Enable fallback verification
   ./scripts/enable-fallback.sh --circuit=membership
   ```

2. **Short-term** (5-60 min)
   - Audit all proofs generated with vulnerable circuit
   - Identify potentially forged proofs (anomaly detection)
   - Revoke suspect proofs
   - Notify affected users

3. **Long-term** (1-24 hours)
   - Develop circuit patch
   - External audit of patch
   - Deploy patched circuit
   - Migrate users to new circuit

**Communication Template**:
```
Subject: Security Advisory - ZKP Circuit Update Required

We have identified a vulnerability in the [circuit name] circuit version [X.X].

Impact: [Description]
Action Required: [User action]
Timeline: [When users must act]
Support: [Contact info]
```

---

### Runbook 2: DDoS Attack

**Scenario**: Proof generation service overwhelmed by requests

**Actions**:
1. **Immediate** (0-2 min)
   ```bash
   # Enable aggressive rate limiting
   ./scripts/enable-rate-limit.sh --level=strict
   
   # Activate CDN DDoS protection
   curl -X POST https://api.cloudflare.com/v4/zones/{zone}/firewall/ddos
   ```

2. **Short-term** (2-15 min)
   - Analyze traffic patterns
   - Identify attack source (IPs, regions)
   - Block malicious traffic
   - Scale up infrastructure if needed

3. **Long-term** (15-60 min)
   - Implement CAPTCHAs for suspicious requests
   - Require authentication for proof generation
   - Coordinate with ISP/hosting provider
   - Consider traffic scrubbing service

**Monitoring**:
```bash
# Watch request rates
watch -n 1 'curl -s https://api.vey.example/metrics | jq .proof_generation_rate'

# Check error rates
datadog query "avg:proof.errors{*}.as_rate()"
```

---

### Runbook 3: Privacy Breach (PID Linkage)

**Scenario**: PIDs linked to user identities

**Actions**:
1. **Immediate** (0-10 min)
   ```bash
   # Identify affected PIDs
   ./scripts/find-linked-pids.sh --breach-id=BR001 > affected_pids.txt
   
   # Trigger emergency PID rotation
   ./scripts/rotate-pids.sh --input=affected_pids.txt
   ```

2. **Short-term** (10-60 min)
   - Revoke linked PIDs
   - Generate new PIDs for affected users
   - Invalidate old proofs
   - Enable enhanced privacy mode

3. **Long-term** (1-24 hours)
   - Forensic analysis of linkage method
   - Implement countermeasures
   - Notify affected users (GDPR compliance)
   - Offer credit monitoring (if applicable)

**Legal Compliance**:
- GDPR notification (72 hours)
- Document breach details
- User notification with details
- Regulatory reporting if required

---

### Runbook 4: Service Outage

**Scenario**: Proof verification service down

**Actions**:
1. **Immediate** (0-2 min)
   ```bash
   # Check service status
   ./scripts/health-check.sh --all
   
   # Failover to backup region
   ./scripts/failover.sh --from=us-east-1 --to=us-west-2
   ```

2. **Short-term** (2-30 min)
   - Investigate root cause (database, network, code)
   - Restart failed services
   - Check dependencies (external APIs)
   - Scale up resources if needed

3. **Long-term** (30-120 min)
   - Fix underlying issue
   - Restore from backup if data corruption
   - Verify data integrity
   - Resume normal operations

**Status Page Update**:
```
Title: Proof Verification Service Disruption
Status: Investigating / Identified / Monitoring / Resolved
Message: [Details of issue and current status]
Updates: [Timestamp] - [Update message]
```

---

### Runbook 5: Signing Key Compromise

**Scenario**: Private signing key suspected compromise

**Actions**:
1. **Immediate** (0-1 min)
   ```bash
   # Revoke compromised key
   ./scripts/revoke-key.sh --key-id=signing-key-001
   
   # Rotate to new key
   ./scripts/rotate-signing-key.sh --generate-new
   ```

2. **Short-term** (1-15 min)
   - Identify all signatures from compromised key
   - Invalidate compromised signatures
   - Re-sign critical data with new key
   - Update verification keys

3. **Long-term** (15-60 min)
   - Forensic analysis of compromise
   - Audit all systems for unauthorized access
   - Implement enhanced key protection (HSM)
   - Notify users of key rotation

**Verification Key Distribution**:
```javascript
// Update verification key in SDK
const NEW_VERIFICATION_KEY = "..." // New key
const KEY_ROTATION_DATE = "2025-12-07"

// Reject signatures from old key after grace period
if (signature.date > KEY_ROTATION_DATE && signature.key !== NEW_VERIFICATION_KEY) {
  throw new Error('Signature from revoked key');
}
```

---

## Communication Templates

### Internal Notification

**Slack Template** (#incident channel):
```
🚨 **INCIDENT DECLARED** 🚨

**Incident ID**: INC-20251207-001
**Severity**: P[0-3]
**Summary**: [Brief description]
**IC**: @[Incident Commander]
**Status**: [Investigating/Mitigating/Resolved]

**Impact**:
- [Affected component]
- [Estimated user impact]

**Next Update**: [Timestamp]

**War Room**: #incident-20251207-001
```

### Customer Communication

**Email Template**:
```
Subject: [Severity] Service Advisory - [Brief Description]

Dear Valued Customer,

We are currently experiencing [issue description]. Our team is actively working to resolve this issue.

**What happened**: [Technical summary in plain language]
**Impact**: [What customers experienced]
**Status**: [Current status]
**Expected resolution**: [Timeline]

**What we're doing**:
- [Action 1]
- [Action 2]

**What you can do**:
- [User action if any]

We apologize for any inconvenience and will provide updates every [frequency].

For real-time status: https://status.vey.example
For support: support@vey.example

Thank you for your patience.

The Vey Team
```

### Status Page Update

**Template**:
```
Title: [Component] - [Issue Type]
Status: [Investigating/Identified/Monitoring/Resolved]
Components: [Affected components]

[TIMESTAMP] - Investigating
We are investigating reports of [issue]. Our team is looking into this with high priority.

[TIMESTAMP] - Identified
We have identified the issue as [description]. We are implementing a fix.

[TIMESTAMP] - Monitoring
A fix has been deployed. We are monitoring the situation.

[TIMESTAMP] - Resolved
The issue has been fully resolved. All systems are operational.
```

---

## Training and Drills

### Incident Response Training

**Schedule**: Quarterly

**Topics**:
- Incident classification
- Escalation procedures
- Tool usage (PagerDuty, Datadog, etc.)
- Communication protocols
- Runbook walkthroughs

**Format**:
- 2-hour workshop
- Hands-on exercises
- Role-playing scenarios
- Q&A session

### Incident Response Drills

**Schedule**: Semi-annually

**Scenarios**:
1. **Circuit Vulnerability**: Simulated proof forgery
2. **DDoS Attack**: Synthetic traffic flood
3. **Privacy Breach**: Mock PID linkage
4. **Multi-component Outage**: Cascading failures

**Evaluation Criteria**:
- Response time (vs. SLA)
- Coordination effectiveness
- Communication clarity
- Technical resolution quality
- Post-mortem completeness

---

## Metrics and KPIs

### Incident Metrics

**Track**:
- Mean Time to Detect (MTTD)
- Mean Time to Acknowledge (MTTA)
- Mean Time to Resolve (MTTR)
- Incident frequency by severity
- Repeat incidents (same root cause)

**Targets**:
- MTTD: <5 minutes
- MTTA: <15 minutes (P0), <1 hour (P1)
- MTTR: <2 hours (P0), <8 hours (P1)
- Repeat rate: <10%

### Continuous Improvement

**Monthly Review**:
- Incident trends
- Response time trends
- Action item completion rate
- Training effectiveness
- Documentation updates

**Quarterly Goals**:
- Reduce MTTR by 10%
- Increase runbook coverage to 90%
- 100% team incident response training
- Zero P0 incidents (aspirational)

---

## Tools and Systems

### Monitoring and Alerting
- **Datadog**: Application metrics, logs
- **Prometheus/Grafana**: System metrics
- **Sentry**: Error tracking
- **PagerDuty**: On-call rotation, escalation

### Communication
- **Slack**: Internal coordination (#incident channels)
- **Statuspage.io**: Public status updates
- **SendGrid**: Customer email notifications
- **Zoom**: War room video calls

### Forensics and Analysis
- **Splunk**: Log aggregation and search
- **Wireshark**: Network traffic analysis
- **Elasticsearch**: Log analysis
- **Jupyter**: Data analysis and visualization

### Incident Management
- **Jira**: Incident tracking
- **Confluence**: Runbook documentation
- **GitHub**: Code changes, post-mortems
- **Google Docs**: Collaborative post-mortem writing

---

## Appendices

### Appendix A: Contact Information

| Role | Primary | Backup | Phone | Email |
|------|---------|--------|-------|-------|
| IC | Alice Smith | Bob Jones | +1-XXX | alice@vey.example |
| TL | Charlie Brown | Diana Prince | +1-XXX | charlie@vey.example |
| CL | Eve Adams | Frank Castle | +1-XXX | eve@vey.example |
| Security | Grace Hopper | Henry Ford | +1-XXX | grace@vey.example |

### Appendix B: External Contacts

| Organization | Contact | Purpose |
|--------------|---------|---------|
| ISP | support@isp.example | Network issues |
| CDN | support@cloudflare.com | DDoS protection |
| Legal | counsel@lawfirm.example | Breach notification |
| Insurance | claims@cyberinsurance.example | Incident claims |

### Appendix C: Compliance Requirements

**GDPR Breach Notification**:
- **Deadline**: 72 hours from discovery
- **Authority**: Local DPA
- **Content**: Nature, impact, measures, contact

**SOC 2 Incident Reporting**:
- **Requirement**: Document all security incidents
- **Retention**: 7 years
- **Audit**: Annual review by external auditor

### Appendix D: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12 | Security Team | Initial release |

---

**Document Owner**: Security Team  
**Review Frequency**: Quarterly  
**Next Review**: March 2026  
**Contact**: security@vey.example
