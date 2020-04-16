import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Image } from '../models/image.model';
import { DeleteResult, SelectQueryBuilder } from 'typeorm';

@injectable()
export class ImageRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    /**
     * Retrieves all the images within the database.
     * @returns the array of all the images
     */
    public async findAll(): Promise<Image[]> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.find();
    }

    /**
     * Gets all the images properly sorted and filtered following the specified parameters.
     * @param sort the images will be sorted relative to this field.
     * @param order the images are sorted following this order (either 'ASC' or 'DESC').
     * @param page the amount of pages within the gallery that need to be filled, ignored if 0.
     * @param pageSize the size of a page within the galley, ignore if 0.
     * @param filters the additional filters applied to the images.
     * @returns the images after having been manipulated.
     */
    // tslint:disable-next-line: max-line-length
    public async findAllWithCount(sort: string = 'image.id', order: string = 'ASC', page: number = 0, pageSize: number = 0, filters?: string): Promise<any> {
        const repository =  (await this.connectionProvider()).getRepository(Image);

        const queryBuilder = repository
            .createQueryBuilder('image')
            .skip(page * pageSize)
            .take(pageSize);
        if (order.toUpperCase() === 'ASC') {
            queryBuilder.orderBy(sort, 'ASC');
        } else {
            queryBuilder.orderBy(sort, 'DESC');
        }
        const queryResult = await this.filterImages(queryBuilder, filters);

        return queryResult;
    }

    /**
     * Retrieves a fitered list of images.
     * @param queryBuilder the query builder for a select of an image
     * @param filters the different filters to put into the query.
     * @returns the filtered list of images within the database.
     */
    private async filterImages(queryBuilder: SelectQueryBuilder<Image>, filters?: string): Promise<[Image[], number]> {
        if (filters) {
            const filterJson = JSON.parse(filters);
            let count = 0;
            for (const key of Object.keys(filterJson)) {
                // imageColumns are hard coded to avoid SQL injection
                const imageColumns = ['type', 'metadata'];
                // TODO: add filtering of metada JSON
                const imageColumnKey = imageColumns.indexOf(key) > -1 ? key : '';

                if (imageColumnKey !== '' && filterJson[key] && count === 0) {
                    queryBuilder.where(`LOWER(${imageColumnKey}) like LOWER(:filter)`, { filter: `%${filterJson[key]}%` });
                    count++;
                } else if (imageColumnKey !== '' && filterJson[key]) {
                    const filterName = `filter${count}`;
                    const filterNameObj = {};
                    filterNameObj[filterName] = `%${filterJson[key]}%`;
                    queryBuilder.andWhere(`LOWER(${imageColumnKey}) like LOWER(:${filterName})`, filterNameObj);
                    count++;
                }
            }
        }
        return queryBuilder.getManyAndCount();
    }

    /**
     * Creates an image within the database.
     * @param image the model for the image to be created in the databse.
     * @returns the created image, will return null if the image was not created properly
     */
    public async create(image: Image): Promise<Image> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.save(image);
    }

    public async update(image: Image): Promise<Image> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.save(image);
    }

    public async find(id: number): Promise<Image> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.findOne(id);
    }

    public async findByIds(ids: number[]): Promise<Image[]> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.findByIds(ids);
    }

    public async findByPath(path: string): Promise<Image> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.findOne({ where: { path } });
    }

    public async findWithForeignKeys(id: number): Promise<Image> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.findOne({ where: { id }, relations: ['annotations'] });
    }

    public async delete(image: Image): Promise<DeleteResult> {
        const repository =  (await this.connectionProvider()).getRepository(Image);
        return await repository.delete(image);
    }
}
