import { Injectable, Inject, forwardRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Ng2ImgMaxService } from 'ng2-img-max';

import { ImgCropService } from './img-crop.service';

@Injectable()
export class ImgResizeExactService {
    constructor(@Inject(forwardRef(() => Ng2ImgMaxService)) private ng2ImgMaxService: Ng2ImgMaxService,
                @Inject(forwardRef(() => ImgCropService)) private imgCropService: ImgCropService) { }

    public resizeExactFill(file: File, toWidth: number, toHeight: number, fillColor?:string): Observable<any> {
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

                if (imgRatio > resizedRatio) {
                    /* the original height is smaller than the resized height as in ratio, therefore we have to resize to width, then fill to the height */
                    resizeWidth = toWidth;
                }
                else if (imgRatio <= resizedRatio) {
                    /* the original height is bigger than the resized height as in ratio, therefore we can resize to height, then fill to the width */
                    resizeHeight = toHeight;
                }

                this.ng2ImgMaxService.resize([file], resizeWidth, resizeHeight).subscribe((resizeResult) => {
                
                        /* To fill the image based on the center, we calculate where the img needs to be positioned to be centered*/
                        let startX = 0;
                        let startY = 0;

                        /* one side is already resized exactly to the desired size, now fill the other side */
                        if (resizeWidth === 100000) {
                            /* resized to height -> as we fill to the width, we have to set startX */
                            let newImgWidth = orientedImg.width / (orientedImg.height / toHeight);
                            startX = (newImgWidth - toWidth) / 2;
                        }
                        else if (resizeHeight === 100000) {
                            /* resized to width -> as we fill to the height, we have to set startY */
                            let newImgHeight = orientedImg.height / (orientedImg.width / toWidth);
                            startY = (newImgHeight - toHeight) / 2;
                        }
                        
                        let img = new Image();
                        let cvs = document.createElement('canvas');
                        let ctx = cvs.getContext('2d');
                        img.onload = () => {
                            cvs.width=toWidth;
                            cvs.height=toHeight;
                            if(fillColor){
                                ctx.fillStyle = fillColor;
                                ctx.fillRect(0, 0, toWidth, toHeight);
                            }
                            ctx.drawImage(img, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
                            let imageData = ctx.getImageData(0, 0, orientedImg.width, orientedImg.height);
                            let useAlpha = true;
                            if (file.type === "image/jpeg" || (file.type === "image/png" && !this.isImgUsingAlpha(imageData))) {
                                //image without alpha
                                useAlpha = false;
                                ctx = cvs.getContext('2d', { 'alpha': false });
                                ctx.drawImage(img, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
                            }
                            cvs.toBlob((blob)=>{
                                window.URL.revokeObjectURL(img.src);
                                let newFile = new File([blob], file.name, { type: file.type, lastModified: new Date().getTime() });
                                // END OF CROPPING
                                resizedImageSubject.next(newFile);
                            }, useAlpha ? "image/png" : "image/jpeg");
                        };
                        img.src = window.URL.createObjectURL(resizeResult);
                }, error =>{
                    //something went wrong 
                    resizedImageSubject.error(error);
                });
            });
        }
        img.src = window.URL.createObjectURL(file);
        return resizedImageSubject.asObservable();
    }
    public resizeExactCrop(file: File, toWidth: number, toHeight: number): Observable<any> {
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
                        /* one side is already resized exactly to the desired size, now crop the other side */
                        if (resizeWidth === 100000) {
                            /* resized to height -> as we crop to the width, we have to set startX */
                            let newImgWidth = orientedImg.width / (orientedImg.height / toHeight);
                            startX = (newImgWidth - toWidth) / 2;
                        }
                        else if (resizeHeight === 100000) {
                            /* resized to width -> as we crop to the height, we have to set startY */
                            let newImgHeight = orientedImg.height / (orientedImg.width / toWidth);
                            startY = (newImgHeight - toHeight) / 2;
                        }
                        this.imgCropService.cropImage(resizeResult, toWidth, toHeight, startX, startY).subscribe((cropResult) => {
                            //all good, result is a file
                            resizedImageSubject.next(cropResult);
                        }, error =>{
                            //something went wrong 
                            resizedImageSubject.error(error);
                        });
                }, error =>{
                    //something went wrong 
                    resizedImageSubject.error(error);
                });
            });
        }
        img.src = window.URL.createObjectURL(file);
        return resizedImageSubject.asObservable();
    }
    private isImgUsingAlpha(imageData): boolean {
        for (var i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] !== 255) {
                return true;
            }
        }
        return false;
    }
}