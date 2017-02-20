export default {
  entry: 'dist/ng2-img-tools.js',
  dest: 'dist/bundles/ng2-img-tools.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'ng2-img-tools',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs': 'Rx'
  }
}