import * as express from 'express';
import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';

import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { ITask } from '../interfaces/ITask.interface';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ISubmission } from '../../../common/interfaces';
import { AnnotationData } from '../models/annotation.model';
import { User } from '../models/user.model';

@injectable()
export class TaskController implements IController {
    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public setRoutes(app: express.Application): void {
        app.post('/api/tasks/create', this.createTask);
        app.put('/api/tasks/update/:taskId', this.updateTask);
        app.delete('/api/tasks/delete/:taskId', this.deleteTask);
        app.post('/api/tasks/submit/:taskId', this.submitTask);

        // Get
        app.get('/api/tasks/get/:taskId([0-9]+)', this.getTask);
        app.get('/api/tasks/get/:taskId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getTask);
        app.get('/api/tasks/get', this.getMultipleTasks);
        app.get('/api/tasks/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleTasks);
        app.get('/api/tasks/get/next/:userId', this.getNextTaskByUser);

        // List
        app.get('/api/tasks/list', this.list);
        app.get('/api/tasks/list/:attr([a-zA-Z][a-zA-Z0-9]+)', this.list);
        app.get('/api/tasks/gallery/:userId', this.getUserGallery);

    }

    /**
     * Creates a task using the request's information.
     *
     * Requires a task type id, an annotation id, whether the task isComplete or not, whether the task isVisible or not,
     * the task's comment section, a project title, the assigned user's id specified within the request's body.
     *
     * Optionally, the lastModifiedTime can be specified with the request's body.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private createTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newTask: ITask = {
            taskTypeId: req.body.taskTypeId,
            annotationId: req.body.annotationId,
            isComplete: req.body.isComplete,
            isVisible: req.body.isVisible,
            comment: req.body.comment,
            projectTitle: req.body.projectTitle,
            assignedUserId: req.body.assignedUserId,
            creatorId: (req.user as User).id,
            lastModifiedTime: isNullOrUndefined(req.body.lastModifiedTime) ? new Date() : req.body.lastModifiedTime,
        };
        this.taskService.createTask(newTask)
            .then(task => res.send(task.proto()))
            .catch(next);
    }

    /**
     * Gets a task using the specified id.
     *
     * Requires the task's id in the parameters of the route.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private getTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskService.getTask(+req.params.taskId, req.user as User)
            .then(task => res.send(this.export_task(task, req.params.attr)))
            .catch(next);
    }

    /**
     * Gets all the tasks that are specified.
     *
     * Requires the task ids in the request's body.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private getMultipleTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const ids = req.body.ids;
        this.taskService.getTasks(ids)
            .then(tasks => res.send(tasks.map(task => this.export_task(task, req.params.attr))))
            .catch(next);
    }

    /**
     * Gets all the tasks for a specified user and image.
     *
     * Requires the user's id and the image's id in the request's query.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Make sure the filter is in type Number
        const parseIntParams = {
            userId: +req.query.userId,
            imageId: +req.query.imageId,
        };

        const filter = (isNaN(parseIntParams.userId) || isNaN(parseIntParams.imageId)) ? {} : parseIntParams;
        this.taskService.getTasksByFilter(filter)
            .then(tasks => res.send(tasks.map(task => this.export_task(task, req.params.attr))))
            .catch(next);
    }

    /**
     * Get user gallery of task controller
     * The list gets the tasks filtered with the userId and the completed status
     */
    private getUserGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // if (req.user.id !== req.params.userId) {
        //     throwIfNotAdmin(req);
        // }
        const userId = req.params.userId as string;
        const page = req.query.page as number;
        const pageSize = req.query.pageSize as number;
        const isComplete = req.query.isCompleted;

        this.taskService
            .getUserGallery(userId, page, pageSize, isComplete)
            .then(taskGallery => this.taskService.getGalleryWithTaskTypeTitle(taskGallery))
            .then(taskGallery => res.send(taskGallery))
            .catch(next);
    }

    /**
     * Uploads a task after it has been finished or saved within the editor
     *
     * Requires the task's id in the paremeters of the route.
     *
     * Requires the annotationData, the task's uptime and wheteher the task isComplete or not in the request's body.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private submitTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const submission: ISubmission = {
            taskId: + req.params.taskId as number,
            data: req.body.data as AnnotationData,
            uptime: Math.floor(Date.now() / 1000), // Integer TimeStamp in second
            isComplete: req.body.isComplete,
            isVisible: req.body.isVisible,
            comments: req.body.comments
        };

        try {
            this.taskService.submitTask(submission, req.user as User).then(
                () =>
                res.sendStatus(204));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cleans a task so that it may be submitted without comprimising personal information.
     * @param task a task who's login information needs to be deleted
     * @param format a task's format, basically whether it's proto or not.
     * @returns the task with no more personal login information.
     */
    private export_task(task: Task, format: string): any {
        if (!isNullOrUndefined(task.assignedUser)) {
            delete task.assignedUser.password;
            delete task.assignedUser.salt;
        }
        delete task.creator.password;
        delete task.creator.salt;

        delete task.annotation.submitEvent.user.password;
        delete task.annotation.submitEvent.user.salt;

        switch (format) {
            case undefined: return task;
            case 'proto': return task.proto();
        }
        return null;
    }

    /**
     * Gets the next task that the user must complete that is visible.
     *
     * Requires the user's id in the route's parameters.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private getNextTaskByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if ((req.user as User).id !== +req.params.userId) {
            throwIfNotAdmin(req.user);
        }

        this.taskService.getTasksByFilter({ userId: +req.params.userId })
            .then(tasks => {
                tasks.forEach((task) => {
                    if (!task.isComplete && task.isVisible) {
                        res.send(task.proto());
                        return;
                    }
                });
                res.send(null);
            })
            .catch(next);
    }

    /**
     * Update a task from the taskId given in params
     * The visibility, completness and last modified time are updated
     */
    private updateTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedTask: ITask = {
            id: +req.params.taskId,
            isVisible: isNullOrUndefined(req.body.isVisible) ? false : req.body.isVisible,
            isComplete: isNullOrUndefined(req.body.isComplete) ? false : req.body.isComplete,
            lastModifiedTime: isNullOrUndefined(req.body.lastModifiedTime) ? new Date() : req.body.lastModifiedTime,
        };

        this.taskService.updateTask(updatedTask, req.user as User)
            .then(task => res.send(task))
            .catch(next);
    }

    /**
     * Deletes the specifed task
     *
     * Requires the task's id in the route's parameters.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private deleteTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.taskService.deleteTask(+req.params.taskId, req.user as User)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
