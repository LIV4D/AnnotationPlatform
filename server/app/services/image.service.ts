import 'reflect-metadata';
import * as config from 'config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import TYPES from '../types';
import { inject, injectable } from 'inversify';

import { Image, Metadata } from '../models/image.model';
import { IImage } from '../interfaces/IImage.interface';
import { ImageRepository } from '../repository/image.repository';
import { createError } from '../utils/error';
import { searchFileByName } from '../utils/filesystem';

@injectable()
export class ImageService {
    @inject(TYPES.ImageRepository)
    private imageRepository: ImageRepository;

    public async createImage(newImage: IImage, imageLocalPath: string, preprocessingPath: string = null) {
        // Setup new image entity
        let image = Image.fromInterface(newImage);

        // Add entity to image repository. After this line image has an id.
        image = await this.imageRepository.create(image);

        await this.updateImageFile(image.id, imageLocalPath, false);
        if (image.preprocessing) {
            await this.updatePreprocessingFile(image.id, preprocessingPath, false);
        }

        return image;
    }
/*
    public async uploadImage(newImage: IImage) {
        const image = new Image();
        image.type = newImage.type;
        image.metadata = newImage.metadata;
        return await this.imageRepository.create(image);
    } */

    public async updateImage(updatedImage: IImage) {
        const image = await this.getImage(updatedImage.id);
        image.update(updatedImage);
        return await this.imageRepository.update(image);
    }

    public async updateImageFile(imageId: number, imageLocalPath: string, checkDatabase = true) {
        if (checkDatabase) {
            const image = await this.imageRepository.find(imageId);
            if (image === null) {
                throw createError('Image does not exist, thus can\'t be modified.', 404);
            }
        }

        try {
            // Makes the directory for storing images and thumbnails if necessary.
            if (!fs.existsSync(config.get('storageFolders.image'))) {
                fs.mkdirSync(config.get('storageFolders.image'), { recursive : true } );
            }
            if (!fs.existsSync(config.get('storageFolders.thumbnail'))) {
                fs.mkdirSync(config.get('storageFolders.thumbnail'), { recursive : true } );
            }

            const destPath = path.join(config.get('storageFolders.image'), imageId.toString() + '.jpg');
            const thumbnailPath = path.join(config.get('storageFolders.thumbnail'), imageId.toString() + '.jpg');

            // Remove previous image and thumbnail if they exist
            if (fs.existsSync(destPath)) { fs.unlinkSync(destPath); }
            if (fs.existsSync(thumbnailPath)) { fs.unlinkSync(thumbnailPath); }

            // Convert image and save it to permanent folder
            await sharp(imageLocalPath).jpeg()
                                       .toFile(destPath);

            // Create and write thumbnail
            const thumbnail = await sharp(destPath).resize(127)
                                                         .jpeg()
                                                         .toBuffer();

            fs.writeFileSync(thumbnailPath, thumbnail);
        } catch (err) {
            throw createError('Error while uploading Image.\n' + err, 409);
        }
    }

    public async updatePreprocessingFile(imageId: number, preprocessingLocalPath: string, checkDatabase = true) {
        if (checkDatabase) {
            const image = await this.imageRepository.find(imageId);
            if (image === null) {
                throw createError ('Image does not exist, thus can\'t be modified.', 404);
            }
            if (!image.preprocessing) {
                image.preprocessing = true;
                this.imageRepository.update(image);
            }
        }
        try {
            // Makes the directory for storing preprocessed images if necessary.
            if (!fs.existsSync(config.get('storageFolders.preprocessing'))) {
                fs.mkdirSync(config.get('storageFolders.preprocessing'), { recursive : true } );
            }

            const destPath = path.join(config.get('storageFolders.preprocessing'), imageId.toString() + '.jpg');

             // Remove previous image and thumbnail if they exist
            if (fs.existsSync(destPath)) { fs.unlinkSync(destPath); }

            // Convert image and save it to permanent folder
            await sharp(preprocessingLocalPath).jpeg()
                                               .toFile(destPath);
        } catch (err) {
            throw createError('Error while uploading Preprocessing.\n' + err, 409);
        }
    }

    public async updateMetadata(imageId: number, metadata: Metadata) {
        const image = await this.imageRepository.find(imageId);
        for (const k of Object.keys(metadata)) {
            image.metadata[k] = metadata[k];
        }
        return await this.imageRepository.update(image);
    }

    public async replaceMetadata(imageId: number, metadata: Metadata) {
        const image = await this.imageRepository.find(imageId);
        image.metadata = metadata;
        return await this.imageRepository.update(image);
    }

    public async getImage(imageId: number) {
        const image = await this.imageRepository.find(imageId);
        if (!image) {
            throw createError('This image does not exist.', 404);
        }
        return image;
    }

    public async getImages(ids: number[]): Promise<Image[]> {
        const image = await this.imageRepository.findByIds(ids);
        if (!image) {
            throw createError('These images do not exist.', 404);
        }
        return image;
    }

    public async getImagePath(imageId: number, checkDatabase = true) {
        // let name: string;
        if (checkDatabase) {
            const image = await this.imageRepository.find(imageId);
            if (image == null) {
                throw createError('This image does not exist.', 404);
            } else {
                // return image;
            }
            // name = await image.metadata.filename as string;
            // console.log('image.name : ' + name);
        }

        const filename = this.getImagePathSync(imageId);
        // console.log('name : ' + name);

        // const filename = this.getImagePathSync(name);

        if (filename === null ) {
            if (checkDatabase) {
                // console.log('checking name val: ' + name);
                throw createError('The image file was not found.', 404);
            } else {
                throw createError('This image does not exist.', 404);
            }
        }
        return filename;
    }

    public getImagePathSync(imageId: number) {
        const prePath = config.get('storageFolders.image') as string;
        const filename = searchFileByName(imageId.toString(), prePath);

        // console.log('\nprePath : ' + prePath + ' and filename : ' + filename + '\n');

        // console.log(filename! == null ? path.join(prePath, 'filename') : null);

        // return filename! == null ? path.join(prePath, 'filename') : null;
        return path.join(prePath, filename);
    }

    public async getPrepocessingPath(imageId: number, checkDatabase = true) {
        if (checkDatabase) {
            const image = await this.imageRepository.find(imageId);
            if (image == null) {
                throw createError('This image does not exist.', 404);
            }
            if (!image.preprocessing) {
                throw createError('This image does not have preprocessing.', 404);
            }
        }

        const filename = this.getPreprocessingPathSync(imageId);
        if (filename === null) {
            if (checkDatabase) {
                throw createError('The preprocessed image file was not found.', 404);
            } else {
                throw createError('This preprocessed image does not exist.', 404);
            }
        }
        return filename;
    }

    public getPreprocessingPathSync(imageId: number) {
        const prePath = config.get('storageFolders.preprocessing') as string;
        const filename = searchFileByName(imageId.toString(), prePath);
        return filename! == null ? path.join(prePath, filename) : null;
    }

    public async getThumbnailPath(imageId: number, checkDatabase = true) {
        if (checkDatabase) {
            const image = await this.imageRepository.find(imageId);
            if (image == null) {
                throw createError('This image does not exist.', 404);
            }
        }

        const filename = this.getThumbnailPathSync(imageId);
        if (filename === null) {
            if (checkDatabase) {
                throw createError('The thumbnail image file was not found.', 404);
            } else {
                throw createError('This thumbnail image does not exist.', 404);
            }
        }
        return filename;
    }

    public getThumbnailPathSync(imageId: number) {
        const prePath = config.get('storageFolders.thumbnail') as string;
        return path.join(prePath, imageId.toString() + '.jpg');
    }

    public async getAllImages() {
        return await this.imageRepository.findAll();
    }

    public async getImagesWithCount(sort?: string, order?: string, page?: number, pageSize?: number, filters?: string): Promise<any> {
        // console.log('Server::ImageService::getImagesWithCount ');

        return await this.imageRepository.findAllWithCount(sort, order, page, pageSize, filters);
    }

    public async deleteImage(imageId: number) {
        const image = await this.imageRepository.findWithForeignKeys(imageId);
        if (image == null) {
            throw createError('This image does not exist.', 404);
        }
        if (image.annotations.length > 0) {
            throw createError('This image has revisions depending on it', 409);
        }

        // Delete image file
        const imgFile = this.getImagePathSync(image.id);
        if (fs.existsSync(imgFile)) {
            fs.unlinkSync(imgFile);
        }

        // Delete thumbnail file
        const thumbFile = this.getThumbnailPathSync(image.id);
        if (fs.existsSync(thumbFile)) { fs.unlinkSync(thumbFile); }

        if (image.preprocessing) {
            // Delete preprocessing file
            const preFile = this.getPreprocessingPathSync(image.id);
            if (fs.existsSync(preFile)) { fs.unlinkSync(preFile); }
        }

        this.imageRepository.delete(image);
    }
}
