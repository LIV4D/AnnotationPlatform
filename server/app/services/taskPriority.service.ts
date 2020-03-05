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

@injectable()
export class TaskPriorityService {
    @inject(TYPES.TaskPriorityRepository)
    private taskPriorityRepository: TaskPriorityRepository;

    @inject(TYPES.TaskTypeRepository)
    private taskTypeRepository: TaskTypeRepository;

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
        // Get all tasks assigned to user with priorities
        const tasks = await this.taskPriorityRepository.findPrioritizedTasksByUser(userId);
        return this.createTasksBundles(tasks);
    }

    public async createTasksBundles(tasks: ITaskPriority[]): Promise<ITasksBundles> {
        // Initialize tempory arrays that will contain the tasks in each bundle
        let B1: Task[] = [];
        let B2: Task[] = [];
        let B3: Task[] = [];

        // Add desired tasks in the temp arrays of tasks
        B1.push(tasks[0].task);
        B2.push(tasks[0].task);
        B3.push(tasks[0].task);

        // Get task type details
        const taskType1 = await this.taskTypeRepository.findByIds([B1[0].taskTypeId]);
        const taskType2 = await this.taskTypeRepository.findByIds([B2[0].taskTypeId]);
        const taskType3 = await this.taskTypeRepository.findByIds([B3[0].taskTypeId]);

        // assign values to interface and return
        const  bundles: ITasksBundles = {
            primaryTaskType: taskType1[0].title,
            primaryTaskTypeDescription: taskType1[0].description,
            primaryBundle: B1,
            secondaryTaskType: taskType2[0].title,
            secondaryTaskTypeDescription: taskType2[0].description,
            secondaryBundle: B2,
            tertiaryTaskType: taskType3[0].title,
            tertiaryTaskTypeDescription: taskType3[0].description,
            tertiaryBundle: B3,

        };

        return bundles;
    }

}
