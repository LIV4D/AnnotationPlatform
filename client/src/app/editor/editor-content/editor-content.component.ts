import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-editor-content',
  templateUrl: './editor-content.component.html',
  styleUrls: ['./editor-content.component.scss']
})
export class EditorContentComponent implements OnInit {
  @Output() svgLoaded: EventEmitter<any> = new EventEmitter();

  constructor(public editorService: EditorService) { }

  ngOnInit(): void {
    this.editorService.init(this.svgLoaded);
  }

}
