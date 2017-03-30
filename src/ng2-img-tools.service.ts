import { Injectable, Inject, forwardRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Ng2ImgMaxService } from 'ng2-img-max';

import { ImgCropService } from './img-crop.service';
import { ImgResizeExactService } from './img-resize-exact.service';

@Injectable()
export class Ng2ImgToolsService {
    constructor(@Inject(forwardRef(() => ImgResizeExactService)) private imgResizeExactService: ImgResizeExactService, 
               @Inject(forwardRef(() => Ng2ImgMaxService)) private ng2ImgMaxService: Ng2ImgMaxService, 
               @Inject(forwardRef(() => ImgCropService)) private imgCropService: ImgCropService) {
    }
    public compress(files: File[], maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any> {
        return this.ng2ImgMaxService.compress(files, maxSizeInMB, ignoreAlpha, logExecutionTime);
    }
    public resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any> {
        return this.ng2ImgMaxService.resize(files, maxWidth, maxHeight, logExecutionTime);
    }
    public crop(files: File[], toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        let croppedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.cropImage(file, toWidth, toHeight, startX, startY).subscribe((value) => {
                croppedFileSubject.next(value);
            }, error => {
                croppedFileSubject.error(error);
            });
        });
        return croppedFileSubject.asObservable();
    }
    public resizeExactCrop(files: File[], toWidth: number, toHeight: number): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.resizeExactCropImage(file, toWidth, toHeight).subscribe((value) => {
                resizedFileSubject.next(value);
            }, error => {
                resizedFileSubject.error(error);
            });
        });
        return resizedFileSubject.asObservable();
    }
    public resizeExactFill(files: File[], toWidth: number, toHeight: number, fillColor?:string): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.resizeExactFillImage(file, toWidth, toHeight, fillColor).subscribe((value) => {
                resizedFileSubject.next(value);
            }, error => {
                resizedFileSubject.error(error);
            });
        });
        return resizedFileSubject.asObservable();
    }
    public resizeExactFillImage(file: File, toWidth: number, toHeight: number, fillColor?:string): Observable<any> {
        return this.imgResizeExactService.resizeExactFill(file, toWidth, toHeight, fillColor);
    }
    public resizeExactCropImage(file: File, toWidth: number, toHeight: number): Observable<any> {
        return this.imgResizeExactService.resizeExactCrop(file, toWidth, toHeight);
    }
    public cropImage(file: File, toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        return this.imgCropService.cropImage(file, toWidth, toHeight, startX, startY);
    }
    public compressImage(file: File, maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any> {
        return this.ng2ImgMaxService.compressImage(file, maxSizeInMB, ignoreAlpha, logExecutionTime);
    }
    public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any> {
        return this.ng2ImgMaxService.resizeImage(file, maxWidth, maxHeight, logExecutionTime);
    }
    public getEXIFOrientedImage(image:HTMLImageElement): Promise<HTMLImageElement> {
        return this.ng2ImgMaxService.getEXIFOrientedImage(image);
    }
}