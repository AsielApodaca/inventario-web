require('dotenv').config();

const getNumber = v => (v ? Number(v) : undefined);

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'inventoryweb',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: getNumber(process.env.DB_PORT) || 3306,
    use_env_variable: process.env.DB_USE_ENV_VARIABLE || undefined
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: getNumber(process.env.DB_PORT) || 3306,
    use_env_variable: process.env.DB_USE_ENV_VARIABLE || undefined
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'database_production',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: getNumber(process.env.DB_PORT) || 3306,
    use_env_variable: process.env.DB_USE_ENV_VARIABLE || undefined
  }
};
