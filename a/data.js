import {config} from './config.js?v=53af6894aebe';
import {validId} from './model.js?v=1017dd7149da';
export function activityId(hash=location.hash){const id=hash.startsWith('#')?hash.slice(1):'';return validId(id)?id:null;}
export async function loadActivity(id,signal){
 if(!validId(id))return null;
 const response=await fetch(`${config.supabaseUrl}/rest/v1/rpc/public_activity`,{
  method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({p_id:id}),signal:signal||AbortSignal.timeout(10000)
 });
 if(!response.ok)return null;return response.json();
}
export async function loadPhotos(id,indexes,signal){
 if(!validId(id))return [];
 const photos=[];
 try{for(const index of indexes){
  if(!Number.isInteger(index)||index<0||index>3)continue;
  const url=new URL(config.supabaseUrl+'/functions/v1/public-activity-media');url.searchParams.set('id',id);url.searchParams.set('index',String(index));
  // Simple GET: no bearer/session/apikey header or private storage URL; endpoint rechecks revocation.
  const response=await fetch(url,{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:signal||AbortSignal.timeout(10000)});
  if(!response.ok||!/^image\/jpeg(?:;|$)/i.test(response.headers.get('Content-Type')||''))throw new Error('Public media unavailable');
  const blob=await response.blob();if(!blob.size)throw new Error('Empty public image');photos.push({url:URL.createObjectURL(blob),index});
 }return photos;}catch(error){revokePhotos(photos);throw error;}
}
export function revokePhotos(photos){for(const photo of photos)URL.revokeObjectURL(photo.url);}
