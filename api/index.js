const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const contactRouter = require("./contacts/contacts.router")
require('dotenv').config()

module.exports = class ContactsServer {
  constructor() {
    this.server = null;
  }
  start() {
    this.initServer();
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
    this.server.use(cors({ origin: 'http://localhost:3000' }));
    this.server.use(morgan('tiny'))
  }

  initRouts() {
      this.server.use("/api/contacts", contactRouter)
  }

  initError() {
    this.server.use((err, req, res, next) => {
      const { message, status } = err;
    
      return res.status(status || 500).send(message);
    });
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {
      console.log('Server started listening on port', process.env.PORT);
    });
  }
}
