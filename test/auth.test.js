require('./envConfig');
require('../dist/utils/db.js');
require('../dist/utils/passport');
const request = require('supertest');
const app = require('../dist/server.js');
const User = require('../dist/entities/User');

let server, agent;
const signupData = {
  email: "ibeanuhillaryNewBro@gmail.com",
  password: "ibeanuhillaryNewBro",
  name: "Francis Ibeanu",
  username: "ibeanuhillaryNewBro"
};

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
  // await User.deleteOne({ username: signupData.username });
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe('App Request', () => {
  test('should responds with 201', async (done) => {
    const res = await agent.post(`/auth/signup`).send(signupData);
    console.log({ res: JSON.stringify(res.body) });
    expect(res.status).toBe(201);
    done();
  });
});