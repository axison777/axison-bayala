import {z} from 'zod';
import {query} from '@/lib/server/database';
import {checkOrigin,requireAdmin,logout} from '@/lib/server/auth';
import {verifyPassword,hashPassword} from '@/lib/server/password';
import {failure,json,readJson} from '@/lib/server/http';
export async function POST(request:Request){try{checkOrigin(request);await requireAdmin();const input=z.object({current:z.string().max(256),password:z.string().min(14,'Utilise au moins 14 caractères.').max(256)}).parse(await readJson(request,4096));const row=(await query<{password_hash:string}>('SELECT password_hash FROM admin WHERE id=1')).rows[0];if(!verifyPassword(input.current,row.password_hash))return json({error:'Le mot de passe actuel est incorrect.'},400);const changed=await query('UPDATE admin SET password_hash=? WHERE id=1 AND password_hash=?',[hashPassword(input.password),row.password_hash]);if(changed.rowCount!==1)return json({error:'Le compte a été modifié. Reconnecte-toi.'},409);await query('DELETE FROM sessions');await logout();return json({ok:true});}catch(e){return failure(e);}}
