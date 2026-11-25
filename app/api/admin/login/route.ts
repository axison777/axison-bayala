import {z} from 'zod';
import {checkOrigin,login} from '@/lib/server/auth';
import {failure,json,readJson} from '@/lib/server/http';
export const runtime='nodejs';
export async function POST(request:Request){try{checkOrigin(request);const data=z.object({email:z.string().email().max(200),password:z.string().min(1).max(256)}).parse(await readJson(request,4096));if(!await login(data.email,data.password))return json({error:'Identifiants incorrects.'},401);return json({ok:true});}catch(e){return failure(e);}}
