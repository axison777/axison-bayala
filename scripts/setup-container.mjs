import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,scryptSync} from 'node:crypto';
import path from 'node:path';
const remote=Boolean(process.env.DATABASE_URL);
if(process.env.RENDER==='true'&&!remote)throw new Error('DATABASE_URL is required on Render.');
if(remote&&![process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_API_SECRET].every(Boolean))throw new Error('Cloudinary credentials are required for the remote deployment.');
let pool,database;
if(remote){const {Pool}=await import('pg');pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:15000});}
else{const {DatabaseSync}=await import('node:sqlite');const directory=process.env.DATA_DIR||'/app/data';mkdirSync(directory,{recursive:true});database=new DatabaseSync(path.join(directory,'portfolio.sqlite'));database.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');}
async function query(sql,params=[]){if(pool){let n=0;return (await pool.query(sql.replace(/\?/g,()=>'$'+(++n)),params)).rows;}const stmt=database.prepare(sql);if(/^SELECT/i.test(sql))return stmt.all(...params);stmt.run(...params);return [];}
try{
 for(const sql of JSON.parse(readFileSync('schema-statements.json','utf8')))await query(sql);
 const content=readFileSync('initial-content.json','utf8'),now=new Date().toISOString();
 await query('INSERT INTO portfolio(id,draft,published,updated_at,published_at) VALUES(1,?,?,?,?) ON CONFLICT(id) DO NOTHING',[content,content,now,now]);
 if(!(await query('SELECT id FROM admin WHERE id=1'))[0]){
  if(remote&&!process.env.ADMIN_INITIAL_PASSWORD)throw new Error('ADMIN_INITIAL_PASSWORD is required to create the remote admin account.');
  const password=process.env.ADMIN_INITIAL_PASSWORD||randomBytes(24).toString('base64url');if(password.length<14)throw new Error('ADMIN_INITIAL_PASSWORD: minimum 14 characters.');
  const email=process.env.ADMIN_EMAIL||'bayalaaxison@gmail.com',salt=randomBytes(16).toString('hex'),hash=`${salt}:${scryptSync(password,salt,64).toString('hex')}`;
  await query('INSERT INTO admin(id,email,password_hash) VALUES(1,?,?) ON CONFLICT(id) DO NOTHING',[email,hash]);
  if(!process.env.ADMIN_INITIAL_PASSWORD)writeFileSync(path.join(process.env.DATA_DIR||'/app/data','admin-access.txt'),`Email : ${email}\nMot de passe : ${password}\n`,{mode:0o600});
  console.log('Administrator initialized. Credentials are never printed to logs.');
 }
 console.log(remote?'Neon database ready.':'Local database ready.');
}finally{await pool?.end();database?.close();}
