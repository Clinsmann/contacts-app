require('./env.config.js');
require('../dist/utils/db.js');
require('../dist/utils/passport');
const request = require('supertest');
const app = require('../dist/server.js');
const User = require('../dist/entities/user');
const Contact = require('../dist/entities/contact');
const { StatusCodes } = require('http-status-codes');

let server, agent, header, contactId, userId, wrongContactID;
const contactPayload = { name: "First Contact", phone: "08090123121" };
const contactPayload2 = { name: "Second Contact", phone: "08090123121" };
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
    const { body: { accessToken, user }, status } = await agent.post(`/auth/signup`).send(signupPayload);
    expect(user.username).toBe(signupPayload.username.toLowerCase());
    expect(user.password).not.toEqual(signupPayload.email);
    expect(user.email).toBe(signupPayload.email);
    expect(status).toBe(StatusCodes.CREATED);
    expect(accessToken).toBeTruthy();
    done();
  });

  test('Should login successfully, status code 200', async (done) => {
    const { body: { accessToken, user }, status } = await agent.post(`/auth/login`).send(loginPayload);
    expect(user.username).toBe(signupPayload.username.toLowerCase());
    expect(user.password).not.toEqual(signupPayload.email);
    expect(user.email).toBe(signupPayload.email);
    expect(status).toBe(StatusCodes.OK);
    expect(accessToken).toBeTruthy();
    done();
  });

  /* Negative tests */
  test('Should NOT signup, status code 409', async (done) => {
    const { status, body } = await agent.post(`/auth/signup`).send(signupPayload);
    expect(status).toBe(StatusCodes.CONFLICT);
    expect(body).toHaveProperty('error');
    expect(body.error).toBeTruthy();
    done();
  });

  test('should NOT login, status code 401', async (done) => {
    const res = await agent.post(`/auth/login`).send({ ...loginPayload, password: '---' });
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(res.text).toBe('Unauthorized');
    done();
  });
});

describe('User Contacts', () => {
  /* Positive tests */
  test('Should create contact for a user', async (done) => {
    const res = await agent.post(`/auth/login`).send(loginPayload);
    header = { 'Authorization': 'Bearer ' + res.body.accessToken };

    const { body: { contact }, status } = await agent.set(header).post(`/contact`).send(contactPayload);
    wrongContactID = `4${contact._id.substring(1)}`;
    userId = res.body.user._id;
    contactId = contact._id;

    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    expect(contact.phone).toBe(contactPayload.phone);
    expect(status).toBe(StatusCodes.CREATED);
    expect(contact.createdBy).toBe(userId);
    expect(contact).toBeTruthy();
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

  test('Should return error when trying to edit a contact that doesnt exist', async (done) => {
    const res = await agent.set(header).put(`/contact/${wrongContactID}`).send(contactPayload2);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('Should return error when trying to get a contact that doesnt exist', async (done) => {
    const { body: { error }, status } = await agent.set(header).get(`/contact/${wrongContactID}`);
    expect(status).toBe(StatusCodes.NOT_FOUND);
    expect(error).toBeTruthy();
    done();
  });


  test('Should return error when trying to delete a contact that doesnt exist', async (done) => {
    const { body: { error }, status } = await agent.set(header).delete(`/contact/${wrongContactID}`);
    expect(status).toBe(StatusCodes.NOT_FOUND);
    expect(error).toBeTruthy();
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
