import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {contentSchema,publicContent} from '../lib/portfolio/schema';
import initial from '../lib/portfolio/initial-content.json';

test('Validation du contenu et protection des projets confidentiels',()=>{
 const data=contentSchema.parse(initial);const invalid=structuredClone(data);invalid.ratings[0].value=100;assert.equal(contentSchema.safeParse(invalid).success,false);
 const unsafe=structuredClone(data);unsafe.profile.photo='javascript:alert(1)';assert.equal(contentSchema.safeParse(unsafe).success,false);
 const dup=structuredClone(data);dup.formations.push({...dup.formations[0]});assert.equal(contentSchema.safeParse(dup).success,false);
 const confidentialIndex=0;data.projects[confidentialIndex].confidential=true;data.projects[confidentialIndex].mobileImages=['/images/private-mobile.png'];data.projects[confidentialIndex].loginImage='/images/private-login.png';data.projects[confidentialIndex].images=['/images/private.png'];data.formations[0].visible=false;
 const visible=publicContent(data);assert.deepEqual(visible.projects[confidentialIndex].images,[]);assert.deepEqual(visible.projects[confidentialIndex].mobileImages,[]);assert.equal(visible.projects[confidentialIndex].loginImage,undefined);assert.equal(visible.formations.length,data.formations.length-1);assert.equal(data.projects[confidentialIndex].images!.length,1);
});

test('Backend réel : session, brouillon, publication, conflits et persistance',async t=>{
 const directory=mkdtempSync(path.join(os.tmpdir(),'axison-backend-'));
 const password=randomBytes(24).toString('base64url'),origin='http://127.0.0.1:3011';
 const env:NodeJS.ProcessEnv={...process.env,NODE_ENV:'production',DATABASE_URL:'',CLOUDINARY_CLOUD_NAME:'',CLOUDINARY_API_KEY:'',CLOUDINARY_API_SECRET:'',RENDER:'',HOSTNAME:'127.0.0.1',PORT:'3011',DATA_DIR:directory,APP_URL:origin,ADMIN_EMAIL:'test@example.com',ADMIN_INITIAL_PASSWORD:password,NEXT_TELEMETRY_DISABLED:'1'};
 const setup=spawnSync(process.execPath,['--import','tsx','scripts/setup-admin.ts'],{env,encoding:'utf8'});assert.equal(setup.status,0,setup.stderr);
 let server=spawn(process.execPath,['scripts/start.mjs'],{env,stdio:'ignore'});
 async function ready(){for(let i=0;i<100;i++){try{if((await fetch(origin)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error('Serveur de test indisponible.');}
 const stop=async()=>{if(server.exitCode!==null)return;await new Promise<void>(resolve=>{server.once('exit',()=>resolve());server.kill('SIGTERM');});};
 try{
 await ready();let cookie='';let document:any;
 const request=(route:string,method='GET',body?:unknown,extra:Record<string,string>={})=>fetch(origin+route,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});
 await t.test('Accès anonyme et origine étrangère refusés',async()=>{
  assert.equal((await request('/api/admin/content')).status,401);
  assert.equal((await request('/api/admin/content','PUT',{})).status,401);
  assert.equal((await request('/admin')).status,307);
  assert.equal((await request('/admin/preview')).status,307);
  assert.equal((await request('/api/admin/login','POST',{email:'test@example.com',password},{Origin:'https://evil.example'})).status,403);
  assert.equal((await request('/api/admin/upload','POST')).status,401);
 });
 await t.test('Connexion avec cookie sécurisé et aucune édition publique',async()=>{
  assert.equal((await request('/api/admin/login','POST',{email:'test@example.com',password:'incorrect'})).status,401);
  const r=await request('/api/admin/login','POST',{email:'test@example.com',password});assert.equal(r.status,200);const header=r.headers.get('set-cookie')!;assert.match(header,/HttpOnly/i);assert.match(header,/SameSite=strict/i);cookie=header.split(';')[0];
  const page=await(await request('/')).text();assert.doesNotMatch(page,/Modifier mes stats/);assert.match(page,/PlantCare AI/);
  document=await(await request('/api/admin/content')).json();
 });
 await t.test('Brouillon privé, validation serveur et conflit de version',async()=>{
  const invalid=structuredClone(document.content);invalid.ratings[0].value=120;assert.equal((await request('/api/admin/content','PUT',{content:invalid,revision:document.revision,publish:false})).status,400);
  const draft=structuredClone(document.content);draft.profile.name='Test Brouillon Unique';draft.ratings[0].value=93;
  const oldRevision=document.revision;const r=await request('/api/admin/content','PUT',{content:draft,revision:oldRevision,publish:false});assert.equal(r.status,200);document=await r.json();
  assert.doesNotMatch(await(await request('/')).text(),/Test Brouillon Unique/);
  assert.match(await(await request('/admin/preview')).text(),/Test Brouillon Unique/);
  assert.equal((await request('/api/admin/content','PUT',{content:draft,revision:oldRevision,publish:true})).status,409);
 });
 await t.test('Publication appliquée et conservée après redémarrage',async()=>{
  const r=await request('/api/admin/content','PUT',{content:document.content,revision:document.revision,publish:true});assert.equal(r.status,200);document=await r.json();assert.match(await(await request('/')).text(),/Test Brouillon Unique/);
  await stop();server=spawn(process.execPath,['scripts/start.mjs'],{env,stdio:'ignore'});await ready();assert.match(await(await request('/')).text(),/Test Brouillon Unique/);
  assert.equal((await request('/api/admin/content')).status,200);
 });
 await t.test('Import validé et déconnexion révocable',async()=>{
  let r=await fetch(origin+'/api/admin/upload',{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'image/svg+xml'},body:'<svg onload="alert(1)"/>'});assert.equal(r.status,400);
  r=await fetch(origin+'/api/admin/upload',{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/pdf'},body:'%PDF-1.4\nTest PDF'});assert.equal(r.status,200);const uploaded=await r.json();const file=await fetch(origin+uploaded.url);assert.equal(file.status,200);assert.equal(file.headers.get('content-type'),'application/pdf');assert.match(file.headers.get('content-disposition')!,/attachment/);
  const oldCookie=cookie;assert.equal((await request('/api/admin/logout','POST')).status,200);assert.equal((await request('/api/admin/content','GET',undefined,{Cookie:oldCookie})).status,401);
 });
 }finally{await stop();rmSync(directory,{recursive:true,force:true});}
});
