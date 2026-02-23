import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import initial from "./json/lettterLettersound.json";
import Digraphs from "./json/lettterLettersound.json";
import Blend from "./json/lettterLettersound.json";
import Long from "./json/lettterLettersound.json";
import Short from "./json/lettterLettersound.json";
import Other from "./json/lettterLettersound.json";
import SingleEnd from "./json/lettterLettersound.json";
import DoubleEnd from "./json/lettterLettersound.json";
import BlendEnd from "./json/lettterLettersound.json";
// import Priority from "../json/lettterLettersound.json";
// import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
// import opentype from 'opentype.js';
import  "./phonics.css";
import '../../index.css';
import WriteLetterTab from "./WrittingLetter";
type SingleItem = {
  id: string;
  lab: string;
  audio: string;
};
type DigraphsItems = {
  id: string;
  lab: string;
  audio: string;
};
type BlendItems = {
  lab: string;
  audio: string;
};
type LongItems = {
   id: string;
  lab: string;
  audio: string;
};
type ShortItems = {
   id: string;
  lab: string;
  audio: string;
};
type OtherItems = {
  lab: string;
  audio: string;
  id: string;
};
type SingleEndItems = {
   id: string;
  lab: string;
  audio: string;
};
type DoubleEndItems = {
   id: string;
  lab: string;
  audio: string;
};
type BlendEndItems = {
  lab: string;
  audio: string;
};

const items: SingleItem[] = initial.INITIAL_SINGLE;
const itemsDigraphsItems: DigraphsItems[] = Digraphs.INITIAL_DIGRAPHS;
const BlendItems: BlendItems[] = Blend.INITIAL_BLENDS;
const ShortItems: ShortItems[] = Short.VOWEL_SHORT;
const LongItems: LongItems[] = Long.VOWEL_LONG;
const OtherItems: OtherItems[] = Other.VOWEL_OTHER;
const SingleEndItems: SingleEndItems[] = SingleEnd.END_SINGLE;
const DoubleEndItems: DoubleEndItems[] = DoubleEnd.END_DOUBLE;
const BlendEndItems: BlendEndItems[] = BlendEnd.END_BLENDS;






function getFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Samantha","Victoria","Zira","Karen","Serena","Tessa","Allison","Aria",
    "Google UK English Female","Google US English","Microsoft Zira","Microsoft Aria","Microsoft Jenny"
  ];
  for (const name of preferred) {
    const v = voices.find(vv => (vv.name || "").includes(name));
    if (v) return v;
  }
  return voices[0] || null;
}

function speakTTS(text: string, { rate = 0.78, cancel = true }: { rate?: number; cancel?: boolean } = {}) {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve(); return; }
    if (cancel) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = 1; u.volume = 1;
    const v = getFemaleVoice(); if (v) u.voice = v;
    u.onend = () => resolve(); u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function playPhoneme(id: string,  fallbackPronunciation = id ,audioUrl?: string) {
stopAllAudio();
  if (audioUrl) {
    const sound = new Audio(audioUrl);
    activeAudios.add(sound);
    sound.play().catch(err => {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.warn("Audio playback failed, falling back to TTS", err);
        activeAudios.delete(sound);
        return speakTTS(fallbackPronunciation, { rate: 0.65, cancel: true });
      }
    });
    sound.onended = () => activeAudios.delete(sound);
    return Promise.resolve();
  }
  
  if (typeof window !== "undefined" && typeof (window as any).__PHONICS_PLAY__ === "function") {
    try { (window as any).__PHONICS_PLAY__(id); return Promise.resolve(); } catch {}
  }
  return speakTTS(fallbackPronunciation, { rate: 0.65, cancel: true });
}

function speakWord(word: string, { cancel = false }: { cancel?: boolean } = {}) {
  if (typeof window !== "undefined" && typeof (window as any).__PHONICS_PLAY__ === "function") {
    try { (window as any).__PHONICS_PLAY__(`WORD:${word}`); return Promise.resolve(); } catch {}
  }
  return speakTTS(word, { rate: 0.9, cancel });
}

const activeAudios = new Set<HTMLAudioElement>();

function stopAllAudio() {
  console.log("Stopping all audio");
  // Stop all active Audio objects
  activeAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudios.clear();
  // Cancel any ongoing TTS
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
// ---------- data (sound wall) ----------

const TOKEN_PRIORITY = [
  "igh","tch","dge",
  "ing","ar","er","ir","or","ur","ai","ay","ea","ee","ie","oa","oo","ue","oi","oy","ou","ow","au","aw",
  "ch","sh","th","ph","wh","ck","ng","nk",
  "ff","ll","ss","zz","ct","ft","lt","mp","nd","nt","pt","sk","sp","st","xt",
];

// ---------- UI primitives ----------
const Pill = ({ children, className = "",index,key }:any) => (
  <div className={`px-3 py-2 rounded-xl font-bold shadow-sm ${className}`}>{children}</div>
);


const SectionCard = ({title, children}:any) => (
  <div className="bg-slate-50 border-4 border-slate-200 rounded-2xl p-4">
    <div className="text-center text-white rounded-xl py-2 mb-3 bg-gradient-to-br from-slate-700 to-slate-800">
      <h2 className="text-xl font-extrabold">{title}</h2>
    </div>
    {children}
  </div>
);

function SoundButton({label, id, color, audio, onPick}: {label: string; id: string;  audio: string; color: string; onPick?: (label: string, id: string)=>void ;key:any}) {
  // speak without the parenthetical hint
  const speakText = (label || "").replace(/\s*\(.*?\)/g,"").trim() || label;
  return (
    <button
      onClick={() => { playPhoneme(id, speakText, audio); onPick?.(label, id); }}
      className={`min-h-[44px] text-white font-bold rounded-lg px-2 py-2 shadow-md hover:shadow-lg active:shadow transition-all text-[12px] md:text-[16px] ${color}`}
      aria-label={`sound ${label}`}
    >{label}</button>
  );
}

function SoundWall({onPick}: {onPick: (label: string, id: string)=>void}) {
  return (
    <div className='myGrid'>
      {/* Initial Sounds */}
      <SectionCard title="🌟 Initial Sounds">
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Single Letters</p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {items.map(({ lab, id, audio }) => (
            <SoundButton key={lab} label={lab} id={id}  audio={audio} onPick={onPick} color="bg-green-500 bg-gradient-to-br from-green-500 to-green-600" />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Digraphs</p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {itemsDigraphsItems.map(({lab,id,audio}) => (
            <SoundButton key={lab} label={lab} id={id} audio={audio} onPick={onPick} color="bg-sky-500 bg-gradient-to-br from-sky-500 to-sky-600" />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Blends</p>
        <div className="grid grid-cols-7 gap-2">
          {BlendItems.map(({lab,audio}) => (
            <SoundButton key={lab} label={lab} id={lab} audio={audio} onPick={onPick} color="bg-violet-500 bg-gradient-to-br from-fuchsia-500 to-violet-600" />
          ))}
        </div>
      </SectionCard>

      {/* Vowel Sounds */}
      <SectionCard title="💎 Vowel Sounds">
        <p className="text-xs font-bold text-slate-500 text-center mb-2 display_bold">Short Vowels</p>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {ShortItems.map(({lab,id ,audio}) => (
            <SoundButton key={lab} label={lab} id={id} audio={audio} onPick={onPick} color="bg-amber-500 bg-gradient-to-br from-amber-500 to-orange-600" />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Long Vowels</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {LongItems.map(({lab,id ,audio}) => (
            <SoundButton key={lab} label={lab} id={id} audio={audio} onPick={onPick} color="bg-amber-500 bg-gradient-to-br from-amber-500 to-orange-600" />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Other Sounds</p>
        <div className="grid grid-cols-4 gap-2">
          {OtherItems.map(({lab,id, audio}) => (
            <SoundButton key={lab} label={lab} id={id} audio={audio} onPick={onPick} color="bg-amber-500 bg-gradient-to-br from-amber-500 to-orange-600" />
          ))}
        </div>
      </SectionCard>

      {/* Ending Sounds (no suffixes) */}
      <SectionCard title="🏁 Ending Sounds">
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Single Letters</p>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {SingleEndItems.map(({lab,id,audio}) => (
            <SoundButton key={lab} label={lab} id={id} audio={audio} onPick={onPick} color="bg-rose-500 bg-gradient-to-br from-rose-500 to-pink-600" />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Double Letters</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {DoubleEndItems.map(({lab,id,audio}) => (
            <SoundButton key={lab} label={lab} id={id} audio={audio} onPick={onPick} color="bg-rose-500 bg-gradient-to-br from-rose-500 to-pink-600" />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">Ending Blends</p>
        <div className="grid grid-cols-6 gap-2">
          {BlendEndItems.map(({lab,audio}) => (
            <SoundButton key={lab} label={lab} id={lab} audio={audio} onPick={onPick} color="bg-rose-500 bg-gradient-to-br from-rose-500 to-pink-600" />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ---------- Blending Board ----------
type Picked = { label: string; id: string };

const BlendingBoard = ({ selection, onClear, onBlend }:any) => {
  const [display, setDisplay] = useState("");
  const [isBlending, setIsBlending] = useState(false);
  const abortControllerRef = useRef(new AbortController());

  useEffect(() => {
    setDisplay("");
    // Reset AbortController when selection changes
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current.abort();
    };
  }, [selection]);

  const handleBlend = async () => {
    if (isBlending) return;
    setIsBlending(true);
    try {
      await onBlend(setDisplay, selection.filter((s:any): s is Picked => s !== null), abortControllerRef.current.signal);
    } finally {
      setIsBlending(false);
    }
  };

  const handleClear = () => {
    stopAllAudio(); // Stop all audio
    abortControllerRef.current.abort(); // Abort ongoing blending
    abortControllerRef.current = new AbortController(); // Create new controller
    setIsBlending(false); // Re-enable tick button
    setDisplay(""); // Clear display
    onClear(); // Clear selection
  };

  return (
    <div className="bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-orange-400 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-center gap-3 bg-white rounded-xl p-4 shadow-inner">
        {[0, 1, 2].map((i) => (
          <Pill
            key={i}
            index={i}
            className={`min-w-[52px] text-center ${
              selection[i] ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
            }`}
          >
            {selection[i]?.label ?? "?"}
          </Pill>
        ))}
        <span className="text-2xl font-extrabold text-slate-700">=</span>
        <button
          className={`w-12 h-12 rounded-full text-white text-2xl shadow-lg ${
            isBlending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={handleBlend}
          title="Blend (play sounds then whole word)"
          disabled={isBlending}
        >
          ✓
        </button>
        <button
          className="ml-2 px-3 py-2 rounded-lg bg-red-500 text-white font-bold shadow"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
      <p className="text-center mt-3 font-bold text-slate-700 min-h-[1.5rem]">
        {display}
      </p>
      <p className="text-center text-sm text-slate-600">
        Tip: pick 2–3 sounds from the Sound Wall, then tap ✓
      </p>
    </div>
  );
};

// ---------- Make the Word (category + listen + tiles) ----------
const CATEGORY_OPTIONS = [
  "satpin","chekr","mdgo","flbqu","jzw","vyx",
  "short vowels","long vowels",
  "s, sh, z","c, ch, ck","CVCC","CVCe",
  " -ack, -at, -an, -ap, -ast, -and",
  "-et, -en, -em, -end, -est, -eck",
  "-on, -ot, -op, -ond, -ock",
  "-ist, -it, -ing, -ip, -ick",
] as const;

const CATEGORY_WORDS: Record<string, string[]> = {
  "satpin": ["sat","pin","nap","is", "tip", "sit","pan","tan", "tap", "pat","sip", "as","sin","in",],
  "chekr": ["cat","rat", "kit", "kin", "can","cap","pet","hen","hat","rip","hit","hip","her",],
  "mdgo": ["mop","dog","dig","mat","map","man","men","cog","tom","tim","got","dot","log","rod"],
  "flbqu": ["fat","fib","fin","fit","fab","bat","bit","bot","bin","ban","queen","lab","lip","lit","let","fan","fun","leg","log","bun","bug","quip","quit","lug","lag","lap"],
  "jzw": ["jot","jab","jam","zip","zen","win","wit","jet","jug","zap","zig","wag","wet","web"],
  "vyx": ["van","yen","yak","vet","vex","yam","yet","yes","box","fox","mix","six"],
  "short vowels": ["cat","cot","men","lip","bug","bed","wet","set","rat","bat","pan","fan","net","men","mop","mob","pig","dog","fog","hop","cup","fig","fit","nib","pin","lip","rib","sit","sun","bun","bus","tub","rub"],
  "long vowels": ["lake","like","road","mute","leaf","cake","bike","home","cube","kite","rope","plane","goat","seed","rain","road","seed","seep","weep","been","bean","lean","teen","tube","mule","soap","hope","hole","poke","fate","fake","rake","rail","sail","pray","bay","beak"],
  "s, sh, z": ["ship","soap","zip","bus","buzz","sip","sun","sock","shop","shell","zap","zoo","fuzz","fizz","shine"],
  "c, ch, ck": ["can","city","chuck","duck","cat","cap","cup","chip","chin","chat","rock","sock","pack","luck","city","cent"],
  "CVCC": ["sand","bend","kind","milk","hand","lamp","tent","jump","gift","pond","bank","bind","find","land","nest","rapt","pant","raft","Sank","ramp","sink","pink","wink","mask","grasp","past","next","ring","text"],
  "CVCe": ["make","take","like","bike","duke","cake","kite","note","bone","cube","tube","rope","hope","lake","bake","shake","wake"],
  " -ack, -at, -an, -ap, -ast, -and": ["sack","sat","man","map","last","band","back","pack","cat","flat","pan","cap","fast","hand"],
  "-et, -en, -em, -end, -est, -eck": ["bet","men","hem","send","pest","check","pet","net","hen","pen","gem","stem","best","rest","neck","peck"],
  "-on, -ot, -op, -ond, -ock": ["ton","tot","pop","pond","lock","son","ton","hot","pot","rot","hop","top","fond","rock","sock"],
  "-ist, -it, -ing, -ip, -ick": ["mist","lit","ring","sip","sick","list","sit","hit","sing","lip","pick","kick"],
};
// Helper function to get audio URL for a phoneme
function getAudioUrlForPhoneme(phonemeId: string): string | undefined {
  // Check all the sound arrays for this phoneme ID
  const allSounds = [
    ...initial.INITIAL_SINGLE,
    ...initial.INITIAL_DIGRAPHS,
    ...initial.VOWEL_SHORT,
    ...initial.VOWEL_LONG,
    ...initial.VOWEL_OTHER,
    ...initial.END_SINGLE,
    ...initial.END_DOUBLE
  ];
  
  // Check sounds with id property first
  const soundWithId = allSounds.find(s => 'id' in s && s.id === phonemeId);
  if (soundWithId) return soundWithId.audio;
  
  // Check BlendItems (no id property, use lab instead)
  const blendSound = initial.INITIAL_BLENDS.find(s => s.lab === phonemeId);
  if (blendSound) return blendSound.audio;
  
  // Check BlendEndItems (no id property, use lab instead)
  const blendEndSound = initial.END_BLENDS.find(s => s.lab === phonemeId);
  if (blendEndSound) return blendEndSound.audio;
  
  return undefined;
}

const MakeTheWord = ({ tiles, onClear }:any) => {
  const [category, setCategory] = useState("satpin");
  const [result, setResult] = useState("");
  const [isBlending, setIsBlending] = useState(false); // Track blending state
  const abortControllerRef = useRef(new AbortController()); // Track abort signal
  const [gettingPrevword,setGettingprevword]=useState('')
  useEffect(() => {
    setResult("");
  }, [tiles]);

  useEffect(() => {
    // Cleanup: Create a new AbortController when component mounts or tiles change
    abortControllerRef.current = new AbortController();
    return () => {
      abortControllerRef.current.abort(); // Abort on unmount
    };
  }, [tiles]);

  async function onListen(): Promise<void> {
    const list = CATEGORY_WORDS[category] || [];
    if (!list.length) return;
    const word = list[Math.floor(Math.random() * list.length)];
    setGettingprevword(word)
    console.log(word,"wordssss")
    await speakTTS(word, { rate: 0.9, cancel: true });
  }
async function onPrev(): Promise<void> {
 await speakTTS(gettingPrevword, { rate: 0.9, cancel: true });
}
  async function onBlendClick(): Promise<void> {
    if (isBlending) return; // Prevent clicks during blending
    if (tiles.length < 2) {
      setResult("Pick at least 2 sounds");
      return;
    }
    setIsBlending(true); // Disable button
    stopAllAudio(); // Clear any ongoing audio
    try {
      const word = buildSpellingFromSounds(tiles);

      // Play phonemes sequentially with a delay
      for (const s of tiles) {
        // Check if aborted
        if (abortControllerRef.current.signal.aborted) {
          throw new Error("Blending aborted");
        }

        await new Promise<void>((resolve, reject) => {
          // Register abort listener
          const abortHandler = () => {
            stopAllAudio();
            reject(new Error("Blending aborted"));
          };
          abortControllerRef.current.signal.addEventListener("abort", abortHandler);

          const audioUrl = getAudioUrlForPhoneme(s.id);
          const speakText = (s.label || "").replace(/\s*\(.*?\)/g, "").trim() || s.label;
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            activeAudios.add(audio); // Track the audio
            audio.onended = () => {
              activeAudios.delete(audio);
              setTimeout(resolve, 600); // 600ms delay after each phoneme
            };
            audio.onerror = () => {
              activeAudios.delete(audio);
              console.warn("Audio playback failed, falling back to TTS");
              speakTTS(speakText, { rate: 0.65, cancel: true })
                .then(() => setTimeout(resolve, 600))
                .catch(reject)
                .finally(() => abortControllerRef.current.signal.removeEventListener("abort", abortHandler));
            };
            audio.play().catch((err) => {
              activeAudios.delete(audio);
              if (!(err instanceof DOMException && err.name === 'AbortError')) {
                console.warn("Audio playback failed, falling back to TTS", err);
                speakTTS(speakText, { rate: 0.65, cancel: true })
                  .then(() => setTimeout(resolve, 600))
                  .catch(reject)
                  .finally(() => abortControllerRef.current.signal.removeEventListener("abort", abortHandler));
              } else {
                reject(err);
              }
            });
          } else {
            speakTTS(speakText, { rate: 0.65, cancel: true })
              .then(() => setTimeout(resolve, 600))
              .catch(reject)
              .finally(() => abortControllerRef.current.signal.removeEventListener("abort", abortHandler));
          }
        });
      }

      // Check if aborted before playing the final word
      if (abortControllerRef.current.signal.aborted) {
        throw new Error("Blending aborted");
      }

      // Wait briefly before playing the word
      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      // Play the final word
      await speakWord(word);
      // setResult(word);
    } catch (err:any) {
      if (err.message !== "Blending aborted") {
        console.error("Error during blending:", err);
        setResult("Error during playback");
      }
    } finally {
      setIsBlending(false); // Re-enable button
    }
  }

  const handleClear = () => {
    stopAllAudio(); // Stop all audio
    abortControllerRef.current.abort(); // Abort ongoing blending
    abortControllerRef.current = new AbortController(); // Create new controller
    setIsBlending(false); // Re-enable tick button
    setResult(""); // Clear result
    onClear(); // Clear tiles
  };

  return (
    <div className="bg-white/80 rounded-2xl border-4 border-indigo-200 p-5">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className="text-sm font-bold text-slate-600">Choose set</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button
          onClick={onListen}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold shadow"
        >
          🔊 Listen
        </button>
        {
        gettingPrevword &&(
           <button
          onClick={onPrev}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold shadow"
        >
          Play again
        </button>
        )
      }
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {tiles.length === 0 && (
            <span className="text-slate-400 text-sm">
              Pick sounds on the Sound Wall…
            </span>
          )}
          {tiles.map((t:any, idx:any) => (
            <Pill key={idx} index={idx} className="bg-blue-500 text-white text-lg">
              {t.label}
            </Pill>
          ))}
        </div>

        <button
          onClick={onBlendClick}
          title="Blend sounds and read the word"
          className={`w-10 h-10 rounded-full text-white text-xl font-black shadow ${
            isBlending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={isBlending}
        >
          ✓
        </button>
        <button
          onClick={handleClear}
          className="ml-1 px-3 py-2 rounded-md bg-red-500 text-white text-xs font-bold"
        >
          Clear
        </button>
      </div>
      {result && (
        <div className="mt-2 text-slate-700">
          {/* <span className="font-semibold">Spelling:</span>{" "} */}
          <span className="font-bold">{result}</span>
        </div>
      )}
    </div>
  );
};
// ---------- Spelling from sounds (phoneme -> grapheme heuristics) ----------
function normalizeId(id: string){ return (id||"").toLowerCase(); }
function mapTokenToGrapheme(tokenId: string, tokenLabel: string) {
  const id = normalizeId(tokenId);
  const baseMap: Record<string,{piece: string; needsFinalE?: boolean}> = {
    ar:{piece:"ar"}, er:{piece:"er"}, ir:{piece:"ir"}, ur:{piece:"ur"},
    "ea-break":{piece:"ea"}, oa:{piece:"oa"}, "o-long":{piece:"o"}, ue:{piece:"ue"},
    ai:{piece:"ai"}, ay:{piece:"ay"}, oi:{piece:"oi"}, ou:{piece:"ou"}, "ow-ow":{piece:"ow"}, oy:{piece:"oy"},
    "ea-long":{piece:"ea"}, aw:{piece:"aw"}, au:{piece:"au"}, igh:{piece:"igh"}, "y-long-i":{piece:"y"},
    "oo-foot":{piece:"oo"}, "oo-goose":{piece:"oo"},
  };
  if (id in baseMap) return {piece: baseMap[id].piece, flags:{needsFinalE: !!baseMap[id].needsFinalE}};
  if (id.startsWith("short-")) return {piece: id.split("-")[1], flags:{}};
  if (id.startsWith("long-"))  return {piece: id.split("-")[1], flags:{needsFinalE:true}};
  const piece = (tokenLabel||"").replace(/\s*\(.*?\)/g,"").trim();
  return {piece, flags:{}};
}

function buildSpellingFromSounds(sounds: Picked[]) {
  if (!sounds || sounds.length===0) return "";
  const ids    = sounds.map(s=>normalizeId(s.id));
  const labels = sounds.map(s=>s.label);

  // Special: w + er -> were/where
  if (ids.length===2 && ids[0]==="w" && ids[1]==="er") {
    return Math.random() < 0.5 ? "were" : "where";
  }
  // Special: w + short-o + s -> was
  if (ids.length===3 && ids[0]==="w" && ids[1]==="short-o" && ids[2]==="s") {
    return "was";
  }
  // Special: s + short-o + lt -> salt
  if (ids.length===3 && labels[0]==="s" && ids[1]==="short-o" && (ids[2]==="lt" || labels[2]==="lt")) {
    return "salt";
  }
  // Special: s + au + lt -> salt
  if (ids.length===3 && labels[0]==="s" && ids[1]==="au" && (ids[2]==="lt" || labels[2]==="lt")) {
    return "salt";
  }

  let out: string[] = [];
  let needsFinalE = false;
  const cvccEndings = ["nd", "nt", "lt", "mp", "st", "sp", "sk", "ft", "lk", "pt"];
  for (let i=0; i<sounds.length; i++) {
    const id  = ids[i];
    const lab = labels[i];

    // Merge rule: au + lt → "alt"
    if (id==="au" && (ids[i+1]==="lt" || labels[i+1]==="lt")) { out.push("alt"); i++; continue; }

    const {piece, flags} = mapTokenToGrapheme(id, lab);
    if ((flags as any).needsFinalE) needsFinalE = true;
    out.push(piece);
  }

  let word = out.join("");
  // CVCe heuristic for long vowels
  // if (needsFinalE && sounds.length>=3 && !word.endsWith("e")) word += "e"
  if (needsFinalE && sounds.length>=3 && !word.endsWith("e")){
      const lastTwoSounds = sounds.slice(-2).map(s => normalizeId(s.id));
      const lastSound = lastTwoSounds[1];
      // const isCVCC = sounds.length === 4 && cvccEndings.includes(lastSound);
      const isCVCC = sounds.length >0 && cvccEndings.includes(lastSound);

      if (!isCVCC) {
        console.log('adding e',"isCVCC",isCVCC,lastSound)
      word += "e";
    } else {
      console.log(`Skipping final 'e' for CVCC word: ${word}`);
    }
  }  
  return word;
}
// ---------- Decoding ----------
// Update the tokenizeWord function to properly handle "ng" and other digraphs
function tokenizeWord(word: string) {
  // Priority tokens to look for first (including ng)
  const priorityTokens = ["ng", "nk", "ch", "sh", "th", "ph", "wh", "ck", ...TOKEN_PRIORITY];
  const tokens: string[] = [];
  let i = 0;
  const clean = word.toLowerCase();
  
  while (i < clean.length) {
    let found = false;
    
    // Check for multi-character tokens first
    for (const token of priorityTokens) {
      if (clean.startsWith(token, i)) {
        tokens.push(token);
        i += token.length;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // If no multi-character token found, take a single character
      tokens.push(clean[i]);
      i += 1;
    }
  }
  
  return tokens;
}
// ---------- Dot component ----------
const Dot = ({x,y,key}:any) => (
  <div style={{left:x, top:y}} className="absolute w-[5px] h-[5px] bg-black rounded-full" />
);
interface Dot {
  x: number;
  y: number;
}
function SentenceDecoder({ input, onTokenClick, onWordClick }: {
  input: string;
  onTokenClick: (token: string) => void;
  onWordClick: (word: string) => void;
}) {
  const containerRef = useRef(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const words = useMemo(() => input.trim().split(/\s+/).filter(Boolean), [input]);

  // List of words that use letter-by-letter spelling
  const letterSpellingWords = useMemo(() => new Set([
    "the", "a", "some", "many",
    "i", "you", "he", "she", "we", "they", "me",
    "are", "was", "were", "be", "do", "have",
    "to", "from",
    "here", "there", "where",
    "gone", "tear", "near", "wear", "none", "hear", "bear", "clear", "move", "love",
    "head", "dead", "bread", "some", "come", "thread", "honest", "climb", "lamb",
    "comb", "walk", "talk", "know",
    "hour", "four", "when"
  ]), []);

  const vowels = ['a', 'e', 'i', 'o', 'u'];

  // Create a mapping from tokens to their sound URLs
  const tokenToSoundMap = useMemo(() => {
    const map: Record<string, string> = {};

    initial.INITIAL_SINGLE.forEach(item => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
      map[item.lab.toUpperCase()] = item.audio;
    });

    initial.INITIAL_DIGRAPHS.forEach(item => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_SHORT.forEach(item => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_LONG.forEach(item => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_OTHER.forEach(item => {
      map[item.id] = item.audio;
      const grapheme = item.lab.split(' ')[0].toLowerCase();
      map[grapheme] = item.audio;
    });

    initial.END_SINGLE.forEach(item => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.END_DOUBLE.forEach(item => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.END_BLENDS.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    map["ng"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ng.mp3";

    // Override with explicit short/long vowel mappings
    map["a"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_a.mp3"; // /æ/
    map["e"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_e.mp3"; // /ɛ/
    map["i"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_i.mp3"; // /ɪ/
    map["o"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_o.mp3"; // /ɒ/
    map["u"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_u.mp3"; // /ʌ/

    map["A"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_a_ah.mp3"; // /ɑː/
    map["E"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_e.mp3"; // /iː/
    map["I"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/diphthong_ai.mp3"; // /aɪ/
    map["O"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_o.mp3"; // /oʊ/
    map["U"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_u.mp3"; // /uː/

    map["ea"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_e.mp3"; // /iː/

    console.log('tokenToSoundMap for "a":', map["a"]);
    console.log('tokenToSoundMap for "A":', map["A"]);

    return map;
  }, []);

  // Function to determine vowel sound based on number of vowels
  const getVowelSound = (word: string, token: string, tokenIndex: number, tokens: string[]) => {
    const cleanWord = word.toLowerCase();
    const cleanToken = token.toLowerCase();

    const iDiphthongWords = new Set(['find', 'mind', 'kind', 'bind', 'grind']);

    if (tokenIndex < tokens.length - 1) {
      const digraph = cleanToken + tokens[tokenIndex + 1].toLowerCase();
      if (['ea', 'ai', 'ay', 'ee', 'ie', 'oa', 'oo', 'ue', 'oi', 'oy', 'au', 'aw'].includes(digraph)) {
        console.log(`Digraph detected: ${digraph} in ${word}`);
        return tokenToSoundMap[digraph] || tokenToSoundMap[cleanToken];
      }
    }

    if (!vowels.includes(cleanToken)) {
      return tokenToSoundMap[cleanToken] || tokenToSoundMap[token];
    }

    if (cleanToken === 'i' && iDiphthongWords.has(cleanWord)) {
      console.log(`Exception: long /aɪ/ for 'i' in ${word}`);
      return tokenToSoundMap['I']; // /aɪ/
    }

    const vowelCount = cleanWord.split('').filter(char => vowels.includes(char) || (char === 'y' && cleanToken === 'y')).length;

    console.log(`Word: ${word}, Token: ${cleanToken}, Vowel count: ${vowelCount}`);

    if (vowelCount === 1) {
      console.log(`Short vowel for ${cleanToken} in ${word}`);
      return tokenToSoundMap[cleanToken]; // Short vowel sound
    } else if (vowelCount >= 2) {
      console.log(`Long vowel for ${cleanToken} in ${word}`);
      return tokenToSoundMap[cleanToken.toUpperCase()]; // Long vowel sound
    }

    return tokenToSoundMap[cleanToken] || tokenToSoundMap[token];
  };

//   async function playWithGap(url: string | null, fallbackText: string, minGapMs = 80) {
//   if (!url) {
//     await speakTTS(fallbackText, { rate: 0.65 });
//     await new Promise(r => setTimeout(r, minGapMs));
//     return;
//   }

//   return new Promise<void>((resolve, reject) => {
//     const audio = new Audio(url);
//     activeAudios.add(audio);

//     let ended = false;

//     const finish = () => {
//       if (ended) return;
//       ended = true;
//       activeAudios.delete(audio);
//       setTimeout(resolve, minGapMs);
//     };

//     audio.onended = finish;
//     audio.onerror = () => {
//       activeAudios.delete(audio);
//       speakTTS(fallbackText, { rate: 0.65 }).then(finish).catch(reject);
//     };

//     audio.play()
//       .then(() => {
//         // If very short sound (< ~60ms) force minimum gap
//         setTimeout(finish, 400); // safety fallback
//       })
//       .catch(err => {
//         activeAudios.delete(audio);
//         if (err.name !== 'AbortError') {
//           speakTTS(fallbackText, { rate: 0.65 }).then(finish).catch(reject);
//         } else {
//           reject(err);
//         }
//       });
//   });
// }
  // Function to play sound for a token, returning a Promise that resolves when playback completes
async function playOneSound(url: string | null, fallbackText: string) {
  // If no URL → just speak
  if (!url) {
    await speakTTS(fallbackText, { rate: 0.65 });
    return;
  }

  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    activeAudios.add(audio);

    const MIN_DURATION_MS = 140;           // force at least this much time per sound
    const GAP_AFTER_MS    = 80;           // breathing room after sound ends

    let hasEnded = false;

    const complete = () => {
      if (hasEnded) return;
      hasEnded = true;
      activeAudios.delete(audio);
      setTimeout(resolve, GAP_AFTER_MS);
    };

    audio.onended = complete;

    audio.onerror = () => {
      activeAudios.delete(audio);
      speakTTS(fallbackText, { rate: 0.65 }).then(complete).catch(reject);
    };

    audio.play()
      .then(() => {
        // Safety: even if sound is very short, give minimum time
        setTimeout(complete, MIN_DURATION_MS);
      })
      .catch(err => {
        activeAudios.delete(audio);
        if (err.name !== 'AbortError') {
          speakTTS(fallbackText, { rate: 0.65 }).then(complete).catch(reject);
        } else {
          reject(err);
        }
      });
  });
}
  const playTokenSound = async (token: string, word: string, tokenIndex: number, tokens: string[]) => {
    const cleanToken = token.toLowerCase();
    const cleanWord = word.toLowerCase();

    // Skip silent 'e' at the end of words with two or more vowels
    if (cleanToken === 'e' && cleanWord.endsWith('e') && tokenIndex === tokens.length - 1) {
      const vowelCount = cleanWord.split('').filter(char => vowels.includes(char)).length;
      if (vowelCount >= 2) {
        console.log(`Skipping silent 'e' in ${word}`);
        return Promise.resolve(); // Silent 'e'
      }
    }

    let soundUrl = getVowelSound(word, token, tokenIndex, tokens);

    // Special handling for "ng"
    if (cleanToken === "ng" && !soundUrl) {
      soundUrl = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ng.mp3";
    }

    console.log(`Playing token '${token}' in '${word}': URL = ${soundUrl}`);
   await new Promise(resolve => setTimeout(resolve, 90));
    return new Promise<void>((resolve, reject) => {
      if (soundUrl) {
        try {
          const audio = new Audio(soundUrl);
          activeAudios.add(audio);
          audio.onended = () => {
            activeAudios.delete(audio);
            console.log(`Completed playback for token '${token}'`);
            resolve();
          };
          audio.onerror = () => {
            activeAudios.delete(audio);
            console.warn(`Could not play sound for ${token} in word ${word}`);
            speakTTS(token, { rate: 0.65 }).then(resolve).catch(reject);
          };
          audio.play().catch(err => {
            activeAudios.delete(audio);
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
              console.warn(`Audio playback failed for ${token}, falling back to TTS`, err);
              speakTTS(token, { rate: 0.65 }).then(resolve).catch(reject);
            } else {
              reject(err);
            }
          });
        } catch (err) {
          if (!(err instanceof DOMException && err.name === 'AbortError')) {
            console.warn(`Could not play sound for ${token}`, err);
            speakTTS(token, { rate: 0.65 }).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        }
      } else {
        speakTTS(token, { rate: 0.65 }).then(resolve).catch(reject);
      }
    });
  };
  

  // Cleanup audio
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [input]);

  // Update dots for token positions
  useEffect(() => {
    const c = containerRef.current as HTMLElement | null;
    if (!c) return;
    const tokenEls = c.querySelectorAll('[data-token]');
    const lineEl = c.querySelector('[data-arrow]');
    const baseRect = c.getBoundingClientRect();
    const lineRect = lineEl?.getBoundingClientRect();
    const y = lineRect ? (lineRect.bottom - baseRect.top + 6) : 60;
    const ds: { x: number; y: number }[] = [];
    tokenEls.forEach((el:any) => {
      const r = el.getBoundingClientRect();
      const cx = r.left - baseRect.left + r.width / 2;
      ds.push({ x: cx - 6, y });
    });
    setDots(ds);
  }, [input]);

  async function playWordSequence(wordEl: HTMLElement | null) {
    if (!wordEl) return;
    setIsPlaying(true);
    const wordText = wordEl.textContent || "";
    const isLetterSpellingWord = letterSpellingWords.has(wordText.toLowerCase());
    stopAllAudio();
    window.speechSynthesis?.cancel();
      // if (typeof window !== "undefined" && "speechSynthesis" in window) {
      //   window.speechSynthesis.cancel();
      // }

    try {
      if (isLetterSpellingWord) {
        const letters = wordText.split('');
        const tokenEls = Array.from(wordEl.querySelectorAll<HTMLElement>('[data-token]'));
        for (let i = 0; i < letters.length; i++) {
          if (tokenEls[i]) tokenEls[i].classList.add("bg-yellow-200");
          await speakTTS(letters[i], { rate: 0.8 });
          if (tokenEls[i]) tokenEls[i].classList.remove("bg-yellow-200");
        }
      }
       else {
        const tokenEls = Array.from(wordEl.querySelectorAll<HTMLElement>('[data-token]'));
        const tokens = tokenEls.map(el => el.textContent || "");
             for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        tokenEls[i].classList.add("bg-yellow-200");

        // ─── Get correct sound URL ─────────────────────────────────
        let soundUrl = getVowelSound(wordText, token, i, tokens);

        if (token.toLowerCase() === "ng" && !soundUrl) {
          soundUrl = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ng.mp3";
        }

        // ─── Skip silent final e ───────────────────────────────────
        const cleanToken = token.toLowerCase();
        const cleanWord = wordText.toLowerCase();
        if (
          cleanToken === 'e' &&
          cleanWord.endsWith('e') &&
          i === tokens.length - 1
        ) {
          const vowelCount = cleanWord.split('').filter(c => 'aeiou'.includes(c)).length;
          if (vowelCount >= 2) {
            console.log(`Silent e skipped in ${wordText}`);
            tokenEls[i].classList.remove("bg-yellow-200");
            continue;
          }
        }

        // ─── Play with proper gap logic ─────────────────────────────
        await playOneSound(soundUrl, token);

        tokenEls[i].classList.remove("bg-yellow-200");

        // Small breath / separation between phonemes (most important!)
        await new Promise(r => setTimeout(r, 100));   // ← 80–140 ms, tune this
      }
      }

      await onWordClick(wordText);
    } catch (err) {
      console.error(`Error playing word sequence for '${wordText}':`, err);
    } finally {
      setIsPlaying(false);
    }
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div className="text-[20px] lowercase tracking-[1px] leading-tight font-bold text-black">
        {words.map((w:any, i:any) => {
          const isLetterSpellingWord = letterSpellingWords.has(w.toLowerCase());
          return (
            <span
              key={i}
              className={`inline-flex items-end mr-3 cursor-pointer ${isPlaying ? 'pointer-events-none cursor-not-allowed' : ''}`}
              data-word
              onClick={(e) => {
                if (isPlaying) return;
                playWordSequence(e.currentTarget as HTMLElement);
              }}
            >
              {isLetterSpellingWord ? (
                w.split('').map((letter:any, j:any) => (
                  <span
                    key={j}
                    data-token
                    className="inline-block px-0.5 py-0.5 transition bg-transparent hover:bg-yellow-200 rounded"
                    onClick={() => onTokenClick(letter)}
                  >
                    {letter}
                  </span>
                ))
              ) : (
                tokenizeWord(w).map((t, j) => (
                  <span
                    key={j}
                    data-token
                    className="inline-block px-0.5 py-0.5 transition bg-transparent hover:bg-yellow-200 rounded"
                    onClick={() => onTokenClick(t)}
                  >
                    {t}
                  </span>
                ))
              )}
            </span>
          );
        })}
      </div>
      <div data-arrow className="mt-1 border-b-4 border-black relative">
        <span className="absolute -right-1 -top-[6px] w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-black" />
      </div>
      {dots.map((d:any, idx:any) => <Dot key={idx} x={d.x} y={d.y} />)}
    </div>
  );
}

// Decoding Component
function Decoding() {
  const [text, setText] = useState("");
  const [show, setShow] = useState("");
  const [warning, setWarning] = useState("");
  const maxLength = 50;

  const graphemeToSoundMap = useMemo(() => {
    const map: Record<string, string> = {};
    
    initial.INITIAL_SINGLE.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });
    
    initial.INITIAL_DIGRAPHS.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });
    
    initial.VOWEL_SHORT.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });
    
    initial.VOWEL_LONG.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });
    
    initial.VOWEL_OTHER.forEach(item => {
      const grapheme = item.lab.split(' ')[0].toLowerCase();
      map[grapheme] = item.audio;
    });
    
    initial.END_SINGLE.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });
    
    initial.END_DOUBLE.forEach(item => {
      map[item.lab.toLowerCase()] = item.audio;
    });
    
    map["a"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_a.mp3";
    map["e"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_e.mp3";
    map["i"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_i.mp3";
    map["o"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_o.mp3";
    map["u"] = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_u.mp3";
    
    return map;
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const playTokenSoundWrapper = async (token: string) => {
    const soundUrl = graphemeToSoundMap[token.toLowerCase()];
    if (soundUrl) {
      try {
        const audio = new Audio(soundUrl);
        activeAudios.add(audio);
        audio.onended = () => activeAudios.delete(audio);
        audio.onerror = () => activeAudios.delete(audio);
        await audio.play();
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.warn(`Could not play sound for ${token}`, err);
          await speakTTS(token, { rate: 0.65 });
        }
      }
    } else {
      await speakTTS(token, { rate: 0.65 });
    }
  };

  const handleInputChange = (e:any) => {
    const input = e.target.value;
    if (input.length <= maxLength) {
      setText(input);
      setWarning("");
      console.log("hello");
    } else {
      setWarning("Input exceeds 50 characters. Please shorten your text.");
      console.log("bad");
    }
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-teal-300 p-5 relative">
      <form onSubmit={(e) => { e.preventDefault(); if (text.length <= maxLength) setShow(text); }} className="flex gap-2 mb-4">
        <input 
          value={text} 
          onChange={handleInputChange}
          placeholder="Type a word or short sentence and press Enter"
          className="mt-[1.5rem] flex-1 px-3 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-lg"
          maxLength={maxLength + 1}
        />
        <button 
          className="px-4 py-2 rounded-lg bg-teal-500 text-white font-bold absolute top-0 right-0"
          disabled={text.length > maxLength}
        >
          Show
        </button>
      </form>
      {warning && (
        <p className="text-red-500 text-sm mb-2">{warning}</p>
      )}
      {show && text.length <= maxLength && (
        <div className="bg-slate-50 rounded-xl p-4 overflow-auto">
          <SentenceDecoder 
            input={show} 
            onTokenClick={playTokenSoundWrapper}
            onWordClick={speakWord}
          />
        </div>
      )}
    </div>
  );
}

const TOOLS = ["Blending Board", "Make the Word", "Decoding", "Write the Letter"] as const;
declare global {
  interface Window {
    submitTimeSpent: (formData: FormData) => void;
    lastSentTimes: Record<string, number>;
  }
}
interface TimeSpentData {
  [key: string]: number;
}
interface PickItem {
  label: string;
  id: number | string;
}
type ToolType = "Blending Board" | "Make the Word" | "Decoding" | "Write the Letter";
interface Window {
  handlePhonicsBackButton: () => void;
  submitTimeSpent?: (formData: FormData) => void;
  lastSentTimes?: Record<string, number>;
  __PHONICS_PLAY__?: (id: string) => void; // Include if needed for other parts of your code
}
export default function PhonicsIsFunApp() {
  const [active, setActive] = useState <ToolType | null>(null);
  const [blendSel, setBlendSel] = useState<PickItem[]> ([]);
  const [makeA, setMakeA] = useState<PickItem[]> ([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hideSoundWallHeader, setHideSoundWallHeader] = useState(false);
  const menuIconRef = useRef (null);
  function handlePick(label: string, id: number | string) {
    if (active === "Blending Board") {
      setBlendSel((prev:any) => prev.length >= 3 ? prev : [...prev, {label, id}]);
    } else if (active === "Make the Word") {
      setMakeA((prev:any) => [...prev, { label, id }]);
    }
  }
  const [timeSpent, setTimeSpent] = useState ({});
  const [currentToolStartTime, setCurrentToolStartTime] = useState <number | null>(null);
  const [previousTool, setPreviousTool] = useState<ToolType | null> (null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const sendTimeSpentData = useCallback((toolName: string, seconds: number) => {
    const now = Date.now();
    const lastSent = window.lastSentTimes?.[toolName] || 0;
    if (now - lastSent < 1000) {
      console.log(`Skipped duplicate send for ${toolName}: ${seconds}s`);
      return;
    }
    window.lastSentTimes = { ...window.lastSentTimes, [toolName]: now };

    const formData = new FormData();
    formData.append('tool', toolName);
    formData.append('time_spent', seconds.toString());
    console.log(`Sending data for ${toolName}: ${seconds}s at ${new Date().toISOString()}`);
    if (typeof window.submitTimeSpent === 'function') {
      window.submitTimeSpent(formData);
    } else {
      console.log('Time spent:', { tool: toolName, time_spent: seconds });
    }
  }, []);

useEffect(() => {
    (window as any).lastSentTimes = (window as any).lastSentTimes || {};
    return () => {
      delete (window as any).lastSentTimes;
    };
  }, []);

  useEffect(() => {
    if (active && active !== previousTool) {
      const now = Date.now();
      if (!currentToolStartTime) {
        setCurrentToolStartTime(now);
      } else {
        const toolToTrack = previousTool || (!previousTool && !isInitialLoad ? 'home' : null);
        if (toolToTrack) {
          const timeSpent = Math.round((now - currentToolStartTime) / 1000);
          if (timeSpent > 0) {
            sendTimeSpentData(toolToTrack, timeSpent);
            setTimeSpent((prev:any) => ({
              ...prev,
              [toolToTrack]: (prev[toolToTrack] || 0) + timeSpent
            }));
          }
        }
      }
      setCurrentToolStartTime(now);
      setPreviousTool(active);
      setIsInitialLoad(false);
    }
  }, [active, previousTool, sendTimeSpentData, isInitialLoad, currentToolStartTime]);

  useEffect(() => {
    return () => {
      const now = Date.now();
      const toolToTrack = previousTool || (isInitialLoad ? 'home' : null);
      if (toolToTrack && currentToolStartTime) {
        const timeSpentOnCurrent = Math.round((now - currentToolStartTime) / 1000);
        if (timeSpentOnCurrent > 0) {
          sendTimeSpentData(toolToTrack, timeSpentOnCurrent);
          setTimeSpent((prev:any) => ({
            ...prev,
            [toolToTrack]: (prev[toolToTrack] || 0) + timeSpentOnCurrent
          }));
        }
      }
    };
  }, [previousTool, currentToolStartTime, sendTimeSpentData, isInitialLoad]);

const handleBackButton = () => {
    const now = Date.now();
    if (active && currentToolStartTime) {
      const timeSpentOnCurrent = Math.round((now - currentToolStartTime) / 1000);
      if (timeSpentOnCurrent > 0) {
        sendTimeSpentData(active, timeSpentOnCurrent);
        setTimeSpent((prev:any) => ({
          ...prev,
          [active]: (prev[active] || 0) + timeSpentOnCurrent,
        }));
      }
    }
    setActive(null);
    setPreviousTool(active);
    setCurrentToolStartTime(now);
  };

useEffect(() => {
  (window as any).handlePhonicsBackButton = handleBackButton;

  const closeButton = document.getElementById('closing-btn-in-rails');
  if (closeButton) {
    closeButton.addEventListener('click', handleBackButton);
  } else {
    console.warn('Back button with ID "closing-btn-in-rails" not found in DOM');
  }

  const observer = new MutationObserver(() => {
    const button = document.getElementById('closing-btn-in-rails');
    if (button) {
      button.addEventListener('click', handleBackButton);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    delete (window as any).handlePhonicsBackButton;
    if (closeButton) {
      closeButton.removeEventListener('click', handleBackButton);
    }
    observer.disconnect();
  };
}, [handleBackButton, active, currentToolStartTime, sendTimeSpentData]);
  useEffect(() => {
    stopAllAudio();
  }, [active]);
  useEffect(() => {
    if (active && active !== "Write the Letter") {
      setHideSoundWallHeader(false);
      const timer = setTimeout(() => setHideSoundWallHeader(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setHideSoundWallHeader(false);
    }
  }, [active]);
async function doBlend(setDisplay: (s: string) => void, blendSel: Picked[], signal: AbortSignal): Promise<void> {
  stopAllAudio();
  if (blendSel.length < 2) {
    setDisplay("Pick at least 2 sounds");
    return;
  }
  const phonemeSeq = blendSel.map(s => `/${s.id}/`).join(" ");
  const word = buildSpellingFromSounds(blendSel);

  try {
    // Play each phoneme sequentially
    for (const s of blendSel) {
      // Check if aborted
      if (signal.aborted) {
        throw new Error("Blending aborted");
      }

      await new Promise<void>((resolve, reject) => {
        // Register abort listener
        const abortHandler = () => {
          stopAllAudio();
          reject(new Error("Blending aborted"));
        };
        signal.addEventListener("abort", abortHandler);

        const audioUrl = getAudioUrlForPhoneme(s.id);
        const speakText = (s.label || "").replace(/\s*\(.*?\)/g, "").trim() || s.label;

        if (audioUrl) {
          const audio = new Audio(audioUrl);
          activeAudios.add(audio);
          audio.onended = () => {
            activeAudios.delete(audio);
            setTimeout(resolve, 600); // 600ms delay after each phoneme
          };
          audio.onerror = () => {
            activeAudios.delete(audio);
            console.warn("Audio playback failed, falling back to TTS", s.id);
            speakTTS(speakText, { rate: 0.65, cancel: true })
              .then(() => setTimeout(resolve, 600))
              .catch(reject)
              .finally(() => signal.removeEventListener("abort", abortHandler));
          };
          audio.play().catch(err => {
            activeAudios.delete(audio);
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
              console.warn("Audio playback failed, falling back to TTS", err);
              speakTTS(speakText, { rate: 0.65, cancel: true })
                .then(() => setTimeout(resolve, 600))
                .catch(reject)
                .finally(() => signal.removeEventListener("abort", abortHandler));
            } else {
              reject(err);
            }
          });
        } else {
          speakTTS(speakText, { rate: 0.65, cancel: true })
            .then(() => setTimeout(resolve, 600))
            .catch(reject)
            .finally(() => signal.removeEventListener("abort", abortHandler));
        }
      });
    }

    // Check if aborted before playing the final word
    if (signal.aborted) {
      throw new Error("Blending aborted");
    }

    // Brief pause before playing the final word
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    // Play the final blended word
    await speakWord(word);

    // Update display with the phoneme sequence and resulting word
    setDisplay(`${phonemeSeq} = ${word}`);
  } catch (err:any) {
    if (err.message !== "Blending aborted") {
      console.error("Error during blending:", err);
      setDisplay("Error during playback");
    }
  }
}
function getAudioUrlForPhoneme(phonemeId: string): string | undefined {
  // Check all the sound arrays for this phoneme ID
  const allSounds = [
    ...initial.INITIAL_SINGLE,
    ...initial.INITIAL_DIGRAPHS,
    ...initial.VOWEL_SHORT,
    ...initial.VOWEL_LONG,
    ...initial.VOWEL_OTHER,
    ...initial.END_SINGLE,
    ...initial.END_DOUBLE
  ];
  
  // Check sounds with id property first
  const soundWithId = allSounds.find(s => 'id' in s && s.id === phonemeId);
  if (soundWithId) return soundWithId.audio;
  
  // Check BlendItems (no id property, use lab instead)
  const blendSound = initial.INITIAL_BLENDS.find(s => s.lab === phonemeId);
  if (blendSound) return blendSound.audio;
  
  // Check BlendEndItems (no id property, use lab instead)
  const blendEndSound = initial.END_BLENDS.find(s => s.lab === phonemeId);
  if (blendEndSound) return blendEndSound.audio;
  
  return undefined;
}

  // inject font CSS once (in case WriteLetter not opened yet)
  useEffect(() => {
    const id = "handwriting-font-style";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        @font-face { font-family: 'KGPrimaryDots'; src: url('/fonts/KGPrimaryDots.ttf') format('truetype'); font-display: swap; }
        @font-face { font-family: 'Dotline'; src: url('/fonts/Dotline.ttf') format('truetype'); font-display: swap; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-violet-500 py-6 px-4 rounded-md">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-6">
        <h1 className="text-center text-lg md:text-4xl font-black text-slate-700 drop-shadow mb-1">{active ? `🎯 ${active}` : "🎉 Phonics is Fun!"}

        </h1>
        
       <div className="relative flex flex-row items-center top-[-3.5rem]">
         {active && (
            <button
              // onClick={() => setActive(null)}
              onClick={handleBackButton}
              className="absolute right-0 top-0 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
            </button>
          )}
  {/* Toggle Button */}
  <div
    ref={menuIconRef}
    className="w-[100%] max-w-[50px] cursor-pointer relative"
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  >
    <img
      src={isSidebarOpen ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/close.png" : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/sidemenu.png"}
      alt={isSidebarOpen ? "Close Menu" : "Open Menu"}
      className="w-full h-auto"
    />
  </div>

  {/* Dropdown Menu */}
  {isSidebarOpen && (
    <div
      className="absolute   mt-2  bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg rounded-2xl z-50 p-3 top-[-0.5rem] left-[3rem]"
    >
      <div className="flex flex-col gap-2">
        {TOOLS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setActive(t);
              if (t !== "Blending Board") setBlendSel([]);
              setIsSidebarOpen(false);
            }}
            className={`rounded-xl font-semibold text-[12px] px-4 py-2 text-left
              ${active === t
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
        <div className="space-y-6">
          {active === "Blending Board" && (<BlendingBoard selection={blendSel} onClear={()=> setBlendSel([])} onBlend={doBlend} />)}
          {active === "Make the Word" && (<MakeTheWord tiles={makeA} onClear={()=> setMakeA([])} />)}
          {active === "Decoding" && <Decoding />}
          {active === "Write the Letter" && <WriteLetterTab />}
        </div>
          {!active && (
          <div className="mt-2">
            <h2 className="text-center text-2xl font-black text-slate-700 mb-3">🧱 Sound Wall</h2>
            <p className="text-center text-slate-600 text-sm mb-4">Click sounds to hear them. Use them in the tools above.</p>
            <SoundWall onPick={handlePick} />
          </div>
        )}

        {/* Sound Wall for specific tools (except Write the Letter) */}
        {active && active !== "Write the Letter" && (
          <div className="mt-8">
            {!hideSoundWallHeader && <h2 className="text-center text-2xl font-black text-slate-700 mb-3">🧱 Sound Wall</h2>}
            {!hideSoundWallHeader && <p className="text-center text-slate-600 text-sm mb-4">Click sounds to hear them. Use them in the tools above.</p>}
            <SoundWall onPick={handlePick} />
          </div>
        )}
      </div>
    </div>
  );
}


// async function playWordSequence(wordEl: HTMLElement | null) {
//   if (!wordEl) return;
//   setIsPlaying(true);
//   const wordText = wordEl.textContent || "";
//   const isLetterSpellingWord = letterSpellingWords.has(wordText.toLowerCase());
//   stopAllAudio();
//   window.speechSynthesis?.cancel();

//   try {
//     if (isLetterSpellingWord) {
//       // keep your existing letter-by-letter logic (unchanged)
//       const letters = wordText.split('');
//       const tokenEls = Array.from(wordEl.querySelectorAll<HTMLElement>('[data-token]'));
//       for (let i = 0; i < letters.length; i++) {
//         if (tokenEls[i]) tokenEls[i].classList.add("bg-yellow-200");
//         await speakTTS(letters[i], { rate: 0.8 });
//         if (tokenEls[i]) tokenEls[i].classList.remove("bg-yellow-200");
//       }
//     } else {
//       // ────────────────────────────────────────────────────────
//       //           NORMAL WORD – PHONEME BY PHONEME
//       // ────────────────────────────────────────────────────────
//       const tokenEls = Array.from(wordEl.querySelectorAll<HTMLElement>('[data-token]'));
//       const tokens = tokenEls.map(el => el.textContent || "");

//       console.log(`Playing word: ${wordText} → tokens:`, tokens);

//       for (let i = 0; i < tokens.length; i++) {
//         const token = tokens[i];
//         tokenEls[i].classList.add("bg-yellow-200");

//         // ─── Get correct sound URL ─────────────────────────────────
//         let soundUrl = getVowelSound(wordText, token, i, tokens);

//         if (token.toLowerCase() === "ng" && !soundUrl) {
//           soundUrl = "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ng.mp3";
//         }

//         // ─── Skip silent final e ───────────────────────────────────
//         const cleanToken = token.toLowerCase();
//         const cleanWord = wordText.toLowerCase();
//         if (
//           cleanToken === 'e' &&
//           cleanWord.endsWith('e') &&
//           i === tokens.length - 1
//         ) {
//           const vowelCount = cleanWord.split('').filter(c => 'aeiou'.includes(c)).length;
//           if (vowelCount >= 2) {
//             console.log(`Silent e skipped in ${wordText}`);
//             tokenEls[i].classList.remove("bg-yellow-200");
//             continue;
//           }
//         }

//         // ─── Play with proper gap logic ─────────────────────────────
//         await playOneSound(soundUrl, token);

//         tokenEls[i].classList.remove("bg-yellow-200");

//         // Small breath / separation between phonemes (most important!)
//         await new Promise(r => setTimeout(r, 100));   // ← 80–140 ms, tune this
//       }
//     }

//     await onWordClick(wordText);
//   } catch (err) {
//     console.error(`Playback error in "${wordText}":`, err);
//   } finally {
//     setIsPlaying(false);
//   }
// }