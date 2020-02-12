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
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { NavigationBarFacadeService } from './navigation-bar/navigation-bar.facade.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { LayoutModule } from '@angular/cdk/layout';

// Material
import { MaterialModule } from '../material/material.module';
// import { MatIconModule } from '@angular/material/icon';



@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      GalleryComponent,
      TasksComponent,
      DashboardComponent,
      LoginComponent,
      NavigationBarComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      MaterialModule,
      // MatIconModule,
      BrowserAnimationsModule,
   ],
   providers: [LoginFacadeService, LoginService, NavigationBarFacadeService],
   bootstrap: [AppComponent]
})
export class AppModule { }
