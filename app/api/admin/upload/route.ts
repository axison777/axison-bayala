import {mediaExtension,saveMedia} from '@/lib/server/media-store';
import {checkOrigin,requireAdmin} from '@/lib/server/auth';
import {failure,json} from '@/lib/server/http';
export const runtime='nodejs';
export async function POST(request:Request){try{
 checkOrigin(request);await requireAdmin();
 if(Number(request.headers.get('content-length')||0)>6_000_000)return json({error:'Fichier trop volumineux (5 Mo maximum).'},413);
 const reader=request.body?.getReader();if(!reader)return json({error:'Fichier absent.'},400);
 const chunks:Uint8Array[]=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5_000_000){await reader.cancel();return json({error:'Fichier trop volumineux (5 Mo maximum).'},413);}chunks.push(value);}
 const buffer=Buffer.concat(chunks),ext=mediaExtension(buffer);
 if(!ext)return json({error:'Formats acceptés : PNG, JPEG, WebP ou PDF.'},400);
 return json({url:await saveMedia(buffer,ext)});
}catch(e){return failure(e);}}
