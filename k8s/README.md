# Kubernetes Manifests

Kubernetes deployment manifests for World Address YAML application and its dependencies.

## Directory Structure

```
k8s/
├── base/                       # Base configurations (environment-agnostic)
│   ├── namespace.yaml         # Namespace definition
│   ├── configmap.yaml         # Application configuration
│   ├── secrets.yaml           # Secrets (template - DO NOT commit real secrets)
│   ├── deployment.yaml        # Application deployment
│   ├── service.yaml           # Service definition
│   ├── postgres.yaml          # PostgreSQL StatefulSet
│   ├── redis.yaml             # Redis StatefulSet
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   ├── ingress.yaml          # Ingress configuration
│   └── rbac.yaml             # RBAC configuration
├── staging/                   # Staging environment overlays
│   ├── kustomization.yaml    # Kustomize config for staging
│   └── deployment-patch.yaml # Staging-specific patches
└── production/                # Production environment overlays
    ├── kustomization.yaml    # Kustomize config for production
    ├── deployment-patch.yaml # Production deployment patches
    └── hpa-patch.yaml        # Production HPA patches
```

## Prerequisites

- Kubernetes cluster (1.28+)
- kubectl configured
- Sufficient cluster resources
- (Optional) Kustomize or kubectl with built-in kustomize support
- (Optional) cert-manager for TLS certificates

## Quick Start

### Using kubectl

**Deploy to default namespace:**
```bash
kubectl apply -f k8s/base/
```

**Deploy to custom namespace:**
```bash
kubectl create namespace world-address
kubectl apply -f k8s/base/ -n world-address
```

### Using Kustomize

**Deploy to staging:**
```bash
kubectl apply -k k8s/staging/
```

**Deploy to production:**
```bash
kubectl apply -k k8s/production/
```

## Base Resources

### Namespace

Creates the `world-address` namespace for resource isolation.

```bash
kubectl apply -f k8s/base/namespace.yaml
```

### ConfigMap

Application configuration including:
- Environment variables
- Database connection strings
- Feature flags

**Customize:**
```bash
kubectl edit configmap world-address-config -n world-address
```

### Secrets

**⚠️ SECURITY WARNING:** The base `secrets.yaml` contains dummy values. 

**Create production secrets:**
```bash
kubectl create secret generic world-address-secrets \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=REDIS_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=MONGO_PASSWORD=$(openssl rand -base64 32) \
  -n world-address
```

### Deployment

Main application deployment with:
- 3 replicas (default)
- Resource limits
- Health checks
- Rolling update strategy

**Scale deployment:**
```bash
kubectl scale deployment/world-address-app --replicas=5 -n world-address
```

### Service

ClusterIP service exposing the application internally.

**Get service info:**
```bash
kubectl get svc world-address-service -n world-address
```

### StatefulSets

**PostgreSQL:**
- Persistent storage
- Health checks
- 1 replica (increase for HA)

**Redis:**
- Persistent storage
- Password authentication
- 1 replica

### Horizontal Pod Autoscaler (HPA)

Auto-scales based on:
- CPU utilization (70%)
- Memory utilization (80%)
- Min replicas: 3
- Max replicas: 10

**Check HPA status:**
```bash
kubectl get hpa -n world-address
```

### Ingress

HTTPS ingress with:
- TLS termination
- Rate limiting
- SSL redirect

**Prerequisites:**
- Nginx Ingress Controller
- cert-manager for automatic TLS

**Update domain:**
```yaml
spec:
  rules:
  - host: api.your-domain.com
```

### RBAC

ServiceAccount with minimal permissions for:
- Reading ConfigMaps and Secrets
- Listing Pods

## Environment-Specific Deployments

### Staging Environment

**Features:**
- Lower resource limits
- Debug logging enabled
- 2 replicas
- Latest staging image

**Deploy:**
```bash
kubectl apply -k k8s/staging/
```

**Verify:**
```bash
kubectl get pods -n world-address-staging
kubectl logs -f deployment/world-address-app -n world-address-staging
```

### Production Environment

**Features:**
- Higher resource limits
- Warn-level logging
- 5 replicas minimum
- 20 replicas maximum
- Production image tag

**Deploy:**
```bash
kubectl apply -k k8s/production/
```

**Verify:**
```bash
kubectl get pods -n world-address-prod
kubectl get hpa -n world-address-prod
```

## Common Operations

### View Resources

```bash
# All resources in namespace
kubectl get all -n world-address

# Pods with labels
kubectl get pods -l app=world-address -n world-address

# Detailed pod info
kubectl describe pod <pod-name> -n world-address
```

### View Logs

```bash
# Application logs
kubectl logs -f deployment/world-address-app -n world-address

# Previous pod logs (if crashed)
kubectl logs -p <pod-name> -n world-address

# All pods with label
kubectl logs -f -l app=world-address -n world-address
```

### Execute Commands

```bash
# Shell into pod
kubectl exec -it deployment/world-address-app -n world-address -- /bin/sh

# Run single command
kubectl exec deployment/world-address-app -n world-address -- node --version
```

### Port Forwarding

```bash
# Forward application port
kubectl port-forward svc/world-address-service 3000:80 -n world-address

# Forward database port
kubectl port-forward svc/postgres-service 5432:5432 -n world-address
```

### Update Deployment

```bash
# Update image
kubectl set image deployment/world-address-app \
  app=ghcr.io/rei-k/world-address:v1.1.0 \
  -n world-address

# Edit deployment
kubectl edit deployment/world-address-app -n world-address

# Apply changes from file
kubectl apply -f k8s/base/deployment.yaml -n world-address
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/world-address-app -n world-address

# Rollback to previous version
kubectl rollout undo deployment/world-address-app -n world-address

# Rollback to specific revision
kubectl rollout undo deployment/world-address-app --to-revision=2 -n world-address
```

## Monitoring

### Resource Usage

```bash
# Node resources
kubectl top nodes

# Pod resources
kubectl top pods -n world-address
```

### Events

```bash
# All events in namespace
kubectl get events -n world-address --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n world-address --watch
```

### Health Checks

```bash
# Check pod health
kubectl get pods -n world-address

# Detailed health status
kubectl describe pod <pod-name> -n world-address | grep -A 5 "Conditions:"
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n world-address

# Check pod logs
kubectl logs <pod-name> -n world-address

# Check events
kubectl get events -n world-address | grep <pod-name>
```

### ImagePullBackOff

```bash
# Check image pull secrets
kubectl get secrets -n world-address

# Describe pod for detailed error
kubectl describe pod <pod-name> -n world-address
```

### CrashLoopBackOff

```bash
# View logs from crashed container
kubectl logs -p <pod-name> -n world-address

# Check liveness/readiness probes
kubectl describe pod <pod-name> -n world-address | grep -A 10 "Liveness\|Readiness"
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n world-address

# Describe service
kubectl describe svc world-address-service -n world-address

# Test from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# apk add curl
# curl http://world-address-service.world-address.svc.cluster.local
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
kubectl exec -it deployment/world-address-app -n world-address -- \
  psql -h postgres-service -U vey_user -d world_address

# Check database pod logs
kubectl logs -f postgres-0 -n world-address
```

## Scaling

### Manual Scaling

```bash
# Scale application
kubectl scale deployment/world-address-app --replicas=10 -n world-address

# Scale database (StatefulSet)
kubectl scale statefulset/postgres --replicas=3 -n world-address
```

### Auto-scaling

HPA is configured by default. To modify:

```bash
# Edit HPA
kubectl edit hpa world-address-app-hpa -n world-address

# Delete HPA (disable auto-scaling)
kubectl delete hpa world-address-app-hpa -n world-address
```

## Cleanup

### Remove Application

```bash
# Delete all resources
kubectl delete -f k8s/base/ -n world-address

# Or using kustomize
kubectl delete -k k8s/production/
```

### Remove Namespace

```bash
# This will delete all resources in the namespace
kubectl delete namespace world-address
```

## Security Best Practices

1. **Secrets Management:**
   - Never commit real secrets to Git
   - Use external secret managers (Vault, AWS Secrets Manager)
   - Rotate secrets regularly

2. **RBAC:**
   - Use least privilege principle
   - Create separate ServiceAccounts for different components
   - Audit RBAC permissions regularly

3. **Network Policies:**
   - Implement network policies to restrict traffic
   - Default deny all traffic, allow only necessary
   - Separate namespaces for different environments

4. **Image Security:**
   - Use specific image tags (not `latest`)
   - Scan images for vulnerabilities
   - Use private registries with authentication

5. **Resource Limits:**
   - Always set resource requests and limits
   - Prevent resource exhaustion
   - Monitor actual usage and adjust

## Advanced Topics

### Custom Resource Definitions (CRDs)

For ZKP features, additional CRDs may be required. See documentation in `docs/zkp/`.

### Service Mesh Integration

For advanced traffic management, consider integrating with:
- Istio
- Linkerd
- Consul

### GitOps Deployment

Use GitOps tools for automated deployments:

**ArgoCD:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: world-address
spec:
  source:
    repoURL: https://github.com/rei-k/world-address-yaml
    path: k8s/production
  destination:
    server: https://kubernetes.default.svc
    namespace: world-address
```

**Flux:**
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: world-address
spec:
  sourceRef:
    kind: GitRepository
    name: world-address
  path: ./k8s/production
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Guide](https://kustomize.io/)
- [Production Deployment Guide](../docs/PRODUCTION_DEPLOYMENT.md)
- [Monitoring Guide](../docs/MONITORING_LOGGING.md)

## Support

For Kubernetes deployment issues:
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: See `docs/` directory
