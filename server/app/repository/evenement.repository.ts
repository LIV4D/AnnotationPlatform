import { injectable, inject } from 'inversify';
import { ConnectionProvider } from './connection.provider';
import { Evenement } from '../models/evenement.model';

@injectable()
export class EvenementRepository {
    private connectionProvider: ConnectionProvider;

    constructor(@inject('ConnectionProvider') connectionProvider: ConnectionProvider) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Evenement[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Evenement).find( { relations: ['image', 'user'] });
    }

    public async findByUser(userId: number): Promise<Evenement[]>  {
        const connection = await this.connectionProvider();
        const queryBuilder = await connection
                            .getRepository(Evenement)
                            .createQueryBuilder('evenement')
                            .where('evenement.user.id = :usrId', { usrId: userId });
        return await queryBuilder.getMany();
    }

    public async findByAnnotation(annotationId: number) {
        const connection = await this.connectionProvider();
        return await connection
                    .getRepository(Evenement)
                    .createQueryBuilder('evenement')
                    .where('evenement.annotation.id = annotID', { annotID: annotationId })
                    .getMany();
    }

    public async findByUserAndAnnotation(userId: number, annotationId: number): Promise<Evenement[]> {
        const connection = await this.connectionProvider();
        return await connection
                    .getRepository(Evenement)
                    .createQueryBuilder('evenement')
                    .where('evenement.user.id = usrId', { usrId: userId })
                    .andWhere('evenement.annotation.id = annotId', { annotId: annotationId })
                    .getMany();
    }
}
