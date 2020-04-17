import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';

import TYPES from '../types';
import { AnnotationService } from './annotation.service';
import { TaskTypeRepository } from '../repository/taskType.repository';
import { TaskRepository } from '../repository/task.repository';
import { Task } from '../models/task.model';
import { ITask } from '../interfaces/ITask.interface';
import { IAnnotation } from '../interfaces/IAnnotation.interface';
import { ISubmission } from '../../../common/interfaces';
import { User } from '../models/user.model';
import { ITaskGallery } from '../interfaces/gallery.interface';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class TaskService {
    @inject(TYPES.TaskRepository)
    private taskRepository: TaskRepository;
    @inject(TYPES.TaskTypeRepository)
    private taskTypeRepository: TaskTypeRepository;
    @inject(TYPES.AnnotationService)
    private annotationService: AnnotationService;

    public static throwIfNotAuthorized(task: Task, user: User) {
        if (task.assignedUserId !== user.id && task.creatorId !== user.id) {
            throwIfNotAdmin(user);
        }
    }

    public async createTask(newTask: ITask): Promise<Task> {
        const task = Task.fromInterface(newTask);
        return await this.taskRepository.create(task);
    }

    public async getTask(id: number, user: User): Promise<Task> {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        TaskService.throwIfNotAuthorized(task, user);
        return task;
    }

    public async getTasks(ids?: number[]): Promise<Task[]> {
        const tasks = ids === undefined ? await this.taskRepository.findAll() : await this.taskRepository.findByIds(ids);
        if (tasks.length === 0) {
            throw createError('Those tasks do not exist.', 404);
        }
        return tasks;
    }

    public async getTasksByFilter(filter: {userId?: number, imageId?: number}) {
        return this.taskRepository.findByFilter(filter);
    }

    // public async getTaskByFilter(filter: {userId?: number, imageId?: number}) {
    //     return this.taskRepository.findOneByFilter(filter);
    // }

    public async updateTask(updatedTask: ITask, user: User) {
        const oldTask = await this.getTask(updatedTask.id, user);
        oldTask.update(updatedTask);
        return await this.taskRepository.create(oldTask);
    }

    public async submitTask(submission: ISubmission, user: User) {
        const task = await this.taskRepository.find(submission.taskId);
        task.isComplete = submission.isComplete;
        task.isVisible = submission.isVisible;

        if (isNullOrUndefined(task)) {
            throw createError('This task does not exist.', 404);
        }
        if (task.assignedUser.id !== user.id) {
            createError('You aren\'t this task\'s assigned user.', 401);
        }
        const newAnnotation: IAnnotation = {
            id: task.annotation.id,
            data: submission.data,
            comments: submission.comments,
        };
        this.annotationService.update(newAnnotation, user, { description: 'Task submission', timestamp: submission.uptime });
        this.updateTask(task, user);
    }

    public async getUserGallery(userId: string, page?: number, pageSize?: number, isComplete?: boolean): Promise<ITaskGallery[]> {
        return await this.taskRepository.findTaskListByUser(userId, page, pageSize, isComplete);
    }

    /**
     * Find each taskType title of a group of Tasks
     * and put in each tasks
     * @param taskGallery: contains tasks filtered by userID
     * @returns a group of tasks with taskTypeTitle fielded
     */
    public async getGalleryWithTaskTypeTitle(taskGallery: ITaskGallery[]): Promise<ITaskGallery[]> {
        await Promise.all(taskGallery.map(async task => {
            const taskTypeTitle = await this.taskTypeRepository.find(task.taskTypeId);
            task.taskTypeTitle =  taskTypeTitle.title;
        } ));
        return await taskGallery;
    }

    public async deleteTask(id: number, user: User) {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        TaskService.throwIfNotAuthorized(task, user);
        return await this.taskRepository.delete(task);
    }
}
