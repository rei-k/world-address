# ZKP Security Incident Response Plan

## Overview

This document outlines the incident response procedures for security events related to the ZKP Address Protocol.

## Incident Classification

### Severity Levels

#### P0 - Critical (Response Time: < 15 minutes)
- Active proof forgery attack detected
- Private key or toxic waste compromise
- Mass data breach (> 1000 users affected)
- Complete system unavailability
- Zero-day vulnerability being actively exploited

#### P1 - High (Response Time: < 1 hour)
- Potential proof forgery attempt
- Unauthorized access to proving keys
- Data breach (< 1000 users)
- Partial system unavailability (> 25% users affected)
- Known vulnerability with public exploit

#### P2 - Medium (Response Time: < 4 hours)
- Suspicious proof patterns detected
- Failed intrusion attempts
- Service degradation
- DoS attack (successfully mitigated)
- Vulnerability discovered (no known exploit)

#### P3 - Low (Response Time: < 24 hours)
- Minor security configuration issues
- Individual verification failures
- Audit log anomalies
- Non-critical CVEs in dependencies

---

## Incident Response Team

### Core Team

**Incident Commander**: 
- Primary: [Name], [Phone], [Email]
- Backup: [Name], [Phone], [Email]
- Responsibility: Coordinate response, make decisions, communicate with stakeholders

**Security Lead**:
- Primary: [Name], [Phone], [Email]
- Responsibility: Assess security impact, investigate root cause, recommend fixes

**Engineering Lead**:
- Primary: [Name], [Phone], [Email]
- Responsibility: Implement fixes, deploy patches, verify resolution

**Communications Lead**:
- Primary: [Name], [Phone], [Email]
- Responsibility: Internal/external communications, user notifications, PR

**Legal/Compliance**:
- Primary: [Name], [Phone], [Email]
- Responsibility: Regulatory compliance, legal implications, breach notifications

### Extended Team (On-Call)
- DevOps Engineer: Infrastructure and deployment
- Database Administrator: Data recovery and integrity
- ZK Cryptographer: Circuit and proof analysis
- Customer Support Lead: User communications

---

## Response Procedures

### Phase 1: Detection & Triage (0-15 minutes)

#### 1.1 Incident Detection

**Automated Alerts**:
```yaml
# Prometheus alert example
- alert: SuspiciousProofPattern
  expr: rate(zkp_proof_verification_failures[5m]) > 0.05
  annotations:
    summary: "High proof verification failure rate detected"
    description: "{{ $value }}% of proofs failing verification"
```

**Manual Detection**:
- User reports suspicious behavior
- Security researcher disclosure
- Audit log review
- Third-party security tool alert

#### 1.2 Initial Triage

```
INCIDENT TRIAGE CHECKLIST
□ Incident ID assigned: INC-2024-XXXX
□ Severity level determined: P0 / P1 / P2 / P3
□ Incident Commander notified
□ Core team assembled
□ War room created (Slack #incident-XXXX)
□ Initial timeline established
```

#### 1.3 Immediate Containment (P0/P1 only)

```bash
# P0: Disable all ZKP operations immediately
curl -X POST https://api.production/emergency/zkp-disable \
  -H "Authorization: Bearer $EMERGENCY_TOKEN"

# P1: Rate limit or isolate affected component
kubectl scale deployment zkp-prover --replicas=0 -n production
```

---

### Phase 2: Investigation & Analysis (15 min - 4 hours)

#### 2.1 Evidence Collection

**Log Collection**:
```bash
# Export relevant logs
kubectl logs deployment/zkp-prover \
  --since=2h \
  --timestamps \
  > logs/prover-$(date +%Y%m%d-%H%M%S).log

# Database query logs
psql $DATABASE_URL -c "SELECT * FROM audit_logs 
  WHERE timestamp > NOW() - INTERVAL '2 hours' 
  AND event_type IN ('proof_generation', 'proof_verification')
  ORDER BY timestamp DESC" \
  > logs/audit-$(date +%Y%m%d-%H%M%S).csv
```

**Proof Analysis**:
```bash
# Analyze suspicious proofs
node scripts/analyze-proof.js \
  --proof-file suspicious-proof.json \
  --circuit membership-v1 \
  --output analysis-report.json
```

**Circuit Verification**:
```bash
# Verify circuit integrity
sha256sum circuits/*.circom build/*.r1cs build/*.zkey
# Compare with known good checksums
```

#### 2.2 Root Cause Analysis

**Checklist**:
- [ ] When did the incident start?
- [ ] What triggered the incident?
- [ ] How many users/proofs affected?
- [ ] Is this an attack or system failure?
- [ ] What data/systems are compromised?
- [ ] Is the attacker still active?

**5 Whys Analysis**:
```
Problem: Proof forgery detected
Why 1: Invalid proof passed verification
Why 2: Verification key didn't match circuit
Why 3: Wrong verification key loaded
Why 4: Deployment script used old key file
Why 5: CI/CD didn't verify key checksums
Root Cause: Missing checksum validation in deployment
```

---

### Phase 3: Containment & Eradication (1-8 hours)

#### 3.1 Short-term Containment

**Isolate Affected Systems**:
```bash
# Network isolation
kubectl label namespace zkp-production isolation=quarantine
kubectl apply -f network-policies/quarantine.yaml

# Block suspicious IPs
iptables -A INPUT -s 192.0.2.100 -j DROP
```

**Revoke Compromised Credentials**:
```bash
# Rotate all API keys
aws secretsmanager rotate-secret \
  --secret-id zkp-api-keys \
  --rotation-lambda-arn arn:aws:lambda:...

# Invalidate all active sessions
redis-cli FLUSHDB
```

#### 3.2 Eradication

**If Circuit Compromise**:
```bash
# Conduct emergency trusted setup
./scripts/emergency-setup.sh

# Generate new proving/verification keys
snarkjs groth16 setup circuits/membership.r1cs \
  new-powers-of-tau.ptau \
  new-membership.zkey

# Deploy new keys
kubectl create secret generic zkp-keys \
  --from-file=membership-vkey=new-membership-vkey.json \
  --dry-run=client -o yaml | kubectl apply -f -
```

**If Application Vulnerability**:
```bash
# Apply security patch
git pull origin hotfix/security-patch
npm install
npm run build
docker build -t zkp-prover:v1.0.1-security .

# Deploy patch
kubectl set image deployment/zkp-prover \
  zkp-prover=registry.com/zkp-prover:v1.0.1-security
```

**If Data Breach**:
```sql
-- Identify compromised records
SELECT user_id, address_pid, accessed_at, accessor_did
FROM audit_logs
WHERE timestamp BETWEEN '2024-12-07 10:00' AND '2024-12-07 12:00'
  AND accessor_did NOT IN (SELECT did FROM authorized_carriers)
ORDER BY accessed_at;

-- Revoke compromised PIDs
INSERT INTO revocation_list (pid, reason, revoked_at)
SELECT address_pid, 'security_breach', NOW()
FROM compromised_addresses;
```

---

### Phase 4: Recovery (2-24 hours)

#### 4.1 System Restoration

```bash
# Gradual rollout of fixed system
kubectl apply -f k8s/canary-deployment.yaml

# Monitor canary for 30 minutes
watch -n 10 'kubectl get pods -l version=canary -n production'

# If stable, proceed with full rollout
kubectl apply -f k8s/production-deployment.yaml

# Enable ZKP operations gradually
# 5% → 25% → 50% → 100%
```

#### 4.2 Data Recovery (if needed)

```bash
# Restore from clean backup
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier prod-db \
  --target-db-instance-identifier prod-db-restored \
  --restore-time 2024-12-07T09:00:00Z

# Verify data integrity
node scripts/verify-database-integrity.js
```

#### 4.3 Verification

```
RECOVERY VERIFICATION CHECKLIST
□ All services healthy
□ Proof generation working correctly
□ Proof verification working correctly
□ No suspicious activity in logs
□ Performance metrics normal
□ All monitoring alerts cleared
□ User functionality restored
□ No data loss confirmed
```

---

### Phase 5: Post-Incident (24-72 hours)

#### 5.1 Post-Mortem Report

**Template**:
```markdown
# Incident Post-Mortem: INC-2024-XXXX

## Summary
Brief description of what happened.

## Timeline
- 10:00 UTC: Incident detected
- 10:05 UTC: Incident Commander notified
- 10:15 UTC: Service disabled
- 10:30 UTC: Root cause identified
- 12:00 UTC: Fix deployed
- 14:00 UTC: Service fully restored

## Impact
- Users affected: 1,234
- Duration: 4 hours
- Data compromised: None
- Revenue impact: $X,XXX

## Root Cause
Detailed explanation of the root cause.

## Resolution
Steps taken to resolve the incident.

## Lessons Learned
What went well:
1. Fast detection
2. Good coordination

What could be improved:
1. Automated rollback
2. Better monitoring

## Action Items
1. [TICKET-123] Implement automated rollback (Owner: Alice, Due: 2024-12-14)
2. [TICKET-124] Add circuit checksum validation (Owner: Bob, Due: 2024-12-21)
3. [TICKET-125] Enhance monitoring alerts (Owner: Carol, Due: 2024-12-28)
```

#### 5.2 User Communication

**Initial Notification** (within 1 hour of detection):
```
Subject: Security Incident - ZKP Service Temporarily Unavailable

We've detected a security issue affecting our ZKP address validation 
service. As a precaution, we've temporarily disabled the service while 
we investigate. Your address data remains secure. We'll provide updates 
every 2 hours.

- ZKP Team
```

**Update** (every 2 hours):
```
Subject: Update: Security Incident Investigation

We've identified the root cause and are deploying a fix. We expect 
service restoration within 2 hours. No user data was compromised.

- ZKP Team
```

**Resolution** (within 24 hours):
```
Subject: Resolved: ZKP Service Restored

The security incident has been resolved. All services are operating 
normally. We'll publish a detailed post-mortem within 48 hours.

Thank you for your patience.
- ZKP Team
```

#### 5.3 Regulatory Compliance

**GDPR Breach Notification** (if applicable):
```
Within 72 hours if personal data compromised:
1. Notify supervisory authority
2. Document nature of breach
3. Notify affected data subjects
4. Assess fines/penalties risk
```

**Other Regulations**:
- CCPA (California): 30 days
- HIPAA (Healthcare): 60 days
- PCI DSS (Payment): As soon as possible

---

## Communication Templates

### Internal Alert (Slack)

```
🚨 SECURITY INCIDENT ALERT 🚨

Severity: P0
Incident ID: INC-2024-XXXX
Summary: Proof forgery attack detected

Action Required:
- Incident Commander: @alice
- Security Lead: @bob
- Engineering Lead: @carol

War Room: #incident-xxxx
Bridge: https://zoom.us/j/emergency
Status Page: https://status.company.com

DO NOT DISCUSS EXTERNALLY
```

### External Status Update

```
⚠️ Investigating Service Disruption

We're currently investigating an issue affecting ZKP proof 
verification. Service is temporarily unavailable. 

Updates will be posted here every 30 minutes.

Last updated: 2024-12-07 10:30 UTC
Next update: 2024-12-07 11:00 UTC
```

---

## Runbooks

### Runbook 1: Proof Forgery Detected

**Symptoms**: Invalid proof passes verification

**Immediate Actions**:
1. Disable all proof generation: `make emergency-disable-zkp`
2. Export suspicious proofs: `make export-suspicious-proofs`
3. Verify circuit integrity: `make verify-circuits`

**Investigation**:
1. Analyze proof structure
2. Check verification key integrity
3. Review recent deployments
4. Examine audit logs

**Resolution**:
1. If circuit issue: Emergency re-setup
2. If key mismatch: Deploy correct keys
3. If attack: Block attacker IP, revoke credentials

---

### Runbook 2: Private Key Compromise

**Symptoms**: Unauthorized proof generation, suspicious DID activity

**Immediate Actions**:
1. Revoke compromised keys: `make revoke-keys --key-id=$KEY_ID`
2. Rotate all keys: `make rotate-all-keys`
3. Invalidate all active sessions

**Investigation**:
1. Identify compromise vector
2. Assess blast radius
3. Check for backdoors

**Resolution**:
1. Generate new key pairs
2. Update all services with new keys
3. Notify affected users

---

### Runbook 3: Data Breach

**Symptoms**: Unauthorized PID resolution, audit log anomalies

**Immediate Actions**:
1. Isolate database: `make isolate-database`
2. Export audit logs: `make export-audit-logs`
3. Identify accessed records

**Investigation**:
1. Determine breach method
2. Identify all compromised data
3. Assess legal implications

**Resolution**:
1. Revoke compromised PIDs
2. Notify affected users
3. File regulatory reports
4. Offer credit monitoring (if severe)

---

## Tools & Resources

### Incident Management Tools
- PagerDuty: On-call alerting
- Jira: Incident tracking
- Confluence: Documentation
- Zoom: Incident bridge
- Slack: Real-time communication

### Security Analysis Tools
- Wireshark: Network analysis
- Splunk: Log analysis
- Hashcat: Password cracking (for testing)
- Burp Suite: Web vulnerability scanning
- Nmap: Network scanning

### ZKP-Specific Tools
- Circom inspector: Circuit analysis
- SnarkJS verifier: Proof validation
- Custom proof analyzer: Pattern detection

---

## Training & Drills

### Quarterly Tabletop Exercises
- Simulate P0 incident
- Test communication procedures
- Practice decision-making
- Review runbooks

### Annual Full-Scale Drill
- Real environment (staging)
- All teams involved
- External observers
- Full post-mortem

---

## Appendix

### A. Contact Directory

| Role | Name | Phone | Email | Timezone |
|------|------|-------|-------|----------|
| Incident Commander | Alice | +1-555-0100 | alice@company.com | UTC-8 |
| Security Lead | Bob | +1-555-0101 | bob@company.com | UTC-5 |
| Engineering Lead | Carol | +1-555-0102 | carol@company.com | UTC+9 |

### B. External Contacts

- **Law Enforcement**: [Local FBI Cyber Division]
- **Legal Counsel**: [Law Firm Name]
- **PR Firm**: [PR Firm Name]
- **Insurance**: [Cyber Insurance Provider]
- **Security Researchers**: security@company.com

### C. Compliance Requirements

- **GDPR**: 72 hours to notify authorities
- **CCPA**: 30 days to notify users
- **HIPAA**: 60 days to notify HHS
- **PCI DSS**: Immediate notification to payment brands

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-07  
**Next Review**: 2025-03-07  
**Owner**: Security Team
