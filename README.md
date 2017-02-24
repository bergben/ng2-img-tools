[![Join the chat at https://gitter.im/bergben/bergben](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/bergben/bergben?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# ng2-img-tools
Angular 2 module to resize images, crop images or compress images down to a certain filesize. This is all done in the browser, using Web Workers when possible.

## Install
```bash
$ npm install ng2-img-tools --save
```

### Import the module
```TypeScript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2ImgToolsModule } from 'ng2-img-tools'; // <-- import the module
import { MyComponent } from './my.component';

@NgModule({
    imports: [BrowserModule,
              Ng2ImgToolsModule // <-- include it in your app module
             ],
    declarations: [MyComponent],  
    bootstrap: [MyComponent]
})
export class MyAppModule {}
```
## Usage
```TypeScript
import { Ng2ImgToolsService } from 'ng2-img-tools';
[...]
    constructor(private ng2ImgToolsService: Ng2ImgToolsService) {
        this.ng2ImgToolsService.resize([someImage], 2000, 1000).subscribe((result)=>{
             if (typeof result.name !== 'undefined' && typeof result.size !== 'undefined' && typeof result.type !== 'undefined') {
                 //all good, result is a file
                  console.info(result);
             }
             else {
                 //something went wrong 
                  console.error(result);
             }
        });
    }
}
```
## Methods
All the methods return an Observable, which onNext either gets a file if everything went as planned or an error object if something went wrong. Please see the example above in Usage to see how to check if the returned value is a File.
All the methods furthermore have a method for a single file as input aswell, which are named e.g. cropImage, resizeImage, etc.

### Maximal filesize
#### IMPORTANT: Catch error cases
When using the compression methods you should make sure to catch the error cases. 
If an error happens, you will receive an object with the following properties: 
 `compressedFile`:`File`, `reason`: `string` and `error`:`string`

Possible errors are: <br /> 
<b>`INVALID_EXTENSION`</b>: File provided is neither of type jpg nor of type png). The `compressedFile` is the original file. <br />
<b>`PNG_WITH_ALPHA`</b>: File provided is a png image which uses the alpha channel. No compression possible unless `ignoreAlpha` is set to true. The `compressedFile` is the original file.<br />
<b>`MAX_STEPS_EXCEEDED`</b>: Could not find the correct compression quality in 15 steps - abort. This should rarely to never at all happen. The `compressedFile` is the result of step 15 of the compression.<br />
<b>`FILE_BIGGER_THAN_INITIAL_FILE`</b>: This should actually never happen, just a precaution. The `compressedFile` is the original file.<br />
<b>`UNABLE_TO_COMPRESS_ENOUGH`</b>: Could not compress image enough to fit the maximal file size limit. The `compressedFile` is a compression as close as it can get.<br />

Example code to show how to see if the result is an object (error happened) or a file:

 ```TypeScript
this.ng2ImgMaxSerive.resize([someImage], 2000, 1000).subscribe((result)=>{
        if (typeof result.name !== 'undefined' && typeof result.size !== 'undefined' && typeof result.type !== 'undefined') {
            //all good, result is a file
            console.info(result);
        }
        else {
            //something went wrong 
            //use result.compressedFile or handle specific error cases individually
        }
});
```

#### `compress(files: File[], maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any>` 
Method to compress an image. This reduces the quality of an image down until it fits a certain fileSize which is given as `maxSizeInMB`.
Set `ignoreAlpha` to true if you want to ignore the alpha channel for png images and compress them nonetheless (not recommended - the alpha channel will be lost and the resulting image might differ from the original image).
Returns an observable that for every file given, onNext receives either a File when everything went as planned or an error Object if something went wrong. 

### Maximal width / height
#### `resize(files: File[], maxWidth: number, maxHeight: number, logExecutionTime: Boolean = false): Observable<any>` 
Method to resize files if necessary down to a certain maximal width or maximal height in px. If you want only one limit just set the other max to a very high value: for example `resize([myfile1,myfile2],2000,10000).subscribe([...]`

### Crop image
#### `crop(files: File[], toWidth: number, toHeight: number, startX: number = 0, startY: number = 0): Observable<any>` 
Crops the given files down to the given width and height. startX and startY tell where the cropping should start as coordinates.

### Resize exact (e.g. useful to create thumbnails)
#### `public resizeExact(files: File[], toWidth: number, toHeight: number): Observable<any>` 
Resizes an image exactly down to the given width and height. To do so, the image will first be resized, then cropped based on the center of the image so to keep the most likely most important part of the image. This way the proportions width to height are kept. 
This proves very useful to create thumbnails.

## Contribute / Limitations
Contributions to improve this toolkit are most welcome especially to find the best possible alghoritms.
Please check out <a href="https://github.com/bergben/ng2-img-max">ng2-img-max</a> to read about the limitations and the current algorithm regarding maximal filesize.

## To-do
 - Provide a demo
