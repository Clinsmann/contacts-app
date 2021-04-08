require('./testEnvConfig');
require('../dist/utils/db.js');
require('../dist/utils/passport');
const request = require('supertest');
const app = require('../dist/server.js');
const User = require('../dist/entities/user');
const Contact = require('../dist/entities/contact');

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

afterEach((done) => {
  server.close(done)
});

afterAll(async () => {
  await Contact.deleteOne({ phone: contactPayload.phone });
  await User.deleteOne({ username: signupPayload.username });
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe('Authentication', () => {
  /* Positive tests */
  test('Should signup successfully, status code of 201', async (done) => {
    const res = await agent
      .post(`/auth/signup`)
      .send(signupPayload);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(signupPayload.email);
    expect(res.body.user.password).not.toEqual(signupPayload.email);
    expect(res.body.user.username).toBe(signupPayload.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  test('Should login successfully, status code 200', async (done) => {
    const res = await agent
      .post(`/auth/login`)
      .send(loginPayload);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(signupPayload.email);
    expect(res.body.user.password).not.toEqual(signupPayload.email);
    expect(res.body.user.username).toBe(signupPayload.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  /* Negative tests */
  test('Should NOT signup, status code 409', async (done) => {
    const res = await agent
      .post(`/auth/signup`)
      .send(signupPayload);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('should NOT login, status code 401', async (done) => {
    const res = await agent
      .post(`/auth/login`)
      .send({ ...loginPayload, password: 'wrongPassword' });

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
    done();
  });
});

describe('User Contacts', () => {
  /* Positive tests */
  test('Should create contact for a user', async (done) => {
    const { body } = await agent
      .post(`/auth/login`)
      .send(loginPayload);

    header = { 'Authorization': 'Bearer ' + body.accessToken };

    const res = await agent
      .set(header)
      .post(`/contact`)
      .send(contactPayload);

    contactId = res.body.contact._id;
    userId = body.user._id;

    expect(res.status).toBe(201);
    expect(res.body.contact).toBeTruthy();
    expect(res.body.contact.createdBy).toBe(userId);
    expect(res.body.contact.phone).toBe(contactPayload.phone);
    expect(res.body.contact.name).toBe(contactPayload.name.toLowerCase());
    done();
  });

  test('Should get all contact for logged in user', async (done) => {
    const { body: { contacts }, status } = await agent
      .set(header)
      .get(`/contact/all`);

    expect(status).toBe(200);
    expect(contacts).toBeTruthy();
    expect(contacts.length).toBe(1);
    expect(contacts[0]._id).toBe(contactId);
    expect(contacts[0].createdBy).toBe(userId);
    expect(contacts[0].phone).toBe(contactPayload.phone);
    expect(contacts[0].name).toBe(contactPayload.name.toLowerCase());
    done();
  });

  test('Should get single contact', async (done) => {
    const { body: { contact }, status } = await agent
      .set(header)
      .get(`/contact/${contactId}`);

    expect(status).toBe(200);
    expect(contact).toBeTruthy();
    expect(contact._id).toBe(contactId);
    expect(contact.createdBy).toBe(userId);
    expect(contact.phone).toBe(contactPayload.phone);
    expect(contact.name).toBe(contactPayload.name.toLowerCase());
    done();
  });

  test('Should update contact for a user and add address', async (done) => {

    // console.log({ contactId });

    const { body, status } = await agent
      .set(header)
      .put(`/contact/${contactId}`)
      .send({ ...contactPayload, address: "127.0.0.1" });

    /*   const { body: { contact } } = await agent
        .set(header)
        .get(`/contact/${contactId}`); */

    // console.log({ body });

    expect(status).toBe(204);
    /* expect(contact).toBeTruthy();
    expect(contact._id).toBe(contactId);
    expect(contact.createdBy).toBe(userId);
    expect(contact.phone).toBe(contactPayload.phone);
    expect(contact.name).toBe(contactPayload.name.toLowerCase()); */
    done();
  });

});
