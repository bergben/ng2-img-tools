import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ImgCropService } from './img-crop.service';
import { ImgResizeExactService } from './img-resize-exact.service';
import { Ng2ImgMaxService } from 'ng2-img-max';

@Injectable()
export class Ng2ImgToolsService {
    constructor(private imgResizeExactService: ImgResizeExactService, private ng2ImgMaxService: Ng2ImgMaxService, private imgCropService: ImgCropService) {
    }
    public compress(files: File[], maxSizeInMB: number, logExecutionTime: Boolean = false): Observable<any> {
        return this.ng2ImgMaxService.compress(files, maxSizeInMB, logExecutionTime);
    }
    public resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any> {
        return this.ng2ImgMaxService.resize(files, maxWidth, maxHeight, logExecutionTime);
    }
    public crop(files: File[], toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        let croppedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.cropImage(file, toWidth, toHeight, startX, startY).subscribe((value) => {
                croppedFileSubject.next(value);
            });
        });
        return croppedFileSubject.asObservable();
    }
    public resizeExact(files: File[], toWidth: number, toHeight: number): Observable<any> {
        let resizedFileSubject: Subject<any> = new Subject<any>();
        files.forEach((file) => {
            this.resizeExactImage(file, toWidth, toHeight).subscribe((value) => {
                resizedFileSubject.next(value);
            });
        });
        return resizedFileSubject.asObservable();
    }
    public resizeExactImage(file: File, toWidth: number, toHeight: number): Observable<any> {
        return this.imgResizeExactService.resizeExact(file, toWidth, toHeight);
    }
    public cropImage(file: File, toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        return this.imgCropService.cropImage(file, toWidth, toHeight, startX, startY);
    }
    public compressImage(file: File, maxSizeInMB: number, logExecutionTime: Boolean = false): Observable<any> {
        return this.ng2ImgMaxService.compressImage(file, maxSizeInMB, logExecutionTime);
    }
    public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any> {
        return this.ng2ImgMaxService.resizeImage(file, maxWidth, maxHeight, logExecutionTime);
    }
}