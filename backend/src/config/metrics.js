const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add default metrics (CPU, Memory, Event Loop, etc.)
client.collectDefaultMetrics({ register, prefix: 'resolveit_' });

// Custom Application Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'resolveit_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'resolveit_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const complaintsCreatedTotal = new client.Counter({
  name: 'resolveit_complaints_created_total',
  help: 'Total number of complaints submitted',
  labelNames: ['category', 'priority']
});

const complaintsResolvedTotal = new client.Counter({
  name: 'resolveit_complaints_resolved_total',
  help: 'Total number of complaints resolved',
  labelNames: ['category']
});

const slaBreachesTotal = new client.Counter({
  name: 'resolveit_sla_breaches_total',
  help: 'Total number of SLA breached complaints'
});

const activeRequests = new client.Gauge({
  name: 'resolveit_active_requests',
  help: 'Number of currently active HTTP requests'
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(complaintsCreatedTotal);
register.registerMetric(complaintsResolvedTotal);
register.registerMetric(slaBreachesTotal);
register.registerMetric(activeRequests);

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  complaintsCreatedTotal,
  complaintsResolvedTotal,
  slaBreachesTotal,
  activeRequests
};
