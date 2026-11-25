import {readMedia} from '@/lib/server/media-store';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{name:string}>}){
 const {name}=await params;if(!/^[a-f0-9-]{36}\.(png|jpg|webp|pdf)$/.test(name))return new Response(null,{status:404});
 try{const media=await readMedia(name);if(!media)return new Response(null,{status:404});return new Response(new Uint8Array(media.file),{headers:{'Content-Type':media.mime,'X-Content-Type-Options':'nosniff','Cache-Control':'public,max-age=31536000,immutable',...(name.endsWith('.pdf')?{'Content-Disposition':'attachment; filename="CV.pdf"'}:{})}});}catch{return new Response(null,{status:502});}
}
