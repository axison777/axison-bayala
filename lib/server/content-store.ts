import {query} from './database';
import {contentSchema,publicContent,type PortfolioContent} from '../portfolio/schema';
import initial from '../portfolio/initial-content.json';
export class ConflictError extends Error {}
export async function readDocument(){
 const {rows}=await query<{draft:string;revision:number;published_at:string;updated_at:string}>('SELECT draft,revision,published_at,updated_at FROM portfolio WHERE id=1');
 const row=rows[0];if(!row)throw new Error('Base non initialisée. Exécuter npm run setup.');
 return {content:contentSchema.parse(JSON.parse(row.draft)),revision:row.revision,publishedAt:row.published_at,updatedAt:row.updated_at};
}
export async function readPublished(){
 const {rows}=await query<{published:string}>('SELECT published FROM portfolio WHERE id=1');
 if(!rows[0])throw new Error('Base non initialisée. Exécuter npm run setup.');
 return publicContent(contentSchema.parse(JSON.parse(rows[0].published)));
}
export async function writeDocument(content:PortfolioContent,revision:number,publish:boolean){
 const parsed=contentSchema.parse(content),json=JSON.stringify(parsed),now=new Date().toISOString();
 const result=publish?await query('UPDATE portfolio SET draft=?,published=?,revision=revision+1,updated_at=?,published_at=? WHERE id=1 AND revision=?',[json,json,now,now,revision]):await query('UPDATE portfolio SET draft=?,revision=revision+1,updated_at=? WHERE id=1 AND revision=?',[json,now,revision]);
 if(result.rowCount!==1)throw new ConflictError('Une autre session a modifié le contenu. Recharge le tableau de bord avant de réessayer.');
 return readDocument();
}
export function initialContent(){return contentSchema.parse(initial);}
