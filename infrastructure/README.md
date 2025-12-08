# Infrastructure Configuration

This directory contains all infrastructure configuration files for deploying and operating World Address YAML in production environments.

## Directory Structure

```
infrastructure/
├── grafana/                    # Grafana configuration
│   ├── provisioning/
│   │   ├── datasources/       # Auto-provisioned datasources
│   │   └── dashboards/        # Dashboard provisioning config
│   └── dashboards/            # Dashboard JSON definitions
├── nginx/                      # Nginx reverse proxy configuration
│   └── nginx.conf             # Main Nginx config
├── postgres/                   # PostgreSQL configuration
│   └── init.sql               # Database initialization script
└── prometheus/                 # Prometheus monitoring configuration
    ├── prometheus.yml         # Prometheus scrape config
    └── alerts.yml             # Alert rules
```

## Components

### Grafana

Pre-configured Grafana setup with:
- Prometheus datasource
- PostgreSQL datasource
- Custom dashboards for application monitoring

**Access:** http://localhost:3001 (default credentials: admin/admin)

### Nginx

Production-ready reverse proxy with:
- SSL/TLS termination
- Rate limiting
- Security headers
- Gzip compression
- Load balancing

**Configuration:** `nginx/nginx.conf`

### PostgreSQL

Database initialization with:
- Address data tables
- API key management
- Audit logging
- Proper indexes

**Init script:** `postgres/init.sql`

### Prometheus

Metrics collection configured for:
- Application metrics
- Database metrics (PostgreSQL, Redis)
- System metrics (Node exporter)
- Kubernetes metrics

**Configuration:** `prometheus/prometheus.yml`
**Alert rules:** `prometheus/alerts.yml`

## Usage

### Docker Compose

All infrastructure components are integrated in the root `docker-compose.yml`:

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d prometheus grafana
```

### Kubernetes

Deploy using the manifests in `k8s/`:

```bash
# Apply all base configurations
kubectl apply -f k8s/base/
```

### Customization

#### Prometheus

Edit `prometheus/prometheus.yml` to add custom scrape targets:

```yaml
scrape_configs:
  - job_name: 'my-custom-app'
    static_configs:
      - targets: ['app:9090']
```

#### Grafana Dashboards

Add custom dashboards to `grafana/dashboards/`:

```bash
# Create dashboard JSON
cp my-dashboard.json grafana/dashboards/

# Reload Grafana (if using Docker)
docker-compose restart grafana
```

#### Nginx

Modify `nginx/nginx.conf` for:
- Custom domain names
- SSL certificate paths
- Rate limiting rules
- Additional backends

#### PostgreSQL

Extend `postgres/init.sql` with:
- Additional tables
- Custom indexes
- Stored procedures
- Data migrations

## Monitoring Endpoints

Once deployed, access these endpoints:

| Service    | URL                    | Purpose                |
|------------|------------------------|------------------------|
| Prometheus | http://localhost:9090  | Metrics & alerts       |
| Grafana    | http://localhost:3001  | Dashboards & visualization |
| Application| http://localhost:3000  | Main application       |
| Nginx      | http://localhost:80    | Reverse proxy          |

## Security Notes

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Generate strong SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable authentication for all services
- [ ] Set up external secret management
- [ ] Configure backup schedules
- [ ] Enable audit logging
- [ ] Set up intrusion detection

### Secret Management

**Never commit secrets to Git!**

Use environment variables or external secret managers:

```bash
# Using environment variables
export POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Using Kubernetes secrets
kubectl create secret generic db-credentials \
  --from-literal=password=$(openssl rand -base64 32)

# Using HashiCorp Vault
vault kv put secret/world-address/db password=$(openssl rand -base64 32)
```

## Troubleshooting

### Prometheus not scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check service discovery
docker-compose logs prometheus
```

### Grafana datasource connection failed

```bash
# Verify Prometheus is running
docker-compose ps prometheus

# Check network connectivity
docker-compose exec grafana ping prometheus
```

### Nginx 502 Bad Gateway

```bash
# Check upstream service
docker-compose ps app

# View Nginx logs
docker-compose logs nginx
```

### PostgreSQL connection refused

```bash
# Check PostgreSQL status
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U vey_user -d world_address
```

## Maintenance

### Backup Procedures

**Database backup:**
```bash
# Manual backup
docker-compose exec postgres pg_dump -U vey_user world_address > backup.sql

# Automated backup (add to crontab)
0 2 * * * docker-compose exec postgres pg_dump -U vey_user world_address > /backups/$(date +\%Y\%m\%d).sql
```

**Configuration backup:**
```bash
# Backup all configs
tar -czf infrastructure-backup-$(date +%Y%m%d).tar.gz infrastructure/
```

### Updates

**Update Docker images:**
```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d
```

**Update Prometheus rules:**
```bash
# Edit alerts
nano prometheus/alerts.yml

# Reload Prometheus
docker-compose exec prometheus kill -HUP 1
```

## Performance Tuning

### Prometheus

```yaml
# Increase retention
storage:
  tsdb:
    retention.time: 30d
    retention.size: 50GB
```

### PostgreSQL

```sql
-- Connection pooling
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

-- Query optimization
work_mem = 16MB
maintenance_work_mem = 64MB
```

### Redis

```conf
# Memory management
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
appendfsync everysec
```

## Documentation

For detailed documentation:
- [Production Deployment Guide](../docs/PRODUCTION_DEPLOYMENT.md)
- [Monitoring and Logging Guide](../docs/MONITORING_LOGGING.md)
- [ZKP Production Migration](../docs/zkp/production-migration.md)

## Support

- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: https://github.com/rei-k/world-address-yaml/docs
