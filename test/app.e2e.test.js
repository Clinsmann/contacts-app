require('./env.config');
require('../dist/utils/db.js');
require('../dist/utils/passport');
const request = require('supertest');
const app = require('../dist/server.js');
const User = require('../dist/entities/user');
const Contact = require('../dist/entities/contact');
const { StatusCodes } = require('http-status-codes');

let server, agent, header, contactId, userId;
const contactPayload = { name: "First Contact", phone: "08090123121" };
const loginPayload = { email: "johndoe@gmail.com", password: "Password123" };
const signupPayload = { ...loginPayload, name: "John Doe Ibeanu", username: "JonnyDrill" };

beforeEach((done) => {
  server = app.listen(process.env.PORT, () => {
    agent = request.agent(server)
    done()
  })
})

afterEach((done) => { server.close(done) });

afterAll(async () => {
  await Contact.deleteOne({ phone: contactPayload.phone });
  await User.deleteOne({ username: signupPayload.username });
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe('Authentication', () => {
  /* Positive tests */
  test('Should signup successfully, status code of 201', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupPayload);
    expect(res.body.user.username).toBe(signupPayload.username.toLowerCase());
    expect(res.body.user.password).not.toEqual(signupPayload.email);
    expect(res.body.user.email).toBe(signupPayload.email);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  test('Should login successfully, status code 200', async (done) => {
    const res = await agent.post(`/auth/login`).send(loginPayload);
    expect(res.body.user.username).toBe(signupPayload.username.toLowerCase());
    expect(res.body.user.password).not.toEqual(signupPayload.email);
    expect(res.body.user.email).toBe(signupPayload.email);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    expect(res.status).toBe(StatusCodes.OK);
    done();
  });

  /* Negative tests */
  test('Should NOT signup, status code 409', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupPayload);
    expect(res.status).toBe(StatusCodes.CONFLICT);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('should NOT login, status code 401', async (done) => {
    const res = await agent.post(`/auth/login`).send({ ...loginPayload, password: 'wrongPassword' });
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(res.text).toBe('Unauthorized');
    done();
  });
});

describe('User Contacts', () => {
  /* Positive tests */
  test('Should create contact for a user', async (done) => {
    const { body } = await agent.post(`/auth/login`).send(loginPayload);
    header = { 'Authorization': 'Bearer ' + body.accessToken };

    const res = await agent.set(header).post(`/contact`).send(contactPayload);
    contactId = res.body.contact._id;
    userId = body.user._id;

    expect(res.body.contact.name).toBe(contactPayload.name.toLowerCase());
    expect(res.body.contact.phone).toBe(contactPayload.phone);
    expect(res.body.contact.createdBy).toBe(userId);
    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body.contact).toBeTruthy();
    done();
  });

  test('Should get all contact for logged in user', async (done) => {
    const { body: { contacts }, status } = await agent.set(header).get(`/contact/all`);
    expect(contacts[0].name).toBe(contactPayload.name.toLowerCase());
    expect(contacts[0].phone).toBe(contactPayload.phone);
    expect(contacts[0].createdBy).toBe(userId);
    expect(contacts[0]._id).toBe(contactId);
    expect(status).toBe(StatusCodes.OK);
    expect(contacts.length).toBe(1);
    expect(contacts).toBeTruthy();
    done();
  });

  test('Should get single contact', async (done) => {
    const { body: { contact }, status } = await agent.set(header).get(`/contact/${contactId}`);
    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    expect(contact.phone).toBe(contactPayload.phone);
    expect(contact.createdBy).toBe(userId);
    expect(contact._id).toBe(contactId);
    expect(status).toBe(StatusCodes.OK);
    expect(contact).toBeTruthy();
    done();
  });

  test('Should update contact for a user and add address', async (done) => {
    const { status } = await agent.set(header).put(`/contact/${contactId}`)
      .send({ ...contactPayload, address: "127.0.0.1" });
    const { body: { contact } } = await agent.set(header).get(`/contact/${contactId}`);
    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    expect(contact.phone).toBe(contactPayload.phone);
    expect(status).toBe(StatusCodes.NO_CONTENT);
    expect(contact.createdBy).toBe(userId);
    expect(contact._id).toBe(contactId);
    expect(contact).toBeTruthy();
    done();
  });

  /* Negative tests */
  test('Should return error for duplicate record', async (done) => {
    const res = await agent.set(header).post(`/contact`).send(contactPayload);
    expect(res.status).toBe(StatusCodes.CONFLICT);
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('Should return error when required field are not provided', async (done) => {
    const res = await agent.set(header).post(`/contact`).send({});
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    expect(res.body.error).toBeTruthy();
    done();
  });

  /* fix */
  test('Should return error when trying to edit a contact that doesnt exist', async (done) => {
    const res = await agent.set(header).post(`/contact`).send({});
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('Should return error when trying to get a contact that doesnt exist', async (done) => {
    const { body: { error }, status } = await agent.set(header).get(`/contact/${contactId}2`);
    expect(status).toBe(StatusCodes.NOT_FOUND);
    expect(error).toBeTruthy();
    // expect(contact._id).toBe(contactId);
    // expect(contact.createdBy).toBe(userId);
    // expect(contact.phone).toBe(contactPayload.phone);
    // expect(contact.name).toBe(contactPayload.name.toLowerCase());
    done();
  });

  test.skip('Should update contact for a user and add address', async (done) => {
    const { body, status } = await agent.set(header).put(`/contact/${contactId}`)
      .send({ ...contactPayload, address: "127.0.0.1" });
    const { body: { contact } } = await agent.set(header).get(`/contact/${contactId}`);
    expect(status).toBe(204);
    expect(contact).toBeTruthy();
    expect(contact._id).toBe(contactId);
    expect(contact.createdBy).toBe(userId);
    expect(contact.phone).toBe(contactPayload.phone);
    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    done();
  });

  test.skip('Should delete contact for a user', async (done) => {
    const { body: { contact }, status } = await agent.set(header).delete(`/contact/${contactId}`);
    expect(status).toBe(200);
    expect(contact).toBeTruthy();
    expect(contact._id).toBe(contactId);
    expect(contact.createdBy).toBe(userId);
    expect(contact.phone).toBe(contactPayload.phone);
    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    done();
  });


  /* delete */
  test('Should delete contact for a user', async (done) => {
    const { body: { contact }, status } = await agent.set(header).delete(`/contact/${contactId}`);
    expect(status).toBe(200);
    expect(contact).toBeTruthy();
    expect(contact._id).toBe(contactId);
    expect(contact.createdBy).toBe(userId);
    expect(contact.phone).toBe(contactPayload.phone);
    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    done();
  });
});
