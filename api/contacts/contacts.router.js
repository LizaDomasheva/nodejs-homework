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

contactRouter.get(
  '/users/current',
  contactControllerProxy.authorize,
  contactControllerProxy.getCurrentContact,
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

contactRouter.patch(
  '/users/:contactId',
  contactControllerProxy.validateId,
  contactControllerProxy.validateUpdateSubscription,
  contactControllerProxy.updateSubscription,
);

contactRouter.delete(
  '/api/contacts/:contactId',
  contactControllerProxy.validateId,
  contactControllerProxy.deleteContact,
);

contactRouter.post(
  '/auth/login',
  contactControllerProxy.validateLogin,
  contactControllerProxy.login,
);

contactRouter.post(
  '/auth/register',
  contactControllerProxy.validateCreateContact,
  contactControllerProxy.createContact,
);

contactRouter.post(
  '/auth/logout',
  contactControllerProxy.authorize,
  contactControllerProxy.logout,
);

module.exports = contactRouter;
