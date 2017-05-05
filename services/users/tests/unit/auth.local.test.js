process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();

const localAuth = require('../../src/auth/local');

describe('auth : local', () => {

  describe('encodeToken()', () => {
    it('should return a token', (done) => {
      const token = localAuth.encodeToken({id: 1});
      should.exist(token);
      token.should.be.a('string');
      done();
    });
  });

  describe('decodeToken()', () => {
    it('should return a payload', (done) => {
      const token = localAuth.encodeToken({id: 1});
      should.exist(token);
      token.should.be.a('string');
      localAuth.decodeToken(token, (err, res) => {
        should.not.exist(err);
        res.sub.should.eql(1);
        done();
      });
    });
  });

});
