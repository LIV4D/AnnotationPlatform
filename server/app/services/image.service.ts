import 'reflect-metadata';
import * as config from 'config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Image, Metadata } from '../models/image.model';
import { ImageRepository } from '../repository/image.repository';
import { createError } from '../utils/error';
import { searchFileByName } from '../utils/filesystem'
import { IImage } from '../../../common/interfaces';

@injectable()
export class ImageService {
    @inject(TYPES.ImageRepository)
    private imageRepository: ImageRepository;

    public async createImage(newImage: IImage, imageLocalPath: string, preprocessingPath:string=null) {
        // Setup new image entity
        let image = new Image();
        image.preprocessing = preprocessingPath!==null;
        image.metadata = newImage.metadata;
        image.type = newImage.type;
        
        console.log(newImage);

        // Add entity to image repository. After this line image has an id.
        image = await this.imageRepository.create(image);

        await this.updateImageFile(image.id, imageLocalPath, false);
        if(image.preprocessing)
            await this.updatePreprocessingFile(image.id, preprocessingPath, false);
        
        return image;
    }

    public async uploadImage(newImage: IImage) {
        const image = new Image();
        image.type = newImage.type;
        image.metadata = newImage.metadata;
        return await this.imageRepository.create(image);
    }

    public async updateImage(updatedImage: IImage) {
        const oldImage = await this.getImage(updatedImage.id);
        for (const key of Object.keys(updatedImage)) {
            if (updatedImage[key] != null) {
                oldImage[key] = updatedImage[key];
            }
        }
        return await this.imageRepository.update(oldImage);
    }

    public async updateImageFile(imageId: number, imageLocalPath: string, checkDatabase=true){
        if(checkDatabase){
            const image = await this.imageRepository.find(imageId);
            if(image===null)
                throw createError("Image does not exist, thus can't be modified.", 404);
        }

        try{
            const sourcePath = path.parse(imageLocalPath);
            const destPath = path.join(config.get('storageFolders.image'), imageId.toString()+sourcePath.ext);
            const thumbnailPath = path.join(config.get('storageFolders.thumbnail'), imageId.toString()+'.jpg');

            // Remove previous image and thumbnail if they exist
            if(fs.existsSync(destPath)) fs.unlinkSync(destPath);
            if(fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

            // Move image to permanent folder
            fs.renameSync(imageLocalPath, destPath);

            // Create and write thumbnail
            const thumbnail = await sharp(destPath).resize(127)
                                                         .jpeg()
                                                         .toBuffer();
            
            fs.writeFileSync(thumbnailPath, thumbnail);
        }catch(err){
            throw createError('Error while uploading Image.\n'+err, 409);
        }
    }

    public async updatePreprocessingFile(imageId: number, preprocessingLocalPath: string, checkDatabase=true){
        if(checkDatabase){
            const image = await this.imageRepository.find(imageId);
            if(image===null)
                throw createError("Image does not exist, thus can't be modified.", 404);
            if(!image.preprocessing){
                image.preprocessing = true;
                this.imageRepository.update(image);
            }
        }
        try{
            const sourcePath = path.parse(preprocessingLocalPath);
            const destPath = path.join(config.get('storageFolders.preprocessing'), imageId.toString()+'.'+sourcePath.ext);
            
             // Remove previous image and thumbnail if they exist
             if(fs.existsSync(destPath)) fs.unlinkSync(destPath);

            // Move preprocessing to permanent folder
            fs.renameSync(preprocessingLocalPath, destPath);
        }catch(err){
            throw createError('Error while uploading Preprocessing.\n'+err, 409);
        }
    }

    public async updateMetadata(imageId: number, metadata: Metadata){
        const image = await this.imageRepository.find(imageId);
        for(const k of Object.keys(metadata)){
            image.metadata[k] = metadata[k];
        }
        return await this.imageRepository.update(image);
    }

    public async replaceMetadata(imageId: number, metadata: Metadata){
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

    public async getImagePath(imageId: number, checkDatabase=true){
        if(checkDatabase){
            const image = await this.imageRepository.find(imageId);
            if (image == null) 
                throw createError('This image does not exist.', 404);
        }

        const filename = this.getImagePathSync(imageId);
        if(filename===null){
            if(checkDatabase)
                throw createError('The image file was not found.', 404);
            else
                throw createError('This image does not exist.', 404);
        }
        return filename;
    }

    public getImagePathSync(imageId: number){
        const prePath = config.get('storageFolders.image') as string;
        const filename = searchFileByName(imageId.toString(), prePath);
        return filename!==null ? path.join(prePath, filename) : null;
    }

    public async getPrepocessingPath(imageId: number, checkDatabase=true){
        if(checkDatabase){
            const image = await this.imageRepository.find(imageId);
            if (image == null) 
                throw createError('This image does not exist.', 404);
            if (!image.preprocessing)
                throw createError('This image does not have preprocessing.', 404);
        }

        const filename = this.getPreprocessingPathSync(imageId);
        if(filename===null){
            if(checkDatabase)
                throw createError('The preprocessed image file was not found.', 404);
            else
                throw createError('This preprocessed image does not exist.', 404);
        }
        return filename;
    }

    public getPreprocessingPathSync(imageId: number){
        const prePath = config.get('storageFolders.preprocessing') as string;
        const filename = searchFileByName(imageId.toString(), prePath);
        return filename!==null ? path.join(prePath, filename) : null;
    }

    public async getThumbnailPath(imageId: number, checkDatabase=true){
        if(checkDatabase){
            const image = await this.imageRepository.find(imageId);
            if (image == null) 
                throw createError('This image does not exist.', 404);
        }

        const filename = this.getThumbnailPathSync(imageId);
        if(filename===null){
            if(checkDatabase)
                throw createError('The thumbnail image file was not found.', 404);
            else
                throw createError('This thumbnail image does not exist.', 404);
        }
        return filename;
    }

    public getThumbnailPathSync(imageId: number){
        const prePath = config.get('storageFolders.thumbnail') as string;
        return path.join(prePath, imageId.toString()+".jpg");
    }

    public async getImages() {
        return await this.imageRepository.findAll();
    }

    public async getImagesWithCount(sort?: string, order?: string, page?: number, pageSize?: number, filters?: string) {
        return await this.imageRepository.findAllWithCount(sort, order, page, pageSize, filters);
    }

    public async deleteImage(imageId: number) {
        const image = await this.imageRepository.findWithForeignKeys(imageId);
        if (image == null) 
            throw createError('This image does not exist.', 404);
        if (image.annotations.length > 0)
            throw createError('This image has revisions depending on it', 409);
        if (image.tasks.length > 0)
            throw createError('This image has tasks depending on it', 409);

        // Delete image file
        const imgFile = this.getImagePathSync(image.id);
        if (fs.existsSync(imgFile)){
            fs.unlinkSync(imgFile);
        } 

        // Delete thumbnail file
        const thumbFile = this.getThumbnailPathSync(image.id);
        if (fs.existsSync(thumbFile)) fs.unlinkSync(thumbFile);

        if (image.preprocessing) {
            // Delete preprocessing file
            const preFile = this.getPreprocessingPathSync(image.id);
            if (fs.existsSync(preFile)) fs.unlinkSync(preFile);
        }
        
        this.imageRepository.delete(image);
    }
}
