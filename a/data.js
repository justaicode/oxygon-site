import {config} from './config.js?v=1fa97ff6bdef';
export const isLocal = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
export function activityId(path=location.pathname) {return /^\/a\/([A-Za-z0-9_-]{6,80})\/?$/.exec(path)?.[1]||null;}
export async function loadActivity(id,language) {
  if(!id)return null;
  if(isLocal&&config.dataSource==='fixture') {
    const {fixture}=await import('./fixtures.js?v=f2dec000fd11');return fixture(id,language);
  }
  // Contract not supplied yet: do not guess the RPC name, call a table, or expose a fixture remotely.
  if(!config.rpcName)return null;
  const response=await fetch(`${config.supabaseUrl}/rest/v1/rpc/${encodeURIComponent(config.rpcName)}`,{
    method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
    headers:{apikey:config.publishableKey,'Content-Type':'application/json'},
    body:JSON.stringify({share_id:id,language}),signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)return null;
  return response.json();
}
