import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { TaskGroup } from '../models/taskGroup.model';

@injectable()
export class TaskGroupRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<TaskGroup[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(TaskGroup).find();
    }

    public async create(taskGroup: TaskGroup): Promise<TaskGroup> {
        const connection =  await this.connectionProvider();
        return await connection.getRepository(TaskGroup).save(taskGroup);
    }

    public async find(id: number): Promise<TaskGroup> {
        const connection  = await this.connectionProvider();
        return await connection.getRepository(TaskGroup).findOne(id);
    }

    public async findByTitle(title: string): Promise<TaskGroup> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(TaskGroup).findOne({ title });
    }
}
