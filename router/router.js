import Router from 'express';
import { isAuthMiddleware } from '../middlewares/isAuthMiddleware.js';
import userController from '../controllers/userController.js';

const router = Router();

router.post('/create', userController.create);

router.get('/:id', userController.getOneUser);

router.get('/', userController.getAllUsers);

router.put('/', isAuthMiddleware, userController.updateUser);

router.delete('/:id', isAuthMiddleware, userController.deleteUser);

router.post('/registration', userController.registration);

router.post('/login', userController.authorization);

export default router;