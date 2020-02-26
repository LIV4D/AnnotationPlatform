// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Pipes
import { CamelCaseToTextPipe } from './shared/pipes/camel-case-to-text.pipe';

// Components
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

// Services
import { LoginFacadeService } from './login/login.facade.service';
import { LoginService } from './shared/services/login.service';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { NavigationBarFacadeService } from './navigation-bar/navigation-bar.facade.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorFacadeService } from './editor/editor.facade.service';
import { LayersFacadeService } from './editor/editor-content/layers/layers.facade.service';
import { ImageBorderService } from './shared/services/Editor/image-border.service';
// import { LayoutModule } from '@angular/cdk/layout';

// Material
import { MaterialModule } from '../material/material.module';
import { AppService } from './shared/services/app.service';
import { AuthInterceptor } from './shared/services/authentification.intercept';
import { ToolboxComponent } from './editor/toolbox/toolbox.component';
import { ToolElementComponent } from './editor/toolbox/tool-element/tool-element.component';
import { RightMenuComponent } from './editor/right-menu/right-menu.component';
import { BiomarkersComponent } from './editor/right-menu/biomarkers/biomarkers.component';
import { TaskSubmissionComponent } from './editor/right-menu/task-submission/task-submission.component';
import { TimerComponent } from './editor/right-menu/timer/timer.component';
import { VisualizationComponent } from './editor/right-menu/visualization/visualization.component';
import { EditorContentComponent } from './editor/editor-content/editor-content.component';
import { LayersComponent } from './editor/editor-content/layers/layers.component';
import { SafeImagePipe } from './shared/services/safe-image.pipe';
import { ZoomComponent } from './editor/zoom/zoom/zoom.component';

// Directives
import { MousewheelDirective } from './shared/directives/mousewheel.directive';
import { ToolPropertiesService } from './shared/services/Editor/tool-properties.service';


@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      GalleryComponent,
      TasksComponent,
      DashboardComponent,
      LoginComponent,
      NavigationBarComponent,
      ToolboxComponent,
      ToolElementComponent,
      RightMenuComponent,
      BiomarkersComponent,
      TaskSubmissionComponent,
      TimerComponent,
      VisualizationComponent,
      EditorContentComponent,
      LayersComponent,
      SafeImagePipe,
      ZoomComponent,
      MousewheelDirective,
      CamelCaseToTextPipe
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      MaterialModule,
      HttpClientModule,
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule
   ],
   providers: [LoginFacadeService, LoginService, NavigationBarFacadeService, HttpClient, AppService,
      EditorFacadeService,
      LayersFacadeService,
      ToolPropertiesService,
      ImageBorderService,
      CamelCaseToTextPipe, {
      provide: HTTP_INTERCEPTORS,
      useFactory: (loginService: LoginService) => new AuthInterceptor(loginService),
      multi: true,
      deps: [LoginService]
  }],
   bootstrap: [AppComponent]
})
export class AppModule { }
