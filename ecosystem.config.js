module.exports = {
  apps: [
    {
      name: 'webhook-server',
      script: 'webhook-server.js',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
    },
    {
      name: 'itplanet',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      watch: false,
      autorestart: true,
    },
  ],
}; 