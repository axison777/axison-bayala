import {ZodError} from 'zod';
import {ConflictError} from './content-store';
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store'}});}
export function failure(error:unknown){
 if(error instanceof ZodError)return json({error:error.issues.map(i=>`${i.path.join('.')} : ${i.message}`).join('\n')},400);
 if(error instanceof ConflictError)return json({error:error.message},409);
 const message=error instanceof Error?error.message:'';
 if(message==='UNAUTHORIZED')return json({error:'Session expirée. Reconnecte-toi.'},401);
 if(message==='ORIGIN')return json({error:'Origine de la requête refusée.'},403);
 if(message==='RATE_LIMIT')return json({error:'Trop de tentatives. Réessaie dans 15 minutes.'},429);
 if(message==='BODY_TOO_LARGE')return json({error:'Le contenu dépasse la taille autorisée.'},413);
 if(error instanceof SyntaxError)return json({error:'Données JSON invalides.'},400);
 console.error('Portfolio API error', error instanceof Error?error.name:'Unknown');
 return json({error:'Impossible de terminer l’opération. Réessaie.'},500);
}
export async function readJson(request:Request,max=1_000_000){
 if(!request.headers.get('content-type')?.includes('application/json'))throw new SyntaxError();
 const reader=request.body?.getReader();if(!reader)throw new SyntaxError();
 const chunks:Uint8Array[]=[];let total=0;
 for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();throw new Error('BODY_TOO_LARGE');}chunks.push(value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
