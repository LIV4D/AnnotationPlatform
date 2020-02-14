import { Component, OnInit } from '@angular/core';
import { Tool } from '../../../models/tool.model';

@Component({
  selector: 'app-tool-element',
  templateUrl: './tool-element.component.html',
  styleUrls: ['./tool-element.component.scss']
})
export class ToolElementComponent implements OnInit {
  listOfTools: Tool[];
  constructor() { }

  ngOnInit(): void {
  }

}
