import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { TaskService } from '../services/task.service';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ITask, ISubmission } from '../../../common/interfaces';
import { isNullOrUndefined } from 'util';

@injectable()
export class TaskController implements IController {
    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public setRoutes(app: express.Application): void {
        // Collection
        app.post('/api/tasks/create', this.createTask);
        app.put('/api/tasks/update/:taskId', this.updateTask);
        app.delete('/api/tasks/delete/:taskId', this.deleteTask);
        app.get('/api/tasks/list', this.listTasks);
        app.get('/api/tasks/list/:userId', this.listTasks);
        app.get('/api/tasks/gallery/:userId', this.getUserGallery);
        app.post('api/tasks/submit/:taskId', this.submitTask);
        app.get('/api/tasks/:userId/next/', this.getNextTaskByUser);

        // Element
        app.get('/api/tasks/get/:taskId', this.getTask);
        app.get('/api/tasks/get/:taskId/:field', this.getTaskField);
    }

    private createTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        let isTaskVisible = true;
        let isTaskCompleted = false;
        if (!isNullOrUndefined(req.body.visible)) {
            isTaskVisible = (req.body.visible === 'true');
        }
        if (!isNullOrUndefined(req.body.isComplete)) {
            isTaskCompleted = (req.body.completed === 'true');
        }
        const newTask: ITask = {
            isVisible: isTaskVisible,
            isComplete: isTaskCompleted,
            imageId: req.body.imageId,
            taskGroupId: req.body.taskGroupId,
            userId: req.body.userId,
            annotationId: req.body.annotationId,
            comment: req.body.comment,
        };
        this.taskService.createTask(newTask)
            .then(task => res.json(task.id))
            .catch(next);
    }

    private getTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskService.getTask(req.params.taskId, req)
            .then(task => {
                delete task.user.password;
                delete task.user.salt;
                delete task.user.isAdmin;
                res.send(task);
            })
            .catch(next);
    }

    private getTaskField = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskService.getTask(req.params.taskId, req)
            .then(task => {
                switch(req.params.field){
                    case "proto": res.send(task.prototype()); break
                }
            })
            .catch(next);
    }

    private listTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // check if it's list by user or not

        // TODO: uncomment all throwIfnotAdmin later
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
            userId: req.user.id,
            data: req.body.data,
            comment: req.body.comment,
            isComplete: false,
            uptime: req.body.uptime,
        };
        if (!isNullOrUndefined(req.body.isComplete)) {
            submission.isComplete = req.body.isComplete === 'true';
        }
        try {
            await this.taskService.submitTask(submission, req);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    /* private async downloadTask(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const downloadedTask = await this.taskService.downloadTask(req.params.taskId);
            res.send(downloadedTask);
        } catch (error) {
            next(error);
        }
    }*/
    
    private getNextTaskByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.taskService.getTasksByUser(req.params.userId)
            .then(tasks => {
                tasks.forEach((task) => {
                    if (!task.isComplete && !task.isVisible) {
                        res.send(task.prototype());
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
        this.taskService.updateTask(updatedTask, req)
            .then(task => res.send(task))
            .catch(next);
    }

    private deleteTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskService.deleteTask(req.params.taskId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
