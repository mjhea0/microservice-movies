// process.env.NODE_ENV = 'test';
//
// const chai = require('chai');
// const should = chai.should();
// const chaiHttp = require('chai-http');
// chai.use(chaiHttp);
//
// const server = require('../../src/app');
// const knex = require('../../src/db/connection');
// const queries = require('../../src/db/queries');
//
// describe('Movies API Routes', () => {
//
//   beforeEach(() => {
//     return knex.migrate.rollback()
//     .then(() => { return knex.migrate.latest(); })
//     .then(() => { return knex.seed.run(); });
//   });
//
//   afterEach(() => {
//     return knex.migrate.rollback();
//   });
//
//   describe('GET /movies/ping', () => {
//     it('should return "pong"', () => {
//       chai.request(server)
//       .get('/movies/ping')
//       .end((err, res) => {
//         res.type.should.eql('text/html');
//         res.text.should.eql('pong');
//       });
//     });
//   });
//
//
//   describe('GET /movies/user', () => {
//     it('should return saved movies', () => {
//       const payload = {
//         username: 'jeremy',
//         password: 'johnson123'
//       };
//       const options = {
//         method: 'POST',
//         uri: 'http://users-service:3000/users/login',
//         body: payload,
//         json: true
//       };
//       return request(options)
//       .then((response) => {
//         chai.request(server)
//         .get('/locations')
//         .set('authorization', `Bearer ${response.token}`)
//         .end((err, res) => {
//           res.type.should.equal('application/json');
//           res.body.status.should.equal('success');
//           res.body.data.should.be.a('array');
//           res.body.data.length.should.equal(1);
//           res.body.data[0].should.have.property('user_id');
//           res.body.data[0].should.have.property('lat');
//           res.body.data[0].should.have.property('long');
//           res.body.data[0].should.have.property('created_at');
//         });
//       });
//     });
//
// });
