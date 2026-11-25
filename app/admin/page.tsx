import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/server/auth';
import {readDocument} from '@/lib/server/content-store';
import Dashboard from '@/components/admin/dashboard';
export const dynamic='force-dynamic';
export default async function AdminPage(){if(!await isAdmin())redirect('/admin/login');return <Dashboard initial={await readDocument()}/>;}
