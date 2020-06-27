const fs = require('fs');
const { promises: fsPromises } = fs;
const path = require('path');

const contactsPath = path.join(__dirname, '../../db/contacts.json');

async function listContacts() {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let contacts = JSON.parse(data);
  console.table(contacts);
  return contacts;
}

async function getContactById(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let contact = JSON.parse(data).find(contact => {
    if (contact.id === contactId) {
      return contact;
    }
  });
  return contact;
}

async function removeContact(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let contacts = JSON.parse(data);
  contacts.splice(contactId - 1, 1)[0];
  const newContacts = JSON.stringify(contacts, null, 2);
  await fsPromises.writeFile(contactsPath, newContacts);
  return newContacts;
}

async function addContact({ id, name, email, phone }) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let allContacts = JSON.parse(data);
  const newContact = {
    id: id,
    name: name,
    email: email,
    phone: phone,
  };

  allContacts.splice(allContacts.length + 1, 0, newContact);

  const jsonStringAllContacts = JSON.stringify(allContacts, null, 2);

  await fsPromises.writeFile(contactsPath, jsonStringAllContacts);
  return jsonStringAllContacts;
}

async function updateContact({ id, name, email, phone }) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let allContacts = JSON.parse(data);
  let contact = allContacts.find(contact => {
    if (contact.id === id) {
      return contact;
    }
  });
  contact = {
    ...contact,
    name: name,
    email: email,
    phone: phone,
  };
  allContacts.splice(id - 1, 1, contact);

  const jsonStringAllContacts = JSON.stringify(allContacts, null, 2);

  await fsPromises.writeFile(contactsPath, jsonStringAllContacts);
  return jsonStringAllContacts;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
