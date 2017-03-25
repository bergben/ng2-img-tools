import { Injectable, Inject, forwardRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Ng2ImgMaxService } from 'ng2-img-max';

import { ImgCropService } from './img-crop.service';

@Injectable()
export class ImgResizeExactService {
    constructor(@Inject(forwardRef(() => Ng2ImgMaxService)) private ng2ImgMaxService: Ng2ImgMaxService,
                @Inject(forwardRef(() => ImgCropService)) private imgCropService: ImgCropService) { }
    public resizeExact(file: File, toWidth: number, toHeight: number): Observable<any> {
        let resizedImageSubject: Subject<any> = new Subject<any>();
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            setTimeout(()=>{
                resizedImageSubject.error({ resizedFile: file, reason: "File provided is neither of type jpg nor of type png.", error: "INVALID_EXTENSION" });
            },0);
            return resizedImageSubject.asObservable();
        }
        let img = new Image();
        img.onload = () => {
            this.ng2ImgMaxService.getEXIFOrientedImage(img).then(orientedImg=>{
                window.URL.revokeObjectURL(img.src);
                let imgRatio = orientedImg.width / orientedImg.height;
                let resizedRatio = toWidth / toHeight;
                /* ratio > 1 means width > height */

                /* setting one parameter of ng2ImgMaxService very high will ensure that the resizing will fit the other provided parameter */
                let resizeHeight = 100000;
                let resizeWidth = 100000;

                /* To crop the image based on the center, so we will keep the most important part of the image, we calculate to crop from where to where */
                let startX = 0;
                let startY = 0;

                if (imgRatio > resizedRatio) {
                    /* the original height is smaller than the resized height as in ratio, therefore we have to resize to height, then crop to the width */
                    resizeHeight = toHeight;
                }
                else if (imgRatio <= resizedRatio) {
                    /* the original height is bigger than the resized height as in ratio, therefore we can resize to width, then crop to the height */
                    resizeWidth = toWidth;
                }

                this.ng2ImgMaxService.resize([file], resizeWidth, resizeHeight).subscribe((resizeResult) => {
                    if (typeof resizeResult.name !== 'undefined' && typeof resizeResult.size !== 'undefined' && typeof resizeResult.type !== 'undefined') {
                        //all good, result is a file
                        /* one side is already resized exactly to the desired size, now crop the other side */
                        if (resizeWidth === 100000) {
                            /* resized to height -> as we crop to the width, we have to set startX */
                            let newImgWidth = orientedImg.width / (orientedImg.height / toHeight);
                            startX = (newImgWidth - toWidth) / 2;
                        }
                        else if (resizeHeight === 100000) {
                            /* resized to width -> as we crop to the height, we have to set startY */
                            let newImgHeight = orientedImg.height / (img.width / toWidth);
                            startY = (newImgHeight - toHeight) / 2;
                        }
                        this.imgCropService.cropImage(resizeResult, toWidth, toHeight, startX, startY).subscribe((cropResult) => {
                            if (typeof cropResult.name !== 'undefined' && typeof cropResult.size !== 'undefined' && typeof cropResult.type !== 'undefined') {
                                //all good, result is a file
                                resizedImageSubject.next(cropResult);
                            }
                            else {
                                //something went wrong 
                                resizedImageSubject.error(cropResult);
                            }
                        });
                    }
                    else {
                        //something went wrong 
                        resizedImageSubject.error(resizeResult);
                    }
                });
            });
        }
        img.src = window.URL.createObjectURL(file);
        return resizedImageSubject.asObservable();
    }
}