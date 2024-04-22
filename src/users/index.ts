import express from 'express';
import userController from './controllers/user';

const userRouter = express.Router();

userRouter.post('/signup', userController.createUser);
userRouter.get('/search', userController.searchUserByPhone);

export default userRouter;
