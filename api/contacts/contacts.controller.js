const Joi = require('@hapi/joi');
const contactModel = require('./contacts.model');
const {
  Types: { ObjectId },
} = require('mongoose');

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
    const contact = await contactModel.create(req.body);
    return res.status(201).json(contact);
  }

  validateCreateContact(req, res, next) {
    const createContactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      subscription: Joi.string().required(),
      password: Joi.string().required(),
      token: Joi.string().allow('').allow(null),
    });

    const result = createContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: 'Missing required name field',
      });
    }
    next();
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

  prepareContactsResponse(contacts) {
    return contacts.map(contact => {
      const { _id, name, email, phone, subscription } = contact;
      return { id: _id, name, email, phone, subscription };
    });
  }
}

module.exports = new ContactController();
