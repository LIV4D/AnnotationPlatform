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

describe('ImageTypes', () => {
    let id = 0;
    let token = '';
    it('should create an imageType', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                token = res.body.token;
                return chai.request(app).post('/api/imageTypes')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + res.body.token)
                .send({
                    name: 'name1',
                    description: 'description1',
                });
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body);
                id = res.body;
                done();
            })
            .catch(err => done(err));
    });

    it('should return all imageTypes', done => {
        chai.request(app).get('/api/imageTypes')
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

    it('should return an image type using it\'s Id', done => {
        chai.request(app).get(`/api/imageTypes/${id}`)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name1');
                chai.expect(res.body.description).to.equal('description1');
                done();
            })
            .catch(err => done(err));
    });

    it('should update an image type', done => {
        chai.request(app).put(`/api/imageTypes/${id}`)
            .set('Authorization', 'Bearer ' + token)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                name: 'name2',
                description: 'description2',
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.description).to.equal('description2');
                done();
            })
            .catch(err => done(err));
    });

    it('should delete an image type', done => {
        chai.request(app).del(`/api/imageTypes/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
                chai.expect(res).to.have.status(204);
                done();
            })
            .catch(err => done(err));
    });

    it('should fail all routes without login', done => {
        chai.request(app).get('/api/imageTypes/' + id)
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/imageTypes/'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).post('/api/imageTypes/'))
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => done(err));
    });
});
