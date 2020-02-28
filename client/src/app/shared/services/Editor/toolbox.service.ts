import { Injectable } from '@angular/core';

import { Tool } from './../../models/tool.model';
import { Point } from './../../models/point.model';
import { PixelBucket } from './../../models/pixel-bucket.model';
import { PixelCrayon } from './../../models/pixel-crayon.model';
import { Eraser } from './../../models/eraser.model';
import { Hand } from './../../models/hand.model';
import { LassoEraser } from './../../models/lasso-eraser.model';
import { BioPicker } from './../../models/biopicker.model';
import { ToolServices } from './../../models/tool-services.model';

import { TOOL_NAMES } from './../../constants/tools';

import { BehaviorSubject } from 'rxjs';

import { LayersService } from './layers.service';
import { EditorService } from './editor.service';


@Injectable({
    providedIn: 'root'
})
export class ToolboxService {

    selectedTool: BehaviorSubject<Tool>;
    listOfTools: Tool[];

    constructor(private layersService: LayersService, private editorService: EditorService) {

        // const toolServices: ToolServices = {
        //     layersService: this.layersService,
        //     editorService: this.editorService
        // };

        this.listOfTools = [
            new Hand(TOOL_NAMES.PAN, '../assets/icons/hand.svg', 'Pan (P)', editorService, layersService),
            new PixelCrayon(TOOL_NAMES.BRUSH, '../assets/icons/brush.svg', 'Brush (B)', editorService, layersService),
            // new Tool( '../assets/icons/lasso.png', 'Partial selection tool'),
            new PixelBucket(TOOL_NAMES.FILL_BRUSH, '../assets/icons/brush-fill.svg', 'Fill Brush (F)', editorService, layersService),
            // new PointByPointBucket(TOOL_NAMES.FILL_VECTOR, '../assets/icons/vector.svg', 'Fill Vector (V)'),
            new Eraser(TOOL_NAMES.ERASER, '../assets/icons/eraser.svg', 'Eraser (E)', editorService, layersService),
            new LassoEraser(TOOL_NAMES.LASSO_ERASER, '../assets/icons/lasso-eraser.svg', 'Lasso Eraser (G)', editorService, layersService),
            new BioPicker(TOOL_NAMES.BIO_PICKER, '../assets/icons/picker.svg', 'Pick Biomarker (K)', editorService, layersService),
            new Tool(TOOL_NAMES.UNDO, '../assets/icons/undo.svg',
                     navigator.platform.indexOf('Mac') === -1 ? 'Undo (Ctrl + Z)' : 'Undo (Cmd + Z)', editorService, layersService),
            new Tool(TOOL_NAMES.REDO, '../assets/icons/redo.svg',
                     navigator.platform.indexOf('Mac') === -1 ? 'Redo (Ctrl + Y)' : 'Redo (Cmd + Y)', editorService, layersService)
        ];

        this.selectedTool = new BehaviorSubject<Tool>(this.listOfTools[0]);
    }

    setSelectedTool(newSelectedTool: string): void {
        const newSelectedToolTool: Tool = this.listOfTools.filter((tool) => tool.name === newSelectedTool)[0];
        this.selectedTool.next(newSelectedToolTool);
    }

    setUndo() {
        // this.layersService.undo();
    }

    setRedo() {
        // this.layersService.redo();
    }

    setUndoRedoState(): void {
        // if (this.layersService.undoStack.getLength() === 0) {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
        // } else {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = false;
        // }

        // if (this.layersService.redoStack.getLength() === 0) {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
        // } else {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = false;
        // }
    }

    public onCursorDown(point: Point): void {
        // if (this.imageBorderService.showBorders && this.selectedTool.getValue().name !== TOOL_NAMES.PAN) {
        //     // this.imageBorderService.showBorders = false;
        //     // this.layersService.toggleBorders(false);
        // }
        this.selectedTool.getValue().onCursorDown(point);
        this.setUndoRedoState();
    }

    public onCursorUp(): void {
        this.selectedTool.getValue().onCursorUp();
    }

    public onCursorOut(point: Point): void {
        this.selectedTool.getValue().onCursorOut(point);
    }

    public onCursorMove(point: Point): void {
        this.selectedTool.getValue().onCursorMove(point);
    }

    public onCancel(): void {
        this.selectedTool.getValue().onCancel();
        this.setUndoRedoState();
    }

}
