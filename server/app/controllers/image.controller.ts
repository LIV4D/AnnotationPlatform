import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { ImageService } from '../services/image.service';
import { IGallery } from '../interfaces/gallery.interface';
import { IGalleryObject } from '../interfaces/galleryObject.interface';
import { throwIfNotAdmin } from '../utils/userVerification';
import { IImage } from '../../../common/common_interfaces/interfaces';

@injectable()
export class ImageController implements IController {
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    public setRoutes(app: express.Application): void {
    // new endpoints:
        app.post('/api/images/create',
        this.imageService.upload.single('image'),
        this.uploadImage);
        app.put('/api/images/update/:imageId',
        this.imageService.upload.single('image'),
        this.uploadImage);
        app.get('/api/images/:imageId/', this.getImage);
        app.delete('api/images/delete/:imageId', this.deleteImage);
        app.get('/api/images/list', this.getImages);
        app.get('/api/images/list/prototype', this.getImagesPrototype);
        app.get('api/images/getMetadata/:imageId', this.getImageMetadata);
        // sending image files:
        app.get('/api/images/getRaw/:imageId', this.getImageFile);
        app.get('api/images/getPreproc/:imageId', this.getPreprocessingFile);
        app.get('api/images/getThumbnail/:imageId', this.getThumbnailFile);
        app.get('/api/gallery/', this.getGallery);

    }

    private uploadImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in imageService.upload
        const newImage: IImage = {
            filename: req.body.filename,
            type: req.body.type,
            metadata: req.body.metadata,
        };
        if (req.params.imageId != null) {
            newImage.id = req.params.imageId as number;
            // Request is an update
            this.imageService.updateImage(newImage)
                .then(image => res.send(image))
                .catch(next);
        } else {
            this.imageService.uploadImage(newImage)
                .then(image => res.send(image))
                .catch(next);
        }
    }

    private getImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
            .then(image => res.send(image))
            .catch(next);
    }

    private getImageFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
            .then(image => {
                res.sendFile(path.resolve(image.path));
            })
            .catch(next);
    }

    private getPreprocessingFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
        .then(image => {
            res.sendFile(path.resolve(image.preprocessingPath));
        })
        .catch(next);
}
    private getThumbnailFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
        .then(image => {
            res.sendFile(path.resolve(image.thumbnail));
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
        throwIfNotAdmin(req);
        this.imageService.getImage(req.params.imageId)
        .then(image => {
            res.send(image.metadata);
        })
        .catch(next);
    }

    private deleteImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const imageId =  req.params.imageId as number;
        this.imageService.deleteImage(imageId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

    private getGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const arr: IGalleryObject[] = [];
        this.imageService.getImagesWithCount(req.query.sort, req.query.order, req.query.page, req.query.pageSize, req.query.filters)
            .then(imageViewModel => {
                imageViewModel.images.map(image => {

                    let dataUrl = '';
                    try {
                        const base64Image = fs.readFileSync(path.resolve(image.thumbnail), 'base64');
                        dataUrl = 'data:image/png;base64, ' + base64Image;
                        const item = {
                            id: image.id,
                            type: image.type,
                            thumbnail: dataUrl,
                            metadata: image.metadata,
                        };
                        arr.push(item);
                    } catch {
                        console.log(`Image non-trouvée: ${image.thumbnail}`);
                    }
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
