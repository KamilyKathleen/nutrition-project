module.exports = {
  apps: [{
    name: 'nutrition-api',
    script: 'dist/server.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    
    // Variáveis de ambiente
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },

    // Logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 1000,
    
    // Performance
    max_memory_restart: '200M',
    node_args: '--max-old-space-size=200',
    
    // Monitoramento
    watch: false,
    ignore_watch: ['node_modules', 'logs', '*.log'],
    
    // Merge logs
    merge_logs: true,
    
    // Auto restart em caso de falha
    autorestart: true,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Graceful shutdown
    listen_timeout: 10000,
    wait_ready: true
  }]
};