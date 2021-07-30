import Jwt from 'jsonwebtoken';
import { secretKey } from '../conf/conf.js';

export const updateMiddleware = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(403).json({message: 'Пользователь не авторизован'});
    }
    const decodedData = Jwt.verify(token, secretKey);
    
    let hasRight = decodedData.email === req.body.email;
    
    if (!hasRight) {
      return res.status(403).json({message: 'У вас нет прав доступа'});
    } 
    next();
  } catch (e) {
    console.log(e);
    return res.status(403).json({message: 'Пользователь не авторизован'});
  }
};