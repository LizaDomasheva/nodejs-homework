const Joi = require('@hapi/joi');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const contactModel = require('./contacts.model');
const {
  Types: { ObjectId },
} = require('mongoose');
const { UnauthorizedError } = require('../helpers/errors.constructors');

class ContactController {
  constructor() {
    this._costFactor = 7;
  }

  get getContacts() {
    return this._getContacts.bind(this);
  }

  get getContactById() {
    return this._getContactById.bind(this);
  }

  get getCurrentContact() {
    return this._getCurrentContact.bind(this);
  }

  get getContactsWithQuery() {
    return this._getContactsWithQuery.bind(this);
  }

  get createContact() {
    return this._createContact.bind(this);
  }

  get updateContact() {
    return this._updateContact.bind(this);
  }

  get updateSubscription() {
    return this._updateSubscription.bind(this);
  }

  get deleteContact() {
    return this._deleteContact.bind(this);
  }

  async _getContacts(req, res, next) {
    const contacts = await contactModel.find();
    return res.status(200).json(this.prepareContactsResponse(contacts));
  }

  async _getContactsWithQuery(req, res, next) {
    if (req.query.sub) {
      const contacts = await contactModel.find({ subscription: req.query.sub });
      return res.status(200).json(this.prepareContactsResponse(contacts));
    }
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const contacts = await contactModel.paginate({}, options);
    return res.status(200).json(this.prepareContactsResponse(contacts.docs));
  }

  async _getContactById(req, res, next) {
    const contactId = req.params.contactId;

    const contact = await contactModel.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }

    const [contactForResponse] = this.prepareContactsResponse([contact]);
    return res.status(200).json(contactForResponse);
  }

  async _getCurrentContact(req, res, next) {
    const [contactForResponse] = this.prepareContactsResponse([req.contact]);
    return res.status(200).json(contactForResponse);
  }

  async _createContact(req, res, next) {
    const { email, password, subscription, token } = req.body;
    const passwordHash = await bcryptjs.hash(password, this._costFactor);
    const existingContact = await contactModel.findContactByEmail(email);
    if (existingContact) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const contact = await contactModel.create({
      email,
      subscription,
      password: passwordHash,
    });
    return res.status(201).json({
      contact: {
        email: contact.email,
        subscription: contact.subscription,
      },
    });
  }

  validateCreateContact(req, res, next) {
    const createContactRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      subscription: Joi.string(),
      token: Joi.string().allow('').allow(null),
    });

    const result = createContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).send(result.error);
    }
    next();
  }

  async authorize(req, res, next) {
    try {
      const authorizationHeader = req.get('Authorization') || '';
      const token = authorizationHeader.replace('Bearer ', '');

      let contactId;
      try {
        contactId = await jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (err) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const contact = await contactModel.findById(contactId);

      if (!contact || contact.token !== token) {
        throw new UnauthorizedError();
      }

      req.contact = contact;
      req.token = token;

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  validateId(req, res, next) {
    const { contactId } = req.params;
    if (!ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: 'Not valid id' });
    }
    next();
  }

  async _updateContact(req, res, next) {
    const contactId = req.params.contactId;
    const updateContact = await contactModel.findContactByIdAndUpdate(
      contactId,
      req.body,
    );
    if (!updateContact) {
      return res.status(404).json({ massage: 'Not found' });
    }

    const [updateContactForResponse] = this.prepareContactsResponse([
      updateContact,
    ]);
    return res.status(200).json(updateContactForResponse);
  }

  validateUpdateContact(req, res, next) {
    const updateContactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      subscription: Joi.string(),
      password: Joi.string(),
      token: Joi.string(),
    });

    const bodyLength = Object.keys(req.body).length;
    if (bodyLength === 0) {
      return res.status(400).send({
        message: 'missing fields',
      });
    }
    const result = updateContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).send({
        message: 'unvalid format of data',
      });
    }
    next();
  }

  async _updateSubscription(req, res, next) {
    const contactId = req.params.contactId;
    const updateContact = await contactModel.findContactByIdAndUpdate(
      contactId,
      req.body,
    );
    if (!updateContact) {
      return res.status(404).json({ massage: 'Not found' });
    }

    const [updateContactForResponse] = this.prepareContactsResponse([
      updateContact,
    ]);
    return res.status(200).json(updateContactForResponse);
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

  async _deleteContact(req, res, next) {
    const contactId = req.params.contactId;
    const deleteContact = await contactModel.findByIdAndDelete(contactId);

    if (!deleteContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.status(200).json({
      message: 'contact deleted',
    });
  }

  async login(req, res, next) {
    const { email, password, subscription } = req.body;

    const contact = await contactModel.findContactByEmail(email);

    if (!contact) {
      return res.status(401).send('Email or password is wrong');
    }

    const isPasswordValid = await bcryptjs.compare(password, contact.password);
    if (!isPasswordValid) {
      return res.status(401).send('Email or password is wrong');
    }

    const token = await jwt.sign({ id: contact._id }, process.env.JWT_SECRET, {
      expiresIn: 2 * 24 * 60 * 60,
    });
    await contactModel.updateToken(contact._id, token);

    return res.status(200).json({
      token,
      contact: {
        email: contact.email,
        subscription: contact.subscription,
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
    const contact = req.contact;
    await contactModel.updateToken(contact._id, null);
    return res.status(204).send('No Content');
  }

  prepareContactsResponse(contacts) {
    return contacts.map(contact => {
      const { _id, name, email, phone, subscription } = contact;
      return { id: _id, name, email, phone, subscription };
    });
  }
}

module.exports = new ContactController();
