import { inject, injectable } from 'inversify';

import TYPES from '../types';
import { createError } from '../utils/error';
import { WidgetRepository } from '../repository/widget.repository';
import { IWidget } from '../interfaces/IWidget.interface';
import { Widget } from '../models/widget.model';

@injectable()
export class WidgetService {
    @inject(TYPES.WidgetRepository)
    private widgetRepository: WidgetRepository;

    public async createWidget(newWidget: IWidget): Promise<Widget> {
        const widget = Widget.fromInterface(newWidget);
        return await this.widgetRepository.create(widget);
    }

    public async getWidget(id: number): Promise<Widget> {
        const widget = await this.widgetRepository.find(id);
        if (widget == null) {
            throw createError('This task does not exist.', 404);
        }
        return widget;
    }

    public async updateWidget(updatedWidget: IWidget) {
        const oldWidget = await this.getWidget(updatedWidget.id);
        oldWidget.update(updatedWidget);
        return await this.widgetRepository.create(oldWidget);
    }

    public async deleteWidget(id: number) {
        const widget = await this.widgetRepository.find(id);
        if (widget == null) {
            throw createError('This widget does not exist.', 404);
        }
        return await this.widgetRepository.delete(widget);
    }
}
