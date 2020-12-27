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
import { EditorComponent } from './frontend-ui/editor/editor.component';
import { TaskDialogSubmissionComponent } from './frontend-ui/editor/right-menu/submit/task-dialog-submission/task-dialog-submission.component';
import { SubmitComponent } from './frontend-ui/editor/right-menu/submit/submit.component';
import { BugtrackerComponent } from './frontend-ui/bugtracker/bugtracker.component';
import { GalleryComponent } from './frontend-ui/gallery/gallery.component';
import { TasksComponent } from './frontend-ui/tasks/tasks.component';
import { TasksCompletedComponent } from './frontend-ui/tasks/tasks-completed/tasks-completed.component';
import { TasksToCompleteComponent } from './frontend-ui/tasks/tasks-to-complete/tasks-to-complete.component';
import { DashboardComponent } from './frontend-ui/dashboard/dashboard.component';
import { LoginComponent } from './frontend-ui/login/login.component';
import { NavigationBarComponent } from './frontend-ui/navigation-bar/navigation-bar.component';
import { BiomarkersComponent } from './frontend-ui/editor/right-menu/biomarkers/biomarkers.component';
import { ManagementComponent } from './management/management.component';
import { TasksBundlesComponent } from './frontend-ui/tasks/tasks-bundles/tasks-bundles.component';
import { AccessDeniedComponent } from './frontend-ui/errors-handler/access-denied/access-denied.component';
import { NonExistentPageComponent } from './frontend-ui/errors-handler/non-existent-page/non-existent-page.component';
import { WidgetComponent } from './frontend-ui/editor/right-menu/widget/widget.component';
import { WidgetSingleLineComponent } from './frontend-ui/editor/right-menu/widget/widgetTypes/widget-single-line/widget-single-line.component';
import { WidgetMultipleLinesComponent } from './frontend-ui/editor/right-menu/widget/widgetTypes/widget-multiple-lines/widget-multiple-lines.component';

// Services
import { LoginFacadeService } from './frontend-ui/login/login.facade.service';
import { NavigationBarFacadeService } from './frontend-ui/navigation-bar/navigation-bar.facade.service';
import { EditorFacadeService } from './frontend-ui/editor/editor.facade.service';
import { LayersFacadeService } from './frontend-ui/editor/editor-content/layers/layers.facade.service';
import { TaskFacadeService } from './frontend-ui/tasks/tasks.facade.service';
import { TasksCompletedFacadeService } from './frontend-ui/tasks/tasks-completed/tasks-completed.facade.service';
import { TasksToCompleteFacadeService } from './frontend-ui/tasks/tasks-to-complete/tasks-to-complete.facade.service';
import { GalleryFacadeService } from './frontend-ui/gallery/gallery.facade.service';
import { ImageBorderService } from './shared/services/editor/image-border.service';
import { LoginService } from './navigation-logic/auth/login.service';
import { UIStatusService } from './shared/services/ui-status.service';
import { ManagementCreationService } from './shared/services/management-creation.service';
import { ManagementFacadeService } from './management/management.facade.service';
import { ModelFinderService } from './shared/services/model-finder.service';
import { AppService } from './shared/services/app.service';
import { TasksBundlesService } from './shared/services/tasks/tasksBundles.service';
import { TasksService } from './shared/services/tasks/tasks.service';
import { TaskTypeService } from './shared/services/tasks/taskType.service';
import { TasksBundlesFacadeService } from './frontend-ui/tasks/tasks-bundles/tasks-bundles.facade.service';
import { ToolPropertiesService } from './shared/services/editor/tool-properties.service';
import { AuthorizationService } from './navigation-logic/auth/authorization.service';
import { CommentBoxComponent } from './frontend-ui/editor/comment-box/comment-box.component';
import { BugtrackerService } from './shared/services/bugtracker.service';
import { BugtrackerFacadeService } from './frontend-ui/bugtracker/bugtracker.facade.service';
import { WidgetFacadeService } from './frontend-ui/editor/right-menu/widget/widget.facade.service';
import { StorageService } from './shared/services/storage.service';
import { VisualizationFacadeService } from './frontend-ui/editor/right-menu/visualization/visualization.facade.service';
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
import { ToolboxComponent } from './frontend-ui/editor/toolbox/toolbox.component';
import { ToolElementComponent } from './frontend-ui/editor/toolbox/tool-element/tool-element.component';
import { RightMenuComponent } from './frontend-ui/editor/right-menu/right-menu.component';
import { TimerComponent } from './frontend-ui/editor/right-menu/timer/timer.component';
import { VisualizationComponent } from './frontend-ui/editor/right-menu/visualization/visualization.component';
import { EditorContentComponent } from './frontend-ui/editor/editor-content/editor-content.component';
import { LayersComponent } from './frontend-ui/editor/editor-content/layers/layers.component';
import { ZoomComponent } from './frontend-ui/editor/zoom/zoom/zoom.component';
import { ToolPropertiesComponent } from './frontend-ui/editor/toolbox/tool-properties/tool-properties.component';
import { BiomarkersDialogComponent } from './frontend-ui/editor/right-menu/biomarkers/biomarkers-dialog/biomarkers-dialog.component';

// Directives
import { MousewheelDirective } from './shared/directives/mousewheel.directive';

// Interceptor
import { AuthInterceptor } from './navigation-logic/auth/authentification.intercept';
import { ErrorComponent } from './frontend-ui/errors-handler/error-popup/error-popup.component';
import { UrlService } from './navigation-logic/url.service';


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
