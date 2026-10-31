import {cp,mkdir,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import './build.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'), destination=resolve(root,'dist');
await rm(destination,{recursive:true,force:true}); await mkdir(destination,{recursive:true});
for(const name of ['index.html','en','achievements','card','assets','.nojekyll']) await cp(resolve(root,name),resolve(destination,name),{recursive:true});
console.log('Exported dist/: upload its contents to the laboratory web directory. All internal links are relative.');
