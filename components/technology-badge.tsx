import {Cloud, Server, Globe, Code2, Network, PenTool} from 'lucide-react';

const logos: Record<string, string[]> = {
  'node.js':['nodejs'], nodejs:['nodejs'], node:['nodejs'],
  express:['express'], 'express.js':['express'], laravel:['laravel'], python:['python'],
  mysql:['mysql'], postgresql:['postgresql'], postgres:['postgresql'], supabase:['supabase'],
  react:['react'], 'react native':['react'], javascript:['javascript'], js:['javascript'],
  typescript:['typescript'], ts:['typescript'], 'html / css':['html5','css3'],
  html:['html5'], html5:['html5'], css:['css3'], css3:['css3'],
  'tailwind css':['tailwindcss'], tailwind:['tailwindcss'], bootstrap:['bootstrap'],
  flutter:['flutter'], figma:['figma'], 'git / github':['git','github'],
  git:['git'], github:['github'], postman:['postman'], linux:['linux'],
  'vs code':['vscode'], vscode:['vscode'], 'visual studio code':['vscode'],
  photoshop:['photoshop'], 'adobe photoshop':['photoshop'],
  illustrator:['illustrator'], 'adobe illustrator':['illustrator'],
};
const aiLogos: Record<string, string> = {
  codex:'codex.svg', claude:'claude.svg', gemini:'gemini.svg',
  glm:'glm.svg', stitch:'stitch.png', 'ux pilot':'uxpilot.png',
};
const lightLogos = new Set(['express','github']);

export default function TechnologyBadge({name}: {name: string}) {
  const key = name.trim().toLowerCase();
  const icons = logos[key];
  const aiLogo = aiLogos[key];
  const Fallback = ['render','vercel','google cloud'].includes(key) ? Cloud : key === 'vps' ? Server : ['o2switch','ionos'].includes(key) ? Globe : key === 'api rest' ? Network : ['ux/ui','ui/ux','ux','ui'].includes(key) ? PenTool : Code2;
  return <span className="technology-badge">
    <i className="technology-badge-icons" aria-hidden="true">
      {aiLogo ? <img src={`/icons/ai/${aiLogo}`} alt="" width={20} height={20} loading="lazy" className="ai-tool-logo"/> : icons ? icons.map(icon => <img key={icon} src={`/icons/tech/${icon}.svg`} alt="" width={20} height={20} loading="lazy" className={lightLogos.has(icon) ? 'technology-logo-light' : icon === 'mysql' ? 'technology-logo-bright' : undefined}/>) : <Fallback size={19} strokeWidth={1.6}/>}
    </i>
    <b>{name}</b>
  </span>;
}
