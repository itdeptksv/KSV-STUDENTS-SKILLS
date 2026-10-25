const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'ksv_dev_jwt_secret_change_in_production_32chars';
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = 'ksv_dev_refresh_secret_change_in_production_32c';
  }
};

module.exports = validateEnv;
