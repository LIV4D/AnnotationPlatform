import * as express from 'express';

export interface IController {
    setRoutes(app: express.Application): void;
}
