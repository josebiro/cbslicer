import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(import.meta.dirname);
const publicFiles=new Set(['/','/index.html','/src/collection.css','/src/collection.js','/src/designs.js','/composite.html','/src/composite.js','/src/composite-app.js','/src/composite.css','/src/app.js','/src/planner.js','/src/assembly.js','/src/style.css']);
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(!publicFiles.has(pathname)){res.writeHead(404).end('Not found');return;}
 const path=resolve(root,'.'+pathname);
 if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{const file=path===root||path===root+'/'?root+'/index.html':path;const data=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(file)]||'text/plain');res.end(data);}catch{res.writeHead(404).end('Not found');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Board designer listening on port '+(process.env.PORT||3000)));
