const { Router } = require('express');
const ContactController = require('./contacts.controller');
const contactRouter = Router();

contactRouter.get('/', ContactController.getContacts);

contactRouter.get('/:contactId', ContactController.getContactById);

contactRouter.post(
  '/',
  ContactController.validateCreateContact,
  ContactController.createContact,
);

contactRouter.patch(
  '/:contactId',
  ContactController.validateUpdateContact,
  ContactController.updateContact,
);

contactRouter.delete('/:contactId', ContactController.deleteContact);

module.exports = contactRouter;
