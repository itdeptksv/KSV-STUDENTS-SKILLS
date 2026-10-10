const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const validateEnv = () => {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = validateEnv;
