import * as express from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { IController } from './abstractController.controller';
import { ManagementService } from '../services/management.service';

@injectable()
export class ManagementController implements IController {
    @inject(TYPES.TaskPriorityService)
    private managementService: ManagementService;

    public setRoutes(app: express.Application): void {
        app.get('/api/management/listNames', this.listAllModels);
        // app.put('/api/tasks/update/:taskId', this.updateTask);
        // app.delete('/api/tasks/delete/:taskId', this.deleteTask);
        // app.post('api/tasks/submit/:taskId', this.submitTask);

        // Get
        // app.get('/api/tasks/get/:taskId([0-9]+)', this.getTask);
        // app.get('/api/tasks/get/:taskId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getTask);
        // app.get('/api/tasks/get', this.getMultipleTasks);
        // app.get('/api/tasks/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleTasks);
        // app.get('/api/tasks/get/next/:userId', this.getNextTaskByUser);

        // List
        // app.get('/api/tasks/list', this.list);
        // app.get('/api/tasks/list/:attr([a-zA-Z][a-zA-Z0-9]+)', this.list);
        // app.get('/api/tasks/gallery/:userId', this.getUserGallery);

    }

    private listAllModels = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.managementService.listAllModels()
            .then(modelNames => res.send(modelNames))
            .catch(next);
    }
}
