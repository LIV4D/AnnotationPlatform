import * as chai from 'chai';
import * as chaiThings from 'chai-things';
import * as express from 'express';
import {} from 'mocha';
import chaiHttp = require('chai-http');
import { Application } from '../app/app';

chai.use(chaiHttp);
chai.should();
chai.use(chaiThings);

const app: express.Application = new Application().app;

describe('PreprocessingTypes', () => {
    let token = '';
    it('should create a preprocessingType', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                token = res.body.token;
                return chai.request(app).post('/api/preprocessingTypes')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .set('Authorization', 'Bearer ' + token)
                    .send({
                        description: 'description',
                        name: 'name',
                    });
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('id');
                chai.expect(res.body.name).to.equal('name');
                chai.expect(res.body.description).to.equal('description');
                done();
            })
            .catch(err => done(err));
    });

    it('should return all preprocessingTypes', done => {
        chai.request(app).get('/api/preprocessingTypes')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('name');
                res.body.should.all.have.property('description');
                done();
            })
            .catch(err => done(err));
    });

    it('should update a preprocessingType', done => {
        chai.request(app).put('/api/preprocessingTypes/2')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({
                description: 'description2',
                name: 'name2',
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.description).to.equal('description2');
                done();
            })
            .catch(err => done(err));
    });

    it('should return a preprocessingType using it\'s id', done => {
        chai.request(app).get('/api/preprocessingTypes/2')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.description).to.equal('description2');
                done();
            })
            .catch(err => done(err));
    });

    it('should return a preprocessingType using it\'s name', done => {
        chai.request(app).get('/api/preprocessingTypes/findByName/name2')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.description).to.equal('description2');
                done();
            })
            .catch(err => done(err));
    });

    it('should fail all routes without login', done => {
        chai.request(app).post('/api/preprocessingTypes/')
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/preprocessingTypes/'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).put('/api/preprocessingTypes/1'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/preprocessingTypes/1'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/preprocessingTypes/findByName/name'))
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => done(err));
    });
});
