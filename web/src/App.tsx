import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircle, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check,
  CheckCircle2, GraduationCap, HeartHandshake, LibraryBig, Menu, MessageCircle,
  RefreshCw, Send, ShieldCheck, Sparkles, X,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
type Programme = { code: string; name: string };
type Bootstrap = {
  product: string;
  institution: string;
  pilot: string;
  programmes: Programme[];
  capabilities: Record<string, string>;
};
type Connection = {
  api: "checking" | "online" | "offline";
  database: "checking" | "ready" | "unavailable";
  bootstrap: Bootstrap | null;
  checkedAt: Date | null;
};
const categories = [
  { value: "experience", label: "My experience" },
  { value: "idea", label: "An idea" },
  { value: "bug", label: "Something is broken" },
  { value: "other", label: "Something else" },
] as const;
const services = [
  { icon: LibraryBig, title: "Academic library", description: "A considered home for course notes, reading lists and learning materials.", key: "academic_resources", tone: "green" },
  { icon: CalendarDays, title: "Timetable", description: "A clearer view of classes, rooms and the rhythm of your week.", key: "timetable", tone: "blue" },
  { icon: MessageCircle, title: "Campus updates", description: "Important notices, brought together in one place.", key: "announcements", tone: "peach" },
];

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(API_BASE + path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Request failed (" + response.status + ")");
  return (await response.json()) as T;
}

function Brand() {
  return <a className="brand" href="#home" aria-label="RootEdu home">
    <span className="brand-mark">r</span><span className="brand-name">root<span>edu</span></span>
  </a>;
}

export default function App() {
  const [connection, setConnection] = useState<Connection>({ api: "checking", database: "checking", bootstrap: null, checkedAt: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number]["value"]>("experience");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function refreshConnection() {
    setConnection((current) => ({ ...current, api: "checking", database: "checking" }));
    const [health, readiness, bootstrap] = await Promise.allSettled([
      getJson<{ status: string }>("/health"),
      getJson<{ status: string }>("/ready"),
      getJson<Bootstrap>("/mobile/bootstrap"),
    ]);
    setConnection({
      api: health.status === "fulfilled" && health.value.status === "ok" ? "online" : "offline",
      database: readiness.status === "fulfilled" && readiness.value.status === "ready" ? "ready" : "unavailable",
      bootstrap: bootstrap.status === "fulfilled" ? bootstrap.value : null,
      checkedAt: new Date(),
    });
  }

  useEffect(() => { void refreshConnection(); }, []);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length < 10) return;
    setSending(true);
    setFeedbackResult(null);
    try {
      const response = await fetch(API_BASE + "/feedback", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          reply_email: replyEmail.trim() || null,
          app_version: "0.1.0",
          device_platform: "unknown",
        }),
      });
      const payload = await response.json().catch(() => ({})) as { message?: string; detail?: string };
      if (!response.ok) throw new Error(payload.detail || "Feedback could not be sent (" + response.status + ").");
      setFeedbackResult({ ok: true, message: payload.message || "Thank you. Your feedback has reached the RootEdu team." });
      setMessage("");
      setReplyEmail("");
    } catch (error) {
      setFeedbackResult({ ok: false, message: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  }

  const apiLabel = connection.api === "checking" ? "Checking connection" : connection.api === "online" ? "API connected" : "API not connected";
  const dbLabel = connection.database === "ready" ? "Database ready" : connection.database === "checking" ? "Checking database" : "Database unavailable";

  return <div className="site-shell" id="home">
    <div className="announcement"><i /> <span>RootEdu is taking shape with the MUST pilot community.</span><a href="#pilot">Meet the pilot <ArrowUpRight size={13} /></a></div>
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
          <a href="#experience" onClick={() => setMenuOpen(false)}>The experience</a>
          <a href="#pilot" onClick={() => setMenuOpen(false)}>Pilot programmes</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our approach</a>
          <a href="#feedback" onClick={() => setMenuOpen(false)}>Feedback</a>
        </nav>
        <div className="header-actions"><a href="#feedback">Talk to the team <ArrowUpRight size={15} /></a>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>

    <main>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><i /> A MORE CONNECTED CAMPUS</div>
          <h1>Your university life,<br /><span>in good hands.</span></h1>
          <p className="hero-lede">The little things that make university life easier, brought together in one thoughtful academic space.</p>
          <div className="hero-actions"><a className="button button-primary" href="#experience">Explore RootEdu <ArrowRight size={17} /></a><a className="text-link" href="#pilot">Discover the pilot <ArrowUpRight size={16} /></a></div>
          <div className="hero-note"><span><ShieldCheck size={17} /></span> Built with care. Designed around real campus needs.</div>
        </div>
        <div className="hero-art" aria-label="Illustration of the RootEdu academic workspace">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sun" />
          <div className="art-caption caption-top"><i /> A little more clarity</div>
          <div className="workspace-card">
            <div className="workspace-top"><div className="mini-brand"><span>r</span> rootedu</div><b>YOUR SPACE</b></div>
            <div className="workspace-greeting">A fresh start,</div><div className="workspace-title">one step at a time.</div><div className="workspace-rule" />
            <div className="workspace-row"><span className="ws-icon green"><BookOpen size={16} /></span><span><b>Learning resources</b><small>All in one place</small></span><ArrowUpRight className="row-arrow" size={15} /></div>
            <div className="workspace-row"><span className="ws-icon blue"><CalendarDays size={16} /></span><span><b>Your timetable</b><small>Make room for what matters</small></span><ArrowUpRight className="row-arrow" size={15} /></div>
            <div className="workspace-row"><span className="ws-icon peach"><MessageCircle size={16} /></span><span><b>Campus updates</b><small>Stay in the loop</small></span><ArrowUpRight className="row-arrow" size={15} /></div>
            <div className="workspace-footer"><Sparkles size={14} /> A calmer way to stay on top of things.</div>
          </div>
          <div className="art-caption caption-bottom"><Check size={12} /> Made for the way you learn</div>
          <div className="art-stamp"><GraduationCap size={22} /><b>MUST<br />PILOT</b></div>
        </div>
      </section>

      <section className="trust-strip"><div className="trust-inner">
        <div className="trust-intro">A thoughtful start,<br /><strong>rooted in community.</strong></div>
        <div className="trust-item"><span><GraduationCap size={19} /></span><div><b>Built for campus life</b><small>Designed around student needs</small></div></div>
        <div className="trust-item"><span><ShieldCheck size={19} /></span><div><b>Privacy by design</b><small>Your information deserves care</small></div></div>
        <div className="trust-item"><span><HeartHandshake size={19} /></span><div><b>Shaped together</b><small>Better with your feedback</small></div></div>
      </div></section>

      <section className="section-wrap experience-section" id="experience">
        <div className="section-heading"><div><div className="eyebrow"><i /> THE ROOTEDU EXPERIENCE</div><h2>Less searching.<br /><span>More getting there.</span></h2></div>
          <p>University comes with a lot to keep track of. RootEdu is being built to make the important things easier to find, follow and manage.</p></div>
        <div className="service-grid">{services.map((service, index) => {
          const Icon = service.icon;
          const capability = connection.bootstrap?.capabilities?.[service.key];
          const state = capability === "available" ? "Available" : "In preparation";
          return <article className="service-card" key={service.key}>
            <div className={"service-icon " + service.tone}><Icon size={22} /></div>
            <div className="service-card-top"><span>0{index + 1} / 03</span><span className="service-state"><i />{state}</span></div>
            <h3>{service.title}</h3><p>{service.description}</p><a href="#pilot" className="card-link">What to expect <ArrowUpRight size={15} /></a>
          </article>;
        })}</div>
        <div className="honesty-note"><Sparkles size={17} /><p><strong>Thoughtful by design.</strong> We only show services when they're ready. No made-up timetables, sample student records or pretend sign-ins.</p></div>
      </section>

      <section className="pilot-section" id="pilot"><div className="section-wrap pilot-layout">
        <div className="pilot-copy"><div className="eyebrow light"><i /> WHERE IT BEGINS</div><h2>Starting with<br /><span>the MUST community.</span></h2>
          <p>RootEdu is beginning with a focused pilot at Meru University of Science and Technology. Three programmes give us a real community to listen to, learn from and build with.</p>
          <div className="pilot-location"><span><GraduationCap size={18} /></span><div><b>Meru University of Science and Technology</b><small>First institutional pilot · Kenya</small></div></div>
        </div>
        <div className="programme-panel"><div className="programme-panel-head"><span>THE FIRST THREE</span><span>{connection.bootstrap?.programmes.length ?? 3} PROGRAMMES</span></div>
          {(connection.bootstrap?.programmes ?? [
            { code: "CT206", name: "Bachelor of Computer Security and Forensics" },
            { code: "CT204", name: "Bachelor of Computer Technology" },
            { code: "CT201", name: "Bachelor of Computer Science" },
          ]).map((programme, index) => <div className="programme-row" key={programme.code}><span className="programme-number">0{index + 1}</span><b className="programme-code">{programme.code}</b><span className="programme-name">{programme.name}</span><ArrowUpRight size={16} /></div>)}
          <div className="programme-panel-foot"><span><Check size={13} /></span> A focused beginning. Built to grow with the community.</div>
        </div>
      </div></section>

      <section className="section-wrap approach-section" id="about">
        <div className="approach-intro"><div className="eyebrow"><i /> WHAT WE BELIEVE</div><h2>Technology should<br /><span>make room for people.</span></h2><p>Good university software should feel dependable, clear and human. That's the standard we're working towards.</p></div>
        <div className="principles">
          <div className="principle"><span><ShieldCheck size={20} /></span><div><h3>Trust comes first</h3><p>Student information is sensitive. Access must be verified, permissions must be clear and privacy should never be an afterthought.</p></div></div>
          <div className="principle"><span><Sparkles size={20} /></span><div><h3>Clarity over clutter</h3><p>Only what is useful, understandable and ready. No noise, no invented information, no unnecessary complexity.</p></div></div>
          <div className="principle"><span><HeartHandshake size={20} /></span><div><h3>Built with the community</h3><p>The best campus tools are shaped by the people who use them. Listening is part of building.</p></div></div>
        </div>
      </section>

      <section className="feedback-section" id="feedback"><div className="section-wrap feedback-layout">
        <div className="feedback-copy"><div className="eyebrow light"><i /> YOUR VOICE MATTERS</div><h2>Help us make<br /><span>RootEdu feel right.</span></h2><p>Tell us what would make your university experience a little easier. Every thoughtful note helps us build something more useful.</p><div className="feedback-promise"><MessageCircle size={18} /> Your feedback goes to the RootEdu team. We never ask for your password.</div></div>
        <form className="feedback-form" onSubmit={submitFeedback}>
          <div className="form-heading"><span>LET'S HEAR FROM YOU</span><span> * Required</span></div>
          <label>What's on your mind?</label><div className="category-options">{categories.map((item) => <button key={item.value} type="button" className={category === item.value ? "category-option selected" : "category-option"} onClick={() => setCategory(item.value)} aria-pressed={category === item.value}>{item.label}</button>)}</div>
          <label htmlFor="feedback-message">Your message <b>*</b></label><textarea id="feedback-message" value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={5000} required placeholder="Share an idea, a moment that could be better, or something you think we're missing..." />
          <div className="field-meta"><span>At least 10 characters</span><span>{message.length}/5000</span></div>
          <label htmlFor="feedback-email">Email address <small>Optional — only if you'd like a reply</small></label><input id="feedback-email" type="email" autoComplete="email" maxLength={254} value={replyEmail} onChange={(event) => setReplyEmail(event.target.value)} placeholder="you@example.com" />
          <p className="privacy-hint">Please don't include passwords, access tokens or private academic records.</p>
          <button className="button button-submit" type="submit" disabled={sending || message.trim().length < 10}>{sending ? "Sending your note…" : "Send feedback"} {sending ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}</button>
          {feedbackResult && <div className={feedbackResult.ok ? "form-result success" : "form-result error"} role="status">{feedbackResult.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<span>{feedbackResult.message}</span></div>}
        </form>
      </div></section>

      <section className="section-wrap status-section"><div className="status-copy"><div className="eyebrow"><i /> A CLEAR PICTURE</div><h2>Always honest<br /><span>about where we are.</span></h2><p>We're building RootEdu carefully. Here's what the connected service is reporting right now.</p></div>
        <div className="status-panel"><div className="status-panel-head"><span>LIVE SERVICE STATUS</span><button type="button" onClick={() => void refreshConnection()} disabled={connection.api === "checking"} aria-label="Refresh service status"><RefreshCw size={15} className={connection.api === "checking" ? "spin" : ""} /></button></div>
          <div className="status-row"><span>RootEdu API</span><b className={"status-value " + connection.api}><i />{apiLabel}</b></div>
          <div className="status-row"><span>Database</span><b className={"status-value " + connection.database}><i />{dbLabel}</b></div>
          <div className="status-row"><span>Institution</span><b className="status-detail">{connection.bootstrap?.institution ?? "MUST pilot"}</b></div>
          <div className="status-updated">{connection.checkedAt ? "Last checked at " + connection.checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Checking the service…"}</div>
        </div>
      </section>
    </main>

    <footer className="site-footer"><div className="section-wrap footer-main">
      <div className="footer-brand-block"><Brand /><p>A more thoughtful way to experience university life.</p></div>
      <div className="footer-links"><b>EXPLORE</b><a href="#experience">The experience</a><a href="#pilot">Pilot programmes</a><a href="#about">Our approach</a></div>
      <div className="footer-links"><b>BE PART OF IT</b><a href="#feedback">Share feedback</a><a href="mailto:trialsandwins@gmail.com">Contact the team <ArrowUpRight size={13} /></a></div>
      <div className="footer-note"><span><GraduationCap size={20} /></span><p>Starting at Meru University of Science and Technology, Kenya.</p></div>
    </div><div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} Root &amp; Weights Lab. RootEdu.</span><span>Made with care, for campus life.</span></div></footer>
  </div>;
}
