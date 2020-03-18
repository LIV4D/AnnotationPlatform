import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { EditorService } from './../shared/services/Editor/editor.service';
import { BiomarkerService } from './../shared/services/Editor/biomarker.service';
import { Point } from './../shared/services/Editor/Tools/point.service';
import { ToolboxService } from './../shared/services/Editor/toolbox.service';
import { TOOL_NAMES } from './../shared/constants/tools';
import { Image } from '../shared/models/image.model';

@Injectable()
export class EditorFacadeService {

  constructor(private editorService: EditorService, private toolboxService: ToolboxService, private biomarkerService: BiomarkerService) { }

  init(svgLoaded: EventEmitter<any>, viewPort: ElementRef, svgBox: ElementRef): void {
    console.log('EditorFacadeService::init()');
    console.log('c% viewPort.nativeElement' + viewPort.nativeElement, 'color:black; background:yellow;');

    this.editorService.init(svgLoaded, viewPort, svgBox);
  }

  zoom(delta: number, position: Point = null): void {
    this.editorService.zoom(delta, position);
  }

  get firstPoint() {
    return this.editorService.layersService.firstPoint;
  }

  get backgroundCanvas() {
    return this.editorService.backgroundCanvas;
  }

  get scaleX() {
    return this.editorService.scaleX;
  }

  get panTool() {
    return this.toolboxService.listOfTools.filter((tool) => tool.name === TOOL_NAMES.PAN)[0];
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
    this.editorService.resize();
  }

  public load(imageId: string) {
    this.editorService.loadMetadata(imageId);
  }

  set imageLoaded(boolValue: boolean) {

    this.editorService.imageLoaded = boolValue;
  }

  get imageLoaded(){
    return this.editorService.imageLoaded;
  }

  // TODO: Verify the path of this and its type
  set imageServer(image: Image) {

    this.editorService.imageServer = image;
  }

  set imageLocal(image: HTMLImageElement) {

    this.editorService.imageLocal = image;
  }

  set imageId(imageId: string) {

    this.editorService.imageId = imageId;
  }

  loadImageFromServer(imageId: string) {

    this.editorService.loadImageFromServer(imageId);
  }

  getMousePositionInCanvasSpace(clientPosition: Point): Point {
    return this.editorService.getMousePositionInCanvasSpace(clientPosition);
  }

  loadSVGLocal(event: any){
    this.editorService.loadSVGLocal(event);
  }

  get commentBoxVisible(){
    return this.editorService.commentBoxVisible;
  }

  // Biomarkers

  setFocusBiomarker(item: any) {
    this.biomarkerService.setFocusBiomarker(item);
  }

  get biomarkersCurrentElement(){
    return this.biomarkerService.currentElement;
  }

}
