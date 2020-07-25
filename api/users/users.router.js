const { Router } = require('express');
const UserController = require('./users.controller');
const { createControllerProxy } = require('../helpers/controllers.proxy');
const userRouter = Router();
const multer = require('multer');
const path = require('path');
const { authorize, avatarMin } = require('./users.middleware');

const storage = multer.diskStorage({
  destination: './tmp',
  filename: (req, file, cb) => {
    const { ext } = path.parse(file.originalname);
    return cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

const userControllerProxy = createControllerProxy(UserController);

userRouter.get('/users/current', authorize, userControllerProxy.getCurrentUser);
userRouter.get('/auth/verify/:verificationToken', userControllerProxy.verifyUser);


userRouter.patch(
  '/users/avatars',
  authorize,
  upload.single('avatar'),
  avatarMin,
  userControllerProxy.updateAvatar,
);

userRouter.patch(
  '/users/:userId',
  userControllerProxy.validateId,
  userControllerProxy.validateUpdateSubscription,
  userControllerProxy.updateSubscription,
);

userRouter.post(
  '/auth/login',
  userControllerProxy.validateLogin,
  userControllerProxy.login,
);

userRouter.post(
  '/auth/register',
  upload.single('avatar'),
  userControllerProxy.validateCreateUser,
  userControllerProxy.createUser,
);

userRouter.post(
  '/auth/logout',
  userControllerProxy.authorize,
  userControllerProxy.logout,
);

module.exports = userRouter;
