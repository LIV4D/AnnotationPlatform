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

    private listAllModels = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.managementService.listAllModels()
            .then(modelNames => res.send(modelNames))
            .catch(next);
    }
}
