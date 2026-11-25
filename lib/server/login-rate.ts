import {query,type Query} from './database';
export async function recordLoginAttempt(now=Date.now(),execute:Query=query){
 const result=await execute<{attempts:number}>(`INSERT INTO login_attempts(key,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN login_attempts.reset_at<? THEN 1 ELSE login_attempts.attempts+1 END,reset_at=CASE WHEN login_attempts.reset_at<? THEN ? ELSE login_attempts.reset_at END RETURNING attempts`,['admin-login',now+15*60_000,now,now,now+15*60_000]);
 return result.rows[0].attempts;
}
