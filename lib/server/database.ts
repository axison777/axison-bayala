import path from 'node:path';
import {mkdirSync} from 'node:fs';
import type {DatabaseSync} from 'node:sqlite';
import type {Pool} from 'pg';
const state = globalThis as unknown as {portfolioDb?: DatabaseSync; portfolioPool?: Pool};
export function dataDirectory() { return path.resolve(process.env.DATA_DIR || './data'); }
export function usesPostgres() { return Boolean(process.env.DATABASE_URL); }
export type QueryResult<T> = {rows:T[]; rowCount:number};
export type Query = <T = Record<string, unknown>>(sql:string, params?:unknown[]) => Promise<QueryResult<T>>;
export const query: Query = async <T = Record<string, unknown>>(sql:string, params:unknown[] = []) => {
  if (usesPostgres()) {
    if (!state.portfolioPool) {
      const {Pool} = await import('pg');
      state.portfolioPool = new Pool({connectionString:process.env.DATABASE_URL, max:5, connectionTimeoutMillis:15000, idleTimeoutMillis:30000});
      state.portfolioPool.on('error', () => console.error('PostgreSQL connection interrupted.'));
    }
    let index=0;
    const result=await state.portfolioPool.query(sql.replace(/\?/g, () => '$'+(++index)), params);
    return {rows:result.rows as T[],rowCount:result.rowCount ?? 0};
  }
  if (process.env.RENDER === 'true') throw new Error('DATABASE_URL must be configured on Render.');
  if (!state.portfolioDb) {
    const {DatabaseSync} = await import('node:sqlite');
    mkdirSync(dataDirectory(), {recursive:true});
    state.portfolioDb=new DatabaseSync(path.join(dataDirectory(),'portfolio.sqlite'));
    state.portfolioDb.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  }
  const statement=state.portfolioDb.prepare(sql);
  if (/^\s*(SELECT|WITH|PRAGMA)\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
    const rows=statement.all(...params as (string|number|null)[]) as T[];
    return {rows,rowCount:rows.length};
  }
  const result=statement.run(...params as (string|number|null)[]);
  return {rows:[] as T[],rowCount:Number(result.changes)};
};
export async function closeDatabase(){await state.portfolioPool?.end();state.portfolioPool=undefined;state.portfolioDb?.close();state.portfolioDb=undefined;}
