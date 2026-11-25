"use client";

import { Shield } from "lucide-react";

import type {PortfolioContent} from '@/lib/portfolio/schema';
export default function SkillPlayerCard({skills,profile,confirmed}:{skills:PortfolioContent['ratings'];profile:PortfolioContent['profile'];confirmed:boolean}){
 const overall=Math.round(skills.reduce((sum,s)=>sum+s.value,0)/skills.length);
  return <section id="competences" className="skill-player-section" aria-labelledby="player-section-title">
    <div className="player-intro"><div><span className="eyebrow muted">PLAYER PROFILE / ÉDITION AXISON</span><h2 id="player-section-title">Mon jeu. <span>Mes compétences.</span></h2></div><p>Un profil polyvalent, une progression continue.<br/>Six dimensions pour explorer mon terrain de jeu.</p></div>
    <div className="player-layout">
      <div className="player-stage">
        <span className="stage-ring" aria-hidden="true"/>
        <article className="player-card" aria-label={`Carte ${profile.name}, note globale ${overall} sur 99`}>
          <div className="card-topline"><span>AX / ORIGINAL</span><Shield size={16}/><span>FULL STACK</span></div>
          <div className="player-portrait-area"><div className="player-overall"><strong>{overall}</strong><span>GEN</span><span className="player-position">DEV</span><span className="bf-flag" aria-label="Burkina Faso">★</span></div><img className="player-jersey-portrait" src="/images/axison-player.webp" alt={`${profile.name} en maillot rouge et noir avec un écusson Laravel`} width={720} height={720} loading="lazy"/><span className="player-number" aria-hidden="true">01</span></div>
          <div className="player-identity"><span>{profile.cardFirstName}</span><h3>{profile.cardLastName}</h3><p>{profile.cardRole}</p></div>
          <div className="card-stats">{skills.map(s=><div key={s.id}><strong>{s.value}</strong><span title={s.label}>{s.code}</span></div>)}</div>
          <div className="card-footline"><span>CODE · CREATE · CONNECT</span><span>✳</span></div>
        </article>
        <p className="card-evaluation">{confirmed?"AUTO-ÉVALUATION":"NOTES INDICATIVES"}</p>
      </div>
      <div className="player-controls"><div className="player-controls-heading"><div><span className="eyebrow muted">ATTRIBUTS TECHNIQUES</span><h3>Un profil, six forces.</h3></div><span className="rating-scale">/ 99</span></div>
        <div className="rating-rows">{skills.map(s=><div className="rating-row" key={s.id}><div className="rating-label"><span>{s.label}</span><span>{s.detail}</span></div><span className="rating-value">{s.value}</span><div className="rating-track" aria-hidden="true"><span style={{width:`${s.value/99*100}%`}}/></div></div>)}</div>
        <p className="stats-explanation">{confirmed?"Notes d’auto-évaluation sur 99.":"Notes indicatives en cours de personnalisation."} La note GEN est la moyenne arrondie des six attributs.</p>
      </div>
    </div>
  </section>;
}
