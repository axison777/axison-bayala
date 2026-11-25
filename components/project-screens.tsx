"use client";

import {useRef, useState} from 'react';
import {Expand, X, ChevronLeft, ChevronRight} from 'lucide-react';

function PhoneScreen({src, alt, eager = false, design = false, scrollable = false}: {src: string; alt: string; eager?: boolean; design?: boolean; scrollable?: boolean}) {
  return <span className="phone-frame">
    <span className="phone-speaker" aria-hidden="true"/>
    <span className={`phone-display${design ? " design-phone-display" : ""}${scrollable ? " scrollable-phone-display" : ""}`}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'}/>
    </span>
    <span className="phone-home-indicator" aria-hidden="true"/>
  </span>;
}

export default function ProjectScreens({name, images, mobileImages = [], loginImage, mobile = false, design = false}: {name: string; images: string[]; mobileImages?: string[]; loginImage?: string; mobile?: boolean; design?: boolean}) {
  const screens = loginImage ? [loginImage, ...images.filter(src => src !== loginImage)] : images;
  const isMobileScreen = (src: string) => mobile || mobileImages.includes(src);
  const tiles = screens.slice(0, 5);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);

  function open(index: number) {
    setActive(index);
    dialog.current?.showModal();
  }

  return (
    <section className={`detail-screens${mobile ? " mobile-screens" : ""}${design ? " design-screens" : ""}`} aria-labelledby="screens-title">
      <div className="detail-screens-heading"><h2 id="screens-title">{design ? "Les maquettes en images" : "L’application en images"}</h2><span>{screens.length} écrans</span></div>
      <div className={`detail-screen-grid mosaic-count-${tiles.length}`}>
        {tiles.map((src, index) => (
          <button className={`detail-screen${isMobileScreen(src) ? " mobile-screen" : ""}`} key={src} onClick={() => open(index)} aria-label={`Agrandir l’écran ${index + 1} de ${name}`}>
            {isMobileScreen(src)
              ? <PhoneScreen src={src} alt={`${name} — écran ${index + 1}`} eager={index === 0} design={design}/>
              : <img src={src} alt={`${name} — écran ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'}/>}
            <span className="detail-screen-caption">{index === tiles.length - 1 && screens.length > tiles.length
              ? `+${screens.length - tiles.length} écrans`
              : src === loginImage ? "Connexion" : `Écran ${index + 1}`}<Expand size={16}/></span>
          </button>
        ))}
      </div>
      <dialog ref={dialog} className="screen-lightbox" aria-label={`Écrans de ${name}`} onClick={event => {if(event.target === event.currentTarget) dialog.current?.close();}} onKeyDown={event => {
        if (event.key === 'ArrowRight') {event.preventDefault(); setActive(index => (index + 1) % screens.length);}
        if (event.key === 'ArrowLeft') {event.preventDefault(); setActive(index => (index - 1 + screens.length) % screens.length);}
      }}>
        <header><span aria-live="polite">{name} · {active + 1} / {screens.length}</span><button onClick={() => dialog.current?.close()} aria-label="Fermer la capture"><X/></button></header>
        {isMobileScreen(screens[active])
          ? <div className="phone-lightbox-stage"><PhoneScreen key={screens[active]} src={screens[active]} alt={`${name} — écran ${active + 1}`} eager design={design} scrollable={design}/></div>
          : design ? <div key={screens[active]} className="design-lightbox-stage"><img src={screens[active]} alt={`${name} — maquette ${active + 1}`}/></div>
          : <img src={screens[active]} alt={`${name} — écran ${active + 1}`}/>}

        {screens.length > 1 && <footer><button onClick={() => setActive(index => (index - 1 + screens.length) % screens.length)} aria-label="Écran précédent"><ChevronLeft/></button><button onClick={() => setActive(index => (index + 1) % screens.length)} aria-label="Écran suivant"><ChevronRight/></button></footer>}
      </dialog>
    </section>
  );
}
