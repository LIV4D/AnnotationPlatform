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

describe('Preprocessings', () => {
    let token = '';

    it('should return all preprocessings', done => {
        chai.request(app).post('/auth/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                username: 'test',
                password: 'test',
            })
            .then(res => {
                token = res.body.token;
                return chai.request(app).get('/api/preprocessings/')
                .set('Authorization', 'Bearer ' + token);
            })
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should return all the preprocessings for an image', done => {
        chai.request(app).get('/api/preprocessings/1')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(200);
                done();
            })
            .catch(err => done(err));
    });

    it('should delete a preprocessing for an image for a preprocessing type', done => {
        chai.request(app).del('/api/preprocessings/1/1')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                chai.expect(res).to.have.status(204);
                done();
            })
            .catch(err => done(err));
    });
});
