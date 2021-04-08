require('./envConfig');
require('../dist/utils/db.js');
require('../dist/utils/passport');
const request = require('supertest');
const app = require('../dist/server.js');
const User = require('../dist/entities/User');

let server, agent;
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
  test('should responds with 201 for correct Signup Payload', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupData);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(signupData.email);
    expect(res.body.user.password).not.toEqual(signupData.email);
    expect(res.body.user.username).toBe(signupData.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  test('should responds with 409 when signing up with an exisitng detail', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupData);
    console.log({ res: JSON.stringify(res.body) });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBeTruthy();
    done();
  });

  test('should responds with 200 when login in with correct credential', async (done) => {
    const res = await agent.post(`/auth/login`).send(loginData);
    console.log({ res: JSON.stringify(res.body) });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(signupData.email);
    expect(res.body.user.password).not.toEqual(signupData.email);
    expect(res.body.user.username).toBe(signupData.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });

  test('should responds with 200 when login in with wrong credential', async (done) => {
    const res = await agent.post(`/auth/login`).send({ ...loginData, password: 'wrongPassword' });
    console.log({ res: JSON.stringify(res.body) });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(signupData.email);
    expect(res.body.user.password).not.toEqual(signupData.email);
    expect(res.body.user.username).toBe(signupData.username.toLowerCase());
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.accessToken).toBeTruthy();
    done();
  });
});

