import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {uploadCloudinary,mediaExtension,trustedMediaUrl} from '../lib/server/media-store';

test('Cloudinary : envoi signé, types de fichiers, URL de confiance et erreurs',async()=>{
 const keys=['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'] as const;
 const previous=keys.map(key=>process.env[key]);
 Object.assign(process.env,{CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'fake-key',CLOUDINARY_API_SECRET:'fake-secret'});
 try{
  assert.equal(mediaExtension(Buffer.from('%PDF-1.4\nMock')),'pdf');assert.equal(mediaExtension(Buffer.from('<svg onload="bad"/>')),'');
  const name='00000000-0000-0000-0000-000000000001.pdf';
  const request:typeof fetch=async(input,init)=>{
   assert.equal(String(input),'https://api.cloudinary.com/v1_1/test-cloud/raw/upload');
   const form=init?.body as FormData;assert.equal(form.get('api_key'),'fake-key');assert.equal(form.get('api_secret'),null);
   const expected=createHash('sha256').update(`overwrite=false&public_id=portfolio/${name}&timestamp=${form.get('timestamp')}fake-secret`).digest('hex');
   assert.equal(form.get('signature'),expected);assert.ok(form.get('file') instanceof Blob);
   return Response.json({secure_url:`https://res.cloudinary.com/test-cloud/raw/upload/v1/portfolio/${name}`});
  };
  const url=await uploadCloudinary(Buffer.from('%PDF-1.4\nMock'),'pdf',name,request);assert.ok(trustedMediaUrl(url));
  for(const value of ['https://evil.example/test-cloud/demo.pdf','http://res.cloudinary.com/test-cloud/demo.pdf','https://res.cloudinary.com/other/demo.pdf'])assert.equal(trustedMediaUrl(value),false);
  await assert.rejects(uploadCloudinary(Buffer.from('data'),'png','demo.png',async()=>new Response(null,{status:500})),/upload failed/);
  await assert.rejects(uploadCloudinary(Buffer.from('data'),'png','demo.png',async()=>Response.json({secure_url:'https://evil.example/file.png'})),/Invalid Cloudinary/);
 }finally{keys.forEach((key,i)=>{if(previous[i]===undefined)delete process.env[key];else process.env[key]=previous[i];});}
});
