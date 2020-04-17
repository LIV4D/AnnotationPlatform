import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { EditorService } from './../shared/services/Editor/editor.service';
import { LoadingService } from './../shared/services/Editor/Data-Persistence/loading.service';
import { CanvasDimensionService } from './../shared/services/Editor/canvas-dimension.service';
import { BiomarkerService } from './../shared/services/Editor/biomarker.service';
import { BiomarkerVisibilityService } from './../shared/services/Editor/biomarker-visibility.service';
import { Point } from './../shared/services/Editor/Tools/point.service';
import { ToolboxService } from './../shared/services/Editor/toolbox.service';
import { TOOL_NAMES } from './../shared/constants/tools';
import { Image } from '../shared/models/serverModels/image.model';
import { LayersService } from '../shared/services/Editor/layers.service';
import { ZoomService } from '../shared/services/Editor/zoom.service';

@Injectable({
  providedIn:'root',
})

export class EditorFacadeService {

  constructor(private editorService: EditorService,
              private toolboxService: ToolboxService,
              public canvasDimensionService: CanvasDimensionService,
              private biomarkerService: BiomarkerService,
              public layersService: LayersService,
              private loadingService: LoadingService,
              private zoomService: ZoomService,
              private biomarkerVisibilityService: BiomarkerVisibilityService) { }

  init(svgLoaded: EventEmitter<any>, viewPort: ElementRef, svgBox: ElementRef): void {
    this.editorService.init(svgLoaded, viewPort, svgBox);
  }

  zoom(delta: number, position: Point = null): void {
    this.canvasDimensionService.zoom(delta, position);
  }

  get zoomFactor(): number {
    return this.zoomService.zoomFactor;
  }

  get firstPoint() {
    return this.layersService.firstPoint;
  }

  get commentHasBeenLoaded() {
    return this.loadingService.commentsHasBeenLoaded;
  }

  get backgroundCanvas() {
    return this.canvasDimensionService.backgroundCanvas;
  }

  get scaleX() {
    return this.canvasDimensionService.scaleX;
  }

  get panTool() {
    return this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
  }

  get undoTool() {
    return this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0];
  }

  get redoTool() {
    return this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0];
  }

  setPanToolByString(tool: string) {
    this.toolboxService.setSelectedTool(tool);
  }

  get menuState() {
    return this.editorService.menuState;
  }

  set menuState(menuState) {
    this.editorService.menuState = menuState;
  }

  public onCursorMoveToolbox(point: Point): void {
    this.toolboxService.onCursorMove(point);
  }

  public onCursorDownToolbox(point: Point): void {
    this.toolboxService.onCursorDown(point);
  }

  public onCursorUpToolbox(): void {
    this.toolboxService.onCursorUp();
  }

  public onCursorOutToolbox(point: Point): void {
    this.toolboxService.onCursorOut(point);
  }

  public resize() {
    this.canvasDimensionService.resize();
  }

  public load(imageId: string) {
    this.loadingService.loadMetadata(imageId);
  }

  set imageLoaded(boolValue: boolean) {

    this.loadingService.setImageLoaded(boolValue);
  }

  get imageLoaded(){
    return this.loadingService.getImageLoaded();
  }

  // TODO: Verify the path of this and its type
  set imageServer(imageServer: Image) {

    this.loadingService.setImageServer(imageServer);
  }

  set imageLocal(imageLocal: HTMLImageElement) {

    this.loadingService.setImageLocal(imageLocal);
  }

  set imageId(imageId: string) {

    this.loadingService.getImageId
  }

  loadImageFromServer(imageId: string) {
    this.loadingService.loadImageFromServer(imageId);
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    return this.canvasDimensionService.getMousePositionInCanvasSpace(clientPosition);
  }

  //loadSVGLocal(event: any) {
  //  this.editorService.loadSVGLocal(event);
  //}

  get commentBoxVisible() {
    // return this.editorService.commentBoxVisible;
    return undefined;
  }

  // Biomarkers

  setFocusBiomarker(item: any) {
    this.biomarkerVisibilityService.setFocusBiomarker(item);
  }

  get biomarkersCurrentElement(){
    return this.biomarkerService.currentElement;
  }

  getOriginalImageRatio(): number {
    return this.canvasDimensionService.originalImageRatio();
  }

  moveCenter(percentX: number, percentY: number) {
    this.canvasDimensionService.moveCenter(percentX, percentY);
  }
}
