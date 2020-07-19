const jwt = require('jsonwebtoken');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const { promises: fsPromises } = require('fs');
const path = require('path');
const User = require('./users.model');
const { UnauthorizedError } = require('../helpers/errors.constructors');

exports.authorize = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const user = await User.findById(payload.id);
  if (!user || user.token !== token) {
    throw new UnauthorizedError();
  }
  req.user = user;
  req.token = token;
  next();
};

exports.avatarMin = async (req, res, next) => {
  const { path: filePath, destination: multerDest, filename } = req.file;
  const DESTINATION_PATH = './public/images';

  const avatar = await imagemin([`${multerDest}/${filename}`], {
    destination: './public/images',
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });

  await fsPromises.unlink(filePath);

  req.file.destination = DESTINATION_PATH;
  req.file.path = path.join(DESTINATION_PATH, filename);

  next();
};
