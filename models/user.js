import Sequelize from 'sequelize';
import { connection } from '../config/config.js'; 

export const sequelize = new Sequelize(connection);

export const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  birthday: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
});
  