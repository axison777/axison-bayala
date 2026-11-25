"use client";
import {useState} from "react";
import TechnologyBadge from "@/components/technology-badge";
import SkillPlayerCard from "@/components/skill-player-card";
import {ArrowUpRight, Download, Code2, Layers, Network, X, Menu, MapPin, Plus, Minus, Check, Copy, Leaf, Wallet, GraduationCap, MessageCircle, Phone, LockKeyhole, Database, HeartHandshake, RefreshCw, Sparkles, Video} from "lucide-react";

import Link from "next/link";
import {projectCategories} from "@/lib/portfolio/schema";
import type {PortfolioContent} from "@/lib/portfolio/schema";
const iconMap = {Code2,Layers,Network,Database,RefreshCw,HeartHandshake,Sparkles,Video};
function SocialLinks({profile}:{profile:PortfolioContent["profile"]}){return <div className="social-links">{profile.github&&<a href={profile.github} target="_blank" rel="noopener noreferrer"><Code2 size={16}/>GitHub<ArrowUpRight size={12}/></a>}{profile.linkedin&&<a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><span className="linkedin-mark" aria-hidden="true">in</span>LinkedIn<ArrowUpRight size={12}/></a>}<a href={`https://wa.me/${profile.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>WhatsApp<ArrowUpRight size={12}/></a></div>}
function Mark(){return <span className="brand-mark" aria-hidden="true">a<span>✳</span></span>}
function Preview({kind}:{kind:string}) {
 return <div className={`project-art ${kind}`} aria-hidden="true">
  <span className="concept">{kind==="private"?"CONFIDENTIEL":kind==="crypgo"?"CAPTURE DU PROJET":kind==="project"||kind==="network"?"":"CONCEPT VISUEL"}</span>
  {kind==="network" ? <div className="network-project-art"><Network size={58} strokeWidth={1}/><strong>Connecter les espaces.<br/>Relier les équipements.</strong><small>WI-FI · RÉSEAU LOCAL · MAINTENANCE</small></div> : kind==="project" ? <div className="new-project-art"><Code2 size={40} strokeWidth={1}/></div> : kind==="private" ? <div className="private-art"><LockKeyhole size={38} strokeWidth={1}/><span>PROJET INSTITUTIONNEL</span><strong>Des outils au service<br/>des organisations.</strong><small>Présentation sur demande</small></div> : kind==="rental" ? <div className="rental-art"><span>EN ROUTE.</span><strong>Réserver.<br/>Rouler.</strong><div className="road-lines"/></div> : kind==="crypgo" ? <div className="capture-preview"><img src="/images/crypgo-1.png" alt="" loading="lazy"/><span>Crypgo · Interface web</span></div> : kind==="money" ? <><span className="art-word">L’argent.<br/>En mouvement.</span><div className="bank-card"><Wallet size={24}/><b>postemoney<span>↗</span></b><small>Votre quotidien, simplifié.</small><div className="card-chip"/><span className="card-dots">•••• &nbsp; •••• &nbsp; ••••</span></div><div className="coin">P</div></> :
   kind==="plant" ? <><div className="plant-copy"><Leaf size={28}/><span>Un regard.<br/><b>Une plante<br/>en bonne santé.</b></span></div><div className="phone"><div className="phone-top"/><span>plantcare<span className="green"> ai</span></span><div className="leaf-scene"><i/><i/><i/><i/><div className="scan-line"/></div><small>COMPRENDRE SA PLANTE</small><strong>La nature, décryptée.</strong><div className="phone-button">Analyser une plante ↗</div></div></> :
   kind==="erp" ? <><span className="art-word">Tout connecter.<br/>Mieux gérer.</span><div className="dashboard"><div className="dash-side">é.<i/><i/><i/><i/></div><div className="dash-main"><small>ÉCONOMAT / VUE D’ENSEMBLE</small><strong>Une gestion centralisée.</strong><div className="dash-stats"><i/><i/><i/></div><div className="bars">{[40,65,50,80,70,95,75,100].map((h,i)=><i key={i} style={{height:h+"%"}}/>)}</div></div></div></> :
   kind==="learning" ? <><div className="learning-word">Hallo<span>!</span></div><div className="learning-card"><GraduationCap/><small>MAISON DE L’ALLEMAGNE</small><b>Une nouvelle langue.<br/>De nouvelles possibilités.</b><span>Apprendre & explorer ↗</span></div><div className="german-stripes"><i/><i/><i/></div></> :
   kind==="apec" ? <><span className="art-word">Investir.<br/>Ensemble.</span><div className="apec-disc">APEC<span>Actionnariat populaire</span></div></> :
   <><span className="art-word">À l’écoute<br/>de soi.</span><div className="cycle-ring"><span>Mon cycle<small>Un jour à la fois.</small></span></div></>}
 </div>
}
export default function PortfolioView({content}:{content:PortfolioContent}){
 const {profile,projects,experiences,skillGroups,formations}=content;
 const services=content.services.map(s=>({...s,icon:iconMap[s.icon]}));
 const expertises=content.expertises.map((e,i)=>({...e,icon:iconMap[e.icon],n:String(i+1).padStart(2,"0")}));
 const [menu,setMenu]=useState(false),[filter,setFilter]=useState("Tous"),[all,setAll]=useState(false),[openExp,setOpenExp]=useState<number|null>(0),[copied,setCopied]=useState(false);
 async function copyEmail(){try{await navigator.clipboard.writeText(profile.email);setCopied(true);setTimeout(()=>setCopied(false),2500)}catch{window.location.href=`mailto:${profile.email}`}}
 const filtered = projects.filter(project => filter === "Tous" || project.categories.some(category => category === filter));
 if (filter === "UI/UX") filtered.sort((a,b) => Number(b.categories.length === 1) - Number(a.categories.length === 1));
 const visible = all ? filtered : filtered.slice(0, 6);
 return <>
 <a className="skip-link" href="#main">Aller au contenu</a>
 <header className="header"><a className="brand" href="#" aria-label="Axison, accueil"><Mark/>axison<span className="brand-dot">.</span></a><nav className={menu?"nav open":"nav"} aria-label="Navigation principale">{[["Réalisations","projets"],["Expertises","expertises"],["À propos","apropos"],["Parcours","parcours"]].map(([name,id])=><a key={id} href={`#${id}`} onClick={()=>setMenu(false)}>{name}</a>)}</nav><a className="button small header-contact" href="#contact">Parlons de votre projet <ArrowUpRight size={16}/></a><button className="menu-toggle" aria-label={menu?"Fermer le menu":"Ouvrir le menu"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
 <main id="main">
 <section className="hero wrap home-hero">
   <div className="hero-copy">
     <p className="home-name">{profile.name} · {profile.role}</p>
     <h1>Des idées.<br/>Du code qui <span>sert.</span></h1>
     <p>{profile.intro}</p>
     <div className="hero-actions">
       <a className="button" href="#contact">Parlons de ton projet <ArrowUpRight size={18}/></a>
       <a className="text-link" href="#projets">Voir mes réalisations <ArrowUpRight size={16}/></a>
     </div>
   </div>
 </section>
 <div className="home-facts wrap">
   <a href="#projets"><strong>{projects.length}</strong> Réalisations</a>
   <a href="#parcours"><strong>{experiences.length}</strong> Expériences</a>
   <a href="#parcours"><strong>{formations.length}</strong> Formations</a>
   <span><MapPin size={20}/> {profile.location}</span>
 </div>
 <section className="section wrap home-projects" id="projets">
   <div className="section-top home-section-top">
     <div><h2>Mes réalisations <Mark/></h2><p>Applications, maquettes UI/UX, réseaux et maintenance informatique.</p></div>
   </div>
     <div className="project-toolbar">
       <div className="filters" aria-label="Filtrer les réalisations">{["Tous",...projectCategories].map(category => <button key={category} className={filter === category ? "active" : ""} aria-pressed={filter === category} onClick={() => {setFilter(category); setAll(false);}}>{category}</button>)}</div>
       <span className="project-count" aria-live="polite">{filter === "Tous" ? projects.length : filtered.length} réalisations</span>
     </div>
   <div id="liste-projets">
     <div className="project-grid compact-projects">{visible.map(project => <Link className={`project-card${project.categories.length === 1 && project.categories.includes("UI/UX") ? " design-project" : ""}`} key={project.id} href={`/projets/${encodeURIComponent(project.id)}`} aria-label={`Découvrir ${project.name}`}>
       {!project.confidential && project.images?.length
         ? <div className="project-art capture-preview"><img src={project.images[0]} alt="" loading="lazy"/></div>
         : <Preview kind={project.confidential ? "private" : project.visual}/>}
       <div className="project-info"><div><small>{project.type}</small><h3>{project.name}</h3></div><span className="round-arrow"><ArrowUpRight size={16}/></span></div>
       <p className="project-description">{project.description}</p>
     </Link>)}</div>
     {!filtered.length && <p>Aucune réalisation dans cette catégorie.</p>}
     {filtered.length > 6 && <button className="button outline more-projects" onClick={() => setAll(!all)}>{all ? "Réduire la liste" : "Voir toutes les réalisations"}{all ? <Minus size={17}/> : <Plus size={17}/>}</button>}
   </div>
 </section>
 <section className="expertise-section" id="expertises"><div className="wrap section"><div className="section-top"><div><h2>Mes expertises <Mark/></h2></div><p>Une vision transversale pour faire avancer<br/>votre projet à chaque étape.</p></div><div className="expertise-grid">{expertises.map(e=><article className="expertise" key={e.n}><div className="expertise-head"><e.icon size={29} strokeWidth={1.4}/><span>{e.n}</span></div><h3>{e.title}</h3><p>{e.text}</p><div className="expertise-tags">{e.tags}</div></article>)}</div><div className="skills-panel"><div className="skills-heading"><span className="eyebrow muted">MA BOÎTE À OUTILS</span><p>Les technologies avec lesquelles je construis.</p></div><div className="skill-groups">{skillGroups.map(group=><div key={group.id}><h3>{group.title}</h3><div>{group.items.map(item=><TechnologyBadge key={item} name={item}/>)}</div></div>)}</div></div><div className="services-panel" id="services"><div className="section-top"><div><div className="eyebrow muted">DE L’EXPERTISE À LA RÉALISATION</div><h2>Comment je peux <span>vous accompagner.</span></h2></div></div><div className="service-list">{services.map(service=><details key={service.id}><summary><service.icon size={22}/><h3>{service.title}</h3><Plus size={18} className="service-plus"/></summary><div className="service-body"><p>{service.text}</p><ul>{service.items.map(item=><li key={item}>{item}</li>)}</ul><a className="text-link" href={`mailto:${profile.email}?subject=${encodeURIComponent(service.title)}`}>Parlons de votre besoin <ArrowUpRight size={15}/></a></div></details>)}</div><div className="process">{[["01","Échanger","Comprendre le besoin et définir le périmètre."],["02","Proposer","Choisir une approche, les technologies et un planning."],["03","Construire","Développer, tester et partager l’avancement."],["04","Transmettre","Livrer, créer des capsules vidéo et former les utilisateurs à la prise en main."]].map(([n,title,text])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></div>)}</div></div></div></section>
 <section className="section wrap journey" id="parcours"><div className="journey-heading"><h2>Mon parcours <Mark/></h2><p>Des premières plateformes web aux applications en production.</p><div className="education"><GraduationCap size={23}/><div><b>Formation continue</b>{formations.map(f=><span key={f.id}>{f.title} · {f.school}, {f.date}</span>)}</div></div></div><div className="timeline">{experiences.map((e,i)=><div className={`experience ${openExp===i?"expanded":""}`} key={e.id}><button onClick={()=>setOpenExp(openExp===i?null:i)} aria-expanded={openExp===i} aria-controls={`exp-${i}`}><span><small>{e.date}</small><h3>{e.role}</h3><span>{e.company}</span></span>{openExp===i?<Minus size={20}/>:<Plus size={20}/>}</button><div id={`exp-${i}`} hidden={openExp!==i}><p>{e.text}</p></div></div>)}</div></section>
 <section className="section wrap about" id="apropos"><div className="about-art portrait-art"><span className="eyebrow">LA TECHNOLOGIE AU SERVICE DE L’IMPACT SOCIAL</span><img className="portrait" src={profile.photo} alt={`Portrait de ${profile.name}`} loading="lazy" width="500" height="500"/><div className="about-caption"><span>{profile.name}</span><span>{profile.location}</span></div></div><div className="about-copy"><h2>{profile.aboutTitle}<br/><span>{profile.aboutSubtitle}</span></h2><p>{profile.aboutText}</p><p>{profile.aboutText2}</p><div className="about-notes">{profile.aboutNotes.map((note,i)=><span key={i}><span>↗</span> {note}</span>)}</div><a className="text-link" href={profile.cv} download>Explorer mon parcours complet <Download size={18}/></a></div></section>
 <div className="wrap profile-stats">
   <SkillPlayerCard skills={content.ratings} profile={profile} confirmed={content.ratingsConfirmed}/>
 </div>
 <section id="contact" className="contact-section wrap home-contact">
   <div className="contact-glow"/>
<h2>Une idée en tête ?<br/><span>Parlons-en.</span></h2><p>Disponible pour discuter de ton projet ou d’une collaboration.</p><a href={`mailto:${profile.email}`} className="button">Discutons de votre projet <ArrowUpRight size={20}/></a><div className="contact-channels"><a href={`tel:${profile.phone.replace(/[^+\d]/g,"")}`}><Phone size={17}/><span><small>TÉLÉPHONE</small>{profile.phone}</span></a><a href={`https://wa.me/${profile.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/><span><small>WHATSAPP</small>{profile.whatsapp}</span><ArrowUpRight size={15}/></a></div><div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}</a><button onClick={copyEmail} aria-label="Copier l’adresse e-mail">{copied?<Check size={17}/>:<Copy size={17}/>}</button><span role="status">{copied?"Adresse copiée":""}</span></div><SocialLinks profile={profile}/></section>
 </main><footer className="footer wrap"><a className="brand" href="#"><Mark/>axison<span className="brand-dot">.</span></a><p>© {new Date().getFullYear()} {profile.name}</p><a href="/admin" className="text-link">Administration</a><a href="#" className="text-link">Retour en haut <ArrowUpRight size={17}/></a></footer>

 </>
}
