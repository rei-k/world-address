# Monitoring and Logging Setup Guide

Complete guide for setting up production monitoring and logging for World Address YAML using industry-standard tools.

## Table of Contents

- [Overview](#overview)
- [Monitoring Stack](#monitoring-stack)
- [Logging Stack](#logging-stack)
- [Alerting](#alerting)
- [Dashboards](#dashboards)
- [Best Practices](#best-practices)

## Overview

The monitoring and logging infrastructure consists of:

- **Metrics Collection**: Prometheus
- **Visualization**: Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
- **Alerting**: Alertmanager
- **Tracing**: Jaeger (optional)

## Monitoring Stack

### Prometheus Setup

#### Installation

**Using Docker Compose:**
```bash
# Already included in docker-compose.yml
docker-compose up -d prometheus
```

**Using Kubernetes:**
```bash
# Using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus \
  --namespace world-address \
  --values infrastructure/prometheus/values.yaml
```

#### Configuration

The Prometheus configuration is in `infrastructure/prometheus/prometheus.yml`.

**Key scrape configs:**
```yaml
scrape_configs:
  - job_name: 'world-address-app'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - world-address
```

#### Custom Metrics

**Instrument your application:**

```typescript
// Example: Track address validation requests
import { Counter, Histogram } from 'prom-client';

const validationCounter = new Counter({
  name: 'address_validation_total',
  help: 'Total address validations',
  labelNames: ['country', 'status']
});

const validationDuration = new Histogram({
  name: 'address_validation_duration_seconds',
  help: 'Address validation duration',
  labelNames: ['country'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Increment counter
validationCounter.inc({ country: 'US', status: 'success' });

// Observe duration
const end = validationDuration.startTimer({ country: 'US' });
// ... validation logic ...
end();
```

#### Exporters

**PostgreSQL Exporter:**
```yaml
# docker-compose.yml
postgres-exporter:
  image: prometheuscommunity/postgres-exporter
  environment:
    DATA_SOURCE_NAME: "postgresql://vey_user:password@postgres:5432/world_address?sslmode=disable"
  ports:
    - "9187:9187"
```

**Redis Exporter:**
```yaml
redis-exporter:
  image: oliver006/redis_exporter
  environment:
    REDIS_ADDR: "redis:6379"
    REDIS_PASSWORD: "${REDIS_PASSWORD}"
  ports:
    - "9121:9121"
```

**Node Exporter (System Metrics):**
```yaml
node-exporter:
  image: prom/node-exporter
  volumes:
    - /proc:/host/proc:ro
    - /sys:/host/sys:ro
    - /:/rootfs:ro
  command:
    - '--path.procfs=/host/proc'
    - '--path.sysfs=/host/sys'
    - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
  ports:
    - "9100:9100"
```

### Grafana Setup

#### Installation

**Using Docker Compose:**
```bash
docker-compose up -d grafana
```

**Using Kubernetes:**
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
  --namespace world-address \
  --set adminPassword=changeme
```

#### Initial Configuration

1. **Login to Grafana:**
   ```bash
   # Get admin password (if using Helm)
   kubectl get secret --namespace world-address grafana -o jsonpath="{.data.admin-password}" | base64 --decode
   
   # Access Grafana
   kubectl port-forward svc/grafana 3000:80 -n world-address
   # Open http://localhost:3000
   ```

2. **Add Prometheus datasource:**
   - Navigate to Configuration > Data Sources
   - Add Prometheus
   - URL: `http://prometheus:9090`
   - Save & Test

#### Pre-built Dashboards

We provide several pre-configured dashboards:

1. **Application Overview Dashboard**
   - Request rate and latency
   - Error rates
   - Resource usage

2. **Database Dashboard**
   - Connection pool status
   - Query performance
   - Table sizes

3. **Infrastructure Dashboard**
   - CPU and memory usage
   - Disk I/O
   - Network traffic

**Import dashboards:**
```bash
# Copy dashboard JSON files
kubectl create configmap grafana-dashboards \
  --from-file=infrastructure/grafana/dashboards/ \
  -n world-address
```

### Key Metrics to Monitor

#### Application Metrics

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Request latency P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active connections
http_connections_active

# Validation success rate
rate(address_validation_total{status="success"}[5m]) / rate(address_validation_total[5m])
```

#### System Metrics

```promql
# CPU usage
rate(process_cpu_seconds_total[5m])

# Memory usage
process_resident_memory_bytes

# Disk usage
(node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes

# Network I/O
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])
```

#### Database Metrics

```promql
# Active connections
pg_stat_database_numbackends

# Transaction rate
rate(pg_stat_database_xact_commit[5m])

# Cache hit ratio
pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)

# Slow queries
pg_stat_statements_mean_exec_time > 1000
```

## Logging Stack

### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

#### Installation

```bash
# Using Helm
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n world-address
helm install logstash elastic/logstash -n world-address
helm install kibana elastic/kibana -n world-address
```

#### Logstash Configuration

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [kubernetes] {
    mutate {
      add_field => {
        "app" => "%{[kubernetes][labels][app]}"
        "namespace" => "%{[kubernetes][namespace]}"
      }
    }
  }
  
  json {
    source => "message"
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "world-address-%{+YYYY.MM.dd}"
  }
}
```

#### Filebeat Configuration

```yaml
filebeat.inputs:
- type: container
  paths:
    - '/var/log/containers/*world-address*.log'
  processors:
    - add_kubernetes_metadata:
        host: ${NODE_NAME}
        matchers:
        - logs_path:
            logs_path: "/var/log/containers/"

output.logstash:
  hosts: ["logstash:5044"]
```

### Option 2: Grafana Loki (Recommended)

#### Installation

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack \
  --namespace world-address \
  --set promtail.enabled=true
```

#### Promtail Configuration

```yaml
# Automatically scrapes logs from Kubernetes pods
server:
  http_listen_port: 3101

clients:
  - url: http://loki:3100/loki/api/v1/push

positions:
  filename: /tmp/positions.yaml

scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - world-address
```

#### Query Logs in Grafana

```logql
# All application logs
{namespace="world-address", app="world-address"}

# Error logs only
{namespace="world-address", app="world-address"} |= "ERROR"

# Logs with specific country code
{namespace="world-address", app="world-address"} | json | country="US"

# Rate of errors
rate({namespace="world-address", app="world-address"} |= "ERROR" [5m])
```

### Structured Logging

**Application logging format:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'world-address',
    version: process.env.VERSION
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Usage
logger.info('Address validation started', {
  country: 'US',
  postalCode: '12345',
  requestId: 'abc-123'
});

logger.error('Validation failed', {
  country: 'US',
  error: error.message,
  stack: error.stack
});
```

## Alerting

### Alertmanager Setup

#### Installation

```bash
helm install alertmanager prometheus-community/alertmanager \
  --namespace world-address
```

#### Configuration

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-notifications'
  routes:
  - match:
      severity: critical
    receiver: 'pagerduty-critical'
  - match:
      severity: warning
    receiver: 'slack-notifications'

receivers:
- name: 'slack-notifications'
  slack_configs:
  - channel: '#alerts'
    title: 'World Address Alert'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'pagerduty-critical'
  pagerduty_configs:
  - service_key: 'YOUR_PAGERDUTY_KEY'
```

### Alert Rules

Defined in `infrastructure/prometheus/alerts.yml`:

```yaml
groups:
  - name: world-address-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}"
```

### Testing Alerts

```bash
# Manually trigger an alert
kubectl exec -it prometheus-0 -n world-address -- \
  promtool test rules /etc/prometheus/rules/alerts.yml
```

## Dashboards

### Creating Custom Dashboards

1. **Application Performance Dashboard:**

```json
{
  "dashboard": {
    "title": "World Address - Application Performance",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{path}}"
          }
        ]
      },
      {
        "title": "P95 Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{method}} {{path}}"
          }
        ]
      }
    ]
  }
}
```

2. **Database Performance Dashboard:**

Query examples:
- Connection pool utilization
- Query execution time
- Transaction throughput
- Cache hit ratio

### Dashboard Best Practices

1. **Use consistent time ranges** (Last 1h, 6h, 24h, 7d)
2. **Include rate of change** not just absolute values
3. **Add SLO/SLA indicators** (e.g., 99.9% uptime)
4. **Use heatmaps** for latency distributions
5. **Include annotations** for deployments and incidents

## Best Practices

### Monitoring Best Practices

1. **Four Golden Signals:**
   - **Latency**: How long requests take
   - **Traffic**: How many requests
   - **Errors**: Rate of failed requests
   - **Saturation**: Resource utilization

2. **Metric Naming:**
   ```
   <namespace>_<subsystem>_<metric>_<unit>
   
   Examples:
   - world_address_validation_duration_seconds
   - world_address_geocoding_requests_total
   - world_address_cache_hit_ratio
   ```

3. **Label Usage:**
   - Use labels for dimensions (country, status, method)
   - Keep cardinality low (< 10 values per label)
   - Avoid user IDs or timestamps as labels

4. **Retention:**
   - High-resolution (15s): 7 days
   - Medium-resolution (1m): 30 days
   - Low-resolution (5m): 1 year

### Logging Best Practices

1. **Log Levels:**
   - **ERROR**: Errors requiring immediate attention
   - **WARN**: Warning conditions
   - **INFO**: Informational messages
   - **DEBUG**: Detailed debugging (disabled in production)

2. **Structured Logging:**
   ```json
   {
     "timestamp": "2024-12-08T10:00:00Z",
     "level": "info",
     "message": "Address validated",
     "country": "US",
     "duration_ms": 120,
     "request_id": "abc-123"
   }
   ```

3. **What to Log:**
   - Request/response (with sanitization)
   - Errors with stack traces
   - Performance metrics
   - Security events
   - State changes

4. **What NOT to Log:**
   - Passwords or secrets
   - Personal data (unless required and encrypted)
   - Credit card numbers
   - Session tokens

### Security Considerations

1. **Access Control:**
   - Restrict Grafana/Prometheus access
   - Use RBAC for Kubernetes resources
   - Enable audit logging

2. **Data Retention:**
   - Define retention policies
   - Comply with GDPR/privacy regulations
   - Secure log storage

3. **Alerting Security:**
   - Encrypt webhook URLs
   - Use dedicated alert channels
   - Test incident response procedures

## Troubleshooting

### Common Issues

**Prometheus not scraping:**
```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Check service discovery
kubectl get servicemonitor -n world-address
```

**High cardinality:**
```bash
# Find high cardinality metrics
curl http://localhost:9090/api/v1/label/__name__/values | jq '.data | length'
```

**Grafana dashboard not loading:**
```bash
# Check datasource connectivity
kubectl logs -f deployment/grafana -n world-address
```

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [ELK Stack Guide](https://www.elastic.co/guide/)

## Support

For monitoring and logging issues:
- GitHub Issues: https://github.com/rei-k/world-address-yaml/issues
- Documentation: See `docs/`
