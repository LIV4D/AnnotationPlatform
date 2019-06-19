import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './registrable.controller';
import { TaskGroupService } from '../services/taskGroup.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class TaskGroupController implements IController {
    @inject(TYPES.TaskGroupService)
    private taskGroupService: TaskGroupService;

    public setRoutes(app: express.Application): void {
        // Collection
        app.get('/api/taskGroups/list', this.getTaskGroups);
        app.post('/api/taskGroups/create', this.createTaskGroup);
        // Element
        app.get('/api/taskGroups/:taskGroupId', this.getTaskGroup);
        app.post('/api/taskGroups/update/:taskGroupId', this.updateTaskGroup);
        app.delete('/api/taskGroups/delete/:taskGroupId', this.deleteTaskGroup);
    }

    private getTaskGroups = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskGroupService.getTaskGroups()
            .then(taskGroups => res.send(taskGroups))
            .catch(next);
    }

    private createTaskGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newTaskGroup = {
            name: req.body.name,
            description: req.body.description,
        };
        this.taskGroupService.createTaskGroup(newTaskGroup)
            .then(taskGroup => res.json(taskGroup.id))
            .catch(next);
    }

    private getTaskGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskGroupService.getTaskGroup(req.params.taskGroupId)
            .then(taskGroup => res.send(taskGroup))
            .catch(next);
    }

    private updateTaskGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskGroupService.updateTaskGroup(req.params.taskGroupId, req.body.name, req.body.description)
            .then(tType => res.send(tType))
            .catch(next);
    }
    private deleteTaskGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskGroupService.deleteTaskGroup(req.params.taskGroupId).then(() => {
            res.sendStatus(204);
        }).catch(next);
    }
}
