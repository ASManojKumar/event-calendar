import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChunkPipe } from './chunk.pipe';

export const pipesComponentsList = [ChunkPipe];

@NgModule({
  imports: [CommonModule],
  declarations: pipesComponentsList,
  exports: pipesComponentsList
})

export class pipesModule {
  static forRoot(): ModuleWithProviders<pipesModule> {
    return {
      ngModule: pipesModule
    }
  }
}