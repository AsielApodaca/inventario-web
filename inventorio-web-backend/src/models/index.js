import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import Sequelize from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

import configFile from '../../config/config.json' with { type: 'json' };
const config = configFile[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
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
  const { default: modelFunc } = await import(path.join(__dirname, file));
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
