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
        return await this.connectionProvider().then(connection =>
            connection.getRepository(User).find());
    }

    public async create(user: User): Promise<User> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(User).save(user));
    }

    public async update(user: User): Promise<User> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(User).save(user));
    }

    public async find(id: string): Promise<User> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(User).findOne({ select: [ 'id', 'name', 'email', 'salt', 'hash', 'role' ], where: { id } }));
    }

    public async findByEmail(email: string): Promise<User> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(User).findOne({ select: [ 'id', 'name', 'email', 'salt', 'hash', 'role' ], where: { email } }));
    }

    public async delete(user: User): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(User).delete(user));
    }
}
