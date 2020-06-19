const importContacts = require('./contacts.js');
const argv = require('yargs').argv;

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      importContacts.listContacts();
      break;

    case 'get':
      importContacts.getContactById(id);
      break;

    case 'add':
      importContacts.addContact(name, email, phone);
      break;

    case 'remove':
      importContacts.removeContact(id);
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
