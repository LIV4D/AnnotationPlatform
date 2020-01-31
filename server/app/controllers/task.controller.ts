import * as express from 'express';
import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';

import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskService } from '../services/task.service';
import { ITask } from '../models/task.model'
import { throwIfNotAdmin } from '../utils/userVerification';
import { ISubmission } from '../../../common/interfaces';


@injectable()
export class TaskController implements IController {
    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public setRoutes(app: express.Application): void {
        app.post('/api/tasks/create', this.createTask);
        app.put('/api/tasks/update/:taskId', this.updateTask);
        app.delete('/api/tasks/delete/:taskId', this.deleteTask);
        app.post('api/tasks/submit/:taskId', this.submitTask);

        // Get
        app.get('/api/tasks/get/:taskId', this.getTask);
        app.get('/api/tasks/get', this.getMultipleTasks);
        app.get('/api/tasks/get/:taskId/:attr', this.getTask);
        app.get('/api/tasks/get/:attr', this.getMultipleTasks)
        app.get('/api/tasks/get/next/:userId', this.getNextTaskByUser);

        // List
        app.get('/api/tasks/list', this.list);
        app.get('/api/tasks/gallery/:userId', this.getUserGallery);

    }

    private createTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        
        const newTask: ITask = {
            typeId: req.body.typeId,
            annotationId: req.body.annotationId,
            isComplete: req.body.isComplete === 'true',
            isVisible: req.body.isVisible === 'true',
            comment: req.body.comment,
            assignedUserId: req.body.assignedUserId,
            creatorId: req.user.id
        };
        this.taskService.createTask(newTask)
            .then(task => res.json(task.id))
            .catch(next);
    }

    private getTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskService.getTask(req.params.taskId, req.user)
            .then(task => {
                delete task.assignedUser.password;
                delete task.assignedUser.salt;
                delete task.creator.password;
                delete task.creator.salt;

                switch(req.params.attr){
                    case undefined: res.send(task); break;
                    case "proto": res.send(task.proto()); break
                }
            })
            .catch(next);
    }

    private getMultipleTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const ids = req.body.ids;
        this.taskService.getTasks(ids)
            .then(tasks => {
                res.send(tasks.map( task => {
                    delete task.assignedUser.password;
                    delete task.assignedUser.salt;
                    delete task.creator.password;
                    delete task.creator.salt;

                    switch(req.params.attr){
                        case undefined:  return task;
                        case "proto": return task.proto();
                    }
                    return null;
                }));                
            })
            .catch(next);
    }

    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const isListByUser = !isNullOrUndefined(req.params.userId);
        if (isListByUser) {
            // if (req.params.userId !== req.user.id) {
            //     throwIfNotAdmin(req);
            // }

            // list by user:
            this.taskService.getTasksByUser(req.params.userId)
            .then(tasks => {
                const taskProtoTypes = tasks.map(task => {
                    const iTask: ITask = {
                        id: task.id,
                        comment: task.comment,
                        isComplete: task.isComplete,
                    };
                    return iTask;
                });
                res.send(taskProtoTypes);
            })
            .catch(next);
        } else {
            // throwIfNotAdmin(req);
            this.taskService.getTasks()
            .then(tasks => {
                const taskProtoTypes = tasks.map(task => {
                    const iTask: ITask = {
                        id: task.id,
                        comment: task.comment,
                        isComplete: task.isComplete,
                    };
                    return iTask;
                });
                res.send(taskProtoTypes);
            })
            .catch(next);
        }
    }

    private getUserGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // if (req.user.id !== req.params.userId) {
        //     throwIfNotAdmin(req);
        // }
        const userId = req.params.userId as string;
        const page = req.query.page as number;
        const pageSize = req.query.pageSize as number;
        const isComplete = (req.query.isComplete === 'true');

        this.taskService
            .getUserGallery(userId, page, pageSize, isComplete)
            .then(taskGallery => res.send(taskGallery))
            .catch(next);
    }

    private async submitTask(req: express.Request, res: express.Response, next: express.NextFunction) {
        const submission: ISubmission = {
            taskId: req.params.taskId as number,
            data: req.body.data,
            uptime: req.body.uptime,
            isComplete: req.body.isComplete === 'true',
        };

        try {
            await this.taskService.submitTask(submission, req.user);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
    
    private getNextTaskByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req.user);
        }
        this.taskService.getTasksByUser(req.params.userId)
            .then(tasks => {
                tasks.forEach((task) => {
                    if (!task.isComplete && !task.isVisible) {
                        res.send(task.proto());
                        return;
                    }
                });
                res.send(null);
            })
            .catch(next);
    }

    private updateTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedTask: ITask = {
            id: req.params.taskId,
            isVisible: false,
            isComplete: false,
        };
        if (!isNullOrUndefined(req.body.isVisible)) {
            updatedTask.isVisible = (req.body.isVisible === 'true');
        }
        if (!isNullOrUndefined(req.body.isComplete)) {
            updatedTask.isComplete = (req.body.isComplete === 'true');
        }
        this.taskService.updateTask(updatedTask, req.user)
            .then(task => res.send(task))
            .catch(next);
    }

    private deleteTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.taskService.deleteTask(req.params.taskId, req.user)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
