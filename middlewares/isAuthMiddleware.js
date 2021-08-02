import Jwt from 'jsonwebtoken';
import { secretKey } from '../config/config.js';
import { User } from '../models/user.js';

export const isAuthMiddleware = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({message: 'Пользователь не авторизован'});
    }
  
    let decodedData;
    try {
      decodedData = Jwt.verify(token, secretKey);
    } catch(err) {
      if (err.name ===  'TokenExpiredError') return res.status(401).json({message: 'Срок действия токена истек'});
      if (err.name ===  'JsonWebTokenError') return res.status(401).json({message: 'Токен не действителен'});
    }
    
    const user = await User.findByPk(decodedData.id);

    req.user = user;

    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({message: 'Пользователь не авторизован '});
  }
};