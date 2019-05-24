import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Annotation } from '../models/annotation.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class AnnotationRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Annotation[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Annotation).find({ relations: ['image'] });
    }

    public async create(annotation: Annotation): Promise<Annotation> {
        const connection =  await this.connectionProvider();
        return await connection.getRepository(Annotation).save(annotation);
    }

    public async update(annotation: Annotation): Promise<Annotation> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Annotation).save(annotation);
    }

    public async find(id: number): Promise<Annotation> {
        const connection =  await this.connectionProvider();
        return await connection.getRepository(Annotation).findOne({ where: { id }, relations : ['image'] });
    }

    public async findForImage(imageId: number): Promise<Annotation> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Annotation).findOne({ image: { id: imageId } });
    }

    public async delete(annotation: Annotation): Promise<DeleteResult> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Annotation).delete(annotation);
    }
}
