import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, MessageCircle, Music2, Pause, Phone, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { siteConfig } from "./config";

type Page = "home" | "envelope" | "memories" | "game" | "questions" | "apology" | "timeline" | "choice" | "final";

const pages: Page[] = ["home", "envelope", "memories", "game", "questions", "apology", "timeline", "choice"];

const gameItems = [
  { emoji: "❤️", message: "Love wasn't perfect. But some of it was real." },
  { emoji: "🌙", message: "Some nights I still remember our conversations." },
  { emoji: "😂", message: "I still remember the ridiculous things that made us laugh." },
  { emoji: "🎧", message: "Some songs still carry memories." },
  { emoji: "✨", message: "Some moments remain special even after everything changes." },
  { emoji: "🫶", message: "Some connections teach us how to become better people." },
  { emoji: "🌸", message: "Not everything beautiful has to last forever to have mattered." }
];

function Character({ mood = "hopeful" }: { mood?: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.25}>
        <mesh position={[0, -0.8, 0]} castShadow>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshStandardMaterial color="#8e6ba8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial color="#ffd9c9" roughness={0.55} />
        </mesh>
        <mesh position={[-0.2, 0.45, 0.52]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#21152e" />
        </mesh>
        <mesh position={[0.2, 0.45, 0.52]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#21152e" />
        </mesh>
        <mesh position={[0, 0.18, 0.57]}>
          <torusGeometry args={[0.12, 0.025, 12, 24, Math.PI]} />
          <meshStandardMaterial color={mood === "peaceful" ? "#8b496f" : "#7a4f6b"} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#ffb6d5" emissive="#ff5fa2" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function CharacterScene({ mood }: { mood?: string }) {
  return (
    <div className="character-scene">
      <Canvas camera={{ position: [0, 0.2, 4.2], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.4} />
        <pointLight position={[2, 3, 4]} intensity={18} color="#ffd4e7" />
        <pointLight position={[-3, -1, 2]} intensity={8} color="#9a8cff" />
        <Stars radius={20} depth={10} count={350} factor={1.5} saturation={0} fade speed={0.4} />
        <Character mood={mood} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

function Background() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="particle" style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 100}%`, animationDelay: `${i * -0.7}s` }}>✦</span>
      ))}
    </div>
  );
}

function App() {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState<Page>("home");
  const [direction, setDirection] = useState(1);
  const [sound, setSound] = useState(false);
  const [gameCollected, setGameCollected] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const pageIndex = pages.indexOf(page);
  const progress = Math.max(0, pageIndex) / (pages.length - 1);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    if (sound) audioRef.current.play().catch(() => setSound(false));
    else audioRef.current.pause();
  }, [sound]);

  const go = (next: Page) => {
    const nextIndex = pages.indexOf(next);
    setDirection(nextIndex >= pageIndex ? 1 : -1);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    const nextPage = pages[pageIndex + 1];
    if (nextPage) go(nextPage);
  };

  const previous = () => {
    const previousPage = pages[pageIndex - 1];
    if (previousPage) go(previousPage);
  };

  const restart = () => {
    setGameCollected([]);
    setAnswers({});
    setQuestionIndex(0);
    setOpened(false);
    go("home");
  };

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

  return (
    <main className="app">
      <Background />
      <audio ref={audioRef} src={siteConfig.soundFile} preload="none" />

      <header className="topbar">
        <div className="brand">A Little Journey <span>✦</span></div>
        <div className="top-actions">
          {page !== "home" && (
            <button className="icon-btn" onClick={() => setSound(v => !v)} aria-label={sound ? "Turn sound off" : "Turn sound on"}>
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
              <span>{sound ? "Sound on" : "Sound off"}</span>
            </button>
          )}
          {page !== "home" && (
            <button className="icon-btn" onClick={restart} aria-label="Restart journey"><RotateCcw size={17} /></button>
          )}
        </div>
      </header>

      {page !== "home" && (
        <div className="progress-wrap" aria-label="Journey progress">
          <div className="progress-line"><motion.div animate={{ width: `${progress * 100}%` }} /></div>
          <div className="progress-dots">
            {pages.slice(1).map((p, i) => (
              <button key={p} onClick={() => go(p)} className={page === p ? "dot active" : pageIndex > i + 1 ? "dot passed" : "dot"} aria-label={`Go to chapter ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 70, filter: reduceMotion ? "none" : "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -70, filter: reduceMotion ? "none" : "blur(8px)" }}
          transition={transition}
          className="page"
        >
          {page === "home" && <Home onStart={() => go("envelope")} />}
          {page === "envelope" && <Envelope opened={opened} setOpened={setOpened} onNext={next} />}
          {page === "memories" && <Memories onNext={next} />}
          {page === "game" && <Game collected={gameCollected} setCollected={setGameCollected} onNext={next} />}
          {page === "questions" && <Questions index={questionIndex} setIndex={setQuestionIndex} answers={answers} setAnswers={setAnswers} onNext={next} />}
          {page === "apology" && <Apology onNext={next} />}
          {page === "timeline" && <Timeline onNext={next} />}
          {page === "choice" && <Choice onFinal={() => setPage("final")} />}
          {page === "final" && <Final onRestart={restart} />}
        </motion.div>
      </AnimatePresence>

      {page !== "home" && page !== "final" && (
        <footer className="navigation">
          <button className="nav-btn ghost" onClick={previous} disabled={pageIndex <= 1}><ArrowLeft size={17} /> Back</button>
          <span>{pageIndex + 1} / {pages.length}</span>
          <button className="nav-btn ghost" onClick={next} disabled={page === "choice"}>Continue <ArrowRight size={17} /></button>
        </footer>
      )}
    </main>
  );
}

function Home({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero page-inner">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse-dot" /> A small thing from my heart</div>
        <h1>I made something<br /><em>I couldn't say properly</em> in words.</h1>
        <p className="lead">You don't have to do anything. Just give me a few minutes, if you're comfortable.</p>
        <button className="primary-btn" onClick={onStart}>Start the little journey <ArrowRight size={18} /></button>
        <p className="soft-note">No pressure. No expectations. Just something from my heart.</p>
      </div>
      <div className="hero-character">
        <CharacterScene mood="hopeful" />
        <div className="floating-heart h1">♡</div>
        <div className="floating-heart h2">✦</div>
        <div className="floating-heart h3">♡</div>
      </div>
    </section>
  );
}

function Envelope({ opened, setOpened, onNext }: { opened: boolean; setOpened: (v: boolean) => void; onNext: () => void }) {
  return (
    <section className="center-page page-inner narrow">
      <div className="section-kicker">CHAPTER 01</div>
      <h2>Before anything else…</h2>
      <p className="subtitle">There is something I should have said sooner.</p>
      <motion.div className={`envelope ${opened ? "opened" : ""}`} animate={{ rotate: opened ? 0 : [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }}>
        <div className="envelope-back" />
        <div className="letter">
          <Heart size={20} fill="currentColor" />
          <p>I don't know if I deserve your forgiveness.<br /><br />But I know I owe you a sincere apology.</p>
        </div>
        <div className="envelope-flap" />
        <div className="envelope-front" />
      </motion.div>
      {!opened ? (
        <button className="primary-btn" onClick={() => setOpened(true)}>Open it <Heart size={17} /></button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="reveal-actions">
          <p className="soft-note">Some things deserve to be said gently.</p>
          <button className="primary-btn" onClick={onNext}>Continue <ArrowRight size={18} /></button>
        </motion.div>
      )}
    </section>
  );
}

function Memories({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section className="page-inner">
      <div className="section-heading">
        <div className="section-kicker">CHAPTER 02 · MEMORY CONSTELLATION</div>
        <h2>Some memories still glow.</h2>
        <p className="subtitle">Tap a star. Each one holds a little piece of a chapter I still remember.</p>
      </div>
      <div className="constellation">
        <div className="constellation-lines" />
        {siteConfig.memories.map((m, i) => {
          const positions = [[16, 26], [42, 16], [68, 32], [30, 66], [73, 70]];
          const [left, top] = positions[i % positions.length];
          return (
            <button key={m.title} className={`star-node ${selected === i ? "selected" : ""}`} style={{ left: `${left}%`, top: `${top}%` }} onClick={() => setSelected(i)}>
              <span>{m.emoji}</span>
              <i />
            </button>
          );
        })}
        {selected !== null && (
          <motion.div initial={{ opacity: 0, scale: .94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="memory-card glass">
            <div className="memory-emoji">{siteConfig.memories[selected].emoji}</div>
            <h3>{siteConfig.memories[selected].title}</h3>
            <p>{siteConfig.memories[selected].text}</p>
            <button className="text-btn" onClick={() => setSelected(null)}>Close</button>
          </motion.div>
        )}
      </div>
      <div className="bottom-message">
        <p>“Some memories don't disappear just because a chapter ends.”</p>
        <button className="primary-btn" onClick={onNext}>Continue <ArrowRight size={18} /></button>
      </div>
    </section>
  );
}

function Game({ collected, setCollected, onNext }: { collected: number[]; setCollected: (v: number[]) => void; onNext: () => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState(() => gameItems.map((item, i) => ({ ...item, id: i, x: 10 + ((i * 13) % 78), y: 10 + ((i * 19) % 68) })));
  const done = collected.length >= 5;

  const collect = (id: number) => {
    if (collected.includes(id)) return;
    setCollected([...collected, id]);
    setMessage(gameItems[id].message);
    setTimeout(() => setMessage(null), 2200);
  };

  return (
    <section className="page-inner">
      <div className="section-heading">
        <div className="section-kicker">CHAPTER 03 · THE LITTLE THINGS</div>
        <h2>Catch the little things.</h2>
        <p className="subtitle">Tap the memories that remind you of us. You need 5 to finish, but you can collect them all.</p>
      </div>
      <div className="game-shell glass">
        <div className="game-top"><span>{collected.length} / 7 collected</span><div className="game-progress"><div style={{ width: `${(collected.length / 7) * 100}%` }} /></div></div>
        <div className="game-field">
          {items.map(item => (
            <motion.button
              key={item.id}
              className={`game-item ${collected.includes(item.id) ? "caught" : ""}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => collect(item.id)}
              animate={collected.includes(item.id) ? { scale: 0, opacity: 0, rotate: 180 } : { y: [0, -8, 0] }}
              transition={{ y: { duration: 2 + item.id * .15, repeat: Infinity } }}
            >{item.emoji}</motion.button>
          ))}
          {message && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="game-message">{message}</motion.div>}
        </div>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="completion glass">
          <span className="completion-icon">✦</span>
          <h3>Maybe memories aren't meant to pull us backward.</h3>
          <p>Maybe they're meant to remind us what mattered.</p>
          <button className="primary-btn" onClick={onNext}>Keep going <ArrowRight size={18} /></button>
        </motion.div>
      )}
    </section>
  );
}

function Questions({ index, setIndex, answers, setAnswers, onNext }: { index: number; setIndex: (v: number) => void; answers: Record<number, string>; setAnswers: (v: Record<number, string>) => void; onNext: () => void }) {
  const q = siteConfig.questions[index];
  const isText = index === 1 || index === 2 || index === 4;
  const answer = answers[index] || "";
  const finish = index === siteConfig.questions.length - 1;

  const choose = (value: string) => setAnswers({ ...answers, [index]: value });
  const advance = () => {
    if (finish) onNext();
    else setIndex(index + 1);
  };

  return (
    <section className="center-page page-inner narrow">
      <div className="section-kicker">CHAPTER 04 · OPTIONAL QUESTIONS</div>
      <div className="question-count">{index + 1} / {siteConfig.questions.length}</div>
      <h2>Can I ask you a few things?</h2>
      <p className="subtitle">You don't have to answer anything you don't want to.</p>
      <motion.div key={index} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="question-card glass">
        <h3>{q}</h3>
        {isText ? (
          <textarea value={answer} onChange={e => choose(e.target.value)} placeholder="Only if you feel like sharing…" rows={6} />
        ) : (
          <div className="answer-grid">
            {["Yes", "Maybe", "I'm not sure", "I'd rather not answer"].map(option => (
              <button key={option} className={answer === option ? "answer active" : "answer"} onClick={() => choose(option)}>{option}</button>
            ))}
          </div>
        )}
        <div className="question-actions">
          <button className="text-btn" onClick={advance}>Skip this one →</button>
          <button className="primary-btn" onClick={advance}>{finish ? "Continue" : "Next"} <ArrowRight size={17} /></button>
        </div>
      </motion.div>
    </section>
  );
}

function Apology({ onNext }: { onNext: () => void }) {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    if (visible >= siteConfig.apology.length) return;
    const timer = setTimeout(() => setVisible(v => v + 1), 900);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <section className="apology-page page-inner">
      <div className="apology-character"><CharacterScene mood="reflective" /></div>
      <div className="apology-copy">
        <div className="section-kicker">CHAPTER 05 · MY APOLOGY</div>
        <h2>What I should have said sooner.</h2>
        <div className="letter-text">
          {siteConfig.apology.slice(0, visible).map((line, i) => <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{line}</motion.p>)}
        </div>
        {visible >= siteConfig.apology.length && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="primary-btn" onClick={onNext}>Continue <ArrowRight size={18} /></motion.button>}
      </div>
    </section>
  );
}

function Timeline({ onNext }: { onNext: () => void }) {
  const items = [
    ["Then", "I thought I understood everything."],
    ["Realization", "I started recognizing the things I should have handled differently."],
    ["Reflection", "I learned that loving someone also means listening, respecting boundaries, and taking responsibility."],
    ["Now", "I don't want to repeat the same mistakes."]
  ];
  return (
    <section className="page-inner">
      <div className="section-heading">
        <div className="section-kicker">CHAPTER 06 · WHAT I LEARNED</div>
        <h2>A year changes a person.</h2>
        <p className="subtitle">Not because time fixes everything, but because reflection can change what we do next.</p>
      </div>
      <div className="timeline">
        <div className="timeline-line" />
        {items.map(([title, text], i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} className="timeline-card glass">
            <span>0{i + 1}</span><h3>{title}</h3><p>{text}</p>
          </motion.div>
        ))}
      </div>
      <div className="center-actions"><button className="primary-btn" onClick={onNext}>One last thing <ArrowRight size={18} /></button></div>
    </section>
  );
}

function Choice({ onFinal }: { onFinal: () => void }) {
  const [declined, setDeclined] = useState(false);
  const call = () => {
    if (siteConfig.phoneNumber !== "YOUR_PHONE_NUMBER") window.location.href = `tel:${siteConfig.phoneNumber}`;
    else alert("Add your phone number in src/config.ts first.");
  };
  const message = () => {
    if (!siteConfig.whatsappUrl.includes("YOUR_PHONE_NUMBER")) window.open(siteConfig.whatsappUrl, "_blank", "noopener,noreferrer");
    else alert("Add your WhatsApp link in src/config.ts first.");
  };

  return (
    <section className="choice-page page-inner">
      <div className="choice-character"><CharacterScene mood="peaceful" /></div>
      <div className="choice-copy">
        <div className="section-kicker">CHAPTER 07 · THE CHOICE</div>
        <h2>I don't know what happens next.</h2>
        <div className="choice-text">
          <p>Maybe we talk.</p><p>Maybe we don't.</p><p>Maybe someday we're friends.</p><p>Maybe life takes us somewhere completely different.</p>
          <p>I don't want to decide that for you.</p>
          <p>I just wanted you to know how I feel.</p>
        </div>
        <h3>If you're comfortable…</h3>
        {!declined ? (
          <div className="choice-actions">
            <button className="primary-btn large" onClick={() => { onFinal(); call(); }}><Phone size={18} /> I'd like to talk ❤️</button>
            <button className="secondary-btn" onClick={() => setDeclined(true)}>Maybe another time 🌙</button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="respect-card glass">
            <span>🌙</span>
            <p>That's completely okay. Thank you for seeing this.</p>
            <button className="text-btn" onClick={() => setDeclined(false)}>Go back</button>
          </motion.div>
        )}
        <button className="message-link" onClick={message}><MessageCircle size={16} /> Message instead</button>
      </div>
    </section>
  );
}

function Final({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="final-page page-inner">
      <div className="final-stars" aria-hidden="true">✦　♡　✦　♡　✦</div>
      <div className="final-character"><CharacterScene mood="peaceful" /></div>
      <div className="final-copy">
        <div className="eyebrow"><span className="pulse-dot" /> Thank you</div>
        <h1>Whatever happens next,<br /><em>I'm grateful you stayed for a moment.</em></h1>
        <p className="lead">I would love to hear your voice, but only if you want that too.</p>
        <p className="soft-note">Call me when you're comfortable. No pressure. No expectations.</p>
        <button className="secondary-btn" onClick={onRestart}><RotateCcw size={17} /> Start over</button>
      </div>
    </section>
  );
}

export default App;