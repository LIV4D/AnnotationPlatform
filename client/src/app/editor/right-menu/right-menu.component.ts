import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { BackgroundCanvas } from 'src/app/shared/services/Editor/Tools/background-canvas.service';
import { BiomarkersComponent } from './biomarkers/biomarkers.component';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {
  loaded: boolean;
  saveText: string;
  @Input() canvas: BackgroundCanvas;
  @ViewChild('biomarkers') biomarkers: BiomarkersComponent;

  constructor() {
    this.loaded = true;
    this.saveText = navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
  }

  ngOnInit(): void {
  }

  public svgLoaded(arbre: SVGGElement[]): void {
      this.loaded = true;
      setTimeout(() => {
          this.biomarkers.init(arbre);
      }, 0);
  }

  public commandOrCtrlPressed(event: KeyboardEvent): boolean {
      return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
  }

}
