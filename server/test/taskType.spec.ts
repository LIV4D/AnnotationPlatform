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

describe('TaskType', () => {
    let id = 0;
    it('should create a taskType', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                return chai.request(app).post('/api/taskTypes')
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
            .catch(err => {
                done(err);
            });
    });

    it('should return all task types', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                return chai.request(app).get('/api/taskTypes')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + res.body.token);
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('name');
                res.body.should.all.have.property('description');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return a taskType using it\'s Id', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                return chai.request(app).get('/api/taskTypes/' + id)
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + res.body.token);
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name1');
                chai.expect(res.body.description).to.equal('description1');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should fail all routes without login', done => {
        chai.request(app).get('/api/taskTypes/' + id)
            .set('content-type', 'application/x-www-form-urlencoded')
            .then(res => {
                chai.expect(res).to.have.status(401);
            })
            .then(res => {
                return chai.request(app).get('/api/taskTypes/')
                .set('content-type', 'application/x-www-form-urlencoded');
            })
            .then(res => {
                chai.expect(res).to.have.status(401);
            })
            .then(res => {
                return chai.request(app).post('/api/taskTypes/')
                .set('content-type', 'application/x-www-form-urlencoded');
            })
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => {
                done(err);
            });
    });
});
