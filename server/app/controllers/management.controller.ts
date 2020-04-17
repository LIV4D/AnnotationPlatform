import * as express from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { IController } from './abstractController.controller';
import { ManagementService } from '../services/management.service';

@injectable()
export class ManagementController implements IController {
    @inject(TYPES.ManagementService)
    private managementService: ManagementService;

    public setRoutes(app: express.Application): void {
        app.get('/api/management/listNames', this.listAllModels);
    }

    /**
     * Gets all the entities (models) specified within the server's database.
     * @param req an express request with management data
     * @param res an express response where the management data will be put
     * @param next is the following function in the express application
     */
    private listAllModels = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.managementService.listAllModels()
            .then(modelNames => res.send(modelNames))
            .catch(next);
    }
}
