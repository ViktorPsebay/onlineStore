import { createHmac } from 'crypto';
import Jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { salt, secretKey } from '../config/config.js';

const generateAccessToken = (id, email) => {
  const payload = {
    id, 
    email
  };
  return Jwt.sign(payload, secretKey, {expiresIn: '2h'});
};

class UserController {
  async create(req, res) {
    try {
      const {fullName, email, password, birthday} = req.body;
      const emailNormalize = email.toLowerCase();
      const candidate = await User.findOne({where: {email: emailNormalize}});
      if (candidate) {
        return res.status(400).json({message: 'Пользователь с таким email уже существует'});
      }

      if (password.length < 5) return res.status(400).json({message: 'Пароль не может быть менее 5 символов'});
      if (fullName.length < 3) return res.status(400).json({message: 'Имя не может быть менее 3 символов'});

      const regularExpEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      if (!regularExpEmail.test(String(email).toLowerCase())) 
        return res.status(400).json({message: 'Неправильный формат email'});

      if (!Date.parse(birthday)) return res.status(400).json({message: 'Неправильный формат даты'});

      const hashPassword = createHmac('sha256', salt).update(password).digest('hex');
      await User.create({
        fullName,
        password: hashPassword,
        email: emailNormalize,
        birthday,
      });
      res.status(200).json('Пользователь успешно добавлен');
    }
    catch(e) {
      console.log(e);
    }
  }

  async getOneUser(req, res) {
    try {
      const { id } = req.params;
      const users = await User.findAll({ where:{id}, raw: true });
      console.log(users);
      res.status(200).json(users);
    }
    catch(e) {
      console.log(e);
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({raw: true,
        attributes: ['id', 'fullName', 'email', 'birthday']
      });
      res.status(200).json(users);
    }
    catch(e) {
      console.log(e);
    }
  }

  async updateUser(req, res) {
    try {
      const { fullName, password, birthday, email } = req.body;
      const hasRight = req.user.email === email;
      if (!hasRight) {
        return res.status(401).json({message: 'У вас нет прав доступа'});
      }

      const hashPassword = createHmac('sha256', salt).update(password).digest('hex');
      const user = await User.update( {fullName, password: hashPassword, birthday, email}, 
        {where:{email}});
      res.status(200).json(user);
    }
    catch(e) {
      console.log(e);
    }
  }

  async deleteUser(req, res) {
    
    try {
      const { id } = req.params;
      
      const hasRight = req.user.id === +id;
      if (!hasRight) {
        return res.status(401).json({message: 'У вас нет прав доступа'});
      } 

      const users = await User.destroy({ where:{id}});
      console.log(users);
      res.status(200).json({message: 'Пользователь был удален'});
    }
    catch(e) {
      console.log(e);
    }
  }

  async registration(req, res) {
    try {
      const {fullName, email, password, birthday} = req.body;
      const emailNormalize = email.toLowerCase();
      const candidate = await User.findOne({where: {email: emailNormalize}});
      if (candidate) {
        return res.status(400).json({message: 'Пользователь с таким email уже существует'});
      }

      if (password.length < 5) return res.status(400).json({message: 'Пароль не может быть менее 5 символов'});
      if (fullName.length < 3) return res.status(400).json({message: 'Имя не может быть менее 3 символов'});

      const regularExpEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      if (!regularExpEmail.test(String(email).toLowerCase())) return res.status(400).json({message: 'Неправильный формат email'});

      if (!Date.parse(birthday)) return res.status(400).json({message: 'Неправильный формат даты'});

      const hashPassword = createHmac('sha256', salt).update(password).digest('hex');
      await User.create({
        fullName,
        password: hashPassword,
        email: emailNormalize,
        birthday,
      });
      res.status(200).json('Пользователь успешно добавлен');
    } catch (e) {
      console.log(e);
    }
  }

  async authorization(req, res) {
    try {
      const {email, password} = req.body;
      const user = await User.findOne({where: {email}});
      if (!user) {
        return res.status(400).json({message: 'Пользователь не найден'});
      }
      const validPassword = createHmac('sha256', salt).update(password).digest('hex') === user.password;
      if (!validPassword) {
        return res.status(400).json({message: 'Введен неверный пароль'});
      }
      const token = generateAccessToken(user.id, user.email);
      return res.status(200).json(token);
  
    } catch (e) {
      console.log(e);       
    }
  }

}

export default new UserController();