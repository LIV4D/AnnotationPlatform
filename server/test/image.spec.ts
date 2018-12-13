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

describe('Images', () => {
    let token = '';
    it('should create the base revision of an image', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                token = res.body.token;
                return chai.request(app).get('/api/images/1/baseRevision')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + token);
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.svg).to.equal('<?xml version=\'1.0\' encoding=\'UTF-8\' standalone=\'no\'?><svg></svg>');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should update an image by its id', done => {
        chai.request(app).put('/api/images/1')
            .set('Authorization', 'Bearer ' + token)
            .send({
                eye: 'left',
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should return an image by its id', done => {
        chai.request(app).get('/api/images/1')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.eye).to.equal('left');
                done();
            })
            .catch(err => done(err));
    });

    it('should return a gallery', done => {
        chai.request(app).get('/api/gallery/')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should return all images', done => {
        chai.request(app).get('/api/images')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('id');
                res.body.should.all.have.property('path');
                done();
            })
            .catch(err => done(err));
    });

    it('should delete an image', done => {
        chai.request(app).del('/api/images/4')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(204);
                done();
            })
            .catch(err => done(err));
    });
});
