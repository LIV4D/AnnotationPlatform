import { injectable, inject } from 'inversify';
import { ConnectionProvider } from './connection.provider';
import { SubmissionEvent } from '../models/submissionEvent.model';

@injectable()
export class SubmissionEventRepository {
    private connectionProvider: ConnectionProvider;

    constructor(@inject('ConnectionProvider') connectionProvider: ConnectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public async create(event: SubmissionEvent): Promise<SubmissionEvent> {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        event = await repository.save(event);
        return await repository.findOne(event.id); // Reload foreign entity
    }

    public async findAll(): Promise<SubmissionEvent[]> {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository.find( { relations: ['image', 'user'] });
    }

    public async findByUser(userId: number): Promise<SubmissionEvent[]>  {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository
                      .createQueryBuilder('event')
                      .where('event.user.id = :usrId', { usrId: userId })
                      .getMany();
    }

    public async findByAnnotation(annotationId: number) {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository
                    .createQueryBuilder('event')
                    .where('event.annotation.id = :annotID', { annotID: annotationId })
                    .getMany();
    }

    public async findByUserAndAnnotation(userId: number, annotationId: number): Promise<SubmissionEvent[]> {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository
                    .createQueryBuilder('event')
                    .where('event.user.id = :usrId', { usrId: userId })
                    .andWhere('event.annotation.id = :annotId', { annotId: annotationId })
                    .getMany();
    }

    public async findByFilter(filter: {userId?:number, imageId?:number}): Promise<SubmissionEvent[]>{
        const whereConditions = [];
        if(filter.imageId!==undefined) {
            whereConditions.push('event.annotation.image.id = '+filter.imageId.toString());
        }
        if(filter.userId!==undefined) {
            whereConditions.push('event.user.id = '+filter.userId.toString());
        }

        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository
                    .createQueryBuilder('event')
                    .leftJoinAndSelect('event.user', 'user')
                    .where(whereConditions.join(' AND '))
                    .getMany()
    }

    public async find(submitId: number): Promise<SubmissionEvent> {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository.findOne(submitId);
    }
    public async findByIds(ids: number[]): Promise<SubmissionEvent[]> {
        const repository =  (await this.connectionProvider()).getRepository(SubmissionEvent);
        return await repository.findByIds(ids);
    }
}
