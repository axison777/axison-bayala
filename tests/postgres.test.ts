import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {migrate} from '../lib/server/migrate';
import {recordLoginAttempt} from '../lib/server/login-rate';
import type {Query} from '../lib/server/database';

test('PostgreSQL réel : migrations idempotentes, publication atomique et limitation de connexion',async()=>{
 const pg=new PGlite();
 const execute:Query=async <T>(sql:string,params:unknown[]=[])=>{let n=0;const result=await pg.query(sql.replace(/\?/g,()=>'$'+(++n)),params);return {rows:result.rows as T[],rowCount:result.affectedRows??result.rows.length};};
 try{
  await migrate(execute);
  const first=(await execute<{published:string;revision:number}>('SELECT published,revision FROM portfolio WHERE id=1')).rows[0];
  assert.ok(JSON.parse(first.published).projects.length>0);
  const updated=await execute('UPDATE portfolio SET draft=?,published=?,revision=revision+1 WHERE id=1 AND revision=?',[first.published,first.published,first.revision]);assert.equal(updated.rowCount,1);
  assert.equal((await execute('UPDATE portfolio SET draft=? WHERE id=1 AND revision=?',['stale',first.revision])).rowCount,0);
  await migrate(execute);assert.equal((await execute<{revision:number}>('SELECT revision FROM portfolio WHERE id=1')).rows[0].revision,first.revision+1);
  const now=Date.now();for(let n=1;n<=11;n++)assert.equal(await recordLoginAttempt(now,execute),n);
  assert.equal(await recordLoginAttempt(now+16*60_000,execute),1);
  await execute('INSERT INTO sessions(token_hash,expires_at) VALUES(?,?)',['test',now+10000]);
  assert.equal((await execute('SELECT token_hash FROM sessions WHERE expires_at>?',[now])).rows.length,1);
  await execute('INSERT INTO media(name,url,mime) VALUES(?,?,?)',['demo.pdf','https://res.cloudinary.com/test/raw/upload/demo.pdf','application/pdf']);
  assert.equal((await execute('SELECT name FROM media WHERE name=?',['demo.pdf'])).rows.length,1);
 }finally{await pg.close();}
});
