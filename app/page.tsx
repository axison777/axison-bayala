import PortfolioView from '@/components/portfolio-view';
import {readPublished} from '@/lib/server/content-store';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function generateMetadata(){const {profile}=await readPublished();return {title:`${profile.name} — ${profile.role}`,description:profile.intro};}
export default async function Home(){return <PortfolioView content={await readPublished()}/>;}
