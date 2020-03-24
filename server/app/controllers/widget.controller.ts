import * as express from 'express';
import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';

import TYPES from '../types';
import { IController } from './abstractController.controller';
import { throwIfNotAdmin } from '../utils/userVerification';
import { IWidget } from '../interfaces/IWidget.interface';
import { WidgetService } from '../services/widget.service';

@injectable()
export class WidgetController implements IController {
    @inject(TYPES.WidgetService)
    private widgetService: WidgetService;

    public setRoutes(app: express.Application): void {
        app.post('/api/widgets/create', this.createWidget);
        app.put('/api/widgets/update/:taskId', this.updateTask);
        app.delete('/api/widgets/delete/:taskId', this.deleteTask);
    }

    private createWidget = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newWidget: IWidget = {
            label: req.body.label,
            taskTypeId: req.body.taskTypeId,
            type: req.body.type,
            defaultEntryValue: req.body.defaultEntryValue,
            validationRegex: req.body.validationRegex,
        };
        this.widgetService.createWidget(newWidget)
            .then(widget => res.send(widget.proto()))
            .catch(next);
    }

    /**
     * Update a task from the taskId given in params
     * The visibility, completness and last modified time are updated
     */
    private updateTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedWidget: IWidget = {
            id: req.params.widgetId,
            entryField: isNullOrUndefined(req.body.entryField) ? undefined : req.body.entryField,
            label: isNullOrUndefined(req.body.label) ? undefined : req.body.label,
        };

        this.widgetService.updateWidget(updatedWidget)
            .then(task => res.send(task))
            .catch(next);
    }

    private deleteTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.widgetService.deleteWidget(req.params.taskId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
