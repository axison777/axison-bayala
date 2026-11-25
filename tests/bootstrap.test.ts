import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';

test('Initialisation Docker : contenu et compte conservés après deux démarrages',()=>{
 const directory=mkdtempSync(path.join(tmpdir(),'axison-bootstrap-'));
 try{
  copyFileSync('lib/server/schema-statements.json',path.join(directory,'schema-statements.json'));
  copyFileSync('lib/portfolio/initial-content.json',path.join(directory,'initial-content.json'));
  const password=randomBytes(24).toString('base64url');
  const env={...process.env,DATABASE_URL:'',RENDER:'',DATA_DIR:path.join(directory,'data'),ADMIN_EMAIL:'bootstrap@example.test',ADMIN_INITIAL_PASSWORD:password};
  const run=()=>spawnSync(process.execPath,[path.resolve('scripts/setup-container.mjs')],{cwd:directory,env,encoding:'utf8'});
  const first=run();assert.equal(first.status,0,first.stderr);assert.ok(!first.stdout.includes(password));
  const db=new DatabaseSync(path.join(directory,'data/portfolio.sqlite'));
  const hash=(db.prepare('SELECT password_hash FROM admin WHERE id=1').get() as {password_hash:string}).password_hash;
  db.prepare('UPDATE portfolio SET revision=42 WHERE id=1').run();db.close();
  assert.equal(run().status,0);
  const reopened=new DatabaseSync(path.join(directory,'data/portfolio.sqlite'));
  assert.equal((reopened.prepare('SELECT revision FROM portfolio WHERE id=1').get() as {revision:number}).revision,42);
  assert.equal((reopened.prepare('SELECT password_hash FROM admin WHERE id=1').get() as {password_hash:string}).password_hash,hash);reopened.close();
 }finally{rmSync(directory,{recursive:true,force:true});}
});
