import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/server/auth';
import {readDocument} from '@/lib/server/content-store';
import {publicContent} from '@/lib/portfolio/schema';
import PortfolioView from '@/components/portfolio-view';
export const dynamic='force-dynamic';
export default async function Preview(){if(!await isAdmin())redirect('/admin/login');return <><div className="draft-banner">Aperçu du brouillon enregistré — non publié <a href="/admin">Retour au tableau de bord ↗</a></div><PortfolioView content={publicContent((await readDocument()).content)}/></>;}
