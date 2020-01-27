import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { TaskTypeService } from '../services/taskType.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class TaskTypeController implements IController {
    @inject(TYPES.TaskGroupService)
    private taskTypeService: TaskTypeService;

    public setRoutes(app: express.Application): void {
        // Collection
        app.get('/api/taskTypes/list', this.getTaskTypes);
        app.post('/api/taskTypes/create', this.createTaskType);
        // Element
        app.get('/api/taskTypes/:taskTypeId', this.getTaskType);
        app.post('/api/taskTypes/update/:taskTypeId', this.updateTaskType);
        app.delete('/api/taskTypes/delete/:taskTypeId', this.deleteTaskType);
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

    private updateTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskTypeService.updateTaskType(req.params.taskTypeId, req.body.name, req.body.description)
            .then(tType => res.send(tType))
            .catch(next);
    }
    private deleteTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskTypeService.deleteTaskType(req.params.taskTypeId).then(() => {
            res.sendStatus(204);
        }).catch(next);
    }
}
