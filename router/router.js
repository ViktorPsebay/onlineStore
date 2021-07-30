import Router from 'express';
import Jwt from 'jsonwebtoken';
import { createHmac } from 'crypto';
import { User } from '../models/user.js';
import { salt, secretKey } from '../conf/conf.js';
import { updateMiddleware } from '../middlewares/updateMiddlewares.js';

const generateAccessToken = (id, email) => {
  const payload = {
    id, 
    email
  };
  return Jwt.sign(payload, secretKey, {expiresIn: '2h'});
};

const router = Router();

router.post('/create', async (req, res) => {
  try {
    const { fullName, password, birthday, email } = req.body;
    console.log(`${fullName} - ${password}`);
    await User.create({
      fullName,
      password,
      email,
      birthday,
    });
    res.status(200).json('user has been added');
  }
  catch(e) {
    console.log(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await User.findAll({ where:{id}, raw: true });
    console.log(users);
    res.status(200).json(users);
  }
  catch(e) {
    console.log(e);
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({raw: true });
    console.log(users);
    res.status(200).json(users);
  }
  catch(e) {
    console.log(e);
  }
});

router.put('/', updateMiddleware, async (req, res) => {
  try {
    const { fullName, password, birthday, email } = req.body;
    const hashPassword = createHmac('sha256', salt).update(password).digest('hex');
    const user = await User.update( {fullName, password: hashPassword, birthday, email}, 
      {where:{email}});
    console.log(user);
    res.status(200).json(user);
  }
  catch(e) {
    console.log(e);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await User.destroy({ where:{id}});
    console.log(users);
    res.status(200).json(users);
  }
  catch(e) {
    console.log(e);
  }
});

router.post('/registration', async (req, res) => {
  try {
    const {fullName, email, password, birthday} = req.body;
    const candidate = await User.findOne({where: {email}});
    if (candidate) {
      return res.status(400).json({message: 'Пользователь с таким именем уже существует'});
    }
    const hashPassword = createHmac('sha256', salt).update(password).digest('hex');
    await User.create({
      fullName,
      password: hashPassword,
      email,
      birthday,
    });
    res.status(200).json('user has been added');
  } catch (e) {
    console.log(e);
  }
});

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({where: {email}});
    if (!user) {
      return res.status(400).json({message: 'пользователь не найден'});
    }
    const validPassword = createHmac('sha256', salt).update(password).digest('hex') === user.password;
    if (!validPassword) {
      return res.status(400).json({message: 'введен неверный пароль'});
    }
    const token = generateAccessToken(user.id, user.email);
    return res.status(200).json(token);

  } catch (e) {
    console.log(e);       
  }
});

export default router;