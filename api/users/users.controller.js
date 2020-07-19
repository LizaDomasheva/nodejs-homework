const Joi = require('@hapi/joi');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const { promises: fsPromises } = require('fs');
const jwt = require('jsonwebtoken');
const Avatar = require('avatar-builder');
const User = require('./users.model');
const {
  Types: { ObjectId },
} = require('mongoose');


class UserController {
  constructor() {
    this._costFactor = 7;
  }

  get getCurrentUser() {
    return this._getCurrentUser.bind(this);
  }

  get createUser() {
    return this._createUser.bind(this);
  }

  get updateSubscription() {
    return this._updateSubscription.bind(this);
  }

  get updateAvatar() {
    return this._updateAvatar.bind(this);
  }

  async _getCurrentUser(req, res, next) {
    const [userForResponse] = this.prepareUserResponse([req.user]);
    return res.status(200).json(userForResponse);
  }

  async _createUser(req, res, next) {
    const { email, password, subscription } = req.body;
    const passwordHash = await bcryptjs.hash(password, this._costFactor);
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const avatar = Avatar.builder(
      Avatar.Image.margin(Avatar.Image.circleMask(Avatar.Image.identicon())),
      128,
      128,
      { cache: Avatar.Cache.lru() },
    );

    // *from tmp to public
    // const avatarBasePath = `${process.env.STATIC_BASE_PATH}/${Date.now()}.png`
    // const avatarBaseUrl = `${process.env.STATIC_BASE_URL}/${Date.now()}.png`;
    // const newAvatar = avatar.create('gabriel').then(buffer => {
    //     fs.writeFileSync(`./${avatarBasePath}`, buffer);
    //     fs.rename(`./${avatarBasePath}`, `./public/${avatarBaseUrl}`, (err) => {
    //         if (err) throw err;
    //         console.log('Rename complete!');
    //       });
    //   });
    // const avatarURL = `${process.env.SERVER_BASE_URL}/${avatarBaseUrl}`;

    // *without tmp to public

    const avatarPath = `${process.env.STATIC_BASE_URL}/${Date.now()}.png`;
    const newAvatar = avatar.create('gabriel').then(buffer => {
      fs.writeFileSync(`./public/${avatarPath}`, buffer);
    });
    const avatarURL = `${process.env.SERVER_BASE_URL}/${avatarPath}`;

    const user = await User.create({
      email,
      subscription,
      password: passwordHash,
      avatarURL: avatarURL,
    });

    return res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  }

  validateCreateUser(req, res, next) {
    const createUserRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      avatar: Joi.string(),
      subscription: Joi.string(),
      token: Joi.string().allow('').allow(null),
    });

    const result = createUserRules.validate(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    next();
  }

  validateId(req, res, next) {
    const { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Not valid id' });
    }
    next();
  }

  async _updateAvatar(req, res, next) {
    const authorizationHeader = req.get('Authorization') || '';
    const token = authorizationHeader.replace('Bearer ', '');

    const user = await User.findUserByToken(token);
    const randomAvatarName = user.avatarURL.slice(29);
    const randomAvatarPath = `public\\${process.env.STATIC_BASE_URL}\\${randomAvatarName}`;
    
    await fsPromises.unlink(randomAvatarPath);
    const avatarURL = `${process.env.SERVER_BASE_URL}/${process.env.STATIC_BASE_URL}/${req.file.filename}`;
    const updateUser = await User.findUserByIdAndUpdate(user._id, {
      avatarURL: avatarURL,
    });

    if (!updateUser) {
      return res.status(404).json({ massage: 'Not found' });
    }

    return res.status(200).json({ avatarURL });
  }

  async _updateSubscription(req, res, next) {
    const userId = req.params.userId;
    const updateUser = await User.findUserByIdAndUpdate(userId, req.body);

    if (!updateUser) {
      return res.status(404).json({ massage: 'Not found' });
    }

    const [updateUserForResponse] = this.prepareUserResponse([updateUser]);
    return res.status(200).json(updateUserForResponse);
  }

  validateUpdateSubscription(req, res, next) {
    const values = ['free', 'pro', 'premium'];
    const updateSubRules = Joi.object({
      subscription: Joi.string().valid(...values),
    });

    const result = updateSubRules.validate(req.body);
    if (result.error) {
      return res.status(400).send({
        message: 'not valid value',
      });
    }
    next();
  }

  async login(req, res, next) {
    const { email, password, subscription } = req.body;

    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(401).send('Email or password is wrong');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Email or password is wrong');
    }

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 2 * 24 * 60 * 60,
    });
    await User.updateToken(user._id, token);

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  }

  validateLogin(req, res, next) {
    const loginRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const result = loginRules.validate(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    next();
  }

  async logout(req, res, next) {
    const user = req.user;
    await User.updateToken(user._id, null);
    return res.status(204).send('No Content');
  }

  prepareUserResponse(users) {
    return users.map(user => {
      const { _id, email, subscription, avatarURL } = user;
      return { id: _id, email, subscription, avatarURL };
    });
  }
}

module.exports = new UserController();
