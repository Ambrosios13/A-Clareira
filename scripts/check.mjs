import {readdir,readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const base=new URL('../dist/',import.meta.url),html=await readFile(new URL('index.html',base),'utf8');
let files=0;
async function checkDirectory(url){
 for(const entry of await readdir(url,{withFileTypes:true})){
  const child=new URL(entry.name+(entry.isDirectory()?'/':''),url);
  if(entry.isDirectory()){await checkDirectory(child);continue;}
  if(!entry.name.endsWith('.js'))continue;
  const source=await readFile(child,'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*\()(['"])(\.\.?\/[^'"]+)\1/g))await access(fileURLToPath(new URL(match[2],child)));
  for(const match of source.matchAll(/\$\('([^']+)'\)/g)){if(!html.includes(`id="${match[1]}"`))throw new Error(`${child.pathname}: missing DOM element ${match[1]}`);}
  files++;
 }
}
await checkDirectory(base);
for(const match of html.matchAll(/(?:src|href)="(\.\/?[^"#]+|[\w-]+\.(?:js|css))"/g)){if(match[1]==='./')continue;await access(fileURLToPath(new URL(match[1],base)));}
console.log(`${files} browser modules checked: local imports, assets and DOM references resolve.`);
