import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { TaskPriorityRepository } from '../repository/taskPriority.repository';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { throwIfNotAdmin } from '../utils/userVerification';
import { TaskPriority } from '../models/taskPriority.model';
import { ITaskPriority } from '../interfaces/ITaskPriority.interface';
import { ITaskBundle } from '../interfaces/ITaskBundle.interface';
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

    /**
     * Throw error if user is not assigned, not the creator and not admin
     * @param task : task trying to be accessed
     * @param user : user trying to access task
     */
    public static throwIfNotAuthorized(task: Task, user: User) {
        if (task.assignedUserId !== user.id && task.creatorId !== user.id) {
            throwIfNotAdmin(user);
        }
    }

    /**
     * Create new task priority
     * @param newTaskPriority : interface of task priority to be created
     */
    public async createTaskPriority(newTaskPriority: ITaskPriority): Promise<TaskPriority> {
        const taskPriority = TaskPriority.fromInterface(newTaskPriority);
        return await this.taskPriorityRepository.create(taskPriority);
    }

    /**
     * Generate bundles for user
     * @param userId : ID of user requesting bundles
     */
    public async getTasksBundles(userId: number): Promise<ITaskBundle[]> {
        // Get all tasks assigned to specified user from the taskPriority table
        const tasks = await this.taskPriorityRepository.findPrioritizedTasksByUser(userId);

        return this.createTasksBundles(tasks);
    }

    /**
     * Algorithme to create bundles for user
     * @param tasks : Array of task priorities for specific user
     * @return bundles : Array of ITaskBundle
     */
    public async createTasksBundles(tasks: ITaskPriority[]): Promise<ITaskBundle[]> {
        const bundles: ITaskBundle[] = [];

        if (tasks.length === 0) {
            return bundles;
        }

         // Get 3 different tasks randomly
        const arrayIndexNumbers: number[] = [];
        this.getRandomIndexes(tasks, arrayIndexNumbers);
        // Generate all bundles

        return await this.generateBundles(arrayIndexNumbers,tasks, bundles);
    }

    /**
     * Generate Bundles
     * @param arrayIndexNumbers : array of random numbers representing indexes of the taskpriority array
     * @param tasks : Array of task priorities for specific user
     * @param bundles : new bundles for user
     */
    public async generateBundles(arrayIndexNumbers: number[], tasks: ITaskPriority[], bundles: ITaskBundle[]):  Promise<ITaskBundle[]> {
        // Initialize tempory arrays that will contain the tasks in each bundle
        let bundleTasks: Task[] = [];
        let taskTypes = [];
        const thumbnails: string[] = [];

         // create 3 bundles
         for (const n of arrayIndexNumbers) {
            // TODO algo to create bundles properly
            // Reinitialize
            bundleTasks = [];
            taskTypes = [];
            taskTypes = [];
            // add 1 random task to temp array
            bundleTasks.push(tasks[n].task);
            // Get task type details from first task of each bundle
            taskTypes = await this.taskTypeRepository.findByIds([bundleTasks[0].taskTypeId]);
            // Get thumbnails
            if (!isNullOrUndefined(bundleTasks) && bundleTasks.length > 0 ) {
                bundleTasks.forEach(task => {
                    thumbnails.push(this.getThumbnails(task.annotation.imageId));
                });
            }
             // assign values to interface and return
            const  bundle: ITaskBundle = {
                taskType: taskTypes[0].title,
                taskTypeDescription: taskTypes[0].description,
                bundle: bundleTasks,
                bundleThumbnails: thumbnails,
            };
            bundles.push(bundle);
        }
        return bundles;
    }
    /**
     *
     * @param tasks :  Array of task priorities for given user
     * @param arrayIndexNumbers : array of random numbers representing indexes of the taskpriority array
     */
    public getRandomIndexes(tasks: ITaskPriority[], arrayIndexNumbers: number[]){
        if (tasks.length === 1) {
            arrayIndexNumbers.push(0);
        } else if (tasks.length === 2) {
            arrayIndexNumbers.push(0);
            arrayIndexNumbers.push(1);
        } else {
            let randomNumber;
            while (arrayIndexNumbers.length < 3) {
                randomNumber = Math.floor(Math.random() * (tasks.length));
                if (arrayIndexNumbers.indexOf(randomNumber) === -1) {
                    arrayIndexNumbers.push( randomNumber );
                }
            }
        }
    }

    /**
     * Get thumbnail for given image
     * @param imageId : Id of the image
     */
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

    /**
     * Assign tasks to given user
     * @param ids : Task IDs of tasks to be assigned
     * @param user : user being assigned tasks
     */
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
            } else {
                throw createError('This task does not exist with the given id.', 404);
            }
        }));
    }

    /**
     * Delete all task priorities for given task ID
     * @param taskId : Task ID to be removed from taskpriority table
     */
    public async deleteTaskPriority(taskId: number): Promise < DeleteResult[] > {
        const taskPriority = await this.taskPriorityRepository.findAll(taskId);
        if (isNullOrUndefined(taskPriority) || taskPriority.length <= 0 ) {
            throw createError('This task priority with the given task id does not exist.', 404);
        }

        return await this.taskPriorityRepository.deletePriorities(taskPriority);
    }

    /**
     * Delete all task priorities for given task ID and user ID
     * @param deletedTaskPriority : taskPriority to be removed
     */
    public async deleteSpecificTaskPriority(deletedTaskPriority: ITaskPriority): Promise < DeleteResult[] > {
        const taskPriority = await this.taskPriorityRepository.findAll(deletedTaskPriority.taskId, deletedTaskPriority.userId );
        if (isNullOrUndefined(taskPriority) || taskPriority.length <= 0 ) {
            throw createError('This task priority with the given task id does not exist.', 404);
        }

        return await this.taskPriorityRepository.deletePriorities(taskPriority);
    }

    public async updateTask(updatedTask: ITask, user: User): Promise<Task> {
        return await this.taskService.updateTask(updatedTask, user);
    }

    public async updateTaskPriority(updatedTaskPriority: ITaskPriority): Promise<TaskPriority> {
        const oldTaskPriority = await this.getTaskPriority(updatedTaskPriority.taskId, updatedTaskPriority.userId);
        oldTaskPriority.update(updatedTaskPriority);
        return await this.taskPriorityRepository.create(oldTaskPriority);
    }

    public async getTaskPriority(taskId: number, userId: number): Promise<TaskPriority> {
        const taskPriority = await this.taskPriorityRepository.find(taskId, userId);
        if (taskPriority == null) {
            throw createError('This task does not exist.', 404);
        }
        return taskPriority;
    }

}
