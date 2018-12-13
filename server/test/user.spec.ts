import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiThings from 'chai-things';
import * as express from 'express';
import chaiHttp = require('chai-http');
import {} from 'mocha';
import { Application } from '../app/app';

chai.use(chaiHttp);
chai.should();
chai.use(chaiThings);

const app: express.Application = new Application().app;

describe('Users', () => {
    let token = '';
    let userId = '';
    it('should authenticate a user on /auth/login POST', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                token = res.body.token;
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.user.name).to.equal('test');
                chai.expect(res.body.user.email).to.equal('test');
                chai.expect(res.body.user).to.not.have.property('hash');
                chai.expect(res.body.user).to.not.have.property('salt');
                chai.expect(res.body.token);
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should create a user on /api/users POST', done => {
        chai.request(app).post('/api/users')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({
                name: 'name',
                email: 'email2@test.com',
                password: 'password',
                role: 'clinician',
            })
            .then(res => {
                userId = res.body.id;
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('id');
                chai.expect(res.body).to.have.property('name');
                chai.expect(res.body).to.have.property('email');
                chai.expect(res.body).to.have.property('role');
                chai.expect(res.body).to.not.have.property('hash');
                chai.expect(res.body).to.not.have.property('salt');
                done();
            })
            .catch(err => done(err));
    });

    it('should fail to get all users with a clinician', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'email2@test.com',
                password: 'password',
            })
            .then(res => chai.request(app).get('/api/users')
                .set('Authorization', 'Bearer ' + res.body.token))
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => done(err));
    });

    it('should get all users on /api/users GET', done => {
        chai.request(app).get('/api/users')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('name');
                res.body.should.all.have.property('email');
                res.body.should.all.not.have.property('hash');
                res.body.should.all.not.have.property('salt');
                done();
            })
            .catch(err => done(err));
    });

    it('should update a user', done => {
        chai.request(app).put(`/api/users/${userId}`)
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({
                name: 'name2',
                password: 'password2',
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('id');
                chai.expect(res.body).to.have.property('name');
                chai.expect(res.body).to.have.property('email');
                chai.expect(res.body).to.not.have.property('hash');
                chai.expect(res.body).to.not.have.property('salt');
                done();
            })
            .catch(err => done(err));
    });

    it('should delete a user', done => {
        chai.request(app).del(`/api/users/${userId}`)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(204);
                done();
            })
            .catch(err => done(err));
    });

    it('should fail to login without accurate information on /auth/login', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'email1',
                password: 'incorrectPassword',
            })
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => {
                return chai.request(app).post('/auth/login')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({
                        username: 'incorrectEmail1',
                        password: 'password',
                    });
            })
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => {
                return chai.request(app).post('/auth/login')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({ username: 'email1' });
            })
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('should fail to get all users /users GET without token', done => {
        chai.request(app).get('/api/users')
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });
});
