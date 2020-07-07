const { Router } = require('express');
const ContactController = require('./contacts.controller');
const { createControllerProxy } = require('../helpers/controllers.proxy');
const contactRouter = Router();

const contactControllerProxy = createControllerProxy(ContactController)

contactRouter.get('/', contactControllerProxy.getContacts);

contactRouter.get('/:contactId', contactControllerProxy.validateId, contactControllerProxy.getContactById);

contactRouter.post(
  '/',
  contactControllerProxy.validateCreateContact,
  contactControllerProxy.createContact,
);

contactRouter.patch(
  '/:contactId',
  contactControllerProxy.validateId,
  contactControllerProxy.validateUpdateContact,
  contactControllerProxy.updateContact,
);

contactRouter.delete('/:contactId', contactControllerProxy.validateId, contactControllerProxy.deleteContact);

module.exports = contactRouter;