require('../dist/utils/db.js');

const path = require('path');
const dotenv = require('dotenv');
const request = require('supertest');
const app = require('../dist/server.js');

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

console.log({ process: process.env });

app.listen(process.env.PORT, () =>
  console.log(`app is now running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
);

let server;
let agent;

beforeEach((done) => {
  server = app.listen(4000, () => {
    agent = request.agent(server)
    done()
  })
})

afterEach((done) => {
  server.close(done)
})

afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe('App Request', () => {
  test('should responds with 404', async (done) => {
    const result = await request(app).get('https://localhost:3001/auth/login');
    expect(result.status).toBe(404);
    done();
  });
});