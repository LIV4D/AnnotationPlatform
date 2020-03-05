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
export class TaskBundleService {
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

        // Add 1 rndom task to temp arrays of tasks
        B1.push(tasks[ArrayIndexNumbers[0]].task);
        B2.push(tasks[ArrayIndexNumbers[1]].task);
        B3.push(tasks[ArrayIndexNumbers[2]].task);

        // Get task type details from first task of eahc bundle
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
