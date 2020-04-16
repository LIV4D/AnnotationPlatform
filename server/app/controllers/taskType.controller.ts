import * as express from 'express';
import { inject, injectable } from 'inversify';

import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskTypeService } from '../services/taskType.service';
import { ITaskType } from '../interfaces/ITaskType.interface';

@injectable()
export class TaskTypeController implements IController {
    @inject(TYPES.TaskTypeService)
    private taskTypeService: TaskTypeService;

    public setRoutes(app: express.Application): void {
        app.post('/api/taskTypes/create', this.createTaskType);
        app.put('/api/taskTypes/update/:taskTypeId', this.updateTaskType);
        app.delete('/api/taskTypes/delete/:taskTypeId', this.deleteTaskType);

        // Get
        app.get('/api/taskTypes/get/:taskTypeId([0-9]+)', this.getTaskType);
        app.get('/api/taskTypes/get/:taskTypeId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getTaskType);
        app.get('/api/taskTypes/get', this.getMultipleTaskTypes);
        app.get('/api/taskTypes/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleTaskTypes);

        // List
        app.get('/api/taskTypes/list', this.list);
        app.get('/api/taskTypes/list/:attr', this.list);
    }

    /**
     * Creates a task type using the request's information.
     *
     * Requires the title and the description to be in the request's body
     * @param req an express request with task type data
     * @param res an express response where the task type data will be put
     * @param next is the following function in the express application
     */
    private createTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const newTaskType: ITaskType = {
            title: req.body.title,
            description: req.body.description,
        };
        this.taskTypeService.createTaskType(newTaskType)
            .then(taskType => res.send(taskType.proto()))
            .catch(next);
    }

    /**
     * Updates the task type specified in the request.
     *
     * Requires the task type id in the parameters of the route.
     *
     * Requires the title and the description in the request's body.
     * @param req an express request with task type data
     * @param res an express response where the task type data will be put
     * @param next is the following function in the express application
     */
    private updateTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedTaskType: ITaskType = {
            id: +req.params.taskTypeId,
            title: req.body.title,
            description: req.body.description,
        };

        this.taskTypeService.updateTaskType(updatedTaskType)
            .then(tType => res.send(tType))
            .catch(next);
    }

    /**
     * Deletes the task type specified in the request.
     *
     * Requires the task type id in the parameters of the route.
     * @param req an express request with task type data
     * @param res an express response where the task type data will be put
     * @param next is the following function in the express application
     */
    private deleteTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskTypeService.deleteTaskType(+req.params.taskTypeId).then(() => {
            res.sendStatus(204);
        }).catch(next);
    }

    /**
     * Gets all the task types within the database.
     * @param req an express request with task type data
     * @param res an express response where the task type data will be put
     * @param next is the following function in the express application
     */
    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskTypeService.getAllTaskTypes()
            .then(taskTypes => {
                res.send(taskTypes.map(taskType => {
                    switch (req.params.attr) {
                        case undefined: return taskType;
                        case 'proto': return taskType.proto();
                    }
                    return null;
                }));
            }).catch(next);
    }

    /**
     * Gets the task type specified from the request.
     *
     * Requires the task type id specified within the route's parameters.
     * @param req an express request with task type data
     * @param res an express response where the task type data will be put
     * @param next is the following function in the express application
     */
    private getTaskType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskTypeService.getTaskType(+req.params.taskTypeId)
            .then(taskType => {
                switch (req.params.attr) {
                    case undefined: res.send(taskType); break;
                    case 'proto': res.send(taskType); break;
                }

            }).catch(next);
    }

    /**
     * Gets all the task types specified from the request.
     *
     * Requires the task type ids in the request's body.
     * @param req an express request with task type data
     * @param res an express response where the task type data will be put
     * @param next is the following function in the express application
     */
    private getMultipleTaskTypes = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskTypeService.getTaskTypes(req.body.ids)
            .then(taskTypes => {
                res.send(taskTypes.map(taskType => {
                    switch (req.params.attr) {
                        case undefined: return taskType;
                        case 'proto': return taskType.proto();
                    }
                    return null;
                }));
            }).catch(next);
    }
}
