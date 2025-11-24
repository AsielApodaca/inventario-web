import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import process from 'process';
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import configFromFile from '../../config/config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Usar configFromFile (config/config.js) en lugar de leer config.json
const fileConfig = configFromFile[env] || {};
const config = {
  ...fileConfig,
  username: process.env.DB_USER || fileConfig.username,
  password: process.env.DB_PASS || fileConfig.password,
  database: process.env.DB_NAME || fileConfig.database,
  host: process.env.DB_HOST || fileConfig.host,
  dialect: process.env.DB_DIALECT || fileConfig.dialect,
  port: process.env.DB_PORT || fileConfig.port,
  // Si se establece DATABASE_URL o se indica otra variable en config.use_env_variable, respetarla
  use_env_variable: process.env.DB_USE_ENV_VARIABLE || process.env.DATABASE_URL || fileConfig.use_env_variable
};

const db = {};

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Cargar dinámicamente todos los modelos
const files = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.endsWith('.js') &&
      !file.includes('.test.js')
    );
  });

for (const file of files) {
  const filePath = path.join(__dirname, file);
  const { default: modelFunc } = await import(pathToFileURL(filePath).href);
  const model = modelFunc(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Asociaciones
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { sequelize, Sequelize };
