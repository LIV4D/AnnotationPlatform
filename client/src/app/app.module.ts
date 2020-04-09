// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Pipes
import { CamelCaseToTextPipe } from './shared/pipes/camel-case-to-text.pipe';

// Components
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { TaskDialogSubmissionComponent } from './editor/right-menu/submit/task-dialog-submission/task-dialog-submission.component';
import { SubmitComponent } from './editor/right-menu/submit/submit.component';
import { BugtrackerComponent } from './bugtracker/bugtracker.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TasksComponent } from './tasks/tasks.component';
import { TasksCompletedComponent } from './tasks/tasks-completed/tasks-completed.component';
import { TasksToCompleteComponent } from './tasks/tasks-to-complete/tasks-to-complete.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { BiomarkersComponent } from './editor/right-menu/biomarkers/biomarkers.component';
import { ManagementComponent } from './management/management.component';
import { TasksBundlesComponent } from './tasks/tasks-bundles/tasks-bundles.component';
import { AccessDeniedComponent } from './user-control/access-denied/access-denied.component';
import { NonExistentPageComponent } from './user-control/non-existent-page/non-existent-page.component';
import { WidgetComponent } from './editor/right-menu/widget/widget.component';
import { WidgetSingleLineComponent } from './editor/right-menu/widget/widgetTypes/widget-single-line/widget-single-line.component';
import { WidgetMultipleLinesComponent } from './editor/right-menu/widget/widgetTypes/widget-multiple-lines/widget-multiple-lines.component';

// Services
import { LoginFacadeService } from './login/login.facade.service';
import { NavigationBarFacadeService } from './navigation-bar/navigation-bar.facade.service';
import { EditorFacadeService } from './editor/editor.facade.service';
import { LayersFacadeService } from './editor/editor-content/layers/layers.facade.service';
import { TaskFacadeService } from './tasks/tasks.facade.service';
import { TasksCompletedFacadeService } from './tasks/tasks-completed/tasks-completed.facade.service';
import { TasksToCompleteFacadeService } from './tasks/tasks-to-complete/tasks-to-Complete.facade.service';
import { GalleryFacadeService } from './gallery/gallery.facade.service';
import { ImageBorderService } from './shared/services/Editor/image-border.service';
import { LoginService } from './shared/services/login.service';
import { HeaderService } from './shared/services/header.service';
import { ManagementCreationService } from './shared/services/management-creation.service';
import { ManagementFacadeService } from './management/management.facade.service';
import { ModelFinderService } from './shared/services/modelfinder.service';
import { AppService } from './shared/services/app.service';
import { TasksBundlesService } from './shared/services/tasks/tasksBundles.service';
import { TasksService } from './shared/services/tasks/tasks.service';
import { TaskTypeService } from './shared/services/Tasks/taskType.service';
import { TasksBundlesFacadeService } from './tasks/tasks-bundles/tasks-bundles.facade.service';
import { ToolPropertiesService } from './shared/services/Editor/tool-properties.service';
import { AuthorizationService } from './shared/services/authorization.service';
import { CommentBoxComponent } from './editor/comment-box/comment-box.component';
import { BugtrackerService } from './shared/services/bugtracker.service';
import { BugtrackerFacadeService } from './bugtracker/bugtracker.facade.service';
import { WidgetFacadeService } from './editor/right-menu/widget/widget.facade.service';
import { StorageService } from './shared/services/storage.service';


// Pipes
import { SafeImagePipe } from './shared/pipes/safe-image.pipe';

// Material
import { MaterialModule } from '../material/material.module';
import { ToolboxComponent } from './editor/toolbox/toolbox.component';
import { ToolElementComponent } from './editor/toolbox/tool-element/tool-element.component';
import { RightMenuComponent } from './editor/right-menu/right-menu.component';
import { TimerComponent } from './editor/right-menu/timer/timer.component';
import { VisualizationComponent } from './editor/right-menu/visualization/visualization.component';
import { EditorContentComponent } from './editor/editor-content/editor-content.component';
import { LayersComponent } from './editor/editor-content/layers/layers.component';
import { ZoomComponent } from './editor/zoom/zoom/zoom.component';
import { ToolPropertiesComponent } from './editor/toolbox/tool-properties/tool-properties.component';
import { BiomarkersDialogComponent } from './editor/right-menu/biomarkers/biomarkers-dialog/biomarkers-dialog.component';

// Directives
import { MousewheelDirective } from './shared/directives/mousewheel.directive';

// Interceptor
import { AuthInterceptor } from './shared/services/authentification.intercept';
import { ErrorComponent } from './error/error.component';
import { VisualizationService } from './editor/right-menu/visualization/visualization.service';

@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      GalleryComponent,
      TasksComponent,
      TasksCompletedComponent,
      TasksToCompleteComponent,
      DashboardComponent,
      LoginComponent,
      NavigationBarComponent,
      ToolboxComponent,
      ToolElementComponent,
      RightMenuComponent,
      BiomarkersComponent,
      TaskDialogSubmissionComponent,
      SubmitComponent,
      TimerComponent,
      VisualizationComponent,
      EditorContentComponent,
      LayersComponent,
      SafeImagePipe,
      ManagementComponent,
      ZoomComponent,
      MousewheelDirective,
      CamelCaseToTextPipe,
      TasksBundlesComponent,
      AccessDeniedComponent,
      NonExistentPageComponent,
      WidgetComponent,
      CommentBoxComponent,
      ToolPropertiesComponent,
      WidgetSingleLineComponent,
      WidgetMultipleLinesComponent,
      BugtrackerComponent,
      ErrorComponent,
      BiomarkersDialogComponent,
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      MaterialModule,
      HttpClientModule,
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
   ],
   providers: [
      LoginFacadeService,
      LoginService,
      BugtrackerService,
      BugtrackerFacadeService,
      AuthorizationService,
      StorageService,
      ManagementFacadeService,
      ModelFinderService,
      NavigationBarFacadeService,
      HttpClient,
      AppService,
      TaskFacadeService,
      TasksToCompleteFacadeService,
      TasksCompletedFacadeService,
      TasksBundlesFacadeService,
      TasksService,
      TaskTypeService,
      TasksBundlesService,
      ManagementCreationService,
      WidgetFacadeService,
      HeaderService,
      EditorFacadeService,
      LayersFacadeService,
      GalleryFacadeService,
      ToolPropertiesService,
      VisualizationService,
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
