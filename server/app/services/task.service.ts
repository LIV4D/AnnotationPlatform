import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';

import TYPES from '../types';
import { AnnotationService } from './annotation.service';
import { TaskRepository } from '../repository/task.repository';
import { Task, ITask } from '../models/task.model';
import { IAnnotation } from '../models/annotation.model';
import { ISubmission} from '../../../common/interfaces';
import { User } from '../models/user.model';
import { ITaskGallery } from '../interfaces/gallery.interface'
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';


@injectable()
export class TaskService {
    @inject(TYPES.TaskRepository)
    private taskRepository: TaskRepository;
    @inject(TYPES.AnnotationService)
    private annotationService: AnnotationService;

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

    public async updateTask(updatedTask: ITask, user: User) {
        const oldTask = await this.getTask(updatedTask.id, user);
        oldTask.update(updatedTask);
        return await this.taskRepository.create(oldTask);
    }

    public async getTasks(): Promise<Task[]> {
        return await this.taskRepository.findAll();
    }

    public async getTasksByUser(userId: string): Promise<Task[]> {
        return await this.taskRepository.findTasksByUser(userId);
    }

    public async submitTask(submission: ISubmission, user: User) {
        const task = await this.taskRepository.find(submission.taskId);
        if (isNullOrUndefined(task)) {
            throw createError('This task does not exist.', 404);
        }
        if (task.assignedUser.id !== user.id) {
            createError("Your aren't the assigned user for this task.", 401);
        }
    
        const newAnnotation: IAnnotation = {
            id: task.annotation.id,
            data: submission.data,
        };
        this.annotationService.update(newAnnotation, user, {description: "Task submission", timestamp: submission.uptime});
    }

    public async getTasksByUserByImage(userId: string, imageId: number): Promise<Task[]> {
        return await this.taskRepository.findTasksByUserByImage(userId, imageId);
    }

    public async getUserGallery(userId: string, page?: number, pageSize?: number, isComplete?: boolean): Promise<ITaskGallery[]> {
        return await this.taskRepository.findTaskListByUser(userId, page, pageSize, isComplete);
    }

    public async deleteTask(id: number, user: User) {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        TaskService.throwIfNotAuthorized(task, user);
        return await this.taskRepository.delete(task);
    }

    public static throwIfNotAuthorized(task: Task, user: User){
        if (task.assignedUserId !== user.id && task.creatorId !== user.id) {
            throwIfNotAdmin(user);
        }
    }
}
