// Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxLoadingModule } from 'ngx-loading';
import { DeviceDetectorModule } from 'ngx-device-detector';

// Components
import { RightMenuComponent } from './edit-layout/right-menu/right-menu.component';
import { ToolBoxComponent } from './edit-layout/toolbox/toolbox.component';
import { ToolComponent } from './edit-layout/toolbox/tool/tool.component';
import { ToolPropertiesComponent } from './edit-layout/toolbox/tool-properties/tool-properties.component';
import { BiomarkersDialogComponent } from './edit-layout/right-menu/biomarkers/biomarkers-dialog/biomarkers-dialog.component';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { CommentsComponent } from './edit-layout/right-menu/comments/comments.component';
import { LayersComponent } from './edit-layout/editor/layers/layers.component';
import { EditorComponent } from './edit-layout/editor/editor.component';
import { ZoomComponent } from './edit-layout/editor/zoom/zoom.component';
import { BiomarkersComponent } from './edit-layout/right-menu/biomarkers/biomarkers.component';
import { HeaderComponent } from './header/header.component';
import { VisualizationComponent } from './edit-layout/right-menu/visualization/visualization.component';
import { GalleryComponent } from './gallery/gallery.component';
import { EditLayoutComponent } from './edit-layout/edit-layout.component';
import { BugtrackerComponent } from './bugtracker/bugtracker.component';
import { TimerComponent } from './edit-layout/right-menu/timer/timer.component';

// Services
import { AppService } from './app.service';
import { LoginService } from './login/login.service';
import { GalleryService } from './gallery/gallery.service';
import { LayersService } from './edit-layout/editor/layers/layers.service';
import { CommentsService} from './edit-layout/right-menu/comments/comments.service';
import { BiomarkersService } from './edit-layout/right-menu/biomarkers/biomarkers.service';
import { VisualizationService } from './edit-layout/right-menu/visualization/visualization.service';
import { TimerService } from './edit-layout/right-menu/timer/timer.service';
import { ImageBorderService } from './edit-layout/right-menu/biomarkers/image-border.service';
import { BugtrackerService } from './bugtracker/bugtracker.service';
import { EditorService } from './edit-layout/editor/editor.service';
import {ToolPropertiesService} from './edit-layout/toolbox/tool-properties/tool-properties.service';
import {ToolboxService} from './edit-layout/toolbox/toolbox.service';

// Directives
import { MouseWheelDirective } from './mousewheel.directive';

// Pipes
import { CamelCaseToTextPipe } from './pipes/camel-case-to-text.pipe';
import { SafeImagePipe } from './pipes/safe-image.pipe';

// Material
import { MaterialModule } from '../material/material.module';
import { MatIconModule } from "@angular/material/icon";

// Others
import { LoginGuard } from './login/login.guard';
import { NoImageGuard } from './edit-layout/editor/no-image.guard';
import { AuthInterceptor } from './authentication/authentication.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TasksComponent } from './tasks/tasks.component';
import { TaskDialogComponent } from './edit-layout/right-menu/tasks/task-dialog.component';
import {ApplicationRef} from '@angular/core';
import { HeaderService } from './header/header.service';


@NgModule({
    entryComponents: [BiomarkersComponent, BiomarkersDialogComponent, TaskDialogComponent],
    declarations: [
        AppComponent,
        EditorComponent,
        ToolBoxComponent,
        ToolComponent,
        ToolPropertiesComponent,
        ZoomComponent,
        RightMenuComponent,
        BiomarkersComponent,
        HeaderComponent,
        BiomarkersDialogComponent,
        LoginComponent,
        MouseWheelDirective,
        LayersComponent,
        CamelCaseToTextPipe,
        SafeImagePipe,
        VisualizationComponent,
        GalleryComponent,
        EditLayoutComponent,
        CommentsComponent,
        TasksComponent,
        TaskDialogComponent,
        BugtrackerComponent,
        TimerComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NgxLoadingModule.forRoot({}),
        MaterialModule,
        MatIconModule,
        DeviceDetectorModule.forRoot()
    ],

    providers: [AppService, HttpClient,  EditorService, LoginService, {
        provide: HTTP_INTERCEPTORS,
        useFactory: (loginService: LoginService) => new AuthInterceptor(loginService),
        multi: true,
        deps: [LoginService]
    }, LoginGuard, NoImageGuard, VisualizationService,  GalleryService, BugtrackerService, CamelCaseToTextPipe,
    CommentsService, TimerService, BiomarkersService, ImageBorderService, LayersService, HeaderService],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
    }
}
