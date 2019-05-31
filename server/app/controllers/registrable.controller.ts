import * as express from 'express';

export interface IRegistrableController {
    setRoutes(app: express.Application): void;
}
