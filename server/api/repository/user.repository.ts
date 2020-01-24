import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { User } from '../models/user.model';
import { DeleteResult } from 'typeorm';
import { SubmissionEvent } from '../models/submissionEvent.model';

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

    public async create(user: User): Promise<User> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(User).save(user);
    }
    // TODO: delete this method
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

    public async getEvents(id: string): Promise<SubmissionEvent[]> {
        const connection = await this.connectionProvider();
        return await connection
                            .getRepository(SubmissionEvent)
                            .createQueryBuilder('evenement')
                            .where('evenement.user.id = :userId', { userId: id })
                            .getMany();

    }

    public async getLastEvent(id: string): Promise<SubmissionEvent> {
        const connection = await this.connectionProvider();
        const queryBuilder = await connection
                            .getRepository(SubmissionEvent);
        // tslint:disable: no-trailing-whitespace
        const lastEvent =  await queryBuilder
        .query(`Select * from public.evenement as e1 INNER JOIN 
        (SELECT userId, MAX(timestamp) as timestamp from public.evenement group by userId) 
        as e2 ON e1.timestamp = e2.timestamp where userId = ${id}`);

        return lastEvent as SubmissionEvent;
    }
}
