const { Router } = require('express');
const ContactController = require('./contacts.controller');
const { createControllerProxy } = require('../helpers/controllers.proxy');
const contactRouter = Router();

const contactControllerProxy = createControllerProxy(ContactController);

contactRouter.get('/api/contacts', contactControllerProxy.getContacts);

contactRouter.get('/contacts', contactControllerProxy.getContactsWithQuery);

contactRouter.get(
  '/api/contacts/:contactId',
  contactControllerProxy.validateId,
  contactControllerProxy.getContactById,
);

contactRouter.post(
  '/api/contacts',
  contactControllerProxy.validateCreateContact,
  contactControllerProxy.createContact,
);

contactRouter.patch(
  '/api/contacts/:contactId',
  contactControllerProxy.validateId,
  contactControllerProxy.validateUpdateContact,
  contactControllerProxy.updateContact,
);

contactRouter.delete(
  '/api/contacts/:contactId',
  contactControllerProxy.validateId,
  contactControllerProxy.deleteContact,
);

module.exports = contactRouter;
