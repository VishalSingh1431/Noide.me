import { useState, useEffect, useRef } from 'react';
import {
    Github, Linkedin, Twitter, Mail, Phone, MapPin,
    ExternalLink, Download, Briefcase, GraduationCap,
    Star, Award, Menu, X, Quote, ArrowRight, Sparkles, ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../config/constants';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PURE WHITE · NEAR-BLACK · ONE BLUE ACCENT
   Apple / Stripe / Linear — crisp, premium, bold.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const C = {
    bg: '#ffffff',
    bg2: '#f5f5f7',   // Apple-gray section bg
    bgCard: '#ffffff',
    border: 'rgba(0,0,0,0.09)',
    black: '#09090b',   // near-black
    dark: '#18181b',
    mid: '#52525b',
    low: '#a1a1aa',
    blue: '#2563eb',   // single vivid accent
    blueD: '#1d4ed8',
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
};

const GlobalStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { scroll-behavior:smooth; }
    body { font-family:'Inter',system-ui,sans-serif; background:#fff; color:${C.black}; overflow-x:hidden; }

    /* ── Name shimmer — BLACK ── */
    .name-text {
        background: linear-gradient(135deg, #09090b 0%, #3f3f46 40%, #09090b 70%);
        background-size: 200% auto;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        animation: nameShim 6s linear infinite;
    }
    .blue-text {
        background: linear-gradient(135deg, ${C.blue}, ${C.blueD});
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    @keyframes nameShim { 0%{background-position:-200% center} 100%{background-position:200% center} }

    /* ── Cards ── */
    .card {
        background: ${C.bgCard};
        border: 1px solid ${C.border};
        border-radius: 18px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .card-lift {
        transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, border-color .25s;
    }
    .card-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        border-color: rgba(37,99,235,0.25);
    }

    /* ── Nav ── */
    .nav-link {
        color:${C.mid}; font-size:13px; font-weight:600;
        padding:8px 16px; border-radius:99px; border:none;
        background:none; cursor:pointer; font-family:inherit;
        text-transform:capitalize; transition:all .2s;
    }
    .nav-link:hover { color:${C.black}; background:${C.bg2}; }

    /* ── Buttons ── */
    .btn-black {
        background:${C.black}; border:none; border-radius:12px;
        padding:14px 30px; font-weight:700; font-size:15px; color:#fff;
        cursor:pointer; font-family:inherit;
        transition:transform .2s, box-shadow .25s, background .2s;
    }
    .btn-black:hover { background:${C.dark}; transform:scale(1.03); box-shadow:0 8px 30px rgba(9,9,11,0.25); }
    .btn-outline {
        background:transparent; border:1.5px solid ${C.border};
        border-radius:12px; padding:13px 28px; font-weight:700;
        font-size:15px; color:${C.black}; cursor:pointer; font-family:inherit;
        transition:all .2s;
    }
    .btn-outline:hover { border-color:${C.black}; background:${C.bg2}; }
    .btn-blue {
        background:${C.blue}; border:none; border-radius:12px;
        padding:14px 30px; font-weight:700; font-size:15px; color:#fff;
        cursor:pointer; font-family:inherit;
        transition:transform .2s, box-shadow .25s;
    }
    .btn-blue:hover { transform:scale(1.03); box-shadow:0 8px 30px rgba(37,99,235,0.35); }
    .icon-btn {
        width:42px; height:42px; border-radius:50%;
        background:#fff; border:1.5px solid ${C.border};
        display:flex; align-items:center; justify-content:center;
        color:${C.mid}; text-decoration:none; transition:all .25s;
    }
    .icon-btn:hover { background:${C.black}; border-color:${C.black}; color:#fff; transform:scale(1.1); }

    /* ── Tags ── */
    .tag {
        display:inline-block; background:#f4f4f5;
        border:1px solid #e4e4e7; color:${C.dark};
        padding:3px 12px; border-radius:99px; font-size:12px; font-weight:600;
    }

    /* ── Skill bar ── */
    .skill-track { height:5px; background:#f4f4f5; border-radius:99px; overflow:hidden; }
    .skill-fill  { height:100%; border-radius:99px; transition:width 1.3s cubic-bezier(.22,1,.36,1); }

    /* ── Animations ── */
    @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    .float   { animation:float 6s ease-in-out infinite; }
    @keyframes rotate  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .spin-s  { animation:rotate 18s linear infinite; }
    @keyframes slide-up { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
    .slide-up { animation:slide-up .85s cubic-bezier(.22,1,.36,1) forwards; }
    @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
    .blink   { animation:blink 1s step-end infinite; }
    .reveal  { opacity:0; transform:translateY(32px); transition:opacity .75s ease, transform .75s cubic-bezier(.22,1,.36,1); }
    .reveal.in { opacity:1; transform:translateY(0); }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .marq    { display:flex; gap:10px; animation:marquee 22s linear infinite; white-space:nowrap; }

    /* ── Inputs ── */
    input, textarea {
        width:100%; background:${C.bg2}; border:1.5px solid ${C.border};
        border-radius:10px; padding:13px 16px; color:${C.black};
        font-size:14px; outline:none; font-family:inherit; display:block;
        transition:border-color .2s, box-shadow .2s;
    }
    input:focus, textarea:focus {
        border-color:${C.blue}; box-shadow:0 0 0 3px rgba(37,99,235,0.1);
        background:#fff;
    }
    textarea { resize:none; }
    input::placeholder, textarea::placeholder { color:${C.low}; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:#fff; }
    ::-webkit-scrollbar-thumb { background:#d4d4d8; border-radius:3px; }
  `}</style>
);

// Initial placeholder data (will be replaced by resume data)
const INITIAL_P = {
    name: 'Auto-fill Placeholder',
    titles: ['Ready to build...', 'Upload your resume'],
    tagline: 'Your professional profile will appear here once you upload your resume.',
    location: 'Noida, UP',
    email: 'hello@noidahub.com',
    phone: '+91 00000 00000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder&backgroundColor=b6e3f4',
    skills: [
        { name: 'Skill 1', pct: 80, color: C.blue },
        { name: 'Skill 2', pct: 70, color: C.green },
    ],
    projects: [
        { title: 'Project 1', desc: 'Brief description will go here.', tech: ['React'], emoji: '🚀', bg: '#09090b', fg: '#ffffff' }
    ],
    experience: [
        { role: 'Job Role', company: 'Company Name', period: '2023 - Present', color: C.blue, desc: 'Key achievements.' }
    ],
    education: [{ degree: 'Degree Name', school: 'Institute Name', year: '2020', gpa: '9.0' }],
    tech: ['React', 'Node.js', 'PostgreSQL'],
    testimonials: [],
};

/* hooks */
const useTypewriter = (words, speed = 75, pause = 2000) => {
    const [text, setText] = useState(''); const [wi, setWi] = useState(0); const [del, setDel] = useState(false);
    useEffect(() => { const cur = words[wi]; const t = setTimeout(() => { if (!del) { setText(cur.slice(0, text.length + 1)); if (text.length + 1 === cur.length) setTimeout(() => setDel(true), pause); } else { setText(cur.slice(0, text.length - 1)); if (text.length === 0) { setDel(false); setWi(i => (i + 1) % words.length); } } }, (del ? 35 : speed)); return () => clearTimeout(t); }, [text, del, wi, words, speed, pause]);
    return text;
};
const useReveal = () => { const ref = useRef(null); useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('in'); }, { threshold: 0.1 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []); return ref; };

const SkillBar = ({ s, i }) => {
    const [w, setW] = useState(0); const ref = useRef(); useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setW(s.pct), i * 100); }, { threshold: 0.5 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, [s.pct, i]);
    return (<div ref={ref}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: C.dark, fontWeight: 600, fontSize: 14 }}>{s.name}</span><span style={{ color: s.color, fontSize: 12, fontWeight: 700 }}>{s.pct}%</span></div><div className="skill-track"><div className="skill-fill" style={{ width: `${w}%`, background: s.color }} /></div></div>);
};

const SH = ({ pre, hi, sub }) => (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 99, padding: '5px 16px', marginBottom: 16 }}>
            <Sparkles size={12} color={C.blue} />
            <span style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>{sub}</span>
        </div>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: C.black, lineHeight: 1.08 }}>
            {pre} <span className="blue-text">{hi}</span>
        </h2>
        <div style={{ width: 40, height: 3, background: C.black, borderRadius: 2, margin: '14px auto 0' }} />
    </div>
);

const StatCard = ({ emoji, value, label, color }) => (
    <div className="card card-lift" style={{ padding: 22, textAlign: 'center', cursor: 'default' }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>{emoji}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
        <div style={{ fontSize: 12, color: C.low, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
);

export default function PortfolioDemo() {
    const [p, setP] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [menu, setMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const title = useTypewriter(p?.titles || INITIAL_P.titles);
    const nav = ['about', 'skills', 'projects', 'experience', 'testimonials', 'contact'];
    const aRef = useReveal(), sRef = useReveal(), pRef = useReveal(), eRef = useReveal(), tRef = useReveal();

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    const handleFileUpload = async (file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch(`${API_BASE_URL}/portfolio/parse-resume`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to parse resume');

            const data = await response.json();

            // Add custom avatar seed based on name
            data.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s/g, '')}&backgroundColor=b6e3f4`;

            // Assign colors to skills if Gemini didn't
            data.skills = (data.skills || []).map((s, i) => ({
                ...s,
                color: [C.blue, C.green, '#7c3aed', C.amber, '#ea580c', '#0891b2'][i % 6]
            }));

            // Ensure projects have default bg/fg if missing
            data.projects = (data.projects || []).map(prj => ({
                ...prj,
                tech: Array.isArray(prj.tech) ? prj.tech : (typeof prj.tech === 'string' ? prj.tech.split(',').map(t => t.trim()) : []),
                bg: prj.bg || C.black,
                fg: prj.fg || '#ffffff'
            }));

            // Build top-level tech array for the marquee from skills + project techs
            data.tech = data.tech && Array.isArray(data.tech) ? data.tech : [
                ...(data.skills || []).map(s => s.name),
                ...(data.projects || []).flatMap(p => p.tech || [])
            ].filter((v, i, a) => v && a.indexOf(v) === i);

            // Ensure other arrays are safe
            data.experience = data.experience || [];
            data.education = data.education || [];
            data.titles = data.titles || ['Developer'];

            setP(data);
        } catch (err) {
            console.error(err);
            setError("Failed to extract data. Make sure it's a valid DOCX resume.");
        } finally {
            setLoading(false);
        }
    };

    const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenu(false); };

    if (!p && !loading) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <GlobalStyle />
                <div className="card slide-up" style={{ maxWidth: 500, width: '100%', padding: 48, textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Briefcase size={32} color={C.blue} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Build your Portfolio in 10s</h1>
                    <p style={{ color: C.mid, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
                        Drop your resume (DOCX) below. Our AI will extract your skills, projects, and experience to build your personalized site instantly.
                    </p>

                    <label className="btn-black" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', width: '100%' }}>
                        <Download size={18} /> Upload Resume
                        <input type="file" hidden accept=".docx" onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])} />
                    </label>

                    {error && <p style={{ color: C.red, fontSize: 13, marginTop: 16, fontWeight: 600 }}>{error}</p>}

                    <p style={{ marginTop: 32, fontSize: 12, color: C.low, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Powered by Gemini AI
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
                <GlobalStyle />
                <div style={{ width: 60, height: 60, borderRadius: '50%', border: `3px solid ${C.bg2}`, borderTopColor: C.blue, animation: 'rotate 1s linear infinite' }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Gemini is reading your resume...</h2>
                    <p style={{ color: C.mid, fontSize: 14 }}>Extracting skills, magic and experience.</p>
                </div>
                <style>{`@keyframes rotate { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const P = p; // Alias for the rest of the template

    return (
        <div style={{ background: '#fff', minHeight: '100vh', color: C.black }}>
            <GlobalStyle />

            {/* NAV */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
                background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
                transition: 'all .3s ease'
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 900, fontSize: 13, color: '#fff' }}>AS</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 15, color: C.black }}>Arjun.dev</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {nav.map(l => <button key={l} className="nav-link" onClick={() => go(l)}>{l}</button>)}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button className="nav-link" onClick={() => setP(null)}>Upload New</button>
                        <button className="btn-black" onClick={() => go('contact')} style={{ padding: '9px 22px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10 }}>
                            Hire Me <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
                {menu && (
                    <div style={{ background: '#fff', borderTop: `1px solid ${C.border}`, padding: '14px 24px' }}>
                        {nav.map(l => <button key={l} onClick={() => go(l)} style={{ display: 'block', background: 'none', border: 'none', color: C.mid, padding: '10px 0', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left', fontSize: 15 }}>{l}</button>)}
                    </div>
                )}
            </nav>

            {/* HERO */}
            <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#fff', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
                {/* Subtle dot grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
                {/* Very faint blue glow top-right */}
                <div style={{ position: 'absolute', top: -200, right: -100, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 65%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 2, width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 80, alignItems: 'center' }}>

                        {/* Left */}
                        <div className="slide-up">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px #16a34a', display: 'inline-block' }} />
                                <span style={{ color: '#15803d', fontSize: 12, fontWeight: 600 }}>Open to opportunities</span>
                            </div>

                            <h1 style={{ fontSize: 'clamp(2.8rem,5vw,4.5rem)', fontWeight: 900, lineHeight: 1.0, marginBottom: 16, letterSpacing: '-0.03em', color: C.black }}>
                                Hi, I'm<br />
                                <span className="name-text">{P.name}</span>
                            </h1>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, minHeight: 36 }}>
                                <div style={{ width: 22, height: 3, background: C.blue, borderRadius: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: 17, fontWeight: 700, color: C.blue }}>{title}</span>
                                <span className="blink" style={{ color: C.blue, fontSize: 26, lineHeight: 1, fontWeight: 300 }}>|</span>
                            </div>

                            <p style={{ color: C.mid, fontSize: 17, lineHeight: 1.8, maxWidth: 480, marginBottom: 40 }}>{P.tagline}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
                                <button className="btn-black" onClick={() => go('projects')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    View My Work <ArrowRight size={16} />
                                </button>
                                <button className="btn-outline" onClick={() => go('contact')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <Download size={16} /> Resume
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                {[Github, Linkedin, Twitter, Mail].map((Icon, i) => (
                                    <a key={i} href="#" className="icon-btn"><Icon size={17} /></a>
                                ))}
                            </div>
                        </div>

                        {/* Right: Avatar */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="float" style={{ position: 'relative' }}>
                                {/* Spinning ring — black dashes */}
                                <svg className="spin-s" style={{ position: 'absolute', inset: -26, width: 'calc(100%+52px)', height: 'calc(100%+52px)', overflow: 'visible' }} viewBox="0 0 400 400">
                                    <circle cx="200" cy="200" r="188" fill="none" stroke={C.black} strokeWidth="1.5" strokeDasharray="18 10" strokeLinecap="round" opacity="0.15" />
                                </svg>
                                {/* Second ring — blue */}
                                <svg className="spin-s" style={{ position: 'absolute', inset: -14, width: 'calc(100%+28px)', height: 'calc(100%+28px)', overflow: 'visible', animationDirection: 'reverse', animationDuration: '12s' }} viewBox="0 0 376 376">
                                    <circle cx="188" cy="188" r="182" fill="none" stroke={C.blue} strokeWidth="1.5" strokeDasharray="8 14" strokeLinecap="round" opacity="0.4" />
                                </svg>

                                {/* Avatar */}
                                <div style={{ width: 300, height: 300, borderRadius: '50%', padding: 3, background: `linear-gradient(135deg,${C.black},#52525b,${C.blue})`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={P.avatar} alt={P.name} style={{ width: 268, height: 268, objectFit: 'cover' }} />
                                    </div>
                                </div>

                                {/* Floating badges */}
                                <div className="card" style={{ position: 'absolute', top: -10, right: -38, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 7, borderRadius: 14, border: `1px solid #fde68a`, background: '#fffbeb' }}>
                                    <Star size={14} style={{ color: '#d97706', fill: '#d97706' }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.black }}>Top Rated</span>
                                </div>
                                <div className="card" style={{ position: 'absolute', bottom: -10, left: -38, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 7, borderRadius: 14, border: `1px solid #bfdbfe`, background: '#eff6ff' }}>
                                    <Award size={14} style={{ color: C.blue }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.black }}>3+ Yrs Exp</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 80, opacity: .2, animation: 'float 3s ease-in-out infinite' }}>
                        <ChevronDown size={22} color={C.black} />
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" ref={aRef} className="reveal" style={{ padding: '120px 24px', background: C.bg2 }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <SH pre="About" hi="Me" sub="Who I Am" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>
                        <div>
                            <p style={{ color: C.mid, fontSize: 16, lineHeight: 1.9, marginBottom: 36 }}>
                                I'm a passionate Full Stack Developer from Noida with 3+ years of experience. I specialize in React, Node.js, and PostgreSQL — turning complex problems into simple, beautiful, and intuitive solutions. Currently building <strong style={{ color: C.black }}>NoidaHub</strong>, powering 22k+ local businesses. ☕
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <StatCard emoji="🚀" value="20+" label="Projects" color={C.black} />
                                <StatCard emoji="🤝" value="15+" label="Clients" color={C.blue} />
                                <StatCard emoji="⭐" value="3 Yrs" label="Experience" color={C.amber} />
                                <StatCard emoji="💻" value="40+" label="Open Source" color={C.green} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { Icon: MapPin, label: 'Location', value: P.location, color: '#dc2626', bg: '#fef2f2', bdr: '#fecaca' },
                                { Icon: Mail, label: 'Email', value: P.email, color: C.blue, bg: '#eff6ff', bdr: '#bfdbfe' },
                                { Icon: Phone, label: 'Phone', value: P.phone, color: C.green, bg: '#f0fdf4', bdr: '#86efac' },
                            ].map(({ Icon, label, value, color, bg, bdr }, i) => (
                                <div key={i} className="card card-lift" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 16, background: '#fff' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1.5px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={19} color={color} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, color: C.low, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 }}>{label}</p>
                                        <p style={{ color: C.black, fontWeight: 600, fontSize: 14 }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="card" style={{ padding: '15px 20px', background: '#fff' }}>
                                <p style={{ fontSize: 11, color: C.low, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Tech Stack</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                    {['React', 'Node.js', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Figma'].map(t => (
                                        <span key={t} className="tag">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SKILLS */}
            <section id="skills" ref={sRef} className="reveal" style={{ padding: '120px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <SH pre="My" hi="Skills" sub="Technologies" />
                    <div className="card" style={{ padding: 40, marginBottom: 28, background: '#fff' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: 28 }}>
                            {(P.skills || []).map((s, i) => <SkillBar key={i} s={s} i={i} />)}
                        </div>
                    </div>
                    <div style={{ overflow: 'hidden', padding: '10px 0' }}>
                        <div className="marq">
                            {[...(P.tech || []), ...(P.tech || [])].map((t, i) => (
                                <span key={i} className="tag" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, flexShrink: 0 }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* PROJECTS */}
            <section id="projects" ref={pRef} className="reveal" style={{ padding: '120px 24px', background: C.bg2 }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <SH pre="Featured" hi="Projects" sub="My Work" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
                        {(P.projects || []).map((proj, i) => (
                            <div key={i} className="card card-lift" style={{ overflow: 'hidden', padding: 0, background: '#fff' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                                <div style={{ padding: 28, background: proj.bg, position: 'relative', overflow: 'hidden', minHeight: 170 }}>
                                    <div style={{ position: 'absolute', top: -24, right: -24, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                                    <div style={{ fontSize: 34, marginBottom: 12, position: 'relative', zIndex: 1 }}>{proj.emoji}</div>
                                    <h3 style={{ fontWeight: 800, fontSize: 16, color: proj.fg, marginBottom: 8, position: 'relative', zIndex: 1 }}>{proj.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 1.65, position: 'relative', zIndex: 1 }}>{proj.desc}</p>
                                </div>
                                <div style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {(proj.tech || []).map((t, j) => <span key={j} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
                                    </div>
                                    <a href="#" style={{ color: C.blue, display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                                        View <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EXPERIENCE */}
            <section id="experience" ref={eRef} className="reveal" style={{ padding: '120px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <SH pre="Work" hi="Experience" sub="My Journey" />
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 22, top: 0, bottom: 0, width: 1.5, background: 'linear-gradient(180deg,#09090b,rgba(0,0,0,0.1),transparent)', pointerEvents: 'none' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {(P.experience || []).map((e, i) => (
                                <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: `2px solid ${e.color || C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px ${e.color || C.blue}18` }}>
                                        <Briefcase size={17} color={e.color} />
                                    </div>
                                    <div className="card card-lift" style={{ padding: '20px 24px', flex: 1, borderLeft: `3px solid ${e.color || C.blue}`, background: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                                            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.black }}>{e.role}</h3>
                                            <span style={{ fontSize: 11, color: C.low, background: C.bg2, padding: '3px 12px', borderRadius: 99, fontWeight: 600 }}>{e.period}</span>
                                        </div>
                                        <p style={{ color: e.color || C.blue, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{e.company}</p>
                                        <p style={{ color: C.mid, fontSize: 13.5, lineHeight: 1.7 }}>{e.desc}</p>
                                    </div>
                                </div>
                            ))}
                            {(P.education || []).map((e, i) => (
                                <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: `2px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px rgba(217,119,6,0.1)` }}>
                                        <GraduationCap size={17} color={C.amber} />
                                    </div>
                                    <div className="card card-lift" style={{ padding: '20px 24px', flex: 1, borderLeft: `3px solid ${C.amber}`, background: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                                            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.black }}>{e.degree}</h3>
                                            <span style={{ fontSize: 11, color: C.low, background: C.bg2, padding: '3px 12px', borderRadius: 99, fontWeight: 600 }}>{e.year}</span>
                                        </div>
                                        <p style={{ color: C.amber, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{e.school}</p>
                                        <span style={{ fontSize: 11, background: '#f0fdf4', color: C.green, border: '1px solid #86efac', padding: '3px 12px', borderRadius: 99, fontWeight: 600 }}>GPA: {e.gpa}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="testimonials" ref={tRef} className="reveal" style={{ padding: '120px 24px', background: C.bg2 }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <SH pre="What Clients" hi="Say" sub="Testimonials" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                        {(P.testimonials || []).map((t, i) => (
                            <div key={i} className="card card-lift" style={{ padding: 28, background: '#fff' }}>
                                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                                    {[...Array(5)].map((_, j) => <Star key={j} size={14} style={{ color: C.amber, fill: C.amber }} />)}
                                </div>
                                <Quote size={22} style={{ color: C.blue, opacity: .2, marginBottom: 10 }} />
                                <p style={{ color: C.mid, fontSize: 14.5, lineHeight: 1.8, marginBottom: 22 }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                                    <img src={t.avatar} alt={t.name} style={{ width: 46, height: 46, borderRadius: '50%', background: C.bg2, border: `2px solid ${C.border}` }} />
                                    <div>
                                        <p style={{ fontWeight: 700, color: C.black, fontSize: 14 }}>{t.name}</p>
                                        <p style={{ color: C.blue, fontSize: 12, fontWeight: 500 }}>{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section id="contact" style={{ padding: '120px 24px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.05) 0%,transparent 65%)', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <SH pre="Get in" hi="Touch" sub="Contact" />
                    <div className="card" style={{ padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', border: `1px solid #bfdbfe`, background: '#eff6ff' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <p style={{ fontWeight: 800, color: C.black, fontSize: 16 }}>Let's build something amazing 🚀</p>
                            <p style={{ color: C.mid, fontSize: 13, marginTop: 3 }}>Typically replies within 2 hours.</p>
                        </div>
                        <a href={`mailto:${P.email}`} className="btn-blue" style={{ padding: '10px 20px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10 }}>
                            <Mail size={14} /> Email Me
                        </a>
                    </div>
                    <div className="card" style={{ padding: 36, background: '#fff' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <input type="text" placeholder="Your Name" />
                            <input type="email" placeholder="Email Address" />
                        </div>
                        <input type="text" placeholder="Subject" style={{ marginBottom: 12 }} />
                        <textarea rows={5} placeholder="Tell me about your project..." style={{ marginBottom: 20 }} />
                        <button className="btn-black" style={{ width: '100%', padding: 15, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12 }}>
                            Send Message <ArrowRight size={17} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                        {[{ Icon: Github, label: 'GitHub' }, { Icon: Linkedin, label: 'LinkedIn' }, { Icon: Twitter, label: 'Twitter' }, { Icon: Mail, label: 'Email' }].map(({ Icon, label }, i) => (
                            <a key={i} href="#" className="icon-btn" style={{ width: 'auto', padding: '9px 16px', borderRadius: 10, gap: 7, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                                <Icon size={14} /> {label}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: 11, color: '#fff' }}>AS</span>
                    </div>
                    <span style={{ color: C.low, fontSize: 13 }}>© 2025 <strong style={{ color: C.mid }}>Arjun Sharma</strong> — Made with ❤️ in Noida</span>
                </div>
                <span style={{ color: C.low, fontSize: 12 }}>
                    Powered by <strong style={{ color: C.black }}>NoidaHub</strong>
                </span>
            </div>
        </div>
    );
}
