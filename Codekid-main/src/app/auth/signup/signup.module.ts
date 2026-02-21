import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup';  // Adjust if your path is different

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SignupComponent
  ]
})
export class AuthModule {}

