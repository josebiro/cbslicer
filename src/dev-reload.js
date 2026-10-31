// Injected only by the development server. Reconnect after server restarts.
const events=new EventSource('./__dev/events');
let revision=null;
events.addEventListener('ready',event=>{
 if(revision!==null&&revision!==event.data)location.reload();
 revision=event.data;
});
events.addEventListener('reload',()=>location.reload());
