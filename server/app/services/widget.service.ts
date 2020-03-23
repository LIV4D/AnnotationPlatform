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
export class WidgetService {
    @inject(TYPES.TaskRepository)
    private taskRepository: TaskRepository;

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

    public async updateTask(updatedTask: ITask, user: User) {
        const oldTask = await this.getTask(updatedTask.id, user);
        oldTask.update(updatedTask);
        return await this.taskRepository.create(oldTask);
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
