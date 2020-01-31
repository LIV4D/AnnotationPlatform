import { injectable, inject } from 'inversify';
import { ConnectionProvider } from './connection.provider';
import { SubmissionEvent } from '../models/submissionEvent.model';

@injectable()
export class SubmissionEventRepository {
    private connectionProvider: ConnectionProvider;

    constructor(@inject('ConnectionProvider') connectionProvider: ConnectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public async create(evenement: SubmissionEvent): Promise<SubmissionEvent> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(SubmissionEvent).save(evenement);
    }

    public async findAll(): Promise<SubmissionEvent[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(SubmissionEvent).find( { relations: ['image', 'user'] });
    }

    public async findByUser(userId: number): Promise<SubmissionEvent[]>  {
        const connection = await this.connectionProvider();
        const queryBuilder = await connection
                            .getRepository(SubmissionEvent)
                            .createQueryBuilder('evenement')
                            .where('evenement.user.id = :usrId', { usrId: userId });
        return await queryBuilder.getMany();
    }

    public async findByAnnotation(annotationId: number) {
        const connection = await this.connectionProvider();
        return await connection
                    .getRepository(SubmissionEvent)
                    .createQueryBuilder('evenement')
                    .where('evenement.annotation.id = :annotID', { annotID: annotationId })
                    .getMany();
    }

    public async findByUserAndAnnotation(userId: number, annotationId: number): Promise<SubmissionEvent[]> {
        const connection = await this.connectionProvider();
        return await connection
                    .getRepository(SubmissionEvent)
                    .createQueryBuilder('evenement')
                    .where('evenement.user.id = :usrId', { usrId: userId })
                    .andWhere('evenement.annotation.id = :annotId', { annotId: annotationId })
                    .getMany();
    }

    public async findByFilter(filter: {userId?:number, imageId?:number}): Promise<SubmissionEvent[]>{
        let whereConditions = [];
        if(filter.imageId!==undefined) 
            whereConditions.push('evenement.annotation.image.id = '+filter.imageId.toString());
        if(filter.userId!==undefined) 
            whereConditions.push('evenement.user.id = '+filter.userId.toString());

        const connection = await this.connectionProvider();
        return await connection
                     .getRepository(SubmissionEvent)
                     .createQueryBuilder('evenement')
                     .where(whereConditions.join(" AND "))
                     .getMany()
    }

    public async find(submitId: number): Promise<SubmissionEvent> {
        const connection = await this.connectionProvider();
        return await connection
                    .getRepository(SubmissionEvent)
                    .findOne(submitId);
    }
    public async findByIds(ids: number[]): Promise<SubmissionEvent[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(SubmissionEvent).findByIds(ids);
    }
}
