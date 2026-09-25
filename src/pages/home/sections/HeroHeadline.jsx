import { useEffect, useRef, useState } from 'react';
import { HERO_HEADLINE, HERO_INTRO, HERO_MESSAGE_PREFIX, HERO_MESSAGES } from '../../../content/hero.js';

const HeroHeadline = ({ headline }) => {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Begin with a complete, readable proposition, including before JS executes.
  const [typing, setTyping] = useState({ index: 0, length: HERO_MESSAGES[0].length, phase: 'hold' });
  const isDefaultHeadline = headline === HERO_HEADLINE;
  const playing = isDefaultHeadline && visible && documentVisible && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReducedMotion(media.matches);
    const onVisibility = () => setDocumentVisible(!document.hidden);
    media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
      : null;
    if (observer) observer.observe(containerRef.current);
    else window.setTimeout(() => setVisible(true), 0);
    return () => {
      media.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    // Allow five seconds to read each complete message before the next cycle.
    const delay = { hold: 5000, deleting: 50, gap: 400, typing: 100 }[typing.phase];
    const timeout = window.setTimeout(() => {
      setTyping(current => {
        if (current.phase === 'hold') return { ...current, phase: 'deleting' };
        if (current.phase === 'deleting') return current.length > 0
          ? { ...current, length: current.length - 1 }
          : { index: (current.index + 1) % HERO_MESSAGES.length, length: 0, phase: 'gap' };
        if (current.phase === 'gap') return { ...current, phase: 'typing' };
        const length = current.length + 1;
        return { ...current, length, phase: length >= HERO_MESSAGES[current.index].length ? 'hold' : 'typing' };
      });
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [playing, typing]);

  const message = reducedMotion
    ? HERO_MESSAGES[typing.index]
    : HERO_MESSAGES[typing.index].slice(0, typing.length);

  return (
    <div ref={containerRef} data-hero-motion={playing ? 'playing' : 'paused'}>
      <h1 id="hero-heading" aria-label={headline} className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl xl:text-[3.5rem]">
        {isDefaultHeadline ? <span aria-hidden="true">
          <span className="block">{HERO_INTRO}</span>
          <span className="hero-message-stack text-primary-400">
            {HERO_MESSAGES.map(item => <span key={item} className="hero-message-size">{HERO_MESSAGE_PREFIX}{item}<span className="hero-typing-caret">|</span></span>)}
            <span className="hero-message-line"><span data-hero-message>{HERO_MESSAGE_PREFIX}{message}</span><span className="hero-typing-caret" data-playing={playing}>|</span></span>
          </span>
        </span> : headline}
      </h1>
    </div>
  );
};

export default HeroHeadline;
