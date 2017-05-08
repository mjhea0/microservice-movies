process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../../src/app');
const knex = require('../../src/db/connection');

describe('routes : users', () => {

  beforeEach(() => {
    return knex.migrate.rollback()
    .then(() => { return knex.migrate.latest(); })
    .then(() => { return knex.seed.run(); });
  });

  afterEach(() => {
    return knex.migrate.rollback();
  });

  describe('POST /users/register', () => {
    it('should register a new user', (done) => {
      chai.request(server)
      .post('/users/register')
      .send({
        username: 'john',
        password: 'doe'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql('application/json');
        res.body.should.include.keys('status', 'token');
        res.body.status.should.eql('success');
        done();
      });
    });
  });

  describe('POST /users/login', () => {
    it('should login a user', (done) => {
      chai.request(server)
      .post('/users/login')
      .send({
        username: 'michael',
        password: 'herman'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql('application/json');
        res.body.should.include.keys('status', 'token');
        res.body.status.should.eql('success');
        should.exist(res.body.token);
        done();
      });
    });
    it('should not login an unregistered user', (done) => {
      chai.request(server)
      .post('/users/login')
      .send({
        username: 'not',
        password: 'valid'
      })
      .end((err, res) => {
        should.exist(err);
        res.status.should.eql(500);
        res.type.should.eql('application/json');
        res.body.status.should.eql('error');
        done();
      });
    });
    it('should not login a valid user with incorrect password', (done) => {
      chai.request(server)
      .post('/users/login')
      .send({
        username: 'michael',
        password: 'incorrect'
      })
      .end((err, res) => {
        should.exist(err);
        res.status.should.eql(500);
        res.type.should.eql('application/json');
        res.body.status.should.eql('error');
        done();
      });
    });
  });

  describe('GET /users/user', () => {
    it('should return a success', (done) => {
      chai.request(server)
      .post('/users/login')
      .send({
        username: 'michael',
        password: 'herman'
      })
      .end((error, response) => {
        should.not.exist(error);
        chai.request(server)
        .get('/users/user')
        .set('authorization', 'Bearer ' + response.body.token)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.eql(200);
          res.type.should.eql('application/json');
          res.body.should.include.keys('status', 'user');
          res.body.status.should.eql('success');
          should.exist(res.body.user);
          done();
        });
      });
    });
    it('should throw an error if a user is not logged in', (done) => {
      chai.request(server)
      .get('/users/user')
      .end((err, res) => {
        should.exist(err);
        res.status.should.eql(400);
        res.type.should.eql('application/json');
        res.body.status.should.eql('Please log in');
        done();
      });
    });
  });

});
