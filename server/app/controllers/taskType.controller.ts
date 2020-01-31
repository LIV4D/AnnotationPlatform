import * as express from 'express';
import { inject, injectable } from 'inversify';

import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskTypeService } from '../services/taskType.service';
import { ITaskType} from '../models/taskType.model'
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
        throwIfNotAdmin(req.user);
        this.taskTypeService.getTaskTypes()
            .then(taskTypes => res.send(taskTypes))
            .catch(next);
    }

    private createTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newTaskType: ITaskType = {
            title: req.body.title,
            description: req.body.description,
        };
        this.taskTypeService.createTaskType(newTaskType)
            .then(taskType => res.json(taskType.id))
            .catch(next);
    }

    private getTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.taskTypeService.getTaskType(req.params.taskTypeId)
            .then(taskType => res.send(taskType))
            .catch(next);
    }

    private updateTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const updatedTaskType: ITaskType = {
            id: req.params.taskTypeId, 
            title: req.body.title, 
            description: req.body.description,
        }

        this.taskTypeService.updateTaskType(updatedTaskType)
            .then(tType => res.send(tType))
            .catch(next);
    }
    private deleteTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.taskTypeService.deleteTaskType(req.params.taskTypeId).then(() => {
            res.sendStatus(204);
        }).catch(next);
    }
}
