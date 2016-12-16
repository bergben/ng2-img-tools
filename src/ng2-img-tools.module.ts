import { NgModule, ModuleWithProviders } from '@angular/core';
import { ImgCropService } from './img-crop.service';
import { ImgResizeExactService } from './img-resize-exact.service';
import { Ng2ImgToolsService } from './ng2-img-tools.service';
import { Ng2ImgMaxModule, Ng2ImgMaxService } from 'ng2-img-max';

@NgModule({
    imports:[
        Ng2ImgMaxModule
    ],
    providers: [
        {provide: ImgResizeExactService, useClass: ImgResizeExactService},
        {provide: ImgCropService, useClass: ImgCropService},
        {provide: Ng2ImgToolsService, useClass: Ng2ImgToolsService},
        {provide: Ng2ImgMaxService, useClass: Ng2ImgMaxService}
    ]
})
export class Ng2ImgToolsModule {}