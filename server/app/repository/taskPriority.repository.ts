import { Task } from './../models/task.model';
import { ITaskPriority } from './../interfaces/ITaskPriority.interface';
import { TaskPriority } from './../models/taskPriority.model';
import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { DeleteResult } from 'typeorm';
// import { DeleteResult } from 'typeorm';

@injectable()
export class TaskPriorityRepository {

    private connectionProvider: ConnectionProvider;
    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async create(taskPriority: TaskPriority): Promise<TaskPriority> {
        const repository =  (await this.connectionProvider()).getRepository(TaskPriority);
        taskPriority = await repository.save(taskPriority);
        return repository.findOne({ userId: taskPriority.userId, taskId: taskPriority.taskId }); // Reload task
    }

    public async findByFilter(filter: {userId?: number, taskId?: number, priority?: number}): Promise<TaskPriority[]> {
        const whereConditions = [];
        if (filter.taskId !== undefined) {
            whereConditions.push('taskPriority.taskId = ' + filter.taskId.toString());
        }
        if (filter.userId !== undefined) {
            whereConditions.push('taskPriority.userId = ' + filter.userId.toString());
        }
        if (filter.priority !== undefined) {
            whereConditions.push('taskPriority.priority = ' + filter.priority.toString());
        }

        const repository =  (await this.connectionProvider()).getRepository(TaskPriority);
        return await repository
                     .createQueryBuilder('taskPriority')
                     .leftJoinAndSelect('taskPriority.userId', 'userId')
                     .leftJoinAndSelect('taskPriority.taskId', 'taskId')
                     .leftJoinAndSelect('taskPriority.priority', 'priority')
                     .where(whereConditions.join(' AND '))
                     .getMany();
    }

    public async findPrioritizedTasksByUser(userId: number): Promise<ITaskPriority[]> {

        // Get all priorities with specified user
        const taskPriorityRepo =  (await this.connectionProvider()).getRepository(TaskPriority);
        const qb = await taskPriorityRepo
                         .createQueryBuilder('taskPriority')
                         .where(`taskPriority.userId = ${userId}` );
        const taskPrioritys =  await qb.getMany();

        // Get tasks and map them in interface
        const taskRepo =  (await this.connectionProvider()).getRepository(Task);
        const iTaskPrioritys = Promise.all(taskPrioritys.map(async taskPriority => {
            const taskValue = await taskRepo.findOne(taskPriority.taskId);
            const taskPriorityInterface: ITaskPriority = {
                taskId : taskPriority.taskId,
                userId : taskPriority.userId,
                priority : taskPriority.priority,
                task: taskValue,
            };
            return taskPriorityInterface;
        }));

        return iTaskPrioritys;
    }

    public async deletePriorities(taskPriorities: TaskPriority[]): Promise<DeleteResult[]> {
        return Promise.all(taskPriorities.map(async taskPriority => {
            return await this.delete(taskPriority);
        }));
    }

    public async delete(taskPriority: TaskPriority): Promise<DeleteResult> {
        const repository =  (await this.connectionProvider()).getRepository(TaskPriority);
        return await repository.delete(taskPriority);
    }
}
