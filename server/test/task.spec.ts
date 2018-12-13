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

describe('Tasks', () => {
    let userId = '';
    let token = '';
    let id1 = 0;
    let id2 = 0;
    it('should create a default task (active, incomplete)', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                userId = res.body.user.id;
                token = res.body.token;
                return chai.request(app).post('/api/tasks')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    imageId: 2,
                    taskTypeId: 1,
                    userId,
                });
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body);
                id1 = res.body;
                return chai.request(app).get(`/api/revisions/${userId}/2`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + token);
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('svg');
                done();
            })
            .catch(err => done(err));
    });

    it('should create an inactive and completed task', done => {
        chai.request(app).post('/api/tasks')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({
                active: 'false',
                completed: 'true',
                imageId: 3,
                taskTypeId: 1,
                userId,
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body);
                id2 = res.body;
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return a tasklist', done => {
        chai.request(app).get('/api/tasklist/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should return all tasks', done => {
        chai.request(app).get('/api/tasks')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('active');
                res.body.should.all.have.property('completed');
                done();
            })
            .catch(err => done(err));
    });

    it('should update a task', done => {
        chai.request(app).put('/api/tasks/' + id1)
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({ completed: true })
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should return a default task using it\'s Id', done => {
        chai.request(app).get('/api/tasks/' + id1)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.active).to.equal(true);
                chai.expect(res.body.completed).to.equal(true);
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return a task using user id and image id', done => {
        chai.request(app).get('/api/tasks/' + userId + '/' + id1)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('active');
                res.body.should.all.have.property('completed');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return an inactive and completed revision using it\'s Id', done => {
        chai.request(app).get('/api/tasks/' + id2)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.active).to.equal(false);
                chai.expect(res.body.completed).to.equal(true);
                chai.expect(res.body.user.email).to.equal('test');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return tasks belonging to a specific user', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                return chai.request(app).get('/api/tasks/findByUser/' + userId)
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + res.body.token);
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('active');
                res.body.should.all.have.property('completed');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should delete a task', done => {
        chai.request(app).del('/api/tasks/' + id1)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(204);
                done();
            })
            .catch(err => done(err));
    });

    it('should fail all routes without login', done => {
        chai.request(app).get('/api/tasks/' + id1)
            .then(res => chai.expect(res).to.have.status(401))
            .then(res => chai.request(app).get('/api/tasks/'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(res => chai.request(app).post('/api/tasks/'))
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => done(err));
    });
});
