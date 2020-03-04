import { Task } from './../models/task.model';
import { ITaskPriority } from './../interfaces/ITaskPriority.interface';
import { TaskPriority } from './../models/taskPriority.model';
import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
// import { DeleteResult } from 'typeorm';

@injectable()
export class TaskPriorityRepository {

    private connectionProvider: ConnectionProvider;
    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    // public async findAll(): Promise<Task[]> {
    //     const repository =  (await this.connectionProvider()).getRepository(Task);
    //     return await repository.find();
    // }

    public async create(taskPriority: TaskPriority): Promise<TaskPriority> {
        const repository =  (await this.connectionProvider()).getRepository(TaskPriority);
        taskPriority = await repository.save(taskPriority);
        return repository.findOne({ userId: taskPriority.userId, taskId: taskPriority.taskId }); // Reload task
    }

    // public async find(id: number): Promise<Task> {
    //     const repository =  (await this.connectionProvider()).getRepository(Task);
    //     return await repository.findOne(id);
    // }

    // public async findByIds(ids: number[]): Promise<Task[]> {
    //     const repository =  (await this.connectionProvider()).getRepository(Task);
    //     return await repository.findByIds(ids);
    // }

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
        const taskPriorityRepo =  (await this.connectionProvider()).getRepository(TaskPriority);

        const qb = await taskPriorityRepo
                         .createQueryBuilder('taskPriority')
                         .where(`taskPriority.userId = ${userId}` );

        const taskPrioritys =  await qb.getMany();
        const taskRepo =  (await this.connectionProvider()).getRepository(Task);
        taskPrioritys.forEach(async priority => {
            priority.task = await taskRepo.findOne(priority.taskId);
        });

        console.log(taskPrioritys);
        return taskPrioritys;
    }

    // public async delete(task: Task): Promise<DeleteResult> {
    //     const repository =  (await this.connectionProvider()).getRepository(Task);
    //     return await repository.delete(task);
    // }
}
