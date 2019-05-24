import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { User } from '../models/user.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class UserRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<User[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(User).find();
    }

    public async updateUser(user: User): Promise<User> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(User).save(user);
    }

    public async find(id: string): Promise<User> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(User).findOne({ where: { id } });
    }

    public async findByEmail(email: string): Promise<User> {
        const connection = await this.connectionProvider();
        return connection.getRepository(User).findOne({ where: { email } });
    }

    public async delete(user: User): Promise<DeleteResult> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(User).delete(user);
    }
}
