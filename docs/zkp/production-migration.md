# ZKP Production Migration Guide

This comprehensive guide outlines the process of migrating the ZKP Address Protocol from development/testing to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Phases](#migration-phases)
4. [Deployment Steps](#deployment-steps)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring & Observability](#monitoring--observability)
7. [Scaling Considerations](#scaling-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Infrastructure Requirements

**Compute Resources (Proof Generation)**:
- CPU: 8+ cores, 3.0+ GHz (proof generation is CPU-intensive)
- RAM: 32+ GB (circuit loading and witness computation)
- Storage: 100+ GB SSD (circuit files, keys, proofs)
- Network: 1+ Gbps (proof transmission)

**Compute Resources (Verification)**:
- CPU: 2+ cores (verification is lightweight)
- RAM: 4+ GB
- Storage: 10+ GB
- Network: 100+ Mbps

**Database**:
- PostgreSQL 14+ or MongoDB 6+
- Replicated setup (primary + 2 replicas minimum)
- Automated backups (point-in-time recovery)

**Cache**:
- Redis 7+ cluster
- Persistent storage enabled
- Replication configured

### Software Requirements

**Core Dependencies**:
```json
{
  "circom": "^2.1.0",
  "snarkjs": "^0.7.0",
  "circomlibjs": "^0.1.7",
  "node": "^18.0.0",
  "typescript": "^5.0.0"
}
```

**Production Tools**:
- Docker 24+
- Kubernetes 1.28+ (for orchestration)
- Terraform (infrastructure as code)
- Prometheus + Grafana (monitoring)
- ELK Stack or Datadog (logging)

### Security Requirements

- [ ] TLS 1.3 certificates obtained
- [ ] mTLS for service-to-service communication
- [ ] HSM or Cloud KMS for key management
- [ ] WAF configured (Cloudflare, AWS WAF, etc.)
- [ ] DDoS protection enabled
- [ ] Security audit completed
- [ ] Penetration testing passed

---

## Pre-Migration Checklist

### Code & Circuits

- [ ] All circuits finalized and frozen (no more changes)
- [ ] Circuits audited by external security firm
- [ ] All circuit tests passing (100% coverage)
- [ ] Benchmark results documented
- [ ] Circuit compilation scripts tested

### Trusted Setup

- [ ] **Option A (Groth16)**: Multi-party computation ceremony completed
  - [ ] Minimum 20 participants
  - [ ] Toxic waste destroyed by all participants
  - [ ] Setup parameters published and verified
  - [ ] Powers of Tau downloaded from trusted source

- [ ] **Option B (PLONK)**: Universal setup SRS obtained
  - [ ] SRS parameters from Ethereum or Hermez ceremony
  - [ ] SRS verification completed
  - [ ] Circuit-specific setup completed

### Infrastructure

- [ ] Production environment provisioned
- [ ] Staging environment identical to production
- [ ] CI/CD pipelines configured
- [ ] Secrets management setup (Vault, AWS Secrets Manager)
- [ ] Backup and disaster recovery tested
- [ ] Load balancers configured
- [ ] Auto-scaling policies defined

### Testing

- [ ] Load testing completed (target: 1000 proofs/hour)
- [ ] Stress testing passed
- [ ] Chaos engineering tests passed
- [ ] End-to-end integration tests passing
- [ ] Security testing completed (OWASP Top 10)

### Documentation

- [ ] API documentation published (OpenAPI/Swagger)
- [ ] Deployment runbooks created
- [ ] Incident response procedures documented
- [ ] Monitoring dashboards configured
- [ ] User migration guide prepared

### Team Readiness

- [ ] DevOps team trained on ZKP system
- [ ] On-call rotation established
- [ ] Runbooks reviewed by all team members
- [ ] Post-migration support plan in place

---

## Migration Phases

### Phase 1: Pilot (Week 1-2)

**Goal**: Validate production setup with limited traffic

**Activities**:
1. Deploy to production with feature flag disabled
2. Enable for 1% of internal test users
3. Monitor metrics closely
4. Fix any issues discovered
5. Gradual rollout to 5%, 10%, 25% of test users

**Success Criteria**:
- Zero critical bugs
- Proof generation < 10 seconds (p95)
- Proof verification < 100ms (p95)
- 99.9% uptime

---

### Phase 2: Beta (Week 3-4)

**Goal**: Expand to select external users

**Activities**:
1. Enable for beta customers (whitelist)
2. Collect feedback on UX and performance
3. Monitor for edge cases
4. Optimize based on real-world usage patterns

**Success Criteria**:
- Positive user feedback (NPS > 50)
- No security incidents
- Performance targets met
- Error rate < 0.1%

---

### Phase 3: General Availability (Week 5-6)

**Goal**: Full production rollout

**Activities**:
1. Gradual rollout: 25% → 50% → 75% → 100% (over 2 weeks)
2. Monitor each stage for 2-3 days before progressing
3. Keep legacy system running in parallel for 1 month
4. Automated migration of existing address data

**Success Criteria**:
- All users migrated successfully
- Performance better than or equal to legacy system
- Zero data loss
- User support tickets < baseline

---

### Phase 4: Optimization (Week 7-12)

**Goal**: Fine-tune for cost and performance

**Activities**:
1. Analyze production metrics
2. Optimize circuit constraints (reduce proof time)
3. Implement caching strategies
4. Right-size infrastructure
5. Cost optimization

**Success Criteria**:
- 20% reduction in proof generation time
- 30% reduction in infrastructure costs
- Improved user satisfaction

---

## Deployment Steps

### Step 1: Infrastructure Setup

```bash
# Using Terraform
cd infrastructure/terraform
terraform init
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars

# Verify infrastructure
terraform output
```

### Step 2: Circuit Compilation

```bash
# Compile all circuits
cd sdk/core/circuits
./compile-all.sh

# Verify compilation
ls -lh build/
# Expected: membership.r1cs, structure.r1cs, etc.
```

### Step 3: Trusted Setup

```bash
# Download Powers of Tau
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_20.ptau

# Generate proving and verification keys
./setup-keys.sh

# Export verification keys
snarkjs zkey export verificationkey build/membership_final.zkey build/membership_vkey.json
```

### Step 4: Database Migration

```sql
-- Run database migrations
psql $DATABASE_URL < migrations/001_create_tables.sql
psql $DATABASE_URL < migrations/002_add_indices.sql
psql $DATABASE_URL < migrations/003_add_constraints.sql

-- Verify schema
\d addresses
\d proofs
\d revocation_list
```

### Step 5: Application Deployment

```bash
# Build Docker images
docker build -t zkp-prover:v1.0.0 -f docker/Dockerfile.prover .
docker build -t zkp-verifier:v1.0.0 -f docker/Dockerfile.verifier .

# Push to registry
docker push your-registry.com/zkp-prover:v1.0.0
docker push your-registry.com/zkp-verifier:v1.0.0

# Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/prover-deployment.yaml
kubectl apply -f k8s/verifier-deployment.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n zkp-production
kubectl logs -f deployment/zkp-prover -n zkp-production
```

### Step 6: Health Checks

```bash
# API health
curl https://api.zkp.production/health
# Expected: {"status": "healthy", "circuits": "loaded", "database": "connected"}

# Proof generation test
curl -X POST https://api.zkp.production/v1/zkp/generate \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"pid": "JP-13-113-01", "pattern": "membership"}'

# Proof verification test
curl -X POST https://api.zkp.production/v1/zkp/verify \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"proof": "...proof data...", "circuitId": "membership-v1"}'
```

### Step 7: Monitoring Setup

```bash
# Deploy Prometheus
kubectl apply -f monitoring/prometheus.yaml

# Deploy Grafana
kubectl apply -f monitoring/grafana.yaml

# Import dashboards
curl -X POST https://grafana.production/api/dashboards/db \
  -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -d @dashboards/zkp-overview.json
```

### Step 8: Enable Traffic

```bash
# Update feature flag
curl -X POST https://api.config.production/feature-flags \
  -d '{"zkp_enabled": true, "rollout_percentage": 1}'

# Monitor for 1 hour, then increase gradually
# 1% → 5% → 10% → 25% → 50% → 100%
```

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

```bash
# Disable feature flag
curl -X POST https://api.config.production/feature-flags \
  -d '{"zkp_enabled": false}'

# Traffic automatically routes to legacy system
# ZKP pods can remain running for investigation
```

### Full Rollback (< 30 minutes)

```bash
# Scale down ZKP services
kubectl scale deployment zkp-prover --replicas=0 -n zkp-production
kubectl scale deployment zkp-verifier --replicas=0 -n zkp-production

# Restore database from backup if needed
pg_restore -d addresses_db -C backup_pre_migration.dump

# Update DNS to route to legacy system
terraform apply -var "use_legacy_system=true"

# Verify rollback
curl https://api.production/health
```

### Data Recovery

```bash
# If data corruption occurred during migration
# Restore from point-in-time backup
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier prod-db \
  --target-db-instance-identifier prod-db-restored \
  --restore-time 2024-12-07T10:00:00Z

# Update connection strings
kubectl set env deployment/zkp-prover DATABASE_URL=$NEW_DB_URL
```

---

## Monitoring & Observability

### Key Metrics

**Proof Generation**:
- `zkp_proof_generation_duration_seconds` (histogram)
- `zkp_proof_generation_total` (counter)
- `zkp_proof_generation_errors_total` (counter)

**Proof Verification**:
- `zkp_proof_verification_duration_seconds` (histogram)
- `zkp_proof_verification_total` (counter)
- `zkp_proof_verification_failures_total` (counter)

**System Health**:
- `zkp_circuit_load_time_seconds`
- `zkp_memory_usage_bytes`
- `zkp_cpu_usage_percent`
- `zkp_active_provers`

### Dashboards

**ZKP Overview Dashboard**:
- Proof generation rate (proofs/second)
- Average proof generation time
- Verification success rate
- Error rates by type
- Resource utilization

**Performance Dashboard**:
- P50, P95, P99 latencies
- Throughput trends
- Queue depths
- Circuit efficiency

### Alerts

**Critical**:
- Proof generation failure rate > 1%
- Proof verification failure rate > 0.1%
- Service downtime > 1 minute
- Database connection lost

**Warning**:
- Proof generation time > 15 seconds (p95)
- Memory usage > 80%
- CPU usage > 80%
- Queue backlog > 100 proofs

### Logging

```javascript
// Structured logging format
{
  "timestamp": "2024-12-07T10:30:45.123Z",
  "level": "info",
  "service": "zkp-prover",
  "event": "proof_generated",
  "circuit_id": "membership-v1",
  "duration_ms": 4523,
  "user_id": "did:key:user123",
  "request_id": "req_abc123"
}
```

---

## Scaling Considerations

### Horizontal Scaling

**Proof Generation** (CPU-bound):
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: zkp-prover-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: zkp-prover
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Proof Verification** (lightweight):
```yaml
minReplicas: 2
maxReplicas: 10
targetCPUUtilization: 60%
```

### Vertical Scaling

**For high-throughput scenarios**:
- Use compute-optimized instances (AWS C6i, GCP C2)
- Allocate 64+ GB RAM for large circuit loading
- Use NVMe SSDs for fast I/O

### Database Scaling

**Read Replicas**:
- Use for proof verification lookups
- 2-3 read replicas minimum
- Consider geographic distribution

**Connection Pooling**:
```javascript
const pool = new Pool({
  max: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy

**Proof Results Cache**:
```javascript
// Cache verification results for 5 minutes
const proofCache = new Redis({
  host: 'redis-cluster.production',
  ttl: 300,
});

// Cache circuit verification keys indefinitely
const vkeyCache = new Redis({
  host: 'redis-cluster.production',
  ttl: -1, // never expire
});
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Slow Proof Generation

**Symptoms**:
- Proof generation > 20 seconds
- High CPU usage
- Queue backlog

**Diagnosis**:
```bash
# Check CPU usage
kubectl top pods -n zkp-production

# Check proof generation metrics
curl https://prometheus.production/api/v1/query?query=zkp_proof_generation_duration_seconds
```

**Solutions**:
- Increase pod replicas
- Optimize circuit constraints
- Use larger instance types
- Implement proof request batching

---

#### Issue 2: Verification Failures

**Symptoms**:
- Valid-looking proofs rejected
- Error: "Invalid proof structure"

**Diagnosis**:
```bash
# Check logs
kubectl logs deployment/zkp-verifier -n zkp-production --tail=100

# Verify verification keys match proving keys
sha256sum build/*_vkey.json
```

**Solutions**:
- Ensure verification keys match circuit versions
- Check for proof format incompatibilities
- Verify public inputs match expected format

---

#### Issue 3: Memory Leaks

**Symptoms**:
- Memory usage gradually increases
- Pod OOMKilled errors
- Performance degradation over time

**Diagnosis**:
```bash
# Monitor memory over time
kubectl top pods -n zkp-production --containers

# Check for memory leaks
node --inspect --heap-prof app.js
```

**Solutions**:
- Properly dispose of circuit instances
- Implement periodic worker restarts
- Increase memory limits
- Fix memory leaks in code

---

## Post-Migration Validation

### Week 1 Checkpoints

- [ ] All users successfully migrated
- [ ] No critical bugs reported
- [ ] Performance meets or exceeds SLAs
- [ ] Zero security incidents
- [ ] Legacy system still available (hot standby)

### Week 2 Checkpoints

- [ ] Optimize based on production patterns
- [ ] Cost analysis complete
- [ ] User satisfaction survey > 80% positive
- [ ] Documentation updated with lessons learned

### Month 1 Checkpoints

- [ ] Legacy system decommissioned
- [ ] Cost optimization implemented
- [ ] Retrospective completed
- [ ] Knowledge transfer to support team

---

## Contact & Support

**Migration Team**:
- Lead Engineer: [name]
- DevOps Lead: [name]
- Security Lead: [name]

**Escalation**:
1. On-call engineer (Slack: #zkp-oncall)
2. Engineering manager
3. CTO

**Documentation**:
- Internal Wiki: https://wiki.company.com/zkp
- API Docs: https://docs.api.production
- Runbooks: https://runbooks.company.com/zkp

---

**Migration Guide Version**: 1.0  
**Last Updated**: 2024-12-07  
**Next Review**: 2025-01-07
