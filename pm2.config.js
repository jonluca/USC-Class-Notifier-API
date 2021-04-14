module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: "SOC2",
      script: "bin/www",
      log_date_format: "YYYY-MM-DDTHH:mm:ss.SSS",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
