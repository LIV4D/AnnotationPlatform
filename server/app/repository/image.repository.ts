import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Image } from '../models/image.model';
import { ImageViewModel } from '../models/image.viewmodel';
import { DeleteResult } from 'typeorm';

@injectable()
export class ImageRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Image[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).find());
    }

    public async findAllWithCount(sort?: string, order?: string, page?: number, pageSize?: number, filters?: string):
    Promise<ImageViewModel> {
        if (!sort) {
            sort = 'image.id';
        }
        if (!order) {
            order = 'ASC';
        }
        if (!Number.isInteger(Number(page))) {
            page = 0;
        }
        if (!Number.isInteger(Number(pageSize))) {
            pageSize = 0;
        }
        return this.connectionProvider().then(connection => {
            const qb = connection
            .getRepository(Image)
            .createQueryBuilder('image')
            .leftJoinAndSelect('image.imageType', 'imageType')
            .skip(page * pageSize)
            .take(pageSize);
            // TypeORM doesn't accept a string for the order but only 'ASC' or 'DESC'
            if (order.toUpperCase() === 'ASC') {
                qb.orderBy(sort, 'ASC');
            } else {
                qb.orderBy(sort, 'DESC');
            }
            // Iterate through filters and add where conditions
            if (filters) {
                const filterArray = JSON.parse(filters);
                let count = 0;
                for (const key of Object.keys(filterArray)) {
                    let imageColumn = '';
                    // imageColumns are hard coded to avoid SQL injection
                    const imageColumns = ['imageType.name', 'eye', 'hospital', 'patient', 'visit', 'code'];
                    if (imageColumns.indexOf(key) > -1) {
                        imageColumn = key;
                    }

                    if (imageColumn !== '' && filterArray[key] && count === 0) {
                        qb.where(`LOWER(${imageColumn}) like LOWER(:filter)`, { filter : `%${filterArray[key]}%` });
                        count++;
                    } else if (imageColumn !== '' && filterArray[key]) {
                        const filterName = `filter${count}`;
                        const filterNameObj = {};
                        filterNameObj[filterName] = `%${filterArray[key]}%`;
                        qb.andWhere(`LOWER(${imageColumn}) like LOWER(:${filterName})`, filterNameObj);
                        count++;
                    }
                }
            }
            return qb.getManyAndCount();
        })
        .then(res => {
            const vm: ImageViewModel = {
                images: res[0],
                count: res[1],
            };
            return vm;
        });

    }

    public async create(image: Image): Promise<Image> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).save(image));
    }

    public async update(image: Image): Promise<Image> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).save(image));
    }

    public async find(id: number): Promise<Image> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).findOne({ where: { id }, relations : ['imageType'] }));
    }

    public async findByPath(path: string): Promise<Image> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).findOne({ where: { path } }));
    }

    public async findWithForeignKeys(id: number): Promise<Image> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).findOne({ where: { id }, relations: ['preprocessings', 'revisions', 'tasks'] }));
    }

    public async delete(image: Image): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Image).delete(image));
    }
}
