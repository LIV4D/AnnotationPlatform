import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { LoginFacadeService } from './login/login.facade.service';
import { LoginService } from './shared/services/login.service';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { DropdownDirective } from './navigation-bar/dropdown.directive';
import { NavigationBarFacadeService } from './navigation-bar/navigation-bar.facade.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// TODO: This is for testing purposes -- This import should be moved to another module
import {
   MatTreeModule,
   MatToolbarModule,
   MatButtonModule,
   MatSidenavModule,
   MatIconModule,
   MatListModule,
   MatMenuModule,
   MatDialogModule,
   MatDividerModule,
   MatExpansionModule,
   MatTableModule,
   MatSliderModule,
   MatPaginatorModule,
   MatSortModule,
   MatSlideToggleModule,
   MatCheckboxModule,
   MatFormFieldModule,
   MatInputModule,
} from '@angular/material/';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      GalleryComponent,
      TasksComponent,
      DashboardComponent,
      LoginComponent,
      NavigationBarComponent,
      DropdownDirective
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      BrowserAnimationsModule,


      // TODO: This is for testing purposes -- must be moved to another module when approved

      MatTreeModule,
      MatToolbarModule,
      MatButtonModule,
      MatSidenavModule,
      MatIconModule,
      MatListModule,
      MatMenuModule,
      MatDialogModule,
      MatDividerModule,
      MatExpansionModule,
      MatTableModule,
      MatSliderModule,
      MatTooltipModule,
      LayoutModule,
      MatPaginatorModule,
      MatSortModule,
      MatSlideToggleModule,
      MatCheckboxModule,
      MatFormFieldModule,
      MatInputModule
   ],
   providers: [LoginFacadeService, LoginService, NavigationBarFacadeService],
   bootstrap: [AppComponent]
})
export class AppModule { }
