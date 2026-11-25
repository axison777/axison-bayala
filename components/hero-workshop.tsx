import {Braces, Cloud, Code2, Layers, MousePointer2, Server} from "lucide-react";

export default function HeroWorkshop() {
  return <div className="hero-workshop" role="img" aria-label="Du design au déploiement : conception d’interfaces, développement web et mobile, backend et infrastructure cloud.">
    <div className="workshop-grid"/>
    <div className="workshop-orbit"/>
    <div className="workshop-label"><span/> MON ATELIER NUMÉRIQUE</div>
    <div className="workshop-browser">
      <div className="workshop-bar"><span/><span/><span/><small>de l’idée à l’application</small><Code2 size={15}/></div>
      <div className="workshop-canvas">
        <div className="workshop-mini-nav"><b>a<span>✳</span></b><i/><i/><i/></div>
        <div className="workshop-preview"><span>CONCEVOIR. CONSTRUIRE.</span><strong>Une idée.<br/><em>Tout un potentiel.</em></strong><div className="workshop-lines"><i/><i/></div><div className="workshop-mini-button"/></div>
        <div className="workshop-shape"><Layers size={43} strokeWidth={1.1}/></div>
        <div className="workshop-palette"><i/><i/><i/><i/></div>
        <MousePointer2 className="workshop-cursor" size={24} fill="currentColor"/>
      </div>
    </div>
    <div className="workshop-code"><div><Braces size={17}/><span>la logique derrière l’interface</span></div><code><span>const</span> idée = <em>"votre projet"</em>;<br/><span>await</span> construire(idée);<br/><span>return</span> uneExpérienceUtile;</code></div>
    <div className="workshop-mobile"><span className="workshop-speaker"/><Layers size={24}/><b>À portée<br/>de main.</b><i/><i/><div><span/><span/><span/></div></div>
    <div className="workshop-cloud"><Cloud size={23}/><span>DU LOCAL AU CLOUD</span><Server size={15}/></div>
    <div className="workshop-caption"><span>Design UI/UX</span><i/><span>Code & API</span><i/><span>Déploiement</span></div>
  </div>;
}
