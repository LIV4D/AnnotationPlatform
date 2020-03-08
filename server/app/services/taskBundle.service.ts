import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { TaskPriorityRepository } from '../repository/taskPriority.repository';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { throwIfNotAdmin } from '../utils/userVerification';
import { TaskPriority } from '../models/taskPriority.model';
import { ITaskPriority } from '../interfaces/ITaskPriority.interface';
import { ITasksBundles } from '../interfaces/ITasksBundles.interface';
import { TaskTypeRepository } from '../repository/taskType.repository';
import { createError } from '../utils/error';
import { isNullOrUndefined } from 'util';
import { ITask } from '../interfaces/ITask.interface';
import { DeleteResult } from 'typeorm';
import { TaskService } from './task.service';
import * as path from 'path';
import * as fs from 'fs';
import * as config from 'config';

@injectable()
export class TaskBundleService {
    @inject(TYPES.TaskPriorityRepository)
    private taskPriorityRepository: TaskPriorityRepository;

    @inject(TYPES.TaskTypeRepository)
    private taskTypeRepository: TaskTypeRepository;

    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public static throwIfNotAuthorized(task: Task, user: User) {
        if (task.assignedUserId !== user.id && task.creatorId !== user.id) {
            throwIfNotAdmin(user);
        }
    }

    public async createTask(newTaskPriority: ITaskPriority): Promise<TaskPriority> {
        const taskPriority = TaskPriority.fromInterface(newTaskPriority);
        return await this.taskPriorityRepository.create(taskPriority);
    }

    public async getTasksBundles(userId: number): Promise<ITasksBundles> {
        // Get all tasks assigned to specifiec user from the taskPriority table
        const tasks = await this.taskPriorityRepository.findPrioritizedTasksByUser(userId);

        return this.createTasksBundles(tasks);
    }

    public async createTasksBundles(tasks: ITaskPriority[]): Promise<ITasksBundles> {
        // Initialize tempory arrays that will contain the tasks in each bundle
        const B1: Task[] = [];
        const B2: Task[] = [];
        const B3: Task[] = [];

        // TODO algo to create bundles

        // Get 3 different tasks randomly
        const ArrayIndexNumbers = [];
        if (tasks.length === 0) {
            return null;
        } else if (tasks.length < 3) {
            ArrayIndexNumbers.push(0);
            ArrayIndexNumbers.push(0);
            ArrayIndexNumbers.push(0);
        } else {
            let randomNumber;
            while (ArrayIndexNumbers.length < 3) {
                randomNumber = Math.floor(Math.random() * (tasks.length));
                if (ArrayIndexNumbers.indexOf(randomNumber) === -1) {
                    ArrayIndexNumbers.push( randomNumber );
                }
            }
        }

        // Add 1 random task to temp arrays of tasks
        B1.push(tasks[ArrayIndexNumbers[0]].task);
        B2.push(tasks[ArrayIndexNumbers[1]].task);
        B3.push(tasks[ArrayIndexNumbers[2]].task);

        // Get task type details from first task of each bundle
        const taskType1 = await this.taskTypeRepository.findByIds([B1[0].taskTypeId]);
        const taskType2 = await this.taskTypeRepository.findByIds([B2[0].taskTypeId]);
        const taskType3 = await this.taskTypeRepository.findByIds([B3[0].taskTypeId]);

        const bundleThumbnails1: string[] = [];
        const bundleThumbnails2: string[] = [];
        const bundleThumbnails3: string[] = [];

        // // Get thumbnails
        if (!isNullOrUndefined(B1) && B1.length > 0 ) {
            B1.forEach(task => {
                console.log(task.annotation.imageId);
                bundleThumbnails1.push(this.getThumbnails(task.annotation.imageId));
            });
        }
        if (!isNullOrUndefined(B2) && B2.length > 0 ) {
            B2.forEach(task => {
                bundleThumbnails2.push(this.getThumbnails(task.annotation.imageId));
            });
        }
        if (!isNullOrUndefined(B3) && B3.length > 0 ) {
            B3.forEach(task => {
                bundleThumbnails3.push(this.getThumbnails(task.annotation.imageId));
            });
        }

        // assign values to interface and return
        const  bundles: ITasksBundles = {
            primaryTaskType: taskType1[0].title,
            primaryTaskTypeDescription: taskType1[0].description,
            primaryBundle: B1,
            primaryBundleThumbnails: bundleThumbnails1,
            secondaryTaskType: taskType2[0].title,
            secondaryTaskTypeDescription: taskType2[0].description,
            secondaryBundle: B2,
            secondaryBundleThumbnails: bundleThumbnails2,
            tertiaryTaskType: taskType3[0].title,
            tertiaryTaskTypeDescription: taskType3[0].description,
            tertiaryBundle: B3,
            tertiaryBundleThumbnails: bundleThumbnails3,
        };

        return bundles;
    }

    public getThumbnails(imageId: number): string {
        try {
            const thumbPath = path.resolve(this.getThumbnailPathSync(imageId));
            return 'data:image/jpg;base64, ' + fs.readFileSync(thumbPath, 'base64');
        } catch {
            console.error(`Thumbnail for image ${imageId} not found.`);
        }
        return '';
    }

    public getThumbnailPathSync(imageId: number) {
        const prePath = config.get('storageFolders.thumbnail') as string;
        return path.join(prePath, imageId.toString() + '.jpg');
    }

    public async assignTasks(ids: number[], user: User) {
        return Promise.all(ids.map( async (id) => {
            const updatedTask: ITask = {
                id,
                assignedUserId: user.id,
                lastModifiedTime: new Date(),
            };

            const task = await this.updateTask(updatedTask, user);
            if (!isNullOrUndefined(task)) {
                const result =  await this.deleteTaskPriority(id);
                return result;
            }
            throw createError('This task does not exist with the given id.', 404);
        }));
    }

    public async deleteTaskPriority(taskId: number): Promise<DeleteResult[]> {
        const taskPriority = await this.taskPriorityRepository.findAll(taskId);
        if (isNullOrUndefined(taskPriority) || taskPriority.length <= 0) {
            throw createError('This task priority with the given task id does not exist.', 404);
        }

        return await this.taskPriorityRepository.deletePriorities(taskPriority);
    }

    public async updateTask(updatedTask: ITask, user: User): Promise<Task> {
        return await this.taskService.updateTask(updatedTask, user);
    }

}
