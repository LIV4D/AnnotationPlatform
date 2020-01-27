import 'reflect-metadata';
import TYPES from '../types';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import { Task } from '../models/task.model';
import { TaskRepository } from '../repository/task.repository';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ITask, ITaskGallery, IEvenement, ISubmission, IAnnotation} from '../../../common/interfaces';
import { isNullOrUndefined } from 'util';
import { SubmissionEventService } from './submissionEvent.service';
import { AnnotationService } from './annotation.service';

@injectable()
export class TaskService {
    @inject(TYPES.TaskRepository)
    private taskRepository: TaskRepository;
    // TODO: cleanup after introducing the other services
    @inject(TYPES.EvenementService)
    private evenementService: SubmissionEventService;
    @inject(TYPES.AnnotationService)
    private annotationService: AnnotationService;

    public async createTask(newTask: ITask): Promise<Task> {
        const task = new Task();
        task.isVisible = newTask.isVisible ? newTask.isVisible : true;
        task.isComplete = newTask.isComplete ? newTask.isComplete : true;
        task.user = { id: newTask.userId } as any;
        task.image = { id: newTask.imageId } as any;
        task.type = { id: newTask.taskGroupId } as any;
        task.annotation = { id: newTask.annotationId } as any;

        return await this.taskRepository.create(task);
    }

    public async getTask(id: number, req: express.Request): Promise<Task> {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        if (task.user.id !== req.user.id) {
            throwIfNotAdmin(req);
        }
        return task;
    }

    public async getTasks(): Promise<Task[]> {
        return await this.taskRepository.findAll();
    }

    public async getTasksByUser(userId: string): Promise<Task[]> {
        return await this.taskRepository.findTasksByUser(userId);
    }

    public async updateTask(updatedTask: ITask, req: express.Request) {
        const oldTask = await this.taskRepository.find(updatedTask.id);
        if (isNullOrUndefined(oldTask)) {
            throw createError('This task does not exist.', 404);
        }
        if (oldTask.user.id !== req.user.id) {
            throwIfNotAdmin(req);
        }
        oldTask.isVisible = updatedTask.isVisible;
        oldTask.isComplete = updatedTask.isComplete;
        return await this.taskRepository.create(oldTask);
    }

    public async submitTask(submission: ISubmission, req: express.Request) {
        const task = await this.taskRepository.find(submission.taskId);
        if (isNullOrUndefined(task)) {
            throw createError('This task does not exist.', 404);
        }
        if (task.user.id !== Number(submission.userId)) {
            createError('user is not admin', 401);
        }
        // create evenement for the submission:
        const evenement: IEvenement = {
            annotationId: task.annotation.id,
            description: 'new submission',
            timestamp: submission.uptime,
            userId: task.user.id.toString(),
        };
        await this.evenementService.createSubmissionEvent(evenement);
        // update data of annotation:
        const newAnnotation: IAnnotation = {
            id: task.annotation.id,
            data: submission.data,
        };
        if (!isNullOrUndefined(submission.comment)) {
            newAnnotation.comment = submission.comment;
        }
        this.annotationService.update(newAnnotation, req);
    }

    public async getTasksByUserByImage(userId: string, imageId: number): Promise<Task[]> {
        return await this.taskRepository.findTasksByUserByImage(userId, imageId);
    }

    public async getUserGallery(userId: string, page?: number, pageSize?: number, isComplete?: boolean): Promise<ITaskGallery[]> {
        return await this.taskRepository.findTaskListByUser(userId, page, pageSize, isComplete);
    }

    public async deleteTask(id: number) {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        return await this.taskRepository.delete(task);
    }
}
