process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const bcrypt = require('bcryptjs');

const authHelpers = require('../../src/auth/_helpers');

describe('auth : helpers', () => {

  describe('comparePass()', () => {
    it('should return true if the password is correct', (done) => {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync('test', salt);
      const results = authHelpers.comparePass('test', hash);
      should.exist(results);
      results.should.eql(true);
      done();
    });
    it('should return false if the password is correct', (done) => {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync('test', salt);
      const results = authHelpers.comparePass('testing', hash);
      should.exist(results);
      results.should.eql(false);
      done();
    });
    it('should return false if the password empty', (done) => {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync('test', salt);
      const results = authHelpers.comparePass('', hash);
      should.exist(results);
      results.should.eql(false);
      done();
    });
  });

});
