const fs = require('fs');
const { promises: fsPromises } = fs;
const path = require('path');

const contactsPath = path.join(__filename, '../db/contacts.json');

async function listContacts() {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let contacts = JSON.parse(data);
  console.table(contacts);
}

async function getContactById(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let contact = JSON.parse(data).find(contact => {
    if (contact.id === contactId) {
      return contact;
    }
  });
  console.log('contact :>> ', contact);
}

async function removeContact(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let contacts = JSON.parse(data);
  let deleteContact = contacts.splice(contactId - 1, 1)[0];
  console.log('deleteContact :>> ', deleteContact);
  const newContacts = JSON.stringify(contacts, null, 2);
  await fsPromises.writeFile(contactsPath, newContacts);
  console.table(JSON.parse(newContacts));
}

async function addContact(name, email, phone) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  let allContacts = JSON.parse(data);
  const newContact = {
    id: allContacts.length + 1,
    name: name,
    email: email,
    phone: phone,
  };

  console.log('newContact :>> ', newContact);

  allContacts.splice(allContacts.length + 1, 0, newContact);

  const jsonStringAllContacts = JSON.stringify(allContacts, null, 2);

  await fsPromises.writeFile(contactsPath, jsonStringAllContacts);
  console.table(JSON.parse(jsonStringAllContacts));
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
