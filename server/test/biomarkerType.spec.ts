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
describe('BiomarkerTypes', () => {
    let id = 0;
    let childId = 0;
    let token = '';
    it('should create a biomarkerType', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                token = res.body.token;
                return chai.request(app).post('/api/biomarkerTypes')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    name: 'name1',
                    color: 'color1',
                    imageTypes: [1],
                });
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('id');
                id = res.body.id;
                return chai.request(app).post('/api/biomarkerTypes')
                .set('content-type', 'application/x-www-form-urlencoded')
                .set('Authorization', 'Bearer ' + token)
                .send({
                    name: 'name2',
                    color: 'color2',
                    parentId: id,
                    imageTypes: [1],
                });
            })
            .then(res => {
                childId = res.body.id;
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('id');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return all biomarkers', done => {
        chai.request(app).get('/api/biomarkerTypes')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array');
                res.body.should.all.have.property('name');
                res.body.should.all.have.property('color');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return a biomarker using it\'s Id', done => {
        chai.request(app).get('/api/biomarkerTypes/' + childId)
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.color).to.equal('color2');
                chai.expect(res.body.parent.name).to.equal('name1');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should return a biomarker using it\'s name', done => {
        chai.request(app).get('/api/biomarkerTypes/findByName/name2/')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.color).to.equal('color2');
                chai.expect(res.body.parent.name).to.equal('name1');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should update the color of a biomarker type', done => {
        chai.request(app).put(`/api/biomarkerTypes/${childId}`)
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Bearer ' + token)
            .send({ color: 'color3' })
            .then(res => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.name).to.equal('name2');
                chai.expect(res.body.color).to.equal('color3');
                chai.expect(res.body.parent.name).to.equal('name1');
                done();
            })
            .catch(err => done(err));
    });

    it('should delete a biomarker type', done => {
        chai.request(app).del(`/api/biomarkerTypes/${childId}`)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(204);
            })
            .catch(err => done(err))
            .then(() => chai.request(app).del('/api/biomarkerTypes/1')
                .set('Authorization', 'Bearer ' + token))
            .then(res => {
                chai.expect(res).to.have.status(409);
                done();
            })
            .catch(err => done(err));
    });

    it('should fail all routes without login', done => {
        chai.request(app).post('/api/biomarkerTypes/')
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/biomarkerTypes/'))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/biomarkerTypes/' + id))
            .then(res => chai.expect(res).to.have.status(401))
            .then(() => chai.request(app).get('/api/biomarkerTypes/findByName/name2/'))
            .then(res => {
                chai.expect(res).to.have.status(401);
                done();
            })
            .catch(err => done(err));
    });
});
