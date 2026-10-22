module.exports = {
  apps: [
    {
      name: 'clinica-backend',
      cwd: './clinica-turnos/backend',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
