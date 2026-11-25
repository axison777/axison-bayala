import path from 'node:path';
// Le serveur standalone change de répertoire : résoudre les données avant son chargement.
process.env.DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
process.env.HOSTNAME ||= '0.0.0.0';
await import('../.next/standalone/server.js');
