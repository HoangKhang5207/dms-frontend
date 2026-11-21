// Fixed internal DMS transport over Docker stdio; no listening port or fixtures.
const {spawn}=require('node:child_process');
const readline=require('node:readline');
const path=require('node:path');
module.exports=function createBridge(runtime) {
  const tools=path.resolve(runtime,'..','tools');
  const child=spawn('docker',['--context','desktop-linux','run','--rm','-i',
    '--name','aquadocs-gaa-browser-bridge','--label','org.aquadocs.gaa.owner=2026-11-19',
    '--network','aquadocs-gaa-acceptance_callback','--read-only','--cap-drop','ALL',
    '--security-opt','no-new-privileges:true','--pids-limit','32','--memory','128m',
    '-v',`${tools}:/bridge:ro`,'--entrypoint','python','aquadocs-gaa-tools:local','-u','/bridge/browser_bridge.py'],
    {stdio:['pipe','pipe','pipe'],windowsHide:true});
  const pending=new Map();let next=0;
  // Docker diagnostics can contain request metadata; report only the exit code.
  child.stderr.resume();
  child.on('error',()=>{for(const item of pending.values()) item.reject(new Error('Docker bridge unavailable'));pending.clear();});
  child.on('exit',code=>{for(const item of pending.values()) item.reject(new Error(`Docker bridge exited ${code}`));pending.clear();});
  readline.createInterface({input:child.stdout}).on('line',line=>{
    const value=JSON.parse(line),item=pending.get(value.id);if(!item)return;pending.delete(value.id);
    if(value.error)item.reject(new Error(`Internal DMS transport ${value.error}`));else item.resolve(value);
  });
  return {
    request(request) {
      const url=new URL(request.url()),id=++next;
      return new Promise((resolve,reject)=>{
        pending.set(id,{resolve,reject});
        child.stdin.write(JSON.stringify({id,method:request.method(),path:url.pathname+url.search,
          headers:request.headers(),body:(request.postDataBuffer()||Buffer.alloc(0)).toString('base64')})+'\n');
      });
    },
    close(){child.stdin.end();}
  };
};
