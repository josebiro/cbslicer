import http from 'node:http';
import {watch} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(import.meta.dirname);
const development=process.argv.includes('--dev'),clients=new Set(),revision=randomUUID();
if(development){
 let timer;
 const changed=()=>{clearTimeout(timer);timer=setTimeout(()=>{for(const client of clients)client.write('event: reload\ndata: changed\n\n');},150);};
 watch(resolve(root,'src'),changed);
 watch(root,(_event,name)=>{if(name&&['index.html','composite.html'].includes(String(name)))changed();});
}

const publicPages=new Set(['/','/index.html','/composite.html']);
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(development&&pathname==='/__dev/events'){
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive'});
  res.write(`event: ready\ndata: ${revision}\n\n`);clients.add(res);
  const heartbeat=setInterval(()=>res.write(': keepalive\n\n'),15000);
  req.on('close',()=>{clearInterval(heartbeat);clients.delete(res);});return;
 }

 res.setHeader('Cache-Control','no-store');
 const isAsset=/^\/src\/[a-z0-9-]+\.(js|css)$/.test(pathname);
 if(!publicPages.has(pathname)&&!isAsset){res.writeHead(404).end('Not found');return;}
 const path=resolve(root,'.'+pathname);
 if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{const file=path===root||path===root+'/'?root+'/index.html':path;let data=await readFile(file);if(development&&extname(file)==='.html')data=data.toString().replace('</body>','<script src="./src/dev-reload.js"></script></body>');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(file)]||'text/plain');res.end(data);}catch{res.writeHead(404).end('Not found');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Board designer listening on port '+(process.env.PORT||3000)));
