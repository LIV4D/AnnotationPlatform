import * as config from 'config';
import * as express from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { ImageService } from '../services/image.service';
import { IGallery } from '../interfaces/gallery.interface';
import { IGalleryObject } from '../interfaces/galleryObject.interface';
import { throwIfNotAdmin } from '../utils/userVerification';
import { IImage } from '../../../common/interfaces';
import { isAdmin } from '../utils/userVerification';
import { createError } from '../utils/error';

@injectable()
export class ImageController implements IController {
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    private storage = multer.diskStorage({
        destination: (req:express.Request, file, callback) => {
            // Check user permission before upload
            if (isAdmin(req) === false) {
                callback(createError('User is not admin.', 401), null);
            }

            // Uploaded images are temporary stored in folder config.fileStorage.tmp
            callback(null, config.get('fileStorage.tmp'));
        },
    });
    public upload = multer({ storage: this.storage });

    public setRoutes(app: express.Application): void {
        // new endpoints:
        app.post('/api/images/create',
                    this.upload.fields([{name: 'image', maxCount: 1}, {name: 'preprocessing', maxCount: 1}]),
                    this.createImage);
        app.put('/api/images/updateFile/:imageId',
                    this.upload.single('image'),
                    this.uploadImage);
        app.put('/api/images/updatePreprocessing/:imageId',
                    this.upload.single('preprocessing'),
                    this.uploadPreprocessing);
        app.put('/api/images/update/:imageId', this.updateImage);
        app.get('/api/images/:imageId/', this.getImage);
        app.delete('api/images/delete/:imageId', this.deleteImage);
        app.get('/api/images/list', this.getImages);
        app.get('/api/images/list/prototype', this.getImagesPrototype);
        app.get('/api/images/metadata/:imageId', this.getImageMetadata);
        // sending image files:
        app.get('/api/images/raw/:imageId', this.getImageFile);
        app.get('/api/images/preproc/:imageId', this.getPreprocessingFile);
        app.get('/api/images/thumbnail/:imageId', this.getThumbnailFile);
        app.get('/api/images/gallery', this.getGallery);
    }

    private createImage =  (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const newImage: IImage = {
            type: req.body.type,
            metadata: req.body.metadata,
        };

        const imageFile = req.files['image'];
        newImage.metadata['filename'] = imageFile.originalname;

        const preprocessingFile = req.files['preprocessing'];
        let preprocessingPath = null;
        if(preprocessingFile !== undefined){
            newImage.metadata['preprocessingFilename'] = preprocessingFile.originalname;
            preprocessingPath = preprocessingFile.path;
        }

        this.imageService.createImage(newImage, imageFile.path, preprocessingPath)
            .then(image => res.send(image))
            .catch(next);
    }

    private uploadImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const imageId = req.params.imageId;
        this.imageService.updateImageFile(imageId, req.file.path)    
            .then(() => this.imageService.updateMetadata(imageId, {filename: req.file.originalname})
                            .then(image => res.send(image)))
                            .catch(next)
            .catch(next);
    }

    private uploadPreprocessing = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const imageId = req.params.imageId;
        this.imageService.updatePreprocessingFile(imageId, req.file.path)    
            .then(() => this.imageService.updateMetadata(imageId, {preprocessingFilename: req.file.originalname})
                            .then(image => res.send(image)))
                            .catch(next)
            .catch(next);
    }

    private updateImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newImage: IImage = {
            type: req.body.type,
            metadata: req.body.metadata,
        };
        newImage.id = req.params.imageId as number;
        this.imageService.updateImage(newImage)
            .then(image => res.send(image))
            .catch(next);
    }

    private getImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
            .then(image => res.send(image))
            .catch(next);
    }

    private getImageFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImagePath(req.params.imageId)
            .then(imgPath => {
                res.sendFile(path.resolve(imgPath));
            })
            .catch(next);
    }

    private getPreprocessingFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getPrepocessingPath(req.params.imageId)
            .then(prePath => {
                res.sendFile(path.resolve(prePath));
            })
            .catch(next);
    }
    private getThumbnailFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getThumbnailPath(req.params.imageId)
            .then(thumbPath => {
                res.sendFile(path.resolve(thumbPath));
            })
            .catch(next);
    }
    private getImages = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.imageService.getImages()
            .then(images => {
                res.send(images);
            })
            .catch(next);
    }

    private getImagesPrototype = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.imageService.getImages()
            .then(images => {
                const imagesPrototype = images.map(i => i.prototype());
                res.send(imagesPrototype);
            })
            .catch(next);
    }

    private getImageMetadata = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin(req);
        this.imageService.getImage(req.params.imageId)
            .then(image => {
                res.send(image.metadata);
            })
            .catch(next);
    }

    private deleteImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const imageId = req.params.imageId as number;
        this.imageService.deleteImage(imageId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

    private getGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const arr: IGalleryObject[] = [];
        this.imageService.getImagesWithCount(req.query.sort, req.query.order, req.query.page, req.query.pageSize, req.query.filters)
            .then(imageViewModel => {
                imageViewModel.images.map(image => {
                    const  item = {
                        id: image.id,
                        type: image.type,
                        metadata: image.metadata,
                    } as IGalleryObject;
                    
                    // Read thumbnail
                    try {
                        const thumbPath = path.resolve(this.imageService.getThumbnailPathSync(image.id));
                        item.thumbnail = 'data:image/jpg;base64, ' + fs.readFileSync(thumbPath, 'base64');
                    } catch {
                        console.log(`Thumbnail for image `+image.id.toString()+` not found.`);
                    }
                    arr.push(item);
                });
                const gallery: IGallery = {
                    objects: arr,
                    objectCount: imageViewModel.count,
                };
                res.send(gallery);
            })
            .catch(next);
    }
}
