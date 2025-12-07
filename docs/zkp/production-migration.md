# Production Migration Guide - ZKP Protocol

Comprehensive guide for migrating the World Address ZKP Protocol from development to production. Covers infrastructure requirements, deployment strategy, monitoring setup, and rollback procedures.

## Executive Summary

**Migration Timeline**: 12 weeks (Pilot → Beta → GA → Optimization)  
**Risk Level**: MEDIUM (new cryptographic protocol)  
**Rollback Capability**: Full rollback within 15 minutes  
**Success Criteria**: 99.9% availability, <1s proof generation (P95)

### Migration Phases

| Phase | Duration | Traffic | Status |
|-------|----------|---------|--------|
| **Pilot** (Week 1-2) | 2 weeks | 1-25% internal | Planning |
| **Beta** (Week 3-4) | 2 weeks | External beta customers | Planning |
| **GA** (Week 5-6) | 2 weeks | 25% → 100% gradual rollout | Planning |
| **Optimization** (Week 7-12) | 6 weeks | 100% production | Planning |

---

## Pre-Migration Checklist

### Technical Readiness

- [ ] **Circuit Implementation Complete**
  - [ ] All 5 circuits implemented in Circom
  - [ ] Circuits formally verified
  - [ ] External security audit passed
  - [ ] Performance benchmarks meet targets
  - [ ] Constraint counts within budget

- [ ] **Trusted Setup Complete**
  - [ ] Multi-party ceremony with ≥10 contributors
  - [ ] Ceremony transcript published
  - [ ] Verification keys distributed
  - [ ] Toxic waste destroyed and verified
  - [ ] Community verification period completed

- [ ] **Infrastructure Ready**
  - [ ] Production servers provisioned
  - [ ] Database clusters configured
  - [ ] CDN and DDoS protection active
  - [ ] Backup and disaster recovery tested
  - [ ] Monitoring and alerting configured

- [ ] **SDK Integration Tested**
  - [ ] TypeScript SDK tested end-to-end
  - [ ] All 5 proof patterns validated
  - [ ] Performance benchmarks run
  - [ ] Error handling verified
  - [ ] Documentation complete

- [ ] **Security Validated**
  - [ ] Penetration testing completed
  - [ ] Vulnerability scan (CVSS score <4)
  - [ ] Dependency audit clean
  - [ ] Incident response plan tested
  - [ ] Security training completed

### Organizational Readiness

- [ ] **Team Training**
  - [ ] Engineering team ZKP trained
  - [ ] Support team educated
  - [ ] Sales team briefed
  - [ ] Legal team reviewed

- [ ] **Documentation Complete**
  - [ ] API documentation published
  - [ ] Integration guides available
  - [ ] Security documentation finalized
  - [ ] Runbooks prepared
  - [ ] FAQ created

- [ ] **Communication Plan**
  - [ ] Customer announcement prepared
  - [ ] Blog post drafted
  - [ ] Social media strategy
  - [ ] Press release (if applicable)
  - [ ] Migration timeline communicated

---

## Infrastructure Requirements

### Compute Resources

#### Proof Generation Servers

**Specifications (per server)**:
```yaml
CPU: 8 cores (Intel Xeon or AMD EPYC)
RAM: 16 GB
Storage: 100 GB SSD
Network: 10 Gbps
OS: Ubuntu 22.04 LTS
```

**Capacity Planning**:
- **Proof Generation Rate**: 10-20 proofs/sec per server
- **Expected Load**: 1000 proofs/sec at peak
- **Server Count**: 50-100 servers (with headroom)
- **Auto-scaling**: Scale up at 70% CPU, down at 30%

#### Verification Servers

**Specifications (per server)**:
```yaml
CPU: 4 cores
RAM: 8 GB
Storage: 50 GB SSD
Network: 10 Gbps
OS: Ubuntu 22.04 LTS
```

**Capacity Planning**:
- **Verification Rate**: 200-500 verifications/sec per server
- **Expected Load**: 5000 verifications/sec at peak
- **Server Count**: 10-25 servers
- **Auto-scaling**: Scale up at 70% CPU, down at 30%

### Database

#### Primary Database (PostgreSQL)

**Configuration**:
```yaml
Instance: PostgreSQL 15
Size: db.r6g.2xlarge (8 vCPU, 64 GB RAM)
Storage: 1 TB SSD (io2, 10000 IOPS)
Replication: Multi-AZ with 2 read replicas
Backup: Daily automated, 30-day retention
```

**Schema**:
- `verifiable_credentials` - Issued VCs
- `revocation_lists` - PID revocations
- `audit_logs` - Access history
- `proof_cache` - Cached proofs (optional)

#### Cache Layer (Redis)

**Configuration**:
```yaml
Instance: Redis 7.0
Size: cache.r6g.xlarge (4 vCPU, 26 GB RAM)
Nodes: 3 (primary + 2 replicas)
Eviction: LRU (Least Recently Used)
Persistence: AOF (Append-Only File)
```

**Cached Data**:
- Verification keys
- Recent proofs (1 hour TTL)
- Revocation list (5 minute TTL)
- DID documents (1 hour TTL)

### Network Infrastructure

#### Load Balancer

**Type**: Application Load Balancer (Layer 7)

**Configuration**:
```yaml
Scheme: Internet-facing
Listeners:
  - HTTPS (443) → Proof Generation Servers
  - HTTPS (443) → Verification Servers
Health Check: /health (interval: 30s, timeout: 5s)
SSL/TLS: TLS 1.3 minimum
Idle Timeout: 120 seconds
```

**Traffic Distribution**:
- **Proof Generation**: Round-robin with connection affinity
- **Verification**: Least connections
- **Health Checks**: Active (every 30s) + Passive

#### CDN (Cloudflare)

**Configuration**:
```yaml
Plan: Business or Enterprise
Features:
  - DDoS Protection (L3/L4/L7)
  - WAF (Web Application Firewall)
  - Rate Limiting (configurable per endpoint)
  - SSL/TLS (Full Strict)
  - Cache (static assets only, not proofs)
```

**Cached Assets**:
- Verification keys (1 day TTL)
- Circuit metadata (1 day TTL)
- Documentation and examples
- SDK packages

### Storage

#### Object Storage (S3)

**Buckets**:
```yaml
vey-zkp-circuits:
  Purpose: Compiled circuits (.wasm, .zkey)
  Versioning: Enabled
  Encryption: AES-256
  Access: Public read (with CloudFront)

vey-zkp-backups:
  Purpose: Database backups, logs
  Versioning: Enabled
  Encryption: AES-256
  Lifecycle: Archive to Glacier after 90 days

vey-zkp-audit:
  Purpose: Audit logs (immutable)
  Versioning: Enabled
  Encryption: AES-256
  WORM: Object Lock enabled
```

---

## Deployment Strategy

### Phase 1: Pilot (Week 1-2)

**Goal**: Validate production readiness with internal users

**Traffic**: 1-25% of internal traffic

**Actions**:

1. **Deploy to Staging** (Day 1-2)
   ```bash
   # Deploy infrastructure
   terraform apply -var="environment=staging"
   
   # Deploy application
   kubectl apply -f k8s/staging/
   
   # Run smoke tests
   npm run test:e2e:staging
   ```

2. **Internal Testing** (Day 3-5)
   - Engineering team uses ZKP for internal deliveries
   - Monitor metrics closely (every hour)
   - Fix critical bugs immediately
   - Collect feedback

3. **Gradual Internal Rollout** (Day 6-10)
   - Day 6: 1% internal traffic
   - Day 7: 5% internal traffic
   - Day 8: 10% internal traffic
   - Day 9: 15% internal traffic
   - Day 10: 25% internal traffic

4. **Go/No-Go Decision** (Day 11-14)
   - Review metrics
   - Assess stability
   - Fix remaining issues
   - Decision to proceed to Beta

**Success Criteria**:
- [ ] Zero P0/P1 incidents
- [ ] <3 P2 incidents
- [ ] Proof generation <1s (P95)
- [ ] Verification <50ms (P99)
- [ ] 99.9% availability

### Phase 2: Beta (Week 3-4)

**Goal**: Validate with external beta customers

**Traffic**: Select beta customers (5-10 organizations)

**Actions**:

1. **Beta Customer Onboarding** (Day 15-17)
   ```bash
   # Provision beta customer accounts
   ./scripts/provision-beta-user.sh --org=CustomerA
   
   # Generate API keys
   ./scripts/generate-api-key.sh --customer=CustomerA
   
   # Send onboarding email with documentation
   ```

2. **Beta Launch** (Day 18)
   - Enable beta customers on production
   - Provide dedicated support channel
   - Monitor customer usage patterns
   - Collect qualitative feedback

3. **Beta Monitoring** (Day 19-28)
   - Daily check-ins with beta customers
   - Track usage metrics
   - Fix bugs rapidly
   - Iterate on documentation

**Success Criteria**:
- [ ] ≥80% beta customer satisfaction
- [ ] Zero P0 incidents
- [ ] <5 P1 incidents
- [ ] Performance targets met
- [ ] No security incidents

### Phase 3: General Availability (Week 5-6)

**Goal**: Gradual rollout to all customers

**Traffic**: 25% → 100% over 2 weeks

**Actions**:

1. **GA Announcement** (Day 29)
   - Publish blog post
   - Send email to all customers
   - Update documentation
   - Social media announcement

2. **Gradual Rollout** (Day 30-42)
   ```bash
   # Canary deployment
   ./scripts/set-traffic-split.sh --zkp-traffic=25%
   
   # Monitor for 24 hours, then increase
   ./scripts/set-traffic-split.sh --zkp-traffic=50%
   
   # Continue gradual increase
   # Day 32: 50%
   # Day 34: 75%
   # Day 36: 90%
   # Day 38: 95%
   # Day 40: 98%
   # Day 42: 100%
   ```

3. **Rollout Monitoring** (Daily)
   - Track error rates
   - Monitor performance
   - Check customer feedback
   - Address issues immediately

**Success Criteria**:
- [ ] Smooth traffic transition
- [ ] Error rate <0.1%
- [ ] No performance degradation
- [ ] Customer complaints <10
- [ ] Zero security incidents

### Phase 4: Optimization (Week 7-12)

**Goal**: Optimize performance and cost

**Traffic**: 100% production traffic

**Actions**:

1. **Performance Tuning** (Week 7-8)
   - Analyze bottlenecks
   - Optimize circuit constraints
   - Tune database queries
   - Improve caching strategy

2. **Cost Optimization** (Week 9-10)
   - Right-size infrastructure
   - Optimize proof caching
   - Review and reduce waste
   - Negotiate better rates

3. **Feature Enhancement** (Week 11-12)
   - Implement user feedback
   - Add advanced features
   - Improve developer experience
   - Expand integration options

---

## Monitoring and Observability

### Key Metrics

#### Performance Metrics

**Proof Generation**:
```yaml
proof_generation_duration:
  Type: Histogram
  Labels: [circuit_type, status]
  Buckets: [100, 500, 1000, 2000, 5000]ms
  SLA: P95 < 1000ms

proof_generation_rate:
  Type: Counter
  Labels: [circuit_type]
  Target: >1000 proofs/sec

proof_generation_errors:
  Type: Counter
  Labels: [circuit_type, error_type]
  SLA: <0.1% error rate
```

**Verification**:
```yaml
verification_duration:
  Type: Histogram
  Labels: [circuit_type, status]
  Buckets: [5, 10, 20, 50, 100]ms
  SLA: P99 < 50ms

verification_rate:
  Type: Counter
  Labels: [circuit_type]
  Target: >5000 verifications/sec

verification_errors:
  Type: Counter
  Labels: [error_type]
  SLA: <0.01% error rate
```

#### System Metrics

**Infrastructure**:
```yaml
cpu_usage:
  Type: Gauge
  Labels: [server_type, instance_id]
  Alert: >80%

memory_usage:
  Type: Gauge
  Labels: [server_type, instance_id]
  Alert: >85%

disk_usage:
  Type: Gauge
  Labels: [server_type, instance_id]
  Alert: >80%

network_throughput:
  Type: Gauge
  Labels: [server_type, direction]
  Monitor: Bandwidth utilization
```

#### Business Metrics

**Usage**:
```yaml
active_users:
  Type: Gauge
  Frequency: Daily
  Track: DAU, MAU

proofs_generated:
  Type: Counter
  Labels: [circuit_type, customer]
  Track: Total usage

revenue_impact:
  Type: Gauge
  Track: Revenue from ZKP feature
```

### Alerting Rules

#### Critical Alerts (P0)

```yaml
ProofGenerationDown:
  Condition: proof_generation_rate == 0 for 5 minutes
  Action: Page on-call immediately
  Runbook: incident-response.md#service-outage

VerificationFailureSpike:
  Condition: verification_errors > 10% for 2 minutes
  Action: Page on-call immediately
  Runbook: incident-response.md#verification-failures

DatabaseDown:
  Condition: database_up == 0 for 1 minute
  Action: Page on-call + DBA immediately
  Runbook: incident-response.md#database-outage
```

#### Warning Alerts (P1)

```yaml
HighProofGenerationLatency:
  Condition: proof_generation_duration P95 > 1000ms for 10 minutes
  Action: Notify engineering team
  Runbook: performance-tuning.md#proof-latency

HighCPUUsage:
  Condition: cpu_usage > 80% for 15 minutes
  Action: Notify DevOps
  Runbook: scaling.md#scale-up

LowCacheHitRate:
  Condition: cache_hit_rate < 50% for 1 hour
  Action: Notify engineering team
  Runbook: caching.md#low-hit-rate
```

### Dashboards

#### Operations Dashboard

**Panels**:
1. **Traffic Overview**: Request rate, error rate, latency
2. **Proof Generation**: Generation rate, duration, success rate
3. **Verification**: Verification rate, duration, success rate
4. **Infrastructure**: CPU, memory, disk, network
5. **Errors**: Error breakdown by type
6. **SLA Compliance**: Availability, latency SLAs

#### Security Dashboard

**Panels**:
1. **Authentication**: Failed logins, suspicious activity
2. **Access Patterns**: Unusual access, anomalies
3. **Proof Verification**: Forgery attempts, invalid proofs
4. **Rate Limiting**: Blocked requests, threshold hits
5. **Audit Events**: Key management, configuration changes

---

## Rollback Procedures

### Quick Rollback (<15 minutes)

**Trigger**: Critical production issue (P0 incident)

**Actions**:

1. **Immediate Traffic Shift** (2 min)
   ```bash
   # Revert traffic to non-ZKP flow
   ./scripts/set-traffic-split.sh --zkp-traffic=0%
   
   # Verify traffic switched
   curl https://api.vey.example/health/traffic
   ```

2. **Disable ZKP Endpoints** (3 min)
   ```bash
   # Disable proof generation
   kubectl scale deployment zkp-proof-gen --replicas=0
   
   # Disable verification
   kubectl scale deployment zkp-verify --replicas=0
   ```

3. **Status Communication** (5 min)
   - Update status page: "ZKP temporarily disabled"
   - Notify customer support team
   - Internal Slack notification

4. **Verification** (5 min)
   - Check error rates dropped
   - Verify non-ZKP flow working
   - Monitor customer impact

**Total Time**: ~15 minutes

### Full Rollback (1-2 hours)

**Trigger**: Persistent issues, need to revert to previous version

**Actions**:

1. **Database Rollback** (15 min)
   ```bash
   # Restore from last known good backup
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance zkp-prod \
     --target-db-instance zkp-prod-rollback \
     --restore-time 2025-12-07T12:00:00Z
   
   # Switch connection string
   ./scripts/update-db-connection.sh --instance=zkp-prod-rollback
   ```

2. **Application Rollback** (10 min)
   ```bash
   # Revert to previous deployment
   kubectl rollout undo deployment/zkp-proof-gen
   kubectl rollout undo deployment/zkp-verify
   
   # Wait for rollout
   kubectl rollout status deployment/zkp-proof-gen
   ```

3. **Configuration Rollback** (5 min)
   ```bash
   # Revert configuration changes
   terraform apply -var-file="previous-config.tfvars"
   
   # Reload application config
   kubectl delete configmap zkp-config
   kubectl apply -f previous-config.yaml
   ```

4. **Testing and Validation** (30 min)
   - Run smoke tests
   - Verify all services operational
   - Check data integrity
   - Test critical user flows

5. **Communication** (15 min)
   - Update status page
   - Email affected customers
   - Internal post-mortem scheduled
   - Document rollback reason

**Total Time**: 1-2 hours

---

## Scaling Considerations

### Horizontal Scaling

**Auto-scaling Configuration**:

```yaml
# Proof Generation Servers
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: zkp-proof-gen-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: zkp-proof-gen
  minReplicas: 10
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: proof_generation_duration_p95
      target:
        type: AverageValue
        averageValue: "800m"  # 800ms
```

**Scaling Triggers**:
- CPU > 70%: Add 20% more instances
- Proof latency P95 > 800ms: Add 10% more instances
- Queue depth > 100: Add 30% more instances

### Vertical Scaling

**When to Scale Up**:
- Consistent CPU/memory >85%
- Cannot scale horizontally further
- Latency still high after horizontal scaling

**Instance Upgrade Path**:
```
Current: 8 cores, 16 GB RAM
Tier 1:  16 cores, 32 GB RAM
Tier 2:  32 cores, 64 GB RAM
Tier 3:  64 cores, 128 GB RAM
```

### Database Scaling

**Read Replicas**:
- Add replica for every 2000 read req/sec
- Geographic distribution for latency
- Automatic failover configured

**Sharding Strategy** (if needed):
```sql
-- Shard by country code
shard_0: PIDs starting with A-G
shard_1: PIDs starting with H-N
shard_2: PIDs starting with O-U
shard_3: PIDs starting with V-Z
```

---

## Cost Estimation

### Monthly Infrastructure Costs

#### Compute
```
Proof Generation: 50 servers × $200/month = $10,000
Verification: 10 servers × $100/month = $1,000
Total Compute: $11,000/month
```

#### Database
```
Primary PostgreSQL: $800/month
Read Replicas (2): $800/month
Redis Cache: $400/month
Total Database: $2,000/month
```

#### Network
```
Load Balancer: $200/month
CDN (Cloudflare Business): $200/month
Data Transfer: $500/month
Total Network: $900/month
```

#### Storage
```
S3 (circuits, backups): $300/month
Database Storage: $200/month
Total Storage: $500/month
```

#### Monitoring and Tools
```
Datadog: $500/month
PagerDuty: $100/month
Status Page: $50/month
Total Monitoring: $650/month
```

**Total Estimated Cost**: **~$15,000/month**

*(Based on moderate load. Will scale with usage)*

### Cost Optimization Strategies

1. **Reserved Instances**: 30-50% savings on compute
2. **Proof Caching**: Reduce redundant computation
3. **Circuit Optimization**: Faster proofs = fewer servers
4. **Spot Instances**: Use for non-critical workloads
5. **Storage Lifecycle**: Archive old logs to Glacier

---

## Success Metrics

### Production Readiness Scorecard

| Criteria | Target | Status |
|----------|--------|--------|
| Circuit Implementation | 100% (5/5 patterns) | ⏳ Pending |
| Security Audit | Passed (no critical) | ⏳ Pending |
| Performance SLA | P95 <1s proof gen | ⏳ Pending |
| Availability SLA | 99.9% uptime | ⏳ Pending |
| Documentation | 100% complete | ✅ Complete |
| Team Training | 100% trained | ⏳ Pending |
| Infrastructure | Production-ready | ⏳ Pending |

### Post-Migration KPIs

**Week 1-4** (Stabilization):
- Availability: ≥99.5%
- Proof latency P95: <1.5s
- Error rate: <0.5%
- Customer satisfaction: ≥80%

**Month 2-3** (Optimization):
- Availability: ≥99.9%
- Proof latency P95: <1s
- Error rate: <0.1%
- Customer satisfaction: ≥90%

**Month 4+** (Steady State):
- Availability: ≥99.95%
- Proof latency P95: <800ms
- Error rate: <0.05%
- Customer satisfaction: ≥95%

---

## Support and Resources

### On-Call Rotation

**Schedule**: 24/7 coverage

**Tiers**:
1. **Primary On-Call**: Senior engineer (responds within 15 min)
2. **Secondary On-Call**: Principal engineer (backup)
3. **Escalation**: Engineering Manager → VP Engineering → CTO

**Rotation**: Weekly rotation, 2 engineers per tier

### Documentation

- [Deployment Runbook](./deployment-runbook.md)
- [Incident Response](./security/incident-response.md)
- [Performance Tuning Guide](./performance-tuning.md)
- [Scaling Guide](./scaling-guide.md)
- [Cost Optimization](./cost-optimization.md)

### Training Materials

- [ZKP 101 for Engineers](./training/zkp-101.md)
- [Production Operations Training](./training/prod-ops.md)
- [Incident Response Drill Videos](./training/ir-drills/)
- [Customer Support FAQ](./training/support-faq.md)

---

## Timeline Summary

```
Week 1-2:  Pilot (Internal)
Week 3-4:  Beta (External)
Week 5-6:  GA Rollout (25% → 100%)
Week 7-12: Optimization

├─ Week 1: Internal pilot start (1-10%)
├─ Week 2: Internal pilot expansion (10-25%)
├─ Week 3: Beta customer onboarding
├─ Week 4: Beta feedback and iteration
├─ Week 5: GA launch (25-50%)
├─ Week 6: GA completion (50-100%)
├─ Week 7-8: Performance tuning
├─ Week 9-10: Cost optimization
└─ Week 11-12: Feature enhancements
```

**Go-Live Date**: TBD (after successful beta)  
**Full Rollout**: TBD + 2 weeks  
**Optimization Complete**: TBD + 12 weeks

---

## Sign-off

### Pre-Migration Approval

- [ ] **Engineering Lead**: _________________ Date: _______
- [ ] **Security Lead**: _________________ Date: _______
- [ ] **DevOps Lead**: _________________ Date: _______
- [ ] **Product Manager**: _________________ Date: _______
- [ ] **VP Engineering**: _________________ Date: _______

### Post-Migration Review

- [ ] **Week 2 Review**: _________________ Date: _______
- [ ] **Week 6 Review**: _________________ Date: _______
- [ ] **Week 12 Review**: _________________ Date: _______

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Owner**: Engineering Team  
**Contact**: engineering@vey.example
