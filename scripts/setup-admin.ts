import {migrate} from '../lib/server/migrate';
import {query,dataDirectory,closeDatabase,usesPostgres} from '../lib/server/database';
import {hashPassword} from '../lib/server/password';
import {randomBytes} from 'node:crypto';
import {writeFileSync,chmodSync} from 'node:fs';
import path from 'node:path';
await migrate();
if(!(await query('SELECT id FROM admin WHERE id=1')).rows[0]){
 if(usesPostgres()&&!process.env.ADMIN_INITIAL_PASSWORD)throw new Error('ADMIN_INITIAL_PASSWORD est requis pour créer le compte distant.');
 const password=process.env.ADMIN_INITIAL_PASSWORD||randomBytes(24).toString('base64url');
 if(password.length<14)throw new Error('Le mot de passe initial doit contenir au moins 14 caractères.');
 const email=process.env.ADMIN_EMAIL||'bayalaaxison@gmail.com';
 await query('INSERT INTO admin(id,email,password_hash) VALUES(1,?,?) ON CONFLICT(id) DO NOTHING',[email,hashPassword(password)]);
 if(!process.env.ADMIN_INITIAL_PASSWORD){
  const destination=path.join(dataDirectory(),'admin-access.txt');
  writeFileSync(destination,`Compte administrateur\nEmail : ${email}\nMot de passe : ${password}\n\nConnexion : /admin/login\nChange ce mot de passe dans les paramètres après connexion.\n`,{mode:0o600});chmodSync(destination,0o600);
  console.log(`Compte créé. Identifiants enregistrés dans ${destination} (non publié, non suivi par Git).`);
 }else console.log('Compte créé avec le mot de passe fourni par l’environnement.');
}else console.log('Base prête ; compte existant conservé.');

await closeDatabase();
