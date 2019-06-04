import { Injectable, Inject, forwardRef } from '@angular/core';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ImgCropService {
    constructor(@Inject(forwardRef(() => Ng2ImgMaxService)) private ng2ImgMaxService: Ng2ImgMaxService) { }
    public cropImage(file: File, toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any> {
        let croppedImageSubject: Subject<any> = new Subject<any>();
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            // END OF CROPPING
            setTimeout(()=>{
                croppedImageSubject.error({croppedFile:file, reason: "File provided is neither of type jpg nor of type png.", error: "INVALID_EXTENSION"});
            },0);
            return croppedImageSubject.asObservable();
        }
        let cvs = document.createElement('canvas');
        let ctx = cvs.getContext('2d');
        let img = new Image();
        img.onload = () => {
            this.ng2ImgMaxService.getEXIFOrientedImage(img).then(orientedImg=>{
                window.URL.revokeObjectURL(img.src);
                cvs.width=toWidth;
                cvs.height=toHeight;
                ctx.drawImage(orientedImg, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
                let imageData = ctx.getImageData(0, 0, orientedImg.width, orientedImg.height);
                let useAlpha = true;
                if (file.type === "image/jpeg" || (file.type === "image/png" && !this.isImgUsingAlpha(imageData))) {
                    //image without alpha
                    useAlpha = false;
                    ctx = cvs.getContext('2d', { 'alpha': false });
                    ctx.drawImage(orientedImg, startX, startY, toWidth, toHeight, 0, 0, toWidth, toHeight);
                }
                cvs.toBlob((blob)=>{
                    let newFile:File = this.generateResultFile(blob, file.name, file.type, new Date().getTime());
                    // END OF CROPPING
                    croppedImageSubject.next(newFile);
                }, useAlpha ? "image/png" : "image/jpeg");
            });
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
    private generateResultFile(blob:Blob, name:string, type: string, lastModified: number):File{
        let resultFile=new Blob([blob], {type: type});
        return this.blobToFile(resultFile, name, lastModified);
    }
    private blobToFile(blob: Blob, name:string, lastModified: number): File {
        let file: any = blob;
        file.name = name;
        file.lastModified = lastModified;

        //Cast to a File() type
        return <File> file;
    }
}