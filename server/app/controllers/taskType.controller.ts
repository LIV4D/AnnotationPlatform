import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { TaskTypeService } from '../services/taskType.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class TaskTypeController implements IRegistrableController {
    @inject(TYPES.TaskTypeService)
    private taskTypeService: TaskTypeService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/taskTypes', this.getTaskTypes);
        app.post('/api/taskTypes', this.createTaskType);
        // Element
        app.get('/api/taskTypes/:taskTypeId', this.getTaskType);
    }

    private getTaskTypes = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskTypeService.getTaskTypes()
            .then(taskTypes => res.send(taskTypes))
            .catch(next);
    }

    private createTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newTaskType = {
            name: req.body.name,
            description: req.body.description,
        };
        this.taskTypeService.createTaskType(newTaskType)
            .then(taskType => res.json(taskType.id))
            .catch(next);
    }

    private getTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskTypeService.getTaskType(req.params.taskTypeId)
            .then(taskType => res.send(taskType))
            .catch(next);
    }
}
