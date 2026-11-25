import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft, ArrowUpRight, LockKeyhole, Network} from 'lucide-react';
import {readPublished} from '@/lib/server/content-store';
import ProjectScreens from '@/components/project-screens';
import './project-detail.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Props = {params: Promise<{id: string}>};

export async function generateMetadata({params}: Props) {
  const {id} = await params;
  const project = (await readPublished()).projects.find(project => project.id === id);
  return project
    ? {title: project.name + ' — Axison Bayala', description: project.description}
    : {title: 'Projet introuvable'};
}

export default async function ProjectDetail({params}: Props) {
  const {id} = await params;
  const {projects, profile} = await readPublished();
  const project = projects.find(project => project.id === id);
  if (!project) notFound();

  return (
    <main className="project-detail wrap">
      <nav className="detail-nav" aria-label="Navigation du projet">
        <Link href="/#projets"><ArrowLeft size={17}/> Toutes les réalisations</Link>
        <Link href="/#contact" className="text-link">Me contacter <ArrowUpRight size={16}/></Link>
      </nav>
      <header className="detail-heading">
        <p>{project.type}</p>
        <h1>{project.name}</h1>
        <p className="detail-summary">{project.description}</p>
        <div className="project-tech">{project.tech.map(tech => <span key={tech}>{tech}</span>)}</div>
      </header>
      <div className="detail-columns">
      <div className="detail-overview">
        <section aria-labelledby="presentation-title">
          <h2 id="presentation-title">Le projet</h2>
          <p>{project.detail}</p>
          {project.role && <><h2>Mon intervention</h2><p>{project.role}</p></>}
        </section>
        <aside>
          <p className="detail-label">Organisation</p>
          <p>{project.company}</p>
          <a href={`mailto:${profile.email}?subject=${encodeURIComponent('Échanger à propos de ' + project.name)}`} className="button">Échanger sur ce projet <ArrowUpRight size={17}/></a>
        </aside>
      </div>
      {project.confidential
        ? <p className="detail-confidential"><LockKeyhole size={20}/> Les écrans de ce projet sont confidentiels. Présentation de mon intervention sur demande.</p>
        : project.images?.length
          ? <ProjectScreens name={project.name} images={project.images} mobileImages={project.mobileImages} loginImage={project.loginImage} mobile={project.categories.includes("Mobile") && !project.categories.includes("Frontend")} design={project.categories.length === 1 && project.categories.includes("UI/UX")}/>
          : project.visual === 'network'
          ? <section className="detail-network" aria-label="Intervention réseau et maintenance"><Network size={64} strokeWidth={1}/><h2>Réseau & équipements</h2><p>Une intervention sur site pour étendre la connectivité et accompagner l’utilisation des équipements bureautiques.</p><div className="project-tech">{project.tech.map(item=><span key={item}>{item}</span>)}</div></section>
          : <p className="detail-empty">Les captures de cette application seront ajoutées prochainement.</p>}
      </div>

    </main>
  );
}
