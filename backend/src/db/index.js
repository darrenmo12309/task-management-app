const { Pool } = require('pg');

// Connection values are injected as env vars from the Helm ConfigMap and Secret.
// Fallbacks are for running the backend locally outside of Kubernetes.
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'taskmanagement',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

module.exports = pool;
