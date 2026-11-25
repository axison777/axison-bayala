import {cookies} from 'next/headers';
import {createHash,randomBytes} from 'node:crypto';
import {query} from './database';
import {recordLoginAttempt} from './login-rate';
import {verifyPassword} from './password';
const COOKIE='axison_admin';
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(process.env.APP_URL || request.url);
  if (origin === expected.origin) return;

  // Next.js can use localhost internally even when opened via 127.0.0.1.
  const localHosts = ['localhost', '127.0.0.1'];
  if (
    process.env.NODE_ENV === 'development' &&
    expected.protocol === 'http:' &&
    localHosts.includes(expected.hostname) &&
    localHosts.some(host => origin === `http://${host}${expected.port ? ':' + expected.port : ''}`)
  ) return;

  throw new Error('ORIGIN');
}
export async function isAdmin(){
 const token=(await cookies()).get(COOKIE)?.value;
 if(!token||token.length>128)return false;
 const row=(await query<{expires_at:number|string}>('SELECT expires_at FROM sessions WHERE token_hash=?',[hash(token)])).rows[0];
 return !!row&&Number(row.expires_at)>Date.now();
}
export async function requireAdmin(){if(!await isAdmin())throw new Error('UNAUTHORIZED');}
export async function login(email:string,password:string){
 const now=Date.now(),key='admin-login';
 if(await recordLoginAttempt(now)>10)throw new Error('RATE_LIMIT');
 const admin=(await query<{email:string;password_hash:string}>('SELECT email,password_hash FROM admin WHERE id=1')).rows[0];
 if(!admin||!verifyPassword(password,admin.password_hash)||admin.email.toLowerCase()!==email.toLowerCase())return false;
 await query('DELETE FROM login_attempts WHERE key=?',[key]);
 await query('DELETE FROM sessions WHERE expires_at<?',[now]);
 const token=randomBytes(32).toString('base64url');
 await query('INSERT INTO sessions(token_hash,expires_at) VALUES(?,?)',[hash(token),now+8*60*60_000]);
 const secure=process.env.APP_URL?new URL(process.env.APP_URL).protocol==='https:':process.env.NODE_ENV==='production';
 (await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:8*60*60});
 return true;
}
export async function logout(){const jar=await cookies(),token=jar.get(COOKIE)?.value;if(token)await query('DELETE FROM sessions WHERE token_hash=?',[hash(token)]);jar.delete(COOKIE);}
