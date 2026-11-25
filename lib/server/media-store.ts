import {createHash,randomUUID} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {dataDirectory,query,usesPostgres} from './database';
export const mediaTypes:Record<string,string>={png:'image/png',jpg:'image/jpeg',webp:'image/webp',pdf:'application/pdf'};
export function mediaExtension(buffer:Buffer){
 if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
 if(buffer[0]===255&&buffer[1]===216&&buffer[2]===255)return 'jpg';
 if(buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP')return 'webp';
 if(buffer.subarray(0,5).toString()==='%PDF-')return 'pdf';
 return '';
}
export function cloudinaryConfigured(){return Boolean(process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET);}
export async function uploadCloudinary(buffer:Buffer,extension:string,name:string,request:typeof fetch=fetch){
 const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;
 if(!cloud||!key||!secret||!/^[a-zA-Z0-9_-]+$/.test(cloud))throw new Error('Cloudinary must be configured.');
 const resource=extension==='pdf'?'raw':'image';
 const publicId='portfolio/'+(resource==='raw'?name:name.replace(/\.[^.]+$/,''));
 const timestamp=String(Math.floor(Date.now()/1000));
 const signature=createHash('sha256').update(`overwrite=false&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');
 const form=new FormData();form.set('file',new Blob([new Uint8Array(buffer)],{type:mediaTypes[extension]}),name);
 for(const [k,v]of Object.entries({public_id:publicId,overwrite:'false',timestamp,signature,api_key:key}))form.set(k,v);
 const response=await request(`https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`,{method:'POST',body:form,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Cloudinary upload failed.');
 const result=await response.json() as {secure_url?:string};
 if(!result.secure_url||!trustedMediaUrl(result.secure_url))throw new Error('Invalid Cloudinary response.');
 return result.secure_url;
}
export function trustedMediaUrl(value:string){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='res.cloudinary.com'&&url.pathname.startsWith(`/${process.env.CLOUDINARY_CLOUD_NAME}/`);}catch{return false;}}
export async function saveMedia(buffer:Buffer,extension:string){
 const name=`${randomUUID()}.${extension}`;
 if(cloudinaryConfigured()){
  const url=await uploadCloudinary(buffer,extension,name);
  await query('INSERT INTO media(name,url,mime) VALUES(?,?,?)',[name,url,mediaTypes[extension]]);
 }else{
  if(usesPostgres()||process.env.RENDER==='true')throw new Error('Cloudinary must be configured for durable uploads.');
  const directory=path.join(dataDirectory(),'media');await mkdir(directory,{recursive:true});await writeFile(path.join(directory,name),buffer,{flag:'wx',mode:0o600});
 }
 return `/media/${name}`;
}
export async function readMedia(name:string){
 const ext=name.split('.').pop()!;
 if(usesPostgres()||cloudinaryConfigured()){
  const row=(await query<{url:string;mime:string}>('SELECT url,mime FROM media WHERE name=?',[name])).rows[0];
  if(row){if(!trustedMediaUrl(row.url))throw new Error('Invalid media URL.');const response=await fetch(row.url,{signal:AbortSignal.timeout(15000),redirect:'error'});if(!response.ok)throw new Error('Media unavailable.');return {file:Buffer.from(await response.arrayBuffer()),mime:mediaTypes[ext]};}
  if(usesPostgres())return null;
 }
 try{return {file:await readFile(path.join(dataDirectory(),'media',name)),mime:mediaTypes[ext]};}catch{return null;}
}
