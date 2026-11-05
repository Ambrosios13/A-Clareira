import {readdir,readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const base=new URL('../dist/',import.meta.url),html=await readFile(new URL('index.html',base),'utf8');
let files=0;
for(const name of await readdir(base)){if(!name.endsWith('.js'))continue;const url=new URL(name,base),source=await readFile(url,'utf8');for(const match of source.matchAll(/(?:from\s*|import\s*\()(['"])(\.\.?\/[^'"]+)\1/g))await access(fileURLToPath(new URL(match[2],url)));for(const match of source.matchAll(/\$\('([^']+)'\)/g)){if(!html.includes(`id="${match[1]}"`))throw new Error(`${name}: missing DOM element ${match[1]}`);}files++;}
for(const match of html.matchAll(/(?:src|href)="(\.\/?[^"#]+|[\w-]+\.(?:js|css))"/g)){if(match[1]==='./')continue;await access(fileURLToPath(new URL(match[1],base)));}
console.log(`${files} browser modules checked: local imports, assets and DOM references resolve.`);
