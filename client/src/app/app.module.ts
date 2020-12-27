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
import { EditorComponent } from './ui/editor/editor.component';
import { TaskDialogSubmissionComponent } from './ui/editor/right-menu/submit/task-dialog-submission/task-dialog-submission.component';
import { SubmitComponent } from './ui/editor/right-menu/submit/submit.component';
import { BugtrackerComponent } from './ui/bugtracker/bugtracker.component';
import { GalleryComponent } from './ui/gallery/gallery.component';
import { TasksComponent } from './tasks/tasks.component';
import { TasksCompletedComponent } from './tasks/tasks-completed/tasks-completed.component';
import { TasksToCompleteComponent } from './tasks/tasks-to-complete/tasks-to-complete.component';
import { DashboardComponent } from './ui/dashboard/dashboard.component';
import { LoginComponent } from './ui/login/login.component';
import { NavigationBarComponent } from './ui/navigation-bar/navigation-bar.component';
import { BiomarkersComponent } from './ui/editor/right-menu/biomarkers/biomarkers.component';
import { ManagementComponent } from './management/management.component';
import { TasksBundlesComponent } from './tasks/tasks-bundles/tasks-bundles.component';
import { AccessDeniedComponent } from './user-control/access-denied/access-denied.component';
import { NonExistentPageComponent } from './user-control/non-existent-page/non-existent-page.component';
import { WidgetComponent } from './ui/editor/right-menu/widget/widget.component';
import { WidgetSingleLineComponent } from './ui/editor/right-menu/widget/widgetTypes/widget-single-line/widget-single-line.component';
import { WidgetMultipleLinesComponent } from './ui/editor/right-menu/widget/widgetTypes/widget-multiple-lines/widget-multiple-lines.component';

// Services
import { LoginFacadeService } from './ui/login/login.facade.service';
import { NavigationBarFacadeService } from './ui/navigation-bar/navigation-bar.facade.service';
import { EditorFacadeService } from './ui/editor/editor.facade.service';
import { LayersFacadeService } from './ui/editor/editor-content/layers/layers.facade.service';
import { TaskFacadeService } from './tasks/tasks.facade.service';
import { TasksCompletedFacadeService } from './tasks/tasks-completed/tasks-completed.facade.service';
import { TasksToCompleteFacadeService } from './tasks/tasks-to-complete/tasks-to-complete.facade.service';
import { GalleryFacadeService } from './ui/gallery/gallery.facade.service';
import { ImageBorderService } from './shared/services/editor/image-border.service';
import { LoginService } from './shared/services/auth/login.service';
import { UIStatusService } from './shared/services/ui-status.service';
import { ManagementCreationService } from './shared/services/management-creation.service';
import { ManagementFacadeService } from './management/management.facade.service';
import { ModelFinderService } from './shared/services/model-finder.service';
import { AppService } from './shared/services/app.service';
import { TasksBundlesService } from './shared/services/tasks/tasksBundles.service';
import { TasksService } from './shared/services/tasks/tasks.service';
import { TaskTypeService } from './shared/services/tasks/taskType.service';
import { TasksBundlesFacadeService } from './tasks/tasks-bundles/tasks-bundles.facade.service';
import { ToolPropertiesService } from './shared/services/editor/tool-properties.service';
import { AuthorizationService } from './shared/services/auth/authorization.service';
import { CommentBoxComponent } from './ui/editor/comment-box/comment-box.component';
import { BugtrackerService } from './shared/services/bugtracker.service';
import { BugtrackerFacadeService } from './ui/bugtracker/bugtracker.facade.service';
import { WidgetFacadeService } from './ui/editor/right-menu/widget/widget.facade.service';
import { StorageService } from './shared/services/storage.service';
import { VisualizationFacadeService } from './ui/editor/right-menu/visualization/visualization.facade.service';
import { VisualizationService} from './shared/services/editor/visualization.service';
import { WidgetStorageService } from './shared/services/editor/data-persistence/widgetStorage.service';
import { WidgetEventService } from './shared/services/editor/widgetEvent.service';
import { RevisionService } from './shared/services/editor/revision.service';
import { LoadingService } from './shared/services/editor/data-persistence/loading.service';
import { CanvasDimensionService } from './shared/services/editor/canvas-dimension.service';
import { BiomarkerService } from './shared/services/editor/biomarker.service';
import { BiomarkerVisibilityService } from './shared/services/editor/biomarker-visibility.service';
import { ViewportService } from './shared/services/editor/viewport.service';

// Pipes
import { SafeImagePipe } from './shared/pipes/safe-image.pipe';

// Material
import { MaterialModule } from '../material/material.module';
import { ToolboxComponent } from './ui/editor/toolbox/toolbox.component';
import { ToolElementComponent } from './ui/editor/toolbox/tool-element/tool-element.component';
import { RightMenuComponent } from './ui/editor/right-menu/right-menu.component';
import { TimerComponent } from './ui/editor/right-menu/timer/timer.component';
import { VisualizationComponent } from './ui/editor/right-menu/visualization/visualization.component';
import { EditorContentComponent } from './ui/editor/editor-content/editor-content.component';
import { LayersComponent } from './ui/editor/editor-content/layers/layers.component';
import { ZoomComponent } from './ui/editor/zoom/zoom/zoom.component';
import { ToolPropertiesComponent } from './ui/editor/toolbox/tool-properties/tool-properties.component';
import { BiomarkersDialogComponent } from './ui/editor/right-menu/biomarkers/biomarkers-dialog/biomarkers-dialog.component';

// Directives
import { MousewheelDirective } from './shared/directives/mousewheel.directive';

// Interceptor
import { AuthInterceptor } from './shared/services/auth/authentification.intercept';
import { ErrorComponent } from './error/error.component';
import { UrlService } from './shared/services/ui-states/url.service';


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
      WidgetStorageService,
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
      WidgetEventService,
      UIStatusService,
      EditorFacadeService,
      LayersFacadeService,
      GalleryFacadeService,
      ToolPropertiesService,
      ViewportService,
      VisualizationService,
      VisualizationFacadeService,
      UrlService,
      RevisionService,
      LoadingService,
      CanvasDimensionService,
      ImageBorderService,
      BiomarkerVisibilityService,
      CamelCaseToTextPipe, {
      provide: HTTP_INTERCEPTORS,
      useFactory: (loginService: LoginService) => new AuthInterceptor(loginService),
      multi: true,
      deps: [LoginService]
  }],
   bootstrap: [AppComponent]
})
export class AppModule { }
