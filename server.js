const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const contactRouter = require('./api/contacts/contacts.router');
const userRouter = require('./api/users/users.router');

require('dotenv').config();


module.exports = class ContactsServer {
  constructor() {
    this.server = null;
  }
  async start() {
    this.initServer();
    await this.initDataBase();
    this.initMiddlewares();
    this.initRouts();
    this.initError();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: 'http://localhost:3000',
      }),
    );
    this.server.use(morgan('tiny'));
    this.server.use('/images', express.static("./public/images"));
  }

  initRouts() {
    this.server.use('', contactRouter);
    this.server.use('', userRouter)
  }

  initError() {
    this.server.use((err, req, res, next) => {
      const { message, status } = err;

      return res.status(status || 500).send(message);
    });
  }

  async initDataBase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });
      console.log('Database connection successful');
    } catch (err) {
      console.error('App starting error:', err.stack);
      process.exit(1);
    }
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {
      console.log('Server started listening on port', process.env.PORT);
    });
  }
};
