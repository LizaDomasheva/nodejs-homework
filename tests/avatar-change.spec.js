// !До конца не разобралась:(
// const ContactsServer = require('../server');
// const request = require('supertest');
// const { assert, expect } = require('chai');

// describe('Change avatar test suite', () => {
//   let server;

//   before(async () => {
//     const contactsServer = new ContactsServer();
//     await contactsServer.start();
//     server = contactsServer.app;
//   });

//   after(() => {
//     server.close();
//   });

//   describe('PATCH /users/avatars', () => {
//     context('when token is invalid', () => {
//       let response;

//       before(async () => {
//         response = await request(server)
//           .patch('/users/avatars')
//           .set({ headers: { authorization: '' } })
//           .send({ avatar: 'smth' });
//       });

//       it('should throw 401 error', () => {
//         assert.equal(response.status, 401);
//       });
//     });

//     context('when everything is ok', () => {
//       let response;
//       let reqBody = {
//         avatar: 'gxjcyhmhyc.jpg',
//       };

//       before(async () => {
//         response = await request(server)
//           .patch('/users/avatars')
//           .set('Authorization', 'Bearer my jwt token here')
//           .set('Content-Type', 'multipart/form-data')
//           .send({ avatar: 'smth' });
//       });

//       after(async () => {
//         await User.deleteOne({ email: reqBody.email });
//       });

//       it('should return response with 200', () => {
//         assert.equal(response.status, 200);
//       });

//       it('should create avatarURL', async () => {
//         const userFromDB = await User.findOne({ email: reqBody.email });
//         assert.exists(userFromDB);
//       });

//       it('should add avatarURL to user in DB', () => {
//         expect(response.body).to.include({
//           avatarURL: reqBody.avatar
//         });
//       });
//     });
//   });
// });
