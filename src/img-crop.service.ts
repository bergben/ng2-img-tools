import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class ImgCropService {
    public cropImage(file: File, toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        let croppedImageSubject: Subject<any> = new Subject<any>();
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            croppedImageSubject.next({croppedFile:file, reason: "File provided is neither of type jpg nor of type png.", error: "INVALID_EXTENSION"});
            return;
        }
        let cvs = document.createElement('canvas');
        let ctx = cvs.getContext('2d');
        let img = new Image();
        img.onload = () => {
            cvs.width=toWidth;
            cvs.height=toHeight;
            ctx.drawImage(img, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
            let imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
            let useAlpha = true;
            if (file.type === "image/jpeg" || (file.type === "image/png" && !this.isImgUsingAlpha(imageData))) {
                //image without alpha
                useAlpha = false;
                ctx = cvs.getContext('2d', { 'alpha': false });
                ctx.drawImage(img, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
            }
            cvs.toBlob((blob)=>{
                let newFile = new File([blob], file.name, { type: file.type, lastModified: new Date().getTime() });
                croppedImageSubject.next(newFile);
                window.URL.revokeObjectURL(img.src);
            }, useAlpha ? "image/png" : "image/jpeg");
        }
        img.src = window.URL.createObjectURL(file);
        return croppedImageSubject.asObservable();
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