import {z} from 'zod';
import {checkOrigin,requireAdmin} from '@/lib/server/auth';
import {readDocument,writeDocument} from '@/lib/server/content-store';
import {contentSchema} from '@/lib/portfolio/schema';
import {failure,json,readJson} from '@/lib/server/http';
export const runtime='nodejs';
export async function GET(){try{await requireAdmin();return json(await readDocument());}catch(e){return failure(e);}}
export async function PUT(request:Request){try{checkOrigin(request);await requireAdmin();const data=z.object({content:contentSchema,revision:z.number().int().positive(),publish:z.boolean()}).parse(await readJson(request));return json(await writeDocument(data.content,data.revision,data.publish));}catch(e){return failure(e);}}
