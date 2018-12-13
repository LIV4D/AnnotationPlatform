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

describe('Revisions', () => {
    let id = 0;
    let userId = '';
    let token = '';
    it('should create a revision', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                userId = res.body.user.id;
                token = res.body.token;
                return chai.request(app).post('/api/revisions')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    svg: 'svg1',
                    userId,
                    imageId: 3,
                });
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.id).to.be.a('number');
                chai.expect(res.body.image.id).to.equal('3');
                chai.expect(res.body.user.id).to.equal(userId);
                chai.expect(res.body.user).to.not.have.property('hash');
                chai.expect(res.body.user).to.not.have.property('salt');
                id = res.body.id;
                done();
            })
            .catch(err => done(err));
    });

    it('should return all revisions', done => {
        chai.request(app).get('/api/revisions')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('svg');
                res.body.should.all.have.property('diagnostic');
                done();
            })
            .catch(err => done(err));
    });

    it('should return a revision using it\'s Id', done => {
        chai.request(app).get('/api/revisions/' + id)
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('diagnostic');
                chai.expect(res.body.svg).to.equal('svg1');
                chai.expect(res.body.user.email).to.equal('test');
                done();
            })
            .catch(err => done(err));
    });

    it('should return a svg built from the correct biomarker types', done => {
        chai.request(app).get('/api/revisions/emptyRevision/1')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('svg');
                done();
            })
            .catch(err => done(err));
    });

    it('should save an updated version of a revision', done => {
        chai.request(app).put(`/api/revisions/${userId}/1`)
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({ svg: 'test', diagnostic: 'test2' })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('svg');
                chai.expect(res.body.svg).to.equal('test');
                chai.expect(res.body.diagnostic).to.equal('test2');
                done();
            })
            .catch(err => done(err));
    });

    it('should get the revision for a user for an image', done => {
        chai.request(app).get(`/api/revisions/${userId}/1`)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('svg');
                chai.expect(res.body.svg).to.equal('test');
                chai.expect(res.body.diagnostic).to.equal('test2');
                done();
            })
            .catch(err => done(err));
    });

    it('should get the svg for a user for an image', done => {
        chai.request(app).get(`/api/revisions/svg/${userId}/1`)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should delete a revision for a user and an image', done => {
        chai.request(app).del(`/api/revisions/${userId}/1`)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(204);
                done();
            })
            .catch(err => done(err));
    });

    it('should fail all routes without login', done => {
        chai.request(app).post('/api/revisions/')
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/revisions/'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/revisions/1'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/revisions/emptyRevision/1'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).put(`/api/revisions/${userId}/1`))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get(`/api/revisions/${userId}/1`))
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => done(err));
    });
});
