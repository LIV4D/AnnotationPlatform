import * as express from 'express';

/**
 * This interface must be used for any new controllers added into the code.
 * In addition to this, a controller must be added to the inversify.config.ts file so that it can be used (follow examples already there)
 */
export interface IController {
    setRoutes(app: express.Application): void;
}
