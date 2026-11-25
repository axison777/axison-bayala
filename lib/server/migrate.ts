import {query,type Query} from './database';
import {initialContent} from './content-store';
import tables from './schema-statements.json';
export async function migrate(execute:Query=query){

 for(const sql of tables)await execute(sql);
 const json=JSON.stringify(initialContent()),now=new Date().toISOString();
 await execute('INSERT INTO portfolio (id,draft,published,updated_at,published_at) VALUES(1,?,?,?,?) ON CONFLICT(id) DO NOTHING',[json,json,now,now]);
}
