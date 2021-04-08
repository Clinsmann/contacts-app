require('./testEnvConfig');
require('../dist/utils/db.js');
require('../dist/utils/passport');
const request = require('supertest');
const app = require('../dist/server.js');
const User = require('../dist/entities/User');

let server, agent, header;
const loginData = { email: "johndoe@gmail.com", password: "Password123" };
const signupData = { ...loginData, name: "John Doe Ibeanu", username: "JonnyDrill" };

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
  await User.deleteOne({ username: signupData.username });
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe('Authentication', () => {
  test('Should signup successfully, status code of 201', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupData);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(signupData.email);
    expect(res.body.user.password).not.toEqual(signupData.email);
    expect(res.body.user.username).toBe(signupData.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  test('Should not signup, status code 409', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupData);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('Should login successfully, status code 200', async (done) => {
    const res = await agent.post(`/auth/login`).send(loginData);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(signupData.email);
    expect(res.body.user.password).not.toEqual(signupData.email);
    expect(res.body.user.username).toBe(signupData.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  test('should not login, status code 401', async (done) => {
    const res = await agent.post(`/auth/login`).send({ ...loginData, password: 'wrongPassword' });
    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
    done();
  });
});


describe('User Contacts', () => {
  test('Should get all contact for logged in user', async (done) => {
    const { body } = await agent.post(`/auth/login`).send(loginData);
    header = { 'Authorization': 'Bearer ' + body.accessToken };

    const res = await agent.set(header).get(`/contact/all`);
    expect(res.status).toBe(200);
    expect(res.body.contacts).toBeTruthy();
    expect(res.body.contacts.length).toBe(1);
    done();
  });
});
