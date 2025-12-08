# Production Deployment Guide

This guide provides comprehensive instructions for deploying World Address YAML to production environments using Docker and Kubernetes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Environment Configuration](#environment-configuration)
- [Security Considerations](#security-considerations)
- [Monitoring and Logging](#monitoring-and-logging)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- Docker 24.0+ and Docker Compose 2.0+
- Kubernetes 1.28+ (for K8s deployment)
- kubectl configured with cluster access
- Helm 3.0+ (optional, for package management)
- SSL/TLS certificates for HTTPS

### System Requirements

**Minimum (Development/Staging):**
- 2 CPU cores
- 4 GB RAM
- 20 GB storage

**Recommended (Production):**
- 4+ CPU cores
- 8+ GB RAM
- 50+ GB SSD storage

## Docker Deployment

### Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rei-k/world-address-yaml.git
   cd world-address-yaml
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   nano .env
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment:**
   ```bash
   docker-compose ps
   docker-compose logs -f app
   ```

5. **Access services:**
   - Application: http://localhost:3000
   - Grafana: http://localhost:3001
   - Prometheus: http://localhost:9090

### Production Docker Deployment

1. **Build production image:**
   ```bash
   docker build -t world-address:latest .
   ```

2. **Tag and push to registry:**
   ```bash
   docker tag world-address:latest ghcr.io/your-org/world-address:v1.0.0
   docker push ghcr.io/your-org/world-address:v1.0.0
   ```

3. **Run with production settings:**
   ```bash
   docker run -d \
     --name world-address \
     -p 3000:3000 \
     --env-file .env.production \
     --restart unless-stopped \
     ghcr.io/your-org/world-address:v1.0.0
   ```

## Kubernetes Deployment

### Preparation

1. **Configure kubectl:**
   ```bash
   # Test cluster access
   kubectl cluster-info
   kubectl get nodes
   ```

2. **Create namespace:**
   ```bash
   kubectl apply -f k8s/base/namespace.yaml
   ```

3. **Configure secrets:**
   ```bash
   # Create secrets from environment file
   kubectl create secret generic world-address-secrets \
     --from-env-file=.env.production \
     -n world-address

   # Or apply the secrets manifest (after updating values)
   kubectl apply -f k8s/base/secrets.yaml
   ```

### Deploy to Staging

1. **Apply base manifests:**
   ```bash
   kubectl apply -f k8s/base/ -n world-address
   ```

2. **Verify deployment:**
   ```bash
   kubectl get pods -n world-address
   kubectl get services -n world-address
   kubectl logs -f deployment/world-address-app -n world-address
   ```

3. **Check health:**
   ```bash
   kubectl exec -it deployment/world-address-app -n world-address -- node -e "console.log('healthy')"
   ```

### Deploy to Production

1. **Review production configuration:**
   ```bash
   # Update image tag in deployment
   kubectl set image deployment/world-address-app \
     app=ghcr.io/your-org/world-address:v1.0.0 \
     -n world-address
   ```

2. **Apply production-specific settings:**
   ```bash
   kubectl apply -f k8s/production/ -n world-address
   ```

3. **Monitor rollout:**
   ```bash
   kubectl rollout status deployment/world-address-app -n world-address
   kubectl rollout history deployment/world-address-app -n world-address
   ```

4. **Configure ingress:**
   ```bash
   # Update domain in ingress.yaml, then apply
   kubectl apply -f k8s/base/ingress.yaml -n world-address
   ```

## Environment Configuration

### Essential Variables

```bash
# Application
NODE_ENV=production
LOG_LEVEL=info

# Database (PostgreSQL)
POSTGRES_HOST=postgres-service
POSTGRES_DB=world_address
POSTGRES_USER=vey_user
POSTGRES_PASSWORD=<secure-password>

# Cache (Redis)
REDIS_HOST=redis-service
REDIS_PASSWORD=<secure-password>

# Security
JWT_SECRET=<32-char-minimum-secret>
ENCRYPTION_KEY=<32-char-minimum-key>
```

### Secrets Management

**Using Kubernetes Secrets:**
```bash
kubectl create secret generic world-address-secrets \
  --from-literal=POSTGRES_PASSWORD=<password> \
  --from-literal=REDIS_PASSWORD=<password> \
  -n world-address
```

**Using External Secret Managers:**
- AWS Secrets Manager
- HashiCorp Vault
- Google Secret Manager

Example with AWS Secrets Manager:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secret-store
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
```

## Security Considerations

### SSL/TLS Configuration

1. **Generate certificates:**
   ```bash
   # Using Let's Encrypt (recommended)
   certbot certonly --standalone -d api.world-address.example.com
   ```

2. **Create TLS secret:**
   ```bash
   kubectl create secret tls world-address-tls \
     --cert=/path/to/cert.pem \
     --key=/path/to/key.pem \
     -n world-address
   ```

### Network Policies

Apply network policies to restrict traffic:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: world-address-network-policy
spec:
  podSelector:
    matchLabels:
      app: world-address
  policyTypes:
  - Ingress
  - Egress
```

### RBAC Configuration

The deployment uses minimal RBAC permissions. Review `k8s/base/rbac.yaml` for details.

## Monitoring and Logging

### Prometheus Setup

1. **Access Prometheus:**
   ```bash
   kubectl port-forward svc/prometheus 9090:9090 -n world-address
   ```

2. **View metrics:**
   - Open http://localhost:9090
   - Query: `up{job="world-address-app"}`

### Grafana Setup

1. **Access Grafana:**
   ```bash
   kubectl port-forward svc/grafana 3001:3000 -n world-address
   ```

2. **Login:**
   - URL: http://localhost:3001
   - Default credentials: admin / admin (change immediately)

3. **Import dashboards:**
   - Pre-configured dashboards are in `infrastructure/grafana/dashboards/`

### Log Aggregation

**Using ELK Stack:**
```bash
# Deploy Elasticsearch, Logstash, Kibana
helm install elk elastic/elasticsearch
helm install kibana elastic/kibana
```

**Using Loki:**
```bash
helm install loki grafana/loki-stack
```

**View logs:**
```bash
# Application logs
kubectl logs -f deployment/world-address-app -n world-address

# All pods
kubectl logs -f -l app=world-address -n world-address
```

## Scaling

### Horizontal Pod Autoscaling

The HPA is pre-configured in `k8s/base/hpa.yaml`:

```yaml
minReplicas: 3
maxReplicas: 10
targetCPUUtilization: 70%
```

**Monitor autoscaling:**
```bash
kubectl get hpa -n world-address -w
```

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment/world-address-app --replicas=5 -n world-address
```

### Database Scaling

**PostgreSQL Read Replicas:**
```bash
# Add read replica
kubectl apply -f k8s/base/postgres-replica.yaml
```

**Redis Cluster Mode:**
```bash
# Deploy Redis cluster
helm install redis bitnami/redis-cluster
```

## Troubleshooting

### Common Issues

**1. Pods not starting:**
```bash
kubectl describe pod <pod-name> -n world-address
kubectl logs <pod-name> -n world-address
```

**2. Database connection issues:**
```bash
# Test database connectivity
kubectl exec -it deployment/world-address-app -n world-address -- \
  psql -h postgres-service -U vey_user -d world_address
```

**3. High memory usage:**
```bash
# Check resource usage
kubectl top pods -n world-address
kubectl top nodes
```

**4. Service not accessible:**
```bash
# Check service endpoints
kubectl get endpoints -n world-address
kubectl describe svc world-address-service -n world-address
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/world-address-app -n world-address

# Rollback to previous version
kubectl rollout undo deployment/world-address-app -n world-address

# Rollback to specific revision
kubectl rollout undo deployment/world-address-app --to-revision=2 -n world-address
```

### Health Checks

```bash
# Check pod health
kubectl get pods -n world-address -o wide

# Detailed health status
kubectl exec deployment/world-address-app -n world-address -- \
  node -e "console.log('Health check OK')"
```

## Performance Optimization

### Database Optimization

1. **Connection pooling:**
   - Configure max connections in PostgreSQL
   - Use PgBouncer for connection pooling

2. **Indexes:**
   - Review query patterns
   - Add appropriate indexes (see `infrastructure/postgres/init.sql`)

### Caching Strategy

1. **Redis configuration:**
   ```bash
   # Adjust memory limits
   maxmemory 1gb
   maxmemory-policy allkeys-lru
   ```

2. **Application-level caching:**
   - Enable geocoding cache
   - Cache frequently accessed address data

## Backup and Disaster Recovery

### Database Backups

```bash
# Manual backup
kubectl exec -it postgres-0 -n world-address -- \
  pg_dump -U vey_user world_address > backup.sql

# Scheduled backups using CronJob
kubectl apply -f k8s/base/backup-cronjob.yaml
```

### Restore from Backup

```bash
kubectl exec -i postgres-0 -n world-address -- \
  psql -U vey_user -d world_address < backup.sql
```

## Maintenance

### Update Deployment

```bash
# Update image
kubectl set image deployment/world-address-app \
  app=ghcr.io/your-org/world-address:v1.1.0 \
  -n world-address

# Monitor update
kubectl rollout status deployment/world-address-app -n world-address
```

### Zero-Downtime Deployment

The deployment uses RollingUpdate strategy:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: https://github.com/rei-k/world-address-yaml/docs
- Community: [Discord/Slack link]

## License

MIT License - See LICENSE file for details
