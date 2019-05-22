import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { TaskGroup } from '../models/taskGroup.model';

@injectable()
export class TaskTypeRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<TaskType[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(TaskType).find());
    }

    public async create(taskType: TaskType): Promise<TaskType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(TaskType).save(taskType));
    }

    public async update(taskType: TaskType): Promise<TaskType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(TaskType).save(taskType));
    }

    public async find(id: number): Promise<TaskType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(TaskType).findOne(id));
    }

    public async findByName(name: string): Promise<TaskType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(TaskType).findOne({ name }));
    }
}
