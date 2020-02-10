// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

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

// Material
import { MaterialModule } from '../material/material.module';
// import { MatIconModule } from "@angular/material/icon";



@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      GalleryComponent,
      TasksComponent,
      DashboardComponent,
      LoginComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      MaterialModule
   ],
   providers: [
      LoginFacadeService,
      LoginService],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
