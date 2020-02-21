import { Injectable } from '@angular/core';
import { Tool } from './../../models/tool.model';
import { Point } from './../../models/point.model';
import { PixelBucket } from './../../models/pixel-bucket.model';
import { PixelCrayon } from './../../models/pixel-crayon.model';
import { Eraser } from './../../models/eraser.model';
import { Hand } from './../../models/hand.model';
import { LassoEraser } from './../../models/lasso-eraser.model';
import { BioPicker } from './../../models/biopicker.model';
import { TOOL_NAMES } from './../../constants/tools';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToolboxService {

    selectedTool: BehaviorSubject<Tool>;

    listOfTools = [
        new Hand(TOOL_NAMES.PAN, '../assets/icons/hand.svg', 'Pan (P)'), // , toolServices),
        new PixelCrayon(TOOL_NAMES.BRUSH, '../assets/icons/brush.svg', 'Brush (B)'), // toolServices),
        // new Tool( '../assets/icons/lasso.png', 'Partial selection tool'),
        new PixelBucket(TOOL_NAMES.FILL_BRUSH, '../assets/icons/brush-fill.svg', 'Fill Brush (F)'), // toolServices),
        // new PointByPointBucket(TOOL_NAMES.FILL_VECTOR, '../assets/icons/vector.svg', 'Fill Vector (V)'),
        new Eraser(TOOL_NAMES.ERASER, '../assets/icons/eraser.svg', 'Eraser (E)'), // toolServices),
        new LassoEraser(TOOL_NAMES.LASSO_ERASER, '../assets/icons/lasso-eraser.svg', 'Lasso Eraser (G)'), // toolServices),
        new BioPicker(TOOL_NAMES.BIO_PICKER, '../assets/icons/picker.svg', 'Pick Biomarker (K)'), // toolServices),
        new Tool(TOOL_NAMES.UNDO, '../assets/icons/undo.svg',
                 navigator.platform.indexOf('Mac') === -1 ? 'Undo (Ctrl + Z)' : 'Undo (Cmd + Z)'), // toolServices),
        new Tool(TOOL_NAMES.REDO, '../assets/icons/redo.svg',
                 navigator.platform.indexOf('Mac') === -1 ? 'Redo (Ctrl + Y)' : 'Redo (Cmd + Y)') // , toolServices)
    ];

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

}
