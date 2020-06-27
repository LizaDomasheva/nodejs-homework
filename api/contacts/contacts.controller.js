const Joi = require('@hapi/joi');
const importContacts = require('./contacts');
const uuid = require('uuid');
const allContacts = require('../../db/contacts.json');

class ContactController {
  get getContactById() {
    return this._getContactById.bind(this);
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

  async getContacts(req, res, next) {
    try {
      const contacts = await importContacts.listContacts();
      return res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async _getContactById(req, res, next) {
    try {
      const targetContactIndex = this.findContactIndexById(
        res,
        req.params.contactId,
      );
      const contact = await importContacts.getContactById(targetContactIndex);
      return res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async _createContact(req, res, next) {
    try {
      let id = [];
      id = allContacts.map(contact => contact.id);
      const max = Math.max.apply(null, id);
      const newContact = {
        ...req.body,
        id: max + 1,
      };
      await importContacts.addContact(newContact);
      return res.status(201).send(newContact);
    } catch (err) {
      next(err);
    }
  }

  validateCreateContact(req, res, next) {
    const createContactRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });

    const result = createContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).json({ message: 'Missing required name field' });
    }
    next();
  }

  async _updateContact(req, res, next) {
    try {
      const targetContactIndex = this.findContactIndexById(
        res,
        req.params.contactId,
      );
      const contact = await importContacts.getContactById(targetContactIndex);
      const updateContact = {
        ...contact,
        ...req.body,
      };
      await importContacts.updateContact(updateContact);
      return res.status(200).send(updateContact);
    } catch (err) {
      next(err);
    }
  }

  validateUpdateContact(req, res, next) {
    const updateContactRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });

    const bodyLength = Object.keys(req.body).length;
    if (bodyLength === 0) {
      return res.status(400).send({ message: 'missing fields' });
    }
    const result = updateContactRules.validate(req.body);
    if (result.error) {
      return res.status(400).send({ message: 'unvalid format of data' });
    }
    next();
  }

  async _deleteContact(req, res, next) {
    try {
      const targetContactIndex = this.findContactIndexById(
        res,
        req.params.contactId,
      );
      await importContacts.removeContact(targetContactIndex);
      return res.status(200).json({ message: 'contact deleted' });
    } catch (err) {
      next(err);
    }
  }

  findContactIndexById(res, contactId) {
    const id = parseInt(contactId);
    const targetContactIndex = allContacts.findIndex(
      contact => contact.id === id,
    );
    if (targetContactIndex === -1) {
      return res.status(404).json({ message: 'Not found' });
    }
    return targetContactIndex + 1;
  }
}

module.exports = new ContactController();
