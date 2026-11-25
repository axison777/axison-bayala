import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/server/auth';
import LoginForm from '@/components/admin/login-form';
export const dynamic='force-dynamic';
export default async function LoginPage(){if(await isAdmin())redirect('/admin');return <LoginForm/>;}
