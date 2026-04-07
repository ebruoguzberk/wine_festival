import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "./App.css";

// Scroll-triggered visibility hook
function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Immediately visible if already in viewport on mount — fixes iOS Safari refresh delay
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 60) {
      setIsVisible(true);
      return;
    }
    // Fallback: force reveal after 800ms for anything IO misses
    const fallback = setTimeout(() => setIsVisible(true), 800);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        clearTimeout(fallback);
        observer.unobserve(el);
      }
    }, { threshold: options.threshold || 0.05, rootMargin: options.rootMargin || "0px 0px 60px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);
  return [ref, isVisible];
}

// Kinetic typography - letters animate in one by one
function KineticText({ text, className = "", style = {} }) {
  const [ref, visible] = useInView({ threshold: 0.3 });
  return (
    <span ref={ref} className={className} style={{ display: "inline-block", perspective: "600px", ...style }}>
      {text.split("").map((char, i) => (
        <span key={i} className={visible ? "kinetic-letter" : ""} style={{
          display: "inline-block",
          animationDelay: visible ? `${i * 0.04}s` : "0s",
          opacity: visible ? undefined : 0,
          whiteSpace: char === " " ? "pre" : undefined,
        }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// 3D tilt effect on mouse move
function TiltCard({ children, className = "", style = {}, intensity = 8 }) {
  const cardRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`;
    const glow = card.querySelector('.tilt-glow');
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(212,175,55,0.08), transparent 60%)`;
    }
  }, [intensity]);
  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);
  return (
    <div ref={cardRef} className={`tilt-card ${className}`} style={style} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="tilt-glow" />
      {children}
    </div>
  );
}

// Magnetic button - follows cursor slightly
function MagneticBtn({ children, onClick, className = "", style = {}, disabled = false }) {
  const btnRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (disabled) return;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    btn.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    btn.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, [disabled]);
  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (btn) btn.style.transform = "translate(0, 0)";
  }, []);
  return (
    <button ref={btnRef} className={`magnetic-btn ${className}`} style={style} onClick={onClick} disabled={disabled} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </button>
  );
}

// Scroll progress bar
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />;
}

// Wrapper component for scroll reveals
function Reveal({ children, type = "default", delay = 0, className = "", style = {} }) {
  const [ref, visible] = useInView();
  const cls = type === "scale" ? "reveal-scale"
    : type === "left" ? "reveal-left"
    : type === "right" ? "reveal-right"
    : type === "blur" ? "reveal-blur"
    : type === "stagger" ? "stagger-children"
    : "reveal";
  return (
    <div ref={ref} className={`${cls} ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// Word-by-word reveal for body paragraphs (not titles)
function WordReveal({ text, className = "", style = {}, as: Tag = "p" }) {
  const [ref, visible] = useInView({ threshold: 0.2 });
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} style={{ margin: 0, ...style }}>
      {words.map((word, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`,
          marginRight: "0.28em",
        }}>
          {word}
        </span>
      ))}
    </Tag>
  );
}

// Cursor glow orb - warm golden light following mouse
function CursorGlow() {
  const orbRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const raf = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    const animate = () => {
      const orb = orbRef.current;
      if (orb) {
        orb.style.transform = `translate(${pos.current.x - 150}px, ${pos.current.y - 150}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  return (
    <div ref={orbRef} style={{
      position: "fixed", top: 0, left: 0,
      width: "300px", height: "300px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, rgba(180,120,40,0.02) 40%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 1,
      willChange: "transform",
    }} />
  );
}

// ===========================
// DATA
// ===========================
const mainTabs = ["The Event", "Wine Tasting", "Games", "Dress Code", "The Art"];

const concepts = {
  Romantic: [
    { title: "The Sultan's Secret Garden", desc: "Something lush, floral, with hidden beauty and an intoxicating pull. The kind of wine that makes you close your eyes." },
    { title: "Silk and Smoke", desc: "Something smooth, hazy, sensual, lingering. It stays on your lips long after the last sip." },
    { title: "A Letter Never Sent", desc: "Something restrained with unspoken longing. Delicate, with an ache underneath." },
    { title: "The Dancer's Veil", desc: "Something that reveals itself slowly, layer by layer, never fully exposing its secrets." },
    { title: "The Rose That Grew Through Stone", desc: "Something tender and beautiful that survived something hard. Delicate on the surface, unbreakable underneath." },
    { title: "The Last Dance Before Dawn", desc: "Something urgent, warm, bittersweet. You know the night is ending but you're not ready to let go." },
  ],
  Mysterious: [
    { title: "Stolen Jewels at Midnight", desc: "Something dark, bold, dangerous. You shouldn't be drinking this, but you can't stop." },
    { title: "The Merchant's Last Sunset", desc: "Something warm, golden, bittersweet. The end of a long journey, savored slowly." },
    { title: "Moonlight on the Bosphorus", desc: "Something cool, reflective, shimmering. Elegant silence on dark water." },
    { title: "An Empty Throne", desc: "Something powerful, heavy, commanding, with a haunting sense of absence." },
    { title: "The Perfumer's Workshop", desc: "Something layered with invisible complexity. You keep finding new things every time you return to it." },
    { title: "The Voice Behind the Curtain", desc: "Something you can't see, can't name, but can't ignore. It commands the room without ever showing itself." },
  ],
  Adventurous: [
    { title: "The Map to Nowhere", desc: "Something unconventional, a beautiful detour. You have no idea where this is going but you trust it." },
    { title: "The Thief Who Loved a Princess", desc: "Something unexpected, charming, a little rough around the edges but absolutely irresistible." },
    { title: "Fire in the Desert", desc: "Something fierce, dry, burning, unapologetic. It doesn't care if you're ready." },
    { title: "The Spice Merchant's Daughter", desc: "Something complex, aromatic, unforgettable. Every sip is a different city." },
    { title: "The Silk Road at Full Gallop", desc: "Something bold, fast, rich. Every sip covers a thousand miles and you never want to stop riding." },
    { title: "The Wrong Train to Marrakech", desc: "Something you didn't choose but turned out to be the best accident of your life." },
  ],
  Funny: [
    { title: "My Mother-in-Law's Curse", desc: "Something that hits you harder than expected and absolutely refuses to leave." },
    { title: "The Sultan's Diet Starts Monday", desc: "Something indulgent, guilty. The wine equivalent of 'I deserve this.'" },
    { title: "The Camel That Refused to Walk", desc: "Something stubborn, earthy, doing things entirely on its own terms." },
    { title: "The Belly Dancer's Grocery List", desc: "Something unexpectedly mundane hiding behind something glamorous. All that sparkle and underneath it's just eggs and bread." },
    { title: "Aladdin's Third Wish", desc: "Something you'd pick if you only had one chance left and you're NOT messing it up this time." },
    { title: "The Genie's Day Off", desc: "Something loud, unfiltered, no rules. The bottle equivalent of 'I don't work here today.'" },
  ],
  Absurd: [
    { title: "Lost in the Bazaar With No Phone", desc: "Something overwhelming, disorienting. You have no idea what's happening but you're having the time of your life." },
    { title: "The Flying Carpet With Turbulence", desc: "Something that starts smooth and then does something completely unexpected halfway through." },
    { title: "The Fortune Teller Who Was Always Wrong", desc: "Something that defies every single expectation you had when you read the label." },
    { title: "A Sword Fight Over Hummus", desc: "Something aggressive and bold over something that should be simple and peaceful." },
    { title: "The Snake Charmer Whose Snake Fell Asleep", desc: "Something that was supposed to be intense and dramatic but turned out hilariously mellow." },
    { title: "The Parrot That Learned the Wrong Language", desc: "Something that communicates with total confidence but nothing it says makes any sense. And somehow that's the charm." },
  ],
};

const catMeta = {
  Romantic:    { accent: "#e8446a", glow: "rgba(232,68,106,0.10)", icon: "heart" },
  Mysterious:  { accent: "#6ba3d6", glow: "rgba(107,163,214,0.10)", icon: "moon" },
  Adventurous: { accent: "#e8a832", glow: "rgba(232,168,50,0.10)", icon: "compass" },
  Funny:       { accent: "#a8d44a", glow: "rgba(168,212,74,0.10)", icon: "mask" },
  Absurd:      { accent: "#d46ae8", glow: "rgba(212,106,232,0.10)", icon: "spiral" },
};

// ===========================
// SVG ICONS (replace all emojis)
// ===========================
function Icon({ name, size = 20, color = "currentColor" }) {
  const icons = {
    lamp: <><path d="M12 2c-1.5 0-3 .8-3 2.5 0 1 .5 1.8 1 2.5H8c-.5 0-1 .5-1 1v2c0 .5.5 1 1 1h.5l1 6h5l1-6H16c.5 0 1-.5 1-1V8c0-.5-.5-1-1-1h-2c.5-.7 1-1.5 1-2.5C15 2.8 13.5 2 12 2z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 17h4v2c0 .5-.5 1-1 1h-2c-.5 0-1-.5-1-1v-2z" fill={color} opacity="0.4"/><path d="M12 2c0 0-1 1-1 2s1 2 1 2" stroke={color} strokeWidth="1" opacity="0.5" fill="none"/></>,
    star8: <><path d="M12 1l2.5 3.5L19 3l-1 4.5L22 10l-4.5 1L19 15.5l-4-1.5-3 3.5-3-3.5-4 1.5 1.5-4.5L2 10l4-2.5L5 3l4.5 1.5z" fill={color} opacity="0.9"/></>,
    wine: <><path d="M8 2h8l-1 7c0 2-1.5 3.5-3 3.5S9 11 9 9L8 2z" fill="none" stroke={color} strokeWidth="1.5"/><line x1="12" y1="12.5" x2="12" y2="18" stroke={color} strokeWidth="1.5"/><path d="M8 18h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M9.5 5h5" stroke={color} strokeWidth="1" opacity="0.3"/></>,
    dice: <><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="8" cy="8" r="1.5" fill={color}/><circle cx="16" cy="8" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="8" cy="16" r="1.5" fill={color}/><circle cx="16" cy="16" r="1.5" fill={color}/></>,
    crown: <><path d="M3 18h18L19 8l-4 4-3-6-3 6-4-4z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 18h18v2H3z" fill={color} opacity="0.3"/></>,
    palette: <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="8" cy="9" r="1.5" fill={color} opacity="0.7"/><circle cx="15" cy="8" r="1.5" fill={color} opacity="0.5"/><circle cx="16" cy="13" r="1.5" fill={color} opacity="0.6"/><circle cx="9" cy="15" r="1.5" fill={color} opacity="0.4"/></>,
    heart: <path d="M12 21s-7-5-7-10c0-3 2-5 4.5-5S12 8 12 8s1-2 2.5-2S19 8 19 11c0 5-7 10-7 10z" fill={color} opacity="0.8"/>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} opacity="0.7"/>,
    compass: <><circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.5"/><polygon points="12,3 14,11 12,14 10,11" fill={color} opacity="0.7"/><polygon points="12,21 10,13 12,10 14,13" fill={color} opacity="0.3"/></>,
    mask: <><path d="M3 8c0-2 4-5 9-5s9 3 9 5c0 4-4 8-9 8S3 12 3 8z" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="8.5" cy="8" r="2" fill={color} opacity="0.5"/><circle cx="15.5" cy="8" r="2" fill={color} opacity="0.5"/></>,
    spiral: <path d="M12 12c0-1.5 1.2-2.7 2.7-2.7 2.3 0 4.2 1.9 4.2 4.2 0 3.2-2.6 5.7-5.7 5.7-4 0-7.2-3.2-7.2-7.2 0-4.8 3.9-8.7 8.7-8.7" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>,
    feather: <path d="M20 4L4 20M20 4c-2 0-6 1-8 4M20 4c0 2-1 6-4 8M12 8c-3 1-6 4-7 7M16 12c-1 3-4 6-7 7" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    theater: <><circle cx="8" cy="9" r="6" fill={color} opacity="0.15" stroke={color} strokeWidth="1.8"/><circle cx="6.2" cy="7.8" r="1.1" fill={color}/><circle cx="9.8" cy="7.8" r="1.1" fill={color}/><path d="M5.5 11 Q8 14 10.5 11" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="16" cy="15" r="6" fill={color} opacity="0.15" stroke={color} strokeWidth="1.8"/><circle cx="14.2" cy="13.8" r="1.1" fill={color}/><circle cx="17.8" cy="13.8" r="1.1" fill={color}/><path d="M13.5 17.5 Q16 14.5 18.5 17.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/></>,
    mic: <><rect x="9" y="2" width="6" height="10" rx="3" fill="none" stroke={color} strokeWidth="1.5"/><path d="M5 10c0 4 3 7 7 7s7-3 7-7" fill="none" stroke={color} strokeWidth="1.5"/><line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="1.5"/><line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>,
    scroll: <><path d="M6 3c-1 0-2 1-2 2v14c0 1 1 2 2 2h10c1 0 2-1 2-2V7l-4-4H6z" fill="none" stroke={color} strokeWidth="1.5"/><path d="M14 3v4h4" fill="none" stroke={color} strokeWidth="1.5"/><line x1="8" y1="10" x2="14" y2="10" stroke={color} strokeWidth="1" opacity="0.4"/><line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="1" opacity="0.4"/><line x1="8" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1" opacity="0.4"/></>,
    carpet: <><path d="M4 8l16-3v11l-16 3z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 12l16-3" stroke={color} strokeWidth="0.7" opacity="0.3"/><path d="M4 15l16-3" stroke={color} strokeWidth="0.7" opacity="0.3"/><path d="M2 19c1-1 2-1 3 0s2 1 3 0" stroke={color} strokeWidth="1" opacity="0.5" fill="none"/><path d="M16 16c1-1 2-1 3 0s2 1 3 0" stroke={color} strokeWidth="1" opacity="0.5" fill="none"/></>,
    bazaar: <><path d="M3 10l9-7 9 7" fill="none" stroke={color} strokeWidth="1.5"/><path d="M5 10v10h14V10" fill="none" stroke={color} strokeWidth="1.5"/><rect x="9" y="14" width="6" height="6" fill={color} opacity="0.2" stroke={color} strokeWidth="1"/></>,
    brain: <><path d="M12 2c-2 0-3.5 1-4 2.5-.5-.3-1.5-.5-2.5.5-1 1-1 2.5 0 3.5-.5.5-1 1.5-1 2.5 0 1.5 1 2.5 2 3-.5 1 0 2.5 1.5 3s3-.5 3-2V2z" fill="none" stroke={color} strokeWidth="1.3"/><path d="M12 2c2 0 3.5 1 4 2.5.5-.3 1.5-.5 2.5.5 1 1 1 2.5 0 3.5.5.5 1 1.5 1 2.5 0 1.5-1 2.5-2 3 .5 1 0 2.5-1.5 3s-3-.5-3-2V2z" fill="none" stroke={color} strokeWidth="1.3"/></>,
    music: <><circle cx="6" cy="18" r="3" fill={color} opacity="0.4"/><circle cx="18" cy="16" r="3" fill={color} opacity="0.4"/><path d="M9 18V5l12-3v14" fill="none" stroke={color} strokeWidth="1.5"/><path d="M9 9l12-3" stroke={color} strokeWidth="1" opacity="0.4"/></>,
    stop: <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5"/><line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="1.5"/></>,
    brick: <><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke={color} strokeWidth="1.5"/><line x1="12" y1="4" x2="12" y2="12" stroke={color} strokeWidth="1.2" opacity="0.5"/><line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.2" opacity="0.5"/><line x1="7" y1="12" x2="7" y2="20" stroke={color} strokeWidth="1.2" opacity="0.5"/><line x1="17" y1="12" x2="17" y2="20" stroke={color} strokeWidth="1.2" opacity="0.5"/></>,
    crystal: <><path d="M12 2l8 8-8 12-8-12z" fill={color} opacity="0.25" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 10h16" stroke={color} strokeWidth="1.2" opacity="0.6"/><path d="M12 2l-3 8 3 12 3-12z" fill={color} opacity="0.3"/><path d="M4 10l8-8 8 8" fill={color} opacity="0.4"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill={color} opacity="0.6"/></>,
    dress: <><rect x="3" y="19" width="18" height="2.5" rx="1" fill={color} opacity="1"/><rect x="7" y="8" width="10" height="11" rx="1" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5"/><rect x="5" y="19" width="14" height="1" rx="0.5" fill={color} opacity="0.2"/><rect x="7" y="15" width="10" height="2" rx="0.5" fill={color} opacity="0.5"/><rect x="6" y="6" width="12" height="2.5" rx="1" fill={color} opacity="0.9"/></>,
    feast: <><ellipse cx="12" cy="16" rx="9" ry="5" fill="none" stroke={color} strokeWidth="1.5"/><path d="M7 14c0-3 2-6 5-6s5 3 5 6" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="10" cy="13" r="1" fill={color} opacity="0.5"/><circle cx="14" cy="12" r="1.2" fill={color} opacity="0.4"/><circle cx="12" cy="15" r="0.8" fill={color} opacity="0.6"/><path d="M3 16c0 3 4 5 9 5s9-2 9-5" fill="none" stroke={color} strokeWidth="1" opacity="0.3"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {icons[name] || icons.star8}
    </svg>
  );
}

const tabIconMap = { "The Event": "lamp", "Wine Tasting": "wine", "Games": "dice", "Dress Code": "crown", "The Art": "palette" };

// ===========================
// ANIMATED BACKGROUNDS
// ===========================
// ===========================
// LANTERN SCENE - decorative row between sections
// ===========================
function LanternScene() {
  const [ref, visible] = useInView({ threshold: 0.2 });
  const lanterns = [
    { x: 10, h: 30, scale: 0.65, delay: 0 },
    { x: 28, h: 14, scale: 0.85, delay: 0.3 },
    { x: 50, h: 6, scale: 1, delay: 0.6 },
    { x: 72, h: 16, scale: 0.85, delay: 0.9 },
    { x: 90, h: 28, scale: 0.65, delay: 1.2 },
  ];

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", height: "180px", margin: "20px 0", pointerEvents: "none", overflow: "hidden" }}>
      {lanterns.map((l, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${l.x}%`,
          top: `${l.h}px`,
          transform: `translateX(-50%) scale(${l.scale})`,
          opacity: visible ? 1 : 0,
          transition: `opacity 0.8s ease ${l.delay}s, transform 0.8s ease ${l.delay}s`,
        }}>
          {/* Hanging chain */}
          <div style={{ width: "1px", height: `${l.h}px`, background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.3))", margin: "0 auto", position: "absolute", top: `-${l.h}px`, left: "50%", transform: "translateX(-50%)" }} />
          {/* Lantern SVG */}
          <div className="lantern-hang" style={{ "--sway-dur": `${5 + i * 0.8}s`, "--delay": `${i * 0.5}s` }}>
            <svg width="40" height="64" viewBox="0 0 40 64" fill="none">
              <path d="M18 2 Q20 0 22 2 L22 8 L18 8 Z" fill="rgba(212,175,55,0.6)" />
              <ellipse cx="20" cy="12" rx="8" ry="3" fill="rgba(212,175,55,0.5)" />
              <path d="M12 12 Q8 24 10 36 Q12 44 20 48 Q28 44 30 36 Q32 24 28 12" fill="rgba(212,175,55,0.12)" stroke="rgba(212,175,55,0.35)" strokeWidth="0.8" />
              <path d="M14 16 Q11 26 13 34 Q15 40 20 43 L20 16 Z" fill="rgba(255,200,80,0.08)" />
              <path d="M26 16 Q29 26 27 34 Q25 40 20 43 L20 16 Z" fill="rgba(255,200,80,0.05)" />
              <ellipse cx="20" cy="20" rx="9" ry="2" fill="none" stroke="rgba(212,175,55,0.25)" strokeWidth="0.5" />
              <ellipse cx="20" cy="32" rx="8.5" ry="2" fill="none" stroke="rgba(212,175,55,0.25)" strokeWidth="0.5" />
              <ellipse cx="20" cy="48" rx="5" ry="2" fill="rgba(212,175,55,0.4)" />
              <line x1="20" y1="50" x2="20" y2="58" stroke="rgba(212,175,55,0.3)" strokeWidth="0.8" />
              <circle cx="20" cy="59" r="1.5" fill="rgba(212,175,55,0.3)" />
              <g className="lantern-flame">
                <ellipse cx="20" cy="30" rx="4" ry="8" fill="rgba(255,180,60,0.3)" />
                <ellipse cx="20" cy="30" rx="2.5" ry="5" fill="rgba(255,220,100,0.4)" />
                <ellipse cx="20" cy="29" rx="1" ry="2.5" fill="rgba(255,255,200,0.5)" />
              </g>
            </svg>
            {/* Warm glow from each lantern */}
            <div style={{
              position: "absolute", bottom: "-10px", left: "50%",
              width: "80px", height: "80px",
              transform: "translateX(-50%)",
              background: "radial-gradient(circle, rgba(255,160,40,0.12), rgba(255,120,20,0.04) 50%, transparent 70%)",
              borderRadius: "50%",
              animation: `lanternGlow 3s ease-in-out ${i * 0.7}s infinite`,
            }} />
            {/* Light cone below */}
            <div style={{
              position: "absolute", bottom: "-60px", left: "50%",
              width: "40px", height: "60px",
              transform: "translateX(-50%)",
              background: "linear-gradient(180deg, rgba(255,180,60,0.06), transparent)",
              clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================
// ANIMATED SHOOTING STARS
// ===========================
function ShootingStars() {
  const [stars, setStars] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const id = idRef.current++;
      const star = {
        id,
        x: Math.random() * 80 + 10,
        y: Math.random() * 40,
        angle: Math.random() * 20 + 25,
        dur: Math.random() * 0.8 + 0.6,
        size: Math.random() * 1.5 + 0.5,
      };
      setStars((prev) => [...prev.slice(-3), star]);
      setTimeout(() => setStars((prev) => prev.filter((s) => s.id !== id)), star.dur * 1000 + 200);
    };

    // Spawn one early for delight
    const firstTimeout = setTimeout(spawn, 2000);
    const interval = setInterval(() => {
      if (Math.random() < 0.4) spawn();
    }, 4000);

    return () => { clearTimeout(firstTimeout); clearInterval(interval); };
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {stars.map((s) => (
        <div key={s.id} className="shooting-star" style={{
          position: "absolute",
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${80 + s.size * 40}px`,
          height: `${s.size}px`,
          "--angle": `${s.angle}deg`,
          "--dur": `${s.dur}s`,
        }} />
      ))}
    </div>
  );
}

// ===========================
// ANIMATED MAGIC SMOKE SPIRAL (for genie divider)
// ===========================
function MagicSmoke() {
  return (
    <svg className="magic-smoke-svg" width="200" height="160" viewBox="0 0 200 160" style={{ position: "absolute", bottom: "40px", left: "38%", transform: "translateX(-50%)", pointerEvents: "none", opacity: 0.6 }}>
      <defs>
        <filter id="smoke-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="smoke-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(100,150,220,0.5)" />
          <stop offset="50%" stopColor="rgba(160,120,220,0.3)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.1)" />
        </linearGradient>
      </defs>
      {/* Spiral smoke paths */}
      <path className="smoke-path smoke-path-1" d="M100 150 Q90 120 105 100 Q120 80 95 65 Q70 50 100 35 Q130 20 110 5" fill="none" stroke="url(#smoke-grad)" strokeWidth="8" strokeLinecap="round" filter="url(#smoke-blur)" />
      <path className="smoke-path smoke-path-2" d="M100 150 Q115 125 95 105 Q75 85 105 70 Q135 55 100 40 Q65 25 90 10" fill="none" stroke="url(#smoke-grad)" strokeWidth="6" strokeLinecap="round" filter="url(#smoke-blur)" />
      <path className="smoke-path smoke-path-3" d="M100 150 Q85 130 100 110 Q115 90 90 75 Q65 60 95 45 Q125 30 105 15" fill="none" stroke="url(#smoke-grad)" strokeWidth="4" strokeLinecap="round" filter="url(#smoke-blur)" />
      {/* Sparkle dots along smoke */}
      <circle className="smoke-sparkle" cx="95" cy="65" r="2" fill="rgba(255,220,100,0.6)">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="1;3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle className="smoke-sparkle" cx="105" cy="40" r="1.5" fill="rgba(255,220,100,0.5)">
        <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="1;2.5;1" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle className="smoke-sparkle" cx="100" cy="20" r="1" fill="rgba(255,220,100,0.4)">
        <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="0.5;2;0.5" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      dur: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      minO: Math.random() * 0.15 + 0.05,
      maxO: Math.random() * 0.5 + 0.3,
    }))
  ).current;

  return (
    <div className="starfield">
      {stars.map((s) => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          "--dur": `${s.dur}s`, "--delay": `${s.delay}s`,
          "--min-o": s.minO, "--max-o": s.maxO,
        }} />
      ))}
    </div>
  );
}

function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      dur: Math.random() * 20 + 15,
      delay: Math.random() * 15,
      size: Math.random() * 6 + 2,
      maxO: Math.random() * 0.2 + 0.05,
    }))
  ).current;

  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{
          left: `${p.x}%`,
          width: `${p.size}px`, height: `${p.size}px`,
          background: `radial-gradient(circle, rgba(212,175,55,0.6), transparent)`,
          borderRadius: "50%",
          "--dur": `${p.dur}s`, "--delay": `${p.delay}s`, "--max-o": p.maxO,
        }} />
      ))}
    </>
  );
}

function HeroScene() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const p = Math.min(scrollY / 400, 1);

  return (
    <div style={{ position: "relative", width: "100%", height: "280px", marginBottom: "10px", overflow: "hidden" }}>
      {/* Radial glow behind carpet */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: "min(700px, 100vw)", height: "400px",
        transform: `translate(-50%, -50%) scale(${1 + p * 0.3})`,
        background: "radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, rgba(180,60,40,0.08) 30%, rgba(140,80,200,0.05) 50%, transparent 70%)",
        opacity: 1 - p * 0.5,
      }} />

      {/* Flying carpet IMAGE */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(-50%, -50%) translateY(${-p * 60}px) scale(${1 - p * 0.3})`,
        animation: "heroFloat 8s ease-in-out infinite",
        opacity: 1 - p * 0.8,
      }}>
        <img
          src="/carpet.png"
          alt="Flying Carpet"
          style={{
            width: "min(420px, 85vw)",
            height: "auto",
            filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 40px rgba(212,175,55,0.12))",
          }}
        />
        {/* Shadow underneath */}
        <div style={{
          position: "absolute",
          bottom: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "12px",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)",
          borderRadius: "50%",
        }}>
          <div style={{ width: "100%", height: "100%" }}>
            {/* shadow animates with carpet */}
          </div>
        </div>
      </div>

      {/* Sparkles around carpet */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          position: "absolute", left: "50%", top: "50%",
          width: "4px", height: "4px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,216,120,0.8), transparent)",
          boxShadow: "0 0 6px rgba(212,175,55,0.4)",
          animation: `orbit ${12 + i * 2}s linear infinite`,
          animationDelay: `${i * -2.4}s`,
          "--radius": `${100 + i * 20}px`,
          opacity: 0.5 - i * 0.08,
        }} />
      ))}
    </div>
  );
}

// ===========================
// ORNAMENT DIVIDER
// ===========================
function Ornament({ animated = false }) {
  const [ref, visible] = useInView();
  if (animated) {
    return (
      <div ref={ref} className={`ornament-reveal ${visible ? "visible" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "28px 0" }}>
        <div className="ornament-line" style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold))" }} />
        <svg className="ornament-star" width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M12 1l2.5 3.5L19 3l-1 4.5L22 10l-4.5 1L19 15.5l-4-1.5-3 3.5-3-3.5-4 1.5 1.5-4.5L2 10l4-2.5L5 3l4.5 1.5z" fill="var(--gold)"/>
        </svg>
        <div className="ornament-line" style={{ height: "1px", background: "linear-gradient(90deg, var(--gold), transparent)" }} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "28px 0", opacity: 0.5 }}>
      <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold))" }} />
      <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation: "glowPulse 4s ease-in-out infinite" }}>
        <path d="M12 1l2.5 3.5L19 3l-1 4.5L22 10l-4.5 1L19 15.5l-4-1.5-3 3.5-3-3.5-4 1.5 1.5-4.5L2 10l4-2.5L5 3l4.5 1.5z" fill="var(--gold)" opacity="0.7"/>
      </svg>
      <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, var(--gold), transparent)" }} />
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ fontSize: "24px", fontWeight: "500", color: "var(--cream)", textAlign: "center", letterSpacing: "3px", margin: "0 0 8px", fontFamily: "var(--font-display)", textTransform: "uppercase" }}>{title}</h3>
      {subtitle && <p style={{ fontSize: "16px", color: "var(--dust)", textAlign: "center", fontStyle: "italic", marginBottom: "16px", fontWeight: "400" }}>{subtitle}</p>}
      <Ornament />
      {children}
    </div>
  );
}

// ===========================
// GLASS CARD
// ===========================
function Card({ children, style, glow, className = "" }) {
  return (
    <div className={`ornate-border ${className}`} style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
      backdropFilter: "blur(10px)",
      padding: "32px",
      marginBottom: "20px",
      ...(glow ? { boxShadow: `0 0 40px ${glow}, inset 0 1px 0 rgba(255,255,255,0.05)` } : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }),
      ...style,
    }}>
      {children}
    </div>
  );
}

// ===========================
// TAB: THE EVENT
// ===========================
function TheEventTab() {
  return (
    <div className="tab-content" style={{ padding: "0 20px 60px", maxWidth: "720px", margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "50px 0 10px", position: "relative" }}>
        <HeroScene />
        <div style={{ fontSize: "11px", letterSpacing: "8px", color: "var(--gold)", opacity: 0.5, marginBottom: "24px", fontFamily: "var(--font-display)" }}>YOU ARE INVITED TO THE</div>
        <h1 style={{ fontSize: "clamp(36px, 8vw, 60px)", fontWeight: "400", color: "var(--cream)", margin: "0 0 6px", lineHeight: 1.05, fontFamily: "var(--font-display)" }}>3rd Annual</h1>
        <h1 className="shimmer-text" style={{ fontSize: "clamp(30px, 6.5vw, 50px)", fontWeight: "600", margin: "0 0 16px", letterSpacing: "4px", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>Engwall Wine Festival</h1>
        <Ornament />
        <div style={{ fontSize: "26px", color: "var(--sand)", fontStyle: "italic", marginBottom: "10px", fontFamily: "var(--font-body)", fontWeight: "400" }}>The Thousand & One Night</div>
        <div style={{ fontSize: "13px", color: "var(--dust)", letterSpacing: "5px", marginBottom: "14px", fontFamily: "var(--font-display)" }}>WINE &middot; ART &middot; LEGEND</div>
        <div style={{ height: "20px" }} />
      </div>

      <Reveal type="blur">
        <Card>
          <WordReveal
            text="This year's theme is The Thousand & One Night. Think Aladdin, Jasmine, magic carpets, gold everything. You'll taste wine through stories you perform, build a collaborative work of art with your hands, and eat a Middle Eastern feast like a sultan who doesn't believe in moderation."
            style={{ fontSize: "18px", color: "var(--sand)", lineHeight: 1.9, fontWeight: "400" }}
          />
        </Card>
      </Reveal>

      <Reveal type="stagger">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {[
          { label: "WHEN", value: "June 20th", sub: "12:00 PM arrival \u00b7 1:00 PM wine tasting" },
          { label: "WHERE", value: "Engwall Backyard", sub: "" },
          { label: "FOOD", value: "Middle Eastern Feast", sub: "Mezze, b\u00f6rek, baklava, hummus, dates, pomegranates, and more" },
          { label: "WHAT YOU BRING", value: "2 bottles of the same wine with your teammate", sub: "Random object from your home and your bazaar pitch · Best attitude and appetite" },
        ].map((item) => (
          <div key={item.label} className="ornate-border" style={{ background: "rgba(255,255,255,0.02)", padding: "28px" }}>
            <div style={{ fontSize: "14px", letterSpacing: "4px", color: "var(--gold)", marginBottom: "12px", fontFamily: "var(--font-display)", fontWeight: "500" }}>{item.label}</div>
            <div style={{ fontSize: "26px", color: "var(--cream)", marginBottom: "10px", fontFamily: "var(--font-display)", fontWeight: "700" }}>{item.value}</div>
            <div style={{ fontSize: "18px", color: "#d4c8b8", lineHeight: 1.7, fontWeight: "500" }}>{item.sub}</div>
          </div>
        ))}
      </div>
      </Reveal>

      <Reveal type="right">
      <Card>
        <h3 style={{ fontSize: "20px", color: "var(--cream)", margin: "0 0 24px", fontWeight: "500", fontFamily: "var(--font-display)", letterSpacing: "2px" }}>What to Expect</h3>
        {[
          { icon: "wine", title: "A Wine Tasting Game", text: "Each pair picks a secret concept, finds a wine that embodies it, and presents it through a skit, song, poem, dance, or whatever they dream up. The audience guesses the concept." },
          { icon: "brick", title: "A Collaborative Art Piece", text: "All 30 of us build one massive artwork together out of thousands of pieces. Each person gets a numbered section. When they all click together, a hidden image reveals itself." },
          { icon: "feast", title: "A Middle Eastern Feast", text: "Hummus, baba ganoush, b\u00f6rek, stuffed grape leaves, flatbread, baklava, Turkish delight, dates with pistachios, pomegranate seeds, and more. All provided." },
          { icon: "dice", title: "Games & Trivia", text: "The Bazaar Pitch, trivia, music rounds, and a game that runs all afternoon. See the Games tab for details." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "18px", marginBottom: "24px", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "44px", height: "44px", borderRadius: "12px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={item.icon} size={22} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: "18px", color: "var(--cream)", marginBottom: "6px", fontFamily: "var(--font-display)", fontWeight: "500" }}>{item.title}</div>
              <p style={{ fontSize: "16px", color: "var(--dust)", margin: 0, lineHeight: 1.8, fontWeight: "400" }}>{item.text}</p>
            </div>
          </div>
        ))}
      </Card>
      </Reveal>

      <Reveal>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p style={{ fontSize: "17px", color: "rgba(138,126,104,0.6)", fontStyle: "italic", lineHeight: 1.9, fontWeight: "400" }}>
          Shoes come off at the door. Wine goes in your hand.
          <br />The rest will reveal itself.
        </p>
      </div>
      </Reveal>
    </div>
  );
}

// ===========================
// TAB: WINE TASTING
// ===========================
function WineTastingTab() {
  const [activeCat, setActiveCat] = useState("Romantic");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [claimedConcepts, setClaimedConcepts] = useState({});
  const [pairName, setPairName] = useState("");
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [justClaimed, setJustClaimed] = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customPairName, setCustomPairName] = useState("");
  const wc = catMeta[activeCat];
  const cats = Object.keys(concepts);

  const loadClaimed = useCallback(async () => {
    try {
      const res = await fetch("/api/claims");
      if (res.ok) setClaimedConcepts(await res.json());
    } catch (e) { console.error("Failed to load claims", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadClaimed();
    const iv = setInterval(loadClaimed, 5000);
    return () => clearInterval(iv);
  }, [loadClaimed]);

  const handleCustomClaim = async () => {
    if (!customPairName.trim() || !customTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptTitle: customTitle.trim(), pairName: customPairName.trim() }),
      });
      const data = await res.json();
      if (res.status === 409) {
        alert("That story name is already taken! Try a different one.");
        await loadClaimed();
      } else if (data.success) {
        setClaimedConcepts(data.claims);
        setJustClaimed(customTitle.trim());
        setShowCustomForm(false);
        setCustomTitle("");
        setCustomPairName("");
        setTimeout(() => setJustClaimed(null), 5000);
      }
    } catch (e) { alert("Something went wrong. Try again!"); }
    setSubmitting(false);
  };

  const handleClaim = async () => {
    if (!pairName.trim() || !selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptTitle: selected, pairName: pairName.trim() }),
      });
      const data = await res.json();
      if (res.status === 409) {
        alert("Someone just claimed this concept! Please pick another.");
        await loadClaimed();
      } else if (data.success) {
        setClaimedConcepts(data.claims);
        setJustClaimed(selected);
        setShowClaimForm(false);
        setSelected(null);
        setPairName("");
        setTimeout(() => setJustClaimed(null), 5000);
      }
    } catch (e) { alert("Something went wrong. Try again!"); }
    setSubmitting(false);
  };

  const isClaimed = (t) => !!claimedConcepts[t];
  const claimedBy = (t) => claimedConcepts[t] || null;
  const totalClaimed = Object.keys(claimedConcepts).length;
  const totalAll = Object.values(concepts).flat().length;

  return (
    <div className="tab-content" style={{ padding: "0 20px 60px", maxWidth: "820px", margin: "0 auto" }}>
      {/* Section header + category filter - all compact */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '2px', fontFamily: 'var(--font-display)', color: 'var(--cream)', margin: 0 }}>Choose Your Story</h2>
        <span style={{ fontSize: '11px', color: 'var(--dust)', opacity: 0.5 }}>{totalAll - totalClaimed} of {totalAll} left</span>
      </div>

      {/* Category filter - single row */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', alignItems: 'center', maxWidth: '100vw' }}>
        {cats.map((cat) => {
          const active = activeCat === cat && !showCustomForm;
          const tc = catMeta[cat];
          const catAvail = concepts[cat].filter(c => !isClaimed(c.title)).length;
          return (
            <button key={cat} onClick={() => { setActiveCat(cat); setSelected(null); setShowClaimForm(false); setShowCustomForm(false); }} style={{
              padding: '6px 12px', border: 'none',
              borderRadius: '6px',
              background: active ? `${tc.accent}18` : 'transparent',
              color: active ? tc.accent : 'var(--dust)',
              fontSize: '11px', letterSpacing: '1px',
              fontFamily: 'var(--font-display)', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.2s ease',
              opacity: active ? 1 : 0.5,
              whiteSpace: 'nowrap',
            }}>
              {cat}{catAvail < 6 ? ` (${catAvail})` : ''}
            </button>
          );
        })}
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 6px', flexShrink: 0 }} />
        <button onClick={() => { setShowCustomForm(true); setSelected(null); setShowClaimForm(false); }} style={{
          padding: '6px 12px', border: showCustomForm ? '1px solid rgba(212,175,55,0.4)' : '1px dashed rgba(212,175,55,0.25)',
          borderRadius: '6px',
          background: showCustomForm ? 'rgba(212,175,55,0.1)' : 'transparent',
          color: 'var(--gold)',
          fontSize: '11px', letterSpacing: '1px',
          fontFamily: 'var(--font-display)', fontWeight: '500',
          cursor: 'pointer', transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          opacity: showCustomForm ? 1 : 0.6,
        }}>✦ Write Yours</button>
      </div>

      {justClaimed && (
        <div style={{ background: 'rgba(74,212,176,0.06)', border: '1px solid rgba(74,212,176,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', textAlign: 'center', animation: 'revealFromSmoke 0.5s ease-out' }}>
          <span style={{ fontSize: '14px', color: '#4ad4b0', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Claimed “{justClaimed}” — now go find your wine.</span>
        </div>
      )}

      {/* Concept cards */}
      {showCustomForm && (
        <div style={{ marginBottom: '40px', animation: 'revealFromSmoke 0.3s ease-out' }}>
          <div style={{ border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '32px', background: 'rgba(212,175,55,0.03)' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--gold)', margin: '0 0 6px', fontStyle: 'italic', fontFamily: 'var(--font-body)', fontWeight: '500' }}>Write Your Own Story</h3>
            <p style={{ fontSize: '14px', color: 'var(--dust)', margin: '0 0 20px' }}>None of the concepts feel right? Invent your own.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type='text' placeholder='Your story title (e.g. "The Last Oasis")' value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)} autoFocus
                style={{ padding: '12px 16px', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: 'var(--cream)', fontSize: '17px', outline: 'none', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
              />
              <input type='text' placeholder='Your names (e.g. Sarah & Mike)' value={customPairName}
                onChange={(e) => setCustomPairName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCustomClaim()}
                style={{ padding: '12px 16px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: 'var(--cream)', fontSize: '15px', outline: 'none' }}
              />
              <button onClick={handleCustomClaim} disabled={!customPairName.trim() || !customTitle.trim() || submitting} style={{
                padding: '12px', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '10px',
                background: customPairName.trim() && customTitle.trim() ? 'rgba(212,175,55,0.15)' : 'transparent',
                color: customPairName.trim() && customTitle.trim() ? 'var(--gold)' : '#555',
                cursor: customPairName.trim() && customTitle.trim() ? 'pointer' : 'default',
                fontSize: '12px', letterSpacing: '2px', fontFamily: 'var(--font-display)', fontWeight: '600',
              }}>{submitting ? '...' : 'CLAIM THIS STORY'}</button>
            </div>
          </div>
        </div>
      )}
      <div key={activeCat} className='category-morph' style={{ display: showCustomForm ? 'none' : 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        {concepts[activeCat].map((c) => {
          const claimed = isClaimed(c.title);
          const isSel = selected === c.title && !claimed;
          return (
            <TiltCard key={c.title} intensity={claimed ? 0 : 5} style={{
              background: claimed ? 'rgba(255,255,255,0.01)' : isSel ? 'linear-gradient(135deg, rgba(255,255,255,0.05), '+wc.glow+')' : 'rgba(255,255,255,0.02)',
              border: claimed ? '1px solid rgba(255,255,255,0.03)' : isSel ? '1px solid '+wc.accent+'40' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '20px',
              cursor: claimed ? 'default' : 'pointer',
              opacity: claimed ? 0.25 : 1,
              position: 'relative', transition: 'all 0.3s ease',
            }}>
              <div onClick={() => { if (!claimed) { setSelected(isSel ? null : c.title); setShowClaimForm(false); } }}>
              {claimed && <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Taken</div>}
              <h3 style={{ fontSize: '17px', color: claimed ? '#444' : isSel ? wc.accent : 'var(--cream)', margin: '0 0 6px', fontStyle: 'italic', paddingRight: '40px', lineHeight: 1.3, fontFamily: 'var(--font-body)', fontWeight: '500', textDecoration: claimed ? 'line-through' : 'none', transition: 'color 0.2s ease' }}>{c.title}</h3>
              <p style={{ fontSize: '14px', color: claimed ? '#3a3a3a' : 'var(--dust)', margin: 0, lineHeight: 1.65, fontWeight: '300' }}>{claimed ? 'This story has been claimed.' : c.desc}</p>

              {isSel && !claimed && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'revealFromSmoke 0.3s ease-out' }}>
                  {!showClaimForm ? (
                    <MagneticBtn className='pulse-btn' onClick={(e) => { e.stopPropagation(); setShowClaimForm(true); }} style={{
                      padding: '10px 20px', border: '1px solid '+wc.accent+'50', borderRadius: '8px',
                      background: wc.glow, color: wc.accent, fontSize: '11px', letterSpacing: '2px',
                      fontFamily: 'var(--font-display)', width: '100%', fontWeight: '500',
                    }}>CLAIM THIS STORY</MagneticBtn>
                  ) : (
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type='text' placeholder='Your names (e.g. Sarah & Mike)' value={pairName}
                        onChange={(e) => setPairName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleClaim()} autoFocus
                        style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: 'var(--cream)', fontSize: '14px', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={handleClaim} disabled={!pairName.trim() || submitting} style={{
                          flex: 1, padding: '10px', border: '1px solid '+wc.accent, borderRadius: '8px',
                          background: pairName.trim() ? wc.accent : 'transparent',
                          color: pairName.trim() ? '#0a0a0f' : '#555', cursor: pairName.trim() ? 'pointer' : 'default',
                          fontSize: '12px', letterSpacing: '1px', fontFamily: 'var(--font-display)', fontWeight: '600',
                        }}>{submitting ? '...' : 'Confirm'}</button>
                        <button onClick={() => setShowClaimForm(false)} style={{
                          padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                          background: 'transparent', color: 'var(--dust)', cursor: 'pointer', fontSize: '12px',
                        }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </div>
            </TiltCard>
          );
        })}
      </div>



      {/* HOW IT WORKS */}
      <Reveal><Section title="How It Works">
        {[
          { s: "01", t: "Claim Your Concept", d: "Browse the categories above. Pick one that speaks to you. Tap it and claim it with your names. First come, first served." },
          { s: "02", t: "Find a Partner", d: "Pair up with someone. Your partner, a friend, a stranger you want to conspire with. You'll present together." },
          { s: "03", t: "Find Your Wine (Two Bottles)", d: "Go to a wine shop and find a wine that embodies your concept. Buy two identical bottles: one for presenting, one for pouring. Price doesn't matter." },
          { s: "04", t: "Prepare Your Presentation", d: "Plan how you'll bring your concept to life. A performance, a poem, an outfit, a skit, a game. The only rule: you never say your concept out loud." },
          { s: "05", t: "Optional: Bring Props", d: "Bring anything that helps tell your story. A food pairing, a prop, a scent, a sound. Totally optional." },
          { s: "06", t: "Keep It Secret", d: "Do NOT tell anyone what concept you picked. Your job is to make them feel it without saying it." },
        ].map((item) => (
          <div key={item.s} style={{ display: "flex", gap: "20px", marginBottom: "24px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "14px", color: "var(--gold)", fontFamily: "var(--font-display)", opacity: 0.4, paddingTop: "4px", flexShrink: 0, fontWeight: "600" }}>{item.s}</div>
            <div>
              <div style={{ fontSize: "18px", color: "var(--cream)", marginBottom: "6px", fontFamily: "var(--font-display)", fontWeight: "500" }}>{item.t}</div>
              <div style={{ fontSize: "16px", color: "var(--dust)", lineHeight: 1.8, fontWeight: "400" }}>{item.d}</div>
            </div>
          </div>
        ))}
      </Section></Reveal>

      {/* PRESENTATION IDEAS */}
      <Section title="Present However You Want" subtitle="No rules. Go minimal or go all out.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
          {[
            { icon: "theater", title: "Perform a skit", desc: "Act out your concept. Be the thief, the sultan, the merchant." },
            { icon: "mic", title: "Sing a song", desc: "Sing something that captures the mood. Badly is fine." },
            { icon: "music", title: "Dance it out", desc: "A choreographed moment, a slow dramatic pour, a tango with the bottle." },
            { icon: "scroll", title: "Read a poem", desc: "Write something that hints at your concept without naming it." },
            { icon: "eye", title: "Present a slideshow", desc: "Let us know a couple of days before and we'll set up a screen. Share your concept through images, history, or anything you want. Completely up to you." },
            { icon: "dress", title: "Let your outfit speak", desc: "Dress as your concept. Say nothing. Just pour." },
          ].map((idea, i) => (
            <Reveal key={idea.title} delay={i * 0.08}>
              <Card style={{ padding: "22px", marginBottom: "0", height: "100%" }}>
                <div style={{ marginBottom: "12px" }}><Icon name={idea.icon} size={28} color="var(--gold)" /></div>
                <div style={{ fontSize: "16px", color: "var(--cream)", marginBottom: "6px", fontFamily: "var(--font-display)", fontWeight: "500" }}>{idea.title}</div>
                <div style={{ fontSize: "14px", color: "var(--dust)", lineHeight: 1.65, fontWeight: "400" }}>{idea.desc}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* AWARDS */}
      <Section title="Who Wins the Crown" subtitle="After all pairs present, everyone votes. You cannot vote for yourselves.">
        <div style={{ display: "grid", gap: "16px" }}>
          {[
            { icon: "crown", title: "The Sultan's Crown", sub: "Best Overall Pairing", desc: "The pair whose wine, presentation, and concept came together most perfectly.", color: "#D4AF37" },
            { icon: "theater", title: "The Scheherazade", sub: "Best Performance", desc: "The pair who put on the most unforgettable presentation.", color: "#e8446a" },
            { icon: "crystal", title: "The Oracle", sub: "Best Guesser", desc: "The person who correctly guessed the most concepts.", color: "#d46ae8" },
            { icon: "wine", title: "The Sommelier's Nod", sub: "Best Wine Discovery", desc: "The pair who brought a wine nobody knew but everyone wanted more of.", color: "#6ba3d6" },
          ].map((a, i) => (
            <Reveal key={a.title} type={i % 2 === 0 ? "default" : "right"} delay={i * 0.07}>
              <Card style={{ textAlign: "center", padding: "28px" }}>
                <div style={{ marginBottom: "12px", display: "inline-block", animation: "glowPulse 5s ease-in-out infinite" }}>
                  {a.icon === "crystal" ? (
                    <div style={{ position: "relative", width: 36, height: 36 }}>
                      <div style={{ animation: "diamondGlow 3s ease-in-out infinite" }}>
                        <Icon name="crystal" size={36} color={a.color} />
                      </div>
                      <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: 14, color: "white", textShadow: "0 0 10px white, 0 0 20px rgba(220,180,255,0.9)", animation: "diamondFlash 3s ease-in-out infinite", opacity: 0 }}>✦</div>
                    </div>
                  ) : (
                    <Icon name={a.icon} size={36} color={a.color} />
                  )}
                </div>
                <div style={{ fontSize: "20px", color: a.color, fontStyle: "italic", marginBottom: "4px", fontFamily: "var(--font-body)", fontWeight: "500" }}>{a.title}</div>
                <div style={{ fontSize: "11px", color: "var(--dust)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px", fontFamily: "var(--font-display)" }}>{a.sub}</div>
                <p style={{ fontSize: "15px", color: "var(--dust)", margin: 0, lineHeight: 1.7, maxWidth: "400px", marginLeft: "auto", marginRight: "auto", fontWeight: "400" }}>{a.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ===========================
// TAB: DRESS CODE
// ===========================
function DressCodeTab() {
  return (
    <div className="tab-content" style={{ padding: "0 20px 60px", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "40px 0 10px" }}>
        <h2 className="shimmer-text" style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: "600", margin: "0 0 12px", letterSpacing: "3px", fontFamily: "var(--font-display)" }}>What to Wear</h2>
        <p style={{ fontSize: "17px", color: "var(--dust)", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8, fontWeight: "400" }}>The theme is Arabian Nights. Dress up as much or as little as you want.</p>
      </div>
      <Ornament />

      <Reveal type="blur">
      <Card>
        <h3 style={{ fontSize: "20px", color: "var(--cream)", margin: "0 0 16px", fontWeight: "500", fontFamily: "var(--font-display)" }}>The Vibe</h3>
        <WordReveal
          text="Think gold, jewel tones, flowing fabrics. You can go full costume or just pull something from your closet in the right colors with some gold jewelry. However far you want to take it is the right amount."
          style={{ fontSize: "17px", color: "var(--sand)", lineHeight: 1.9, fontWeight: "400" }}
        />
      </Card>
      </Reveal>

      <Reveal type="stagger">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <Card>
          <h4 style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "4px", margin: "0 0 18px", fontWeight: "500", fontFamily: "var(--font-display)" }}>IDEAS FOR HER</h4>
          {["A flowing maxi dress or kaftan", "Silk wrap or draped scarf", "Harem pants with a crop top", "Layered gold necklaces and big earrings", "A head scarf draped loosely", "Anything in emerald, cobalt, burgundy, or gold", "Sandals or go barefoot"].map((item, i) => (
            <p key={i} style={{ fontSize: "15px", color: "var(--dust)", margin: "0 0 10px", lineHeight: 1.6, paddingLeft: "14px", borderLeft: "2px solid rgba(212,175,55,0.15)", fontWeight: "400" }}>{item}</p>
          ))}
        </Card>
        <Card>
          <h4 style={{ fontSize: "12px", color: "var(--gold)", letterSpacing: "4px", margin: "0 0 18px", fontWeight: "500", fontFamily: "var(--font-display)" }}>IDEAS FOR HIM</h4>
          {["A linen shirt: white, black, or jewel toned", "Loose trousers or wide-leg pants", "A light scarf around the neck", "A vest over a simple tee", "Gold or brass jewelry: rings, a cuff, a chain", "A turban wrap if you're feeling it", "Sandals or go barefoot"].map((item, i) => (
            <p key={i} style={{ fontSize: "15px", color: "var(--dust)", margin: "0 0 10px", lineHeight: 1.6, paddingLeft: "14px", borderLeft: "2px solid rgba(212,175,55,0.15)", fontWeight: "400" }}>{item}</p>
          ))}
        </Card>
      </div>
      </Reveal>

      <Reveal>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p style={{ fontSize: "16px", color: "var(--sand)", fontStyle: "italic", lineHeight: 1.9, fontWeight: "400" }}>
          Remember, you also picked a wine concept.
          <br />Your outfit can double as part of your presentation if you want it to.
        </p>
      </div>
      </Reveal>
    </div>
  );
}

// ===========================
// TAB: THE ART
// ===========================
function TheArtTab() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="tab-content" style={{ padding: "0 20px 60px", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "40px 0 10px" }}>
        <h2 className="shimmer-text" style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: "600", margin: "0 0 12px", letterSpacing: "3px", fontFamily: "var(--font-display)" }}>The Collective Masterpiece</h2>
        <p style={{ fontSize: "17px", color: "var(--dust)", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8, fontWeight: "400" }}>Every year we create something together. This year is different.</p>
      </div>
      <Ornament />

      <Reveal type="blur"><Card style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "14px" }}><Icon name="brick" size={40} color="var(--gold)" /></div>
        <h3 className="shimmer-text" style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 14px", fontFamily: "var(--font-display)" }}>We're Building a LEGO Art</h3>
        <p style={{ fontSize: "15px", color: "var(--sand)", lineHeight: 1.8, margin: 0, maxWidth: "480px", marginLeft: "auto", marginRight: "auto", fontWeight: "400" }}>
          14,400+ pieces, 30 builders, one hidden image. Each person gets a numbered section. When all sections click together, the picture reveals itself. No skill needed.
        </p>
      </Card></Reveal>

      <Reveal type="scale"><Card glow="rgba(212,175,55,0.05)" style={{ textAlign: "center", border: "1px solid rgba(212,175,55,0.15)" }}>
        <div style={{ fontSize: "17px", color: "var(--sand)", marginBottom: "14px", fontFamily: "var(--font-display)" }}>What are we building?</div>
        {!revealed ? (
          <div>
            <p className="shimmer-text" style={{ fontSize: "32px", margin: "0 0 18px", fontFamily: "var(--font-display)", fontWeight: "600" }}>That's a secret.</p>
            <p style={{ fontSize: "16px", color: "var(--dust)", lineHeight: 1.8, margin: "0 0 24px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto", fontWeight: "400" }}>
              You'll each receive your section card at the party. You won't see the full image until the last piece clicks into place.
            </p>
            <button className="claim-btn" onClick={() => setRevealed(true)} style={{
              padding: "16px 36px", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "30px",
              background: "rgba(212,175,55,0.06)", color: "var(--gold)",
              fontSize: "13px", letterSpacing: "4px", fontFamily: "var(--font-display)", fontWeight: "500",
            }}>
              I CAN'T WAIT
            </button>
          </div>
        ) : (
          <div style={{ animation: "revealFromSmoke 0.8s ease-out" }}>
            <p style={{ fontSize: "22px", color: "var(--gold)", margin: "0 0 12px", fontStyle: "italic", fontFamily: "var(--font-body)", fontWeight: "500" }}>Patience is a virtue, habibi.</p>
            <p style={{ fontSize: "16px", color: "var(--dust)", fontWeight: "400" }}>You'll find out at the party. Some things are worth waiting for.</p>
          </div>
        )}
      </Card></Reveal>
    </div>
  );
}

// ===========================
// TAB: GAMES
// ===========================
function GamesTab() {
  return (
    <div className="tab-content" style={{ padding: "0 20px 60px", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "40px 0 10px" }}>
        <h2 className="shimmer-text" style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: "600", margin: "0 0 12px", letterSpacing: "3px", fontFamily: "var(--font-display)" }}>The Games</h2>
        <p style={{ fontSize: "17px", color: "var(--dust)", fontStyle: "italic", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8, fontWeight: "400" }}>Wine is the thread. The games are the knots.</p>
      </div>
      <Ornament />

      {/* BAZAAR PITCH */}
      <Reveal><Card glow="rgba(212,175,55,0.04)" style={{ border: "1px solid rgba(212,175,55,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bazaar" size={28} color="var(--gold)" />
          </div>
          <div>
            <h3 style={{ fontSize: "24px", color: "var(--gold)", margin: 0, fontWeight: "500", fontFamily: "var(--font-display)" }}>The Bazaar Pitch</h3>
            <div style={{ fontSize: "11px", color: "var(--dust)", letterSpacing: "4px", marginTop: "4px", fontFamily: "var(--font-display)" }}>ICEBREAKER</div>
          </div>
        </div>
        <p style={{ fontSize: "15px", color: "var(--sand)", lineHeight: 1.8, margin: "0 0 14px", fontWeight: "400" }}>

          Before the party, find the most random, useless object in your house. Don't tell anyone what it is. When the Bazaar is called, you have <span style={{ color: "var(--gold)", fontWeight: "500" }}>1-2 minutes</span> to pitch it as the greatest treasure ever found in the bazaar. Stay in character as a merchant. The crowd votes. Winner is crowned Grand Merchant.
        </p>
        <p style={{ fontSize: "15px", color: "var(--dust)", margin: 0, fontWeight: "400" }}>
          Come prepared. Study your object. The more ridiculous the backstory, the better.
        </p>
      </Card></Reveal>

      {/* TRIVIA */}
      <Reveal delay={0.05}><Card>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(107,163,214,0.08)", border: "1px solid rgba(107,163,214,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="brain" size={28} color="#6ba3d6" />
          </div>
          <div>
            <h3 style={{ fontSize: "24px", color: "#6ba3d6", margin: 0, fontWeight: "500", fontFamily: "var(--font-display)" }}>Trivia</h3>
            <div style={{ fontSize: "11px", color: "var(--dust)", letterSpacing: "4px", marginTop: "4px", fontFamily: "var(--font-display)" }}>TRADITION</div>
          </div>
        </div>
        <p style={{ fontSize: "15px", color: "var(--sand)", lineHeight: 1.8, margin: 0, fontWeight: "400" }}>
          Arabian Nights themed rounds. Wine, history, curveballs. Teams formed at the party. No prep needed.
        </p>
      </Card></Reveal>

      {/* MUSIC */}
      <Reveal delay={0.1}><Card>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(232,168,50,0.08)", border: "1px solid rgba(232,168,50,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="music" size={28} color="#e8a832" />
          </div>
          <div>
            <h3 style={{ fontSize: "24px", color: "#e8a832", margin: 0, fontWeight: "500", fontFamily: "var(--font-display)" }}>Name That Tale</h3>
            <div style={{ fontSize: "11px", color: "var(--dust)", letterSpacing: "4px", marginTop: "4px", fontFamily: "var(--font-display)" }}>MUSIC ROUND</div>
          </div>
        </div>
        <p style={{ fontSize: "15px", color: "var(--sand)", lineHeight: 1.8, margin: 0, fontWeight: "400" }}>
          Guess the song and artist from Arabian Nights themed clips. One point each. Playlist stays secret until the day.
        </p>
      </Card></Reveal>

      {/* FORBIDDEN WORD */}
      <Reveal delay={0.15}><Card>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(232,68,106,0.08)", border: "1px solid rgba(232,68,106,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="stop" size={28} color="#e8446a" />
          </div>
          <div>
            <h3 style={{ fontSize: "24px", color: "#e8446a", margin: 0, fontWeight: "500", fontFamily: "var(--font-display)" }}>The Forbidden Word</h3>
            <div style={{ fontSize: "11px", color: "var(--dust)", letterSpacing: "4px", marginTop: "4px", fontFamily: "var(--font-display)" }}>ALL AFTERNOON</div>
          </div>
        </div>
        <p style={{ fontSize: "15px", color: "var(--sand)", lineHeight: 1.8, margin: "0 0 14px", fontWeight: "400" }}>
          One common word banned all afternoon. Say it and you get caught. Penalties: wear a silly accessory, finish your drink, serenade the group. They stack.
        </p>
        <p style={{ fontSize: "15px", color: "var(--dust)", margin: 0, fontWeight: "400" }}>
          The word is revealed when you arrive.
        </p>
      </Card></Reveal>

      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontSize: "16px", color: "var(--dust)", fontStyle: "italic", lineHeight: 1.9, fontWeight: "400" }}>
          There may be other surprises throughout the afternoon.
          <br /><span style={{ color: "var(--gold)" }}>But if we told you everything, it wouldn't be The Thousand & One Night.</span>
        </p>
      </div>
    </div>
  );
}

// ===========================
// MAIN APP
// ===========================
// Expandable section for secondary content
function Expandable({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "20px 0", border: "none", background: "transparent",
        color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "2px",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Icon name={icon} size={18} color="var(--gold)" />
          {title}
        </span>
        <span style={{ color: "var(--gold)", fontSize: "20px", transition: "transform 0.3s ease", transform: open ? "rotate(45deg)" : "rotate(0deg)", opacity: 0.5 }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? "2000px" : "0",
        overflow: "hidden",
        transition: "max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: open ? 1 : 0,
        transitionProperty: "max-height, opacity",
      }}>
        <div style={{ paddingBottom: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

export default function PartyInvite() {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <CursorGlow />
      <StarField />
      <FloatingParticles />
      <ShootingStars />
      <ScrollProgress />


      {/* Gold line */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", opacity: 0.4, position: "relative", zIndex: 2 }} />

      {/* === HERO === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <HeroScene />
        <div style={{ textAlign: "center", padding: "0 20px 20px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "6px", color: "var(--gold)", opacity: 0.5, marginBottom: "16px", fontFamily: "var(--font-display)" }}>THE 3RD ANNUAL</div>
          <h1 className="shimmer-text" style={{ fontSize: "clamp(30px, 6.5vw, 50px)", fontWeight: "600", margin: "0 0 6px", letterSpacing: "4px", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>Engwall Wine Festival</h1>
          <p style={{ fontSize: "18px", color: "var(--sand)", marginTop: "10px", fontFamily: "var(--font-body)", fontWeight: "400", fontStyle: "italic" }}>The Thousand & One Night</p>
        </div>

        {/* Event details - 2x2 grid with proper spacing */}
        <Reveal type="stagger">
          <div style={{ maxWidth: "700px", margin: "30px auto 0", padding: "0 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "WHEN", value: "June 20th", sub: "12:00 PM arrival \u00b7 1:00 PM wine tasting" },
                { label: "WHERE", value: "Engwall Backyard", sub: "" },
                { label: "FOOD", value: "Middle Eastern Feast", sub: "Mezze, b\u00f6rek, baklava, hummus, dates, and more" },
                { label: "WHAT YOU BRING", value: "2 bottles of the same wine with your teammate", sub: "Random object from your home and your bazaar pitch · Best attitude and appetite" },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gold)", marginBottom: "6px", opacity: 0.5, fontFamily: "var(--font-display)" }}>{item.label}</div>
                  <div style={{ fontSize: "16px", color: "var(--cream)", marginBottom: "3px", fontFamily: "var(--font-display)", fontWeight: "500" }}>{item.value}</div>
                  {item.sub && <div style={{ fontSize: "12px", color: "var(--dust)", lineHeight: 1.5, fontWeight: "400" }}>{item.sub}</div>}
                </div>
              ))}
            </div>

            <WordReveal
              text="This year's theme is The Thousand & One Night. Think Aladdin, Jasmine, magic carpets, gold everything. You'll taste wine through stories you perform, build a collaborative work of art, and eat a Middle Eastern feast like a sultan who doesn't believe in moderation."
              style={{ fontSize: "15px", color: "var(--sand)", lineHeight: 1.85, marginTop: "24px", textAlign: "center", fontWeight: "400" }}
            />
          </div>
        </Reveal>

        <Ornament />
      </div>

      {/* === WINE TASTING === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <WineTastingTab />
      </div>

      {/* === GENIE DIVIDER + GAMES === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Reveal>
          <div className="genie-lamp-scene" style={{ textAlign: "center", margin: "40px 0 20px", position: "relative" }}>
            {/* Subtle dark glow — just enough to pop the genie/lamp and fogs */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(420px, 95vw)", height: "min(420px, 95vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.1) 65%, transparent 80%)", pointerEvents: "none", zIndex: 0 }} />
            {/* Genie + Lamp stacked naturally */}
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
              {/* Fog particles rising from lamp */}
              <div style={{ position: "absolute", bottom: "60px", left: "50%", zIndex: 3, pointerEvents: "none" }}>
                <div style={{ position: "absolute", bottom: "0", left: "0", width: "50px", height: "50px", borderRadius: "50%", background: "radial-gradient(circle, rgba(100,160,240,0.5), rgba(160,120,220,0.25), transparent 70%)", animation: "fogPulse 3s ease-in-out infinite", filter: "blur(6px)" }} />
                {[
                  { w: 60, h: 45, bg: "rgba(100,150,220,0.45)", anim: "fogDrift1", dur: "4s", delay: "0s" },
                  { w: 75, h: 55, bg: "rgba(140,120,220,0.38)", anim: "fogDrift2", dur: "5s", delay: "0.8s" },
                  { w: 50, h: 40, bg: "rgba(100,160,240,0.42)", anim: "fogDrift3", dur: "3.5s", delay: "1.5s" },
                  { w: 65, h: 48, bg: "rgba(120,140,230,0.35)", anim: "fogDrift4", dur: "4.5s", delay: "2.2s" },
                ].map((p, i) => (
                  <div key={i} className="fog-particle" style={{ width: `${p.w}px`, height: `${p.h}px`, background: `radial-gradient(ellipse, ${p.bg}, transparent 60%)`, filter: "blur(10px)", animation: `${p.anim} ${p.dur} ease-out ${p.delay} infinite` }} />
                ))}
              </div>
              <img src="/genie.png" alt="" style={{ width: "180px", marginBottom: "-40px", animation: "lampFloat 5s ease-in-out infinite", filter: "drop-shadow(0 0 25px rgba(100,150,220,0.5))", position: "relative", zIndex: 1 }} />
              <img src="/lamp.png" alt="" style={{ width: "110px", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(212,175,55,0.3))", animation: "glowPulse 4s ease-in-out infinite", position: "relative", zIndex: 2 }} />
              {/* Glow under lamp */}
              <div style={{ width: "130px", height: "16px", background: "radial-gradient(ellipse, rgba(212,175,55,0.35), transparent 70%)", borderRadius: "50%", marginTop: "-4px" }} />
            </div>
          </div>
        </Reveal>

        <GamesTab />
      </div>

      {/* === LANTERN SCENE DIVIDER === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <LanternScene />
      </div>

      {/* === DRESS CODE === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <DressCodeTab />
      </div>

      {/* === ART PROJECT + FOOTER === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <TheArtTab />

        <div style={{ textAlign: "center", padding: "20px 20px 40px" }}>
          <div style={{ fontSize: "12px", color: "var(--dust)", opacity: 0.6, fontFamily: "var(--font-display)", letterSpacing: "3px" }}>THE THOUSAND & ONE NIGHT</div>
        </div>
      </div>

      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", opacity: 0.2, position: "relative", zIndex: 2 }} />
    </div>
  );
}
