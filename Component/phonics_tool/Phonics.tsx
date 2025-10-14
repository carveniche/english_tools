import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import "./phonics.css";
import { ifError } from "node:assert";

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
  if (typeof window === "undefined" || !("speechSynthesis" in window))
    return null;
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Samantha",
    "Victoria",
    "Zira",
    "Karen",
    "Serena",
    "Tessa",
    "Allison",
    "Aria",
    "Google UK English Female",
    "Google US English",
    "Microsoft Zira",
    "Microsoft Aria",
    "Microsoft Jenny",
  ];
  for (const name of preferred) {
    const v = voices.find((vv) => (vv.name || "").includes(name));
    if (v) return v;
  }
  return voices[0] || null;
}

function speakTTS(
  text: string,
  { rate = 0.78, cancel = true }: { rate?: number; cancel?: boolean } = {}
) {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    if (cancel) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;
    const v = getFemaleVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

const canPlay = (role_name?: string, isTogglevalue?: boolean) => {
  // When toggle = true → student only
  console.log(role_name);
  if (isTogglevalue) {
    if (role_name === "tutor") {
      console.log("teacher, true");
      return true;
    }
    if (role_name !== "tutor") {
      console.log("student , true");
      return false;
    }
  } else {
    if (role_name === "tutor") {
      console.log("teacher, false");
      return false;
    }
    if (role_name !== "tutor") {
      console.log("student , false", isTogglevalue);
      return true;
    }
  }
};

function playPhoneme(
  id: string,
  fallbackPronunciation = id,
  audioUrl?: string
) {
  stopAllAudio();
  if (audioUrl) {
    const sound = new Audio(audioUrl);
    activeAudios.add(sound);
    sound.play().catch((err) => {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.warn("Audio playback failed, falling back to TTS", err);
        activeAudios.delete(sound);
        return speakTTS(fallbackPronunciation, { rate: 0.65, cancel: true });
      }
    });
    sound.onended = () => activeAudios.delete(sound);
    return Promise.resolve();
  }

  if (
    typeof window !== "undefined" &&
    typeof (window as any).__PHONICS_PLAY__ === "function"
  ) {
    try {
      (window as any).__PHONICS_PLAY__(id);
      return Promise.resolve();
    } catch {}
  }
  return speakTTS(fallbackPronunciation, { rate: 0.65, cancel: true });
}

function speakWord(
  word: string,
  { cancel = false }: { cancel?: boolean } = {}
) {
  if (
    typeof window !== "undefined" &&
    typeof (window as any).__PHONICS_PLAY__ === "function"
  ) {
    try {
      (window as any).__PHONICS_PLAY__(`WORD:${word}`);
      return Promise.resolve();
    } catch {}
  }
  return speakTTS(word, { rate: 0.9, cancel });
}

const activeAudios = new Set<HTMLAudioElement>();

function stopAllAudio() {
  console.log("Stopping all audio");
  // Stop all active Audio objects
  activeAudios.forEach((audio) => {
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
  "igh",
  "tch",
  "dge",
  "ing",
  "ar",
  "er",
  "ir",
  "or",
  "ur",
  "ai",
  "ay",
  "ea",
  "ee",
  "ie",
  "oa",
  "oo",
  "ue",
  "oi",
  "oy",
  "ou",
  "ow",
  "au",
  "aw",
  "ch",
  "sh",
  "th",
  "ph",
  "wh",
  "ck",
  "ng",
  "nk",
  "ff",
  "ll",
  "ss",
  "zz",
  "ct",
  "ft",
  "lt",
  "mp",
  "nd",
  "nt",
  "pt",
  "sk",
  "sp",
  "st",
  "xt",
];

// ---------- UI primitives ----------
const Pill = ({ children, className = "", index, key }: any) => (
  <div className={`px-3 py-2 rounded-xl font-bold shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionCard = ({ title, children }: any) => (
  <div className="bg-slate-50 border-4 border-slate-200 rounded-2xl p-4">
    <div className="text-center text-white rounded-xl py-2 mb-3 bg-gradient-to-br from-slate-700 to-slate-800">
      <h2 className="text-xl font-extrabold">{title}</h2>
    </div>
    {children}
  </div>
);
interface ButtonData {
  label: string;
  id: string;
  speakText: string;
  audio: string;
}
const datatrackHandler = (
  label: string,
  id: string,
  speakText: string,
  audio: string,
  setButtonData: React.Dispatch<React.SetStateAction<ButtonData>>
) => {
  setButtonData({
    label,
    id,
    speakText,
    audio,
  });
};

function SoundButton({
  label,
  id,
  color,
  audio,
  onPick,
  isTogglevalue,
  role_name,
  isLiveClass,
  setButtonData,
}: {
  label: string;
  id: string;
  audio: string;
  color: string;
  onPick?: (label: string, id: string) => void;
  isTogglevalue: boolean;
  role_name: string;
  isLiveClass: string;
  setButtonData: React.Dispatch<React.SetStateAction<ButtonData>>;
  key: any;
}) {
  // speak without the parenthetical hint
  const speakText = (label || "").replace(/\s*\(.*?\)/g, "").trim() || label;
  return (
    <button
      onClick={() => {
        const iscanPlay = canPlay(role_name, isTogglevalue);
        if (iscanPlay) {
          return;
        }
        console.log(isLiveClass, "isLiveClass");
        if (isLiveClass === "true") {
          console.log("data track");
          datatrackHandler(label, id, speakText, audio, setButtonData);
        }

        playPhoneme(id, speakText, audio);
        onPick?.(label, id);
      }}
      className={`min-h-[44px] text-white font-bold rounded-lg px-2 py-2 shadow-md hover:shadow-lg active:shadow transition-all text-[12px] md:text-[16px] ${color}`}
      aria-label={`sound ${label}`}
    >
      {label}
    </button>
  );
}

function SoundWall({
  onPick,
  isTogglevalue,
  role_name,
  isLiveClass,
  setButtonData,
}: {
  onPick: (label: string, id: string) => void;
  isTogglevalue: boolean;
  role_name: string;
  isLiveClass: string;
  setButtonData: any;
}) {
  return (
    <div className="myGrid">
      {/* Initial Sounds */}
      <SectionCard title="🌟 Initial Sounds">
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Single Letters
        </p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {items.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-green-500 bg-gradient-to-br from-green-500 to-green-600"
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Digraphs
        </p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {itemsDigraphsItems.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-sky-500 bg-gradient-to-br from-sky-500 to-sky-600"
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Blends
        </p>
        <div className="grid grid-cols-7 gap-2">
          {BlendItems.map(({ lab, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={lab}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-violet-500 bg-gradient-to-br from-fuchsia-500 to-violet-600"
            />
          ))}
        </div>
      </SectionCard>

      {/* Vowel Sounds */}
      <SectionCard title="💎 Vowel Sounds">
        <p className="text-xs font-bold text-slate-500 text-center mb-2 display_bold">
          Short Vowels
        </p>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {ShortItems.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-amber-500 bg-gradient-to-br from-amber-500 to-orange-600"
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Long Vowels
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {LongItems.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-amber-500 bg-gradient-to-br from-amber-500 to-orange-600"
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Other Sounds
        </p>
        <div className="grid grid-cols-4 gap-2">
          {OtherItems.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-amber-500 bg-gradient-to-br from-amber-500 to-orange-600"
            />
          ))}
        </div>
      </SectionCard>

      {/* Ending Sounds (no suffixes) */}
      <SectionCard title="🏁 Ending Sounds">
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Single Letters
        </p>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {SingleEndItems.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-rose-500 bg-gradient-to-br from-rose-500 to-pink-600"
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Double Letters
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {DoubleEndItems.map(({ lab, id, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={id}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-rose-500 bg-gradient-to-br from-rose-500 to-pink-600"
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 text-center mb-2">
          Ending Blends
        </p>
        <div className="grid grid-cols-6 gap-2">
          {BlendEndItems.map(({ lab, audio }) => (
            <SoundButton
              key={lab}
              label={lab}
              id={lab}
              audio={audio}
              onPick={onPick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
              color="bg-rose-500 bg-gradient-to-br from-rose-500 to-pink-600"
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ---------- Blending Board ----------
type Picked = { label: string; id: string };

const BlendingBoard = ({ selection, onClear, onBlend }: any) => {
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
      await onBlend(
        setDisplay,
        selection.filter((s: any): s is Picked => s !== null),
        abortControllerRef.current.signal
      );
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
              selection[i]
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-500"
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
  "satpin",
  "chekr",
  "mdgo",
  "flbqu",
  "jzw",
  "vyx",
  "short vowels",
  "long vowels",
  "s, sh, z",
  "c, ch, ck",
  "CVCC",
  "CVCe",
  " -ack, -at, -an, -ap, -ast, -and",
  "-et, -en, -em, -end, -est, -eck",
  "-on, -ot, -op, -ond, -ock",
  "-ist, -it, -ing, -ip, -ick",
] as const;

const CATEGORY_WORDS: Record<string, string[]> = {
  satpin: [
    "sat",
    "pin",
    "nap",
    "is",
    "tip",
    "sit",
    "pan",
    "tan",
    "tap",
    "pat",
    "sip",
    "as",
    "sin",
    "in",
  ],
  chekr: [
    "cat",
    "rat",
    "kit",
    "kin",
    "can",
    "cap",
    "pet",
    "hen",
    "hat",
    "rip",
    "hit",
    "hip",
    "her",
  ],
  mdgo: [
    "mop",
    "dog",
    "dig",
    "mat",
    "map",
    "man",
    "men",
    "cog",
    "tom",
    "tim",
    "got",
    "dot",
    "log",
    "rod",
  ],
  flbqu: [
    "fat",
    "fib",
    "fin",
    "fit",
    "fab",
    "bat",
    "bit",
    "bot",
    "bin",
    "ban",
    "queen",
    "lab",
    "lip",
    "lit",
    "let",
    "fan",
    "fun",
    "leg",
    "log",
    "bun",
    "bug",
    "quip",
    "quit",
    "lug",
    "lag",
    "lap",
  ],
  jzw: [
    "jot",
    "jab",
    "jam",
    "zip",
    "zen",
    "win",
    "wit",
    "jet",
    "jug",
    "zap",
    "zig",
    "wag",
    "wet",
    "web",
  ],
  vyx: [
    "van",
    "yen",
    "yak",
    "vet",
    "vex",
    "yam",
    "yet",
    "yes",
    "box",
    "fox",
    "mix",
    "six",
  ],
  "short vowels": [
    "cat",
    "cot",
    "men",
    "lip",
    "bug",
    "bed",
    "wet",
    "set",
    "rat",
    "bat",
    "pan",
    "fan",
    "net",
    "men",
    "mop",
    "mob",
    "pig",
    "dog",
    "fog",
    "hop",
    "cup",
    "fig",
    "fit",
    "nib",
    "pin",
    "lip",
    "rib",
    "sit",
    "sun",
    "bun",
    "bus",
    "tub",
    "rub",
  ],
  "long vowels": [
    "lake",
    "like",
    "road",
    "mute",
    "leaf",
    "cake",
    "bike",
    "home",
    "cube",
    "kite",
    "rope",
    "plane",
    "goat",
    "seed",
    "rain",
    "road",
    "seed",
    "seep",
    "weep",
    "been",
    "bean",
    "lean",
    "teen",
    "tube",
    "mule",
    "soap",
    "hope",
    "hole",
    "poke",
    "fate",
    "fake",
    "rake",
    "rail",
    "sail",
    "pray",
    "bay",
    "beak",
  ],
  "s, sh, z": [
    "ship",
    "soap",
    "zip",
    "bus",
    "buzz",
    "sip",
    "sun",
    "sock",
    "shop",
    "shell",
    "zap",
    "zoo",
    "fuzz",
    "fizz",
    "shine",
  ],
  "c, ch, ck": [
    "can",
    "city",
    "chuck",
    "duck",
    "cat",
    "cap",
    "cup",
    "chip",
    "chin",
    "chat",
    "rock",
    "sock",
    "pack",
    "luck",
    "city",
    "cent",
  ],
  CVCC: [
    "sand",
    "bend",
    "kind",
    "milk",
    "hand",
    "lamp",
    "tent",
    "jump",
    "gift",
    "pond",
    "bank",
    "bind",
    "find",
    "land",
    "nest",
    "rapt",
    "pant",
    "raft",
    "Sank",
    "ramp",
    "sink",
    "pink",
    "wink",
    "mask",
    "grasp",
    "past",
    "next",
    "ring",
    "text",
  ],
  CVCe: [
    "make",
    "take",
    "like",
    "bike",
    "duke",
    "cake",
    "kite",
    "note",
    "bone",
    "cube",
    "tube",
    "rope",
    "hope",
    "lake",
    "bake",
    "shake",
    "wake",
  ],
  " -ack, -at, -an, -ap, -ast, -and": [
    "sack",
    "sat",
    "man",
    "map",
    "last",
    "band",
    "back",
    "pack",
    "cat",
    "flat",
    "pan",
    "cap",
    "fast",
    "hand",
  ],
  "-et, -en, -em, -end, -est, -eck": [
    "bet",
    "men",
    "hem",
    "send",
    "pest",
    "check",
    "pet",
    "net",
    "hen",
    "pen",
    "gem",
    "stem",
    "best",
    "rest",
    "neck",
    "peck",
  ],
  "-on, -ot, -op, -ond, -ock": [
    "ton",
    "tot",
    "pop",
    "pond",
    "lock",
    "son",
    "ton",
    "hot",
    "pot",
    "rot",
    "hop",
    "top",
    "fond",
    "rock",
    "sock",
  ],
  "-ist, -it, -ing, -ip, -ick": [
    "mist",
    "lit",
    "ring",
    "sip",
    "sick",
    "list",
    "sit",
    "hit",
    "sing",
    "lip",
    "pick",
    "kick",
  ],
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
    ...initial.END_DOUBLE,
  ];

  // Check sounds with id property first
  const soundWithId = allSounds.find((s) => "id" in s && s.id === phonemeId);
  if (soundWithId) return soundWithId.audio;

  // Check BlendItems (no id property, use lab instead)
  const blendSound = initial.INITIAL_BLENDS.find((s) => s.lab === phonemeId);
  if (blendSound) return blendSound.audio;

  // Check BlendEndItems (no id property, use lab instead)
  const blendEndSound = initial.END_BLENDS.find((s) => s.lab === phonemeId);
  if (blendEndSound) return blendEndSound.audio;

  return undefined;
}

const MakeTheWord = ({ tiles, onClear }: any) => {
  const [category, setCategory] = useState("satpin");
  const [result, setResult] = useState("");
  const [isBlending, setIsBlending] = useState(false); // Track blending state
  const abortControllerRef = useRef(new AbortController()); // Track abort signal
  const [gettingPrevword, setGettingprevword] = useState("");
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
    setGettingprevword(word);
    console.log(word, "wordssss");
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
          abortControllerRef.current.signal.addEventListener(
            "abort",
            abortHandler
          );

          const audioUrl = getAudioUrlForPhoneme(s.id);
          const speakText =
            (s.label || "").replace(/\s*\(.*?\)/g, "").trim() || s.label;
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
                .finally(() =>
                  abortControllerRef.current.signal.removeEventListener(
                    "abort",
                    abortHandler
                  )
                );
            };
            audio.play().catch((err) => {
              activeAudios.delete(audio);
              if (!(err instanceof DOMException && err.name === "AbortError")) {
                console.warn("Audio playback failed, falling back to TTS", err);
                speakTTS(speakText, { rate: 0.65, cancel: true })
                  .then(() => setTimeout(resolve, 600))
                  .catch(reject)
                  .finally(() =>
                    abortControllerRef.current.signal.removeEventListener(
                      "abort",
                      abortHandler
                    )
                  );
              } else {
                reject(err);
              }
            });
          } else {
            speakTTS(speakText, { rate: 0.65, cancel: true })
              .then(() => setTimeout(resolve, 600))
              .catch(reject)
              .finally(() =>
                abortControllerRef.current.signal.removeEventListener(
                  "abort",
                  abortHandler
                )
              );
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
    } catch (err: any) {
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
        {gettingPrevword && (
          <button
            onClick={onPrev}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold shadow"
          >
            Play again
          </button>
        )}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {tiles.length === 0 && (
            <span className="text-slate-400 text-sm">
              Pick sounds on the Sound Wall…
            </span>
          )}
          {tiles.map((t: any, idx: any) => (
            <Pill
              key={idx}
              index={idx}
              className="bg-blue-500 text-white text-lg"
            >
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
function normalizeId(id: string) {
  return (id || "").toLowerCase();
}
function mapTokenToGrapheme(tokenId: string, tokenLabel: string) {
  const id = normalizeId(tokenId);
  const baseMap: Record<string, { piece: string; needsFinalE?: boolean }> = {
    ar: { piece: "ar" },
    er: { piece: "er" },
    ir: { piece: "ir" },
    ur: { piece: "ur" },
    "ea-break": { piece: "ea" },
    oa: { piece: "oa" },
    "o-long": { piece: "o" },
    ue: { piece: "ue" },
    ai: { piece: "ai" },
    ay: { piece: "ay" },
    oi: { piece: "oi" },
    ou: { piece: "ou" },
    "ow-ow": { piece: "ow" },
    oy: { piece: "oy" },
    "ea-long": { piece: "ea" },
    aw: { piece: "aw" },
    au: { piece: "au" },
    igh: { piece: "igh" },
    "y-long-i": { piece: "y" },
    "oo-foot": { piece: "oo" },
    "oo-goose": { piece: "oo" },
  };
  if (id in baseMap)
    return {
      piece: baseMap[id].piece,
      flags: { needsFinalE: !!baseMap[id].needsFinalE },
    };
  if (id.startsWith("short-")) return { piece: id.split("-")[1], flags: {} };
  if (id.startsWith("long-"))
    return { piece: id.split("-")[1], flags: { needsFinalE: true } };
  const piece = (tokenLabel || "").replace(/\s*\(.*?\)/g, "").trim();
  return { piece, flags: {} };
}

function buildSpellingFromSounds(sounds: Picked[]) {
  if (!sounds || sounds.length === 0) return "";
  const ids = sounds.map((s) => normalizeId(s.id));
  const labels = sounds.map((s) => s.label);

  // Special: w + er -> were/where
  if (ids.length === 2 && ids[0] === "w" && ids[1] === "er") {
    return Math.random() < 0.5 ? "were" : "where";
  }
  // Special: w + short-o + s -> was
  if (
    ids.length === 3 &&
    ids[0] === "w" &&
    ids[1] === "short-o" &&
    ids[2] === "s"
  ) {
    return "was";
  }
  // Special: s + short-o + lt -> salt
  if (
    ids.length === 3 &&
    labels[0] === "s" &&
    ids[1] === "short-o" &&
    (ids[2] === "lt" || labels[2] === "lt")
  ) {
    return "salt";
  }
  // Special: s + au + lt -> salt
  if (
    ids.length === 3 &&
    labels[0] === "s" &&
    ids[1] === "au" &&
    (ids[2] === "lt" || labels[2] === "lt")
  ) {
    return "salt";
  }

  let out: string[] = [];
  let needsFinalE = false;
  const cvccEndings = [
    "nd",
    "nt",
    "lt",
    "mp",
    "st",
    "sp",
    "sk",
    "ft",
    "lk",
    "pt",
  ];
  for (let i = 0; i < sounds.length; i++) {
    const id = ids[i];
    const lab = labels[i];

    // Merge rule: au + lt → "alt"
    if (id === "au" && (ids[i + 1] === "lt" || labels[i + 1] === "lt")) {
      out.push("alt");
      i++;
      continue;
    }

    const { piece, flags } = mapTokenToGrapheme(id, lab);
    if ((flags as any).needsFinalE) needsFinalE = true;
    out.push(piece);
  }

  let word = out.join("");
  // CVCe heuristic for long vowels
  // if (needsFinalE && sounds.length>=3 && !word.endsWith("e")) word += "e"
  if (needsFinalE && sounds.length >= 3 && !word.endsWith("e")) {
    const lastTwoSounds = sounds.slice(-2).map((s) => normalizeId(s.id));
    const lastSound = lastTwoSounds[1];
    // const isCVCC = sounds.length === 4 && cvccEndings.includes(lastSound);
    const isCVCC = sounds.length > 0 && cvccEndings.includes(lastSound);

    if (!isCVCC) {
      console.log("adding e", "isCVCC", isCVCC, lastSound);
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
  const priorityTokens = [
    "ng",
    "nk",
    "ch",
    "sh",
    "th",
    "ph",
    "wh",
    "ck",
    ...TOKEN_PRIORITY,
  ];
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
const Dot = ({ x, y, key }: any) => (
  <div
    style={{ left: x, top: y }}
    className="absolute w-[5px] h-[5px] bg-black rounded-full"
  />
);
interface Dot {
  x: number;
  y: number;
}
function SentenceDecoder({
  input,
  onTokenClick,
  onWordClick,
}: {
  input: string;
  onTokenClick: (token: string) => void;
  onWordClick: (word: string) => void;
}) {
  const containerRef = useRef(null);
  const [dots, setDots] = useState<Dot[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const words = useMemo(
    () => input.trim().split(/\s+/).filter(Boolean),
    [input]
  );

  // List of words that use letter-by-letter spelling
  const letterSpellingWords = useMemo(
    () =>
      new Set([
        "the",
        "a",
        "some",
        "many",
        "i",
        "you",
        "he",
        "she",
        "we",
        "they",
        "me",
        "are",
        "was",
        "were",
        "be",
        "do",
        "have",
        "to",
        "from",
        "here",
        "there",
        "where",
        "gone",
        "tear",
        "near",
        "wear",
        "none",
        "hear",
        "bear",
        "clear",
        "move",
        "love",
        "head",
        "dead",
        "bread",
        "some",
        "come",
        "thread",
        "honest",
        "climb",
        "lamb",
        "comb",
        "walk",
        "talk",
        "know",
        "hour",
        "four",
        "when",
      ]),
    []
  );

  const vowels = ["a", "e", "i", "o", "u"];

  // Create a mapping from tokens to their sound URLs
  const tokenToSoundMap = useMemo(() => {
    const map: Record<string, string> = {};

    initial.INITIAL_SINGLE.forEach((item) => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
      map[item.lab.toUpperCase()] = item.audio;
    });

    initial.INITIAL_DIGRAPHS.forEach((item) => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_SHORT.forEach((item) => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_LONG.forEach((item) => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_OTHER.forEach((item) => {
      map[item.id] = item.audio;
      const grapheme = item.lab.split(" ")[0].toLowerCase();
      map[grapheme] = item.audio;
    });

    initial.END_SINGLE.forEach((item) => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.END_DOUBLE.forEach((item) => {
      map[item.id] = item.audio;
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.END_BLENDS.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    map["ng"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ng.mp3";

    // Override with explicit short/long vowel mappings
    map["a"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_a.mp3"; // /æ/
    map["e"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_e.mp3"; // /ɛ/
    map["i"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_i.mp3"; // /ɪ/
    map["o"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_o.mp3"; // /ɒ/
    map["u"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_u.mp3"; // /ʌ/

    map["A"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_a_ah.mp3"; // /ɑː/
    map["E"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_e.mp3"; // /iː/
    map["I"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/diphthong_ai.mp3"; // /aɪ/
    map["O"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_o.mp3"; // /oʊ/
    map["U"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_u.mp3"; // /uː/

    map["ea"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/long_vowel_e.mp3"; // /iː/

    console.log('tokenToSoundMap for "a":', map["a"]);
    console.log('tokenToSoundMap for "A":', map["A"]);

    return map;
  }, []);

  // Function to determine vowel sound based on number of vowels
  const getVowelSound = (
    word: string,
    token: string,
    tokenIndex: number,
    tokens: string[]
  ) => {
    const cleanWord = word.toLowerCase();
    const cleanToken = token.toLowerCase();

    const iDiphthongWords = new Set(["find", "mind", "kind", "bind", "grind"]);

    if (tokenIndex < tokens.length - 1) {
      const digraph = cleanToken + tokens[tokenIndex + 1].toLowerCase();
      if (
        [
          "ea",
          "ai",
          "ay",
          "ee",
          "ie",
          "oa",
          "oo",
          "ue",
          "oi",
          "oy",
          "au",
          "aw",
        ].includes(digraph)
      ) {
        console.log(`Digraph detected: ${digraph} in ${word}`);
        return tokenToSoundMap[digraph] || tokenToSoundMap[cleanToken];
      }
    }

    if (!vowels.includes(cleanToken)) {
      return tokenToSoundMap[cleanToken] || tokenToSoundMap[token];
    }

    if (cleanToken === "i" && iDiphthongWords.has(cleanWord)) {
      console.log(`Exception: long /aɪ/ for 'i' in ${word}`);
      return tokenToSoundMap["I"]; // /aɪ/
    }

    const vowelCount = cleanWord
      .split("")
      .filter(
        (char) => vowels.includes(char) || (char === "y" && cleanToken === "y")
      ).length;

    console.log(
      `Word: ${word}, Token: ${cleanToken}, Vowel count: ${vowelCount}`
    );

    if (vowelCount === 1) {
      console.log(`Short vowel for ${cleanToken} in ${word}`);
      return tokenToSoundMap[cleanToken]; // Short vowel sound
    } else if (vowelCount >= 2) {
      console.log(`Long vowel for ${cleanToken} in ${word}`);
      return tokenToSoundMap[cleanToken.toUpperCase()]; // Long vowel sound
    }

    return tokenToSoundMap[cleanToken] || tokenToSoundMap[token];
  };

  // Function to play sound for a token, returning a Promise that resolves when playback completes
  const playTokenSound = async (
    token: string,
    word: string,
    tokenIndex: number,
    tokens: string[]
  ) => {
    const cleanToken = token.toLowerCase();
    const cleanWord = word.toLowerCase();

    // Skip silent 'e' at the end of words with two or more vowels
    if (
      cleanToken === "e" &&
      cleanWord.endsWith("e") &&
      tokenIndex === tokens.length - 1
    ) {
      const vowelCount = cleanWord
        .split("")
        .filter((char) => vowels.includes(char)).length;
      if (vowelCount >= 2) {
        console.log(`Skipping silent 'e' in ${word}`);
        return Promise.resolve(); // Silent 'e'
      }
    }

    let soundUrl = getVowelSound(word, token, tokenIndex, tokens);

    // Special handling for "ng"
    if (cleanToken === "ng" && !soundUrl) {
      soundUrl =
        "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/ng.mp3";
    }

    console.log(`Playing token '${token}' in '${word}': URL = ${soundUrl}`);

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
          audio.play().catch((err) => {
            activeAudios.delete(audio);
            if (!(err instanceof DOMException && err.name === "AbortError")) {
              console.warn(
                `Audio playback failed for ${token}, falling back to TTS`,
                err
              );
              speakTTS(token, { rate: 0.65 }).then(resolve).catch(reject);
            } else {
              reject(err);
            }
          });
        } catch (err) {
          if (!(err instanceof DOMException && err.name === "AbortError")) {
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
    const tokenEls = c.querySelectorAll("[data-token]");
    const lineEl = c.querySelector("[data-arrow]");
    const baseRect = c.getBoundingClientRect();
    const lineRect = lineEl?.getBoundingClientRect();
    const y = lineRect ? lineRect.bottom - baseRect.top + 6 : 60;
    const ds: { x: number; y: number }[] = [];
    tokenEls.forEach((el: any) => {
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
    const isLetterSpellingWord = letterSpellingWords.has(
      wordText.toLowerCase()
    );
    stopAllAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      if (isLetterSpellingWord) {
        const letters = wordText.split("");
        const tokenEls = Array.from(
          wordEl.querySelectorAll<HTMLElement>("[data-token]")
        );
        for (let i = 0; i < letters.length; i++) {
          if (tokenEls[i]) tokenEls[i].classList.add("bg-yellow-200");
          await speakTTS(letters[i], { rate: 0.8 });
          if (tokenEls[i]) tokenEls[i].classList.remove("bg-yellow-200");
        }
      } else {
        const tokenEls = Array.from(
          wordEl.querySelectorAll<HTMLElement>("[data-token]")
        );
        const tokens = tokenEls.map((el) => el.textContent || "");
        console.log(`Tokens for '${wordText}':`, tokens);
        for (let i = 0; i < tokens.length; i++) {
          tokenEls[i].classList.add("bg-yellow-200");
          await playTokenSound(tokens[i], wordText, i, tokens);
          tokenEls[i].classList.remove("bg-yellow-200");
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
        {words.map((w: any, i: any) => {
          const isLetterSpellingWord = letterSpellingWords.has(w.toLowerCase());
          return (
            <span
              key={i}
              className={`inline-flex items-end mr-3 cursor-pointer ${
                isPlaying ? "pointer-events-none cursor-not-allowed" : ""
              }`}
              data-word
              onClick={(e) => {
                if (isPlaying) return;
                playWordSequence(e.currentTarget as HTMLElement);
              }}
            >
              {isLetterSpellingWord
                ? w.split("").map((letter: any, j: any) => (
                    <span
                      key={j}
                      data-token
                      className="inline-block px-0.5 py-0.5 transition bg-transparent hover:bg-yellow-200 rounded"
                      onClick={() => onTokenClick(letter)}
                    >
                      {letter}
                    </span>
                  ))
                : tokenizeWord(w).map((t, j) => (
                    <span
                      key={j}
                      data-token
                      className="inline-block px-0.5 py-0.5 transition bg-transparent hover:bg-yellow-200 rounded"
                      onClick={() => onTokenClick(t)}
                    >
                      {t}
                    </span>
                  ))}
            </span>
          );
        })}
      </div>
      <div data-arrow className="mt-1 border-b-4 border-black relative">
        <span className="absolute -right-1 -top-[6px] w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-black" />
      </div>
      {dots.map((d: any, idx: any) => (
        <Dot key={idx} x={d.x} y={d.y} />
      ))}
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

    initial.INITIAL_SINGLE.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.INITIAL_DIGRAPHS.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_SHORT.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_LONG.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.VOWEL_OTHER.forEach((item) => {
      const grapheme = item.lab.split(" ")[0].toLowerCase();
      map[grapheme] = item.audio;
    });

    initial.END_SINGLE.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    initial.END_DOUBLE.forEach((item) => {
      map[item.lab.toLowerCase()] = item.audio;
    });

    map["a"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_a.mp3";
    map["e"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_e.mp3";
    map["i"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_i.mp3";
    map["o"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_o.mp3";
    map["u"] =
      "https://d3g74fig38xwgn.cloudfront.net/sound_wall/sounds/short_vowel_u.mp3";

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
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.warn(`Could not play sound for ${token}`, err);
          await speakTTS(token, { rate: 0.65 });
        }
      }
    } else {
      await speakTTS(token, { rate: 0.65 });
    }
  };

  const handleInputChange = (e: any) => {
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.length <= maxLength) setShow(text);
        }}
        className="flex gap-2 mb-4"
      >
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
      {warning && <p className="text-red-500 text-sm mb-2">{warning}</p>}
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
function getLetterPath(letter: string, isUpper: boolean) {
  const l = (letter || "a").toLowerCase();
  const p = (x: number, y: number) => ({ x, y });
  const arc = (
    cx: number,
    cy: number,
    r: number,
    a0: number,
    a1: number,
    steps = 16
  ) => {
    const pts: any[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = a0 + ((a1 - a0) * i) / steps;
      pts.push(p(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
    }
    return pts;
  };
  const v = (x: number, y1: number, y2: number) => [p(x, y1), p(x, y2)];
  const h = (x1: number, x2: number, y: number) => [p(x1, y), p(x2, y)];

  const lower: Record<string, any[]> = {
    a: [
      [...arc(115, 70, 20, Math.PI * -2.9, Math.PI * -2)],
      v(135, 65, 170),
      [...arc(100, 130, 35, Math.PI * -0.2, Math.PI * -1.9)],
    ],
    b: [v(60, 50, 180), [...arc(67, 140, 35, Math.PI * 1.5, Math.PI * 2.6)]],
    c: [[...arc(100, 130, 40, Math.PI * -0.2, Math.PI * -1.8)]],
    d: [
      v(140, 50, 180),
      [...arc(107, 140, 35, Math.PI * -2.2, Math.PI * -3.9)],
    ],
    e: [
      h(68, 135, 120),
      [...arc(100, 130, 35, Math.PI * -0.1, Math.PI * -1.8)],
    ],
    f: [
      [...arc(120, 60, 20, Math.PI * -2, Math.PI * -2.6)],
      v(110, 40, 170),
      h(80, 140, 90),
    ],
    g: [
      [...arc(102, 130, 30, Math.PI * -0.2, Math.PI * -1.8)],
      v(130, 110, 200),
      [...arc(110, 200, 20, Math.PI * 1.9, Math.PI * 2.8)],
    ],
    h: [v(60, 50, 180), [p(60, 110), p(100, 90), p(130, 110), p(130, 180)]],
    i: [v(100, 110, 180), [p(100, 90), p(100, 90.1)]],
    j: [
      [p(120, 110), p(120, 180), p(110, 195), p(95, 195)],
      [p(120, 90), p(120, 90.1)],
    ],
    k: [v(60, 50, 180), [p(60, 120), p(135, 70)], [p(60, 120), p(115, 170)]],
    l: [v(80, 50, 180)],
    m: [
      v(50, 110, 180),
      [p(50, 110), p(80, 90), p(110, 110), p(110, 180)],
      [p(110, 110), p(140, 90), p(170, 110), p(170, 180)],
    ],
    n: [
      v(40, 70, 180),
      [
        p(40, 110),
        p(55, 90),
        p(85, 78),
        p(120, 78),
        p(145, 90),
        p(160, 110),
        p(160, 180),
      ],
    ],
    o: [[...arc(100, 130, 40, 0, Math.PI * 2)]],
    p: [v(60, 110, 210), [...arc(75, 140, 35, Math.PI * 1.4, Math.PI * 2.7)]],
    q: [v(140, 90, 200), [...arc(100, 130, 40, 0, Math.PI * -1.8)]],
    r: [v(60, 110, 180), [p(60, 120), p(90, 100), p(110, 110)]],
    // s: [ [...arc(110,110,25,Math.PI*1.2,Math.PI*2.2)], [...arc(90,150,25,Math.PI*0.2,Math.PI*1.2)] ],
    s: [
      [...arc(110, 100, 20, Math.PI * -0.4, Math.PI * -1.5)],
      [...arc(105, 140, 20, Math.PI * 1.5, Math.PI * 2.7)],
    ],
    t: [
      v(100, 50, 180),
      [...arc(110, 175, 10, Math.PI * 2.9, Math.PI * 2)],
      h(75, 125, 90),
    ],
    u: [
      [
        p(60, 110),
        p(60, 150),
        p(80, 170),
        p(100, 170),
        p(120, 150),
        p(120, 110),
      ],
    ],
    v: [[p(60, 110), p(100, 180), p(140, 110)]],
    w: [[p(50, 110), p(80, 180), p(110, 110), p(140, 180), p(170, 110)]],
    x: [
      [p(60, 110), p(140, 180)],
      [p(140, 110), p(60, 180)],
    ],
    // y: [ [p(60,90),p(100,180),p(140,100)], [p(100,180),p(100,210)] ],
    y: [
      [p(60, 80), p(100, 120), p(140, 80)],
      [p(100, 120), p(100, 180)],
    ],
    z: [
      [p(60, 110), p(140, 110)],
      [p(140, 110), p(60, 180)],
      [p(60, 180), p(140, 180)],
    ],
  };
  const stemX = 60; // vertical spine x
  const R = 50; // bowl radius
  const cx = stemX;
  const upper: Record<string, any[]> = {
    a: [[p(60, 180), p(100, 60), p(140, 180)], h(75, 125, 120)],
    b: [
      v(stemX, 40, 200), // vertical spine
      [...arc(cx, 85, 40, -0.5 * Math.PI, 0.5 * Math.PI)], // upper bowl (RIGHT semicircle)
      [...arc(cx, 160, 39, -0.5 * Math.PI, 0.5 * Math.PI)], // lower bowl (RIGHT semicircle)
    ],
    c: [[...arc(100, 120, 60, Math.PI * -0.3, Math.PI * -1.7)]],
    d: [v(60, 50, 180), [...arc(60, 120, 60, -Math.PI / 2, Math.PI / 2)]],
    e: [v(70, 50, 180), h(70, 140, 50), h(70, 120, 115), h(70, 140, 180)],
    f: [v(80, 50, 180), h(80, 140, 50), h(80, 120, 100)],
    g: [
      [...arc(95, 120, 60, Math.PI * -0.3, Math.PI * -1.7)],
      v(130, 170, 130),
      h(130, 80, 130),
    ],
    h: [v(60, 50, 180), v(140, 50, 180), h(60, 140, 120)],
    i: [v(100, 50, 180)],
    j: [[p(120, 50), p(120, 165), p(110, 185), p(90, 185)]],
    k: [v(60, 50, 180), [p(60, 110), p(140, 60)], [p(60, 110), p(140, 170)]],
    l: [v(80, 50, 180), h(80, 140, 180)],
    m: [v(60, 50, 180), [p(60, 50), p(100, 120), p(140, 50)], v(140, 50, 180)],
    n: [v(60, 50, 180), [p(60, 50), p(140, 180)], v(140, 180, 40)],
    o: [[...arc(100, 120, 60, 0, Math.PI * 2)]],
    p: [
      v(60, 50, 180),
      [...arc(75, 90, 39, Math.PI * -2.6, Math.PI * -1.4)],
      // h(60, 90, 127),
      //  h(60, 90, 50)
    ],
    q: [[...arc(100, 120, 60, 0, Math.PI * 2)], [p(125, 145), p(155, 190)]],
    r: [
      v(60, 50, 180),
      [...arc(65, 85, 35, Math.PI * -0.5, Math.PI * 0.5)],
      [p(75, 115), p(110, 180)],
    ],
    s: [
      [...arc(110, 100, 35, Math.PI * -0.3, Math.PI * -1.4)],
      [...arc(90, 170, 40, Math.PI * 1.5, Math.PI * 2.7)],
    ],

    t: [h(70, 130, 50), v(100, 50, 180)],
    u: [
      v(60, 50, 140),
      [...arc(100, 140, 40, Math.PI * 3, Math.PI * 2.1)],
      v(138, 150, 50),
    ],
    v: [[p(60, 50), p(100, 180), p(140, 50)]],
    w: [[p(50, 50), p(80, 180), p(110, 50), p(140, 180), p(170, 50)]],
    x: [
      [p(60, 50), p(140, 180)],
      [p(140, 50), p(60, 180)],
    ],
    y: [
      [p(60, 50), p(100, 120), p(140, 50)],
      [p(100, 120), p(100, 180)],
    ],
    z: [
      [p(60, 50), p(140, 50)],
      [p(140, 50), p(60, 180)],
      [p(60, 180), p(140, 180)],
    ],
  };

  if (!isUpper && lower[l]) return lower[l];
  if (isUpper && upper[l]) return upper[l];
  return [[p(40, 40), p(160, 40), p(160, 180), p(40, 180), p(40, 40)]];
}

function PathTracer({
  letter,
  isUpper,
  onProgress,
}: {
  letter: string;
  isUpper: boolean;
  onProgress: (n: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [segIdx, setSegIdx] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [lastT, setLastT] = useState(0); // ✅ track stroke progress

  const strokes = useMemo(
    () => getLetterPath(letter, isUpper),
    [letter, isUpper]
  );

  function getSegLen(points: { x: number; y: number }[]) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      len += Math.hypot(dx, dy);
    }
    return len;
  }

  function pointAlong(points: { x: number; y: number }[], t: number) {
    const total = getSegLen(points);
    let d = t * total;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1],
        p1 = points[i];
      const seg = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      if (d <= seg) {
        const r = d / seg;
        return { x: p0.x + (p1.x - p0.x) * r, y: p0.y + (p1.y - p0.y) * r };
      }
      d -= seg;
    }
    return points[points.length - 1];
  }

  useEffect(() => {
    const p0 = pointAlong(strokes[0], 0);
    setPos(p0);
    setSegIdx(0);
    setProgress(0);
    setLastT(0);
    setActive(false);
  }, [strokes]);

  function onPointerDownCircle(e: any) {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    setActive(true);
    // setLastT(0);
  }

  function onPointerMove(e: any) {
    if (!active) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pts = strokes[segIdx];

    let bestT = 0,
      bestD = Infinity;
    const samples = 200;
    for (let s = 0; s <= samples; s++) {
      const t = s / samples;
      const pt = pointAlong(pts, t);
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < bestD) {
        bestD = d;
        bestT = t;
      }
    }

    // ✅ only allow forward dragging
    if (bestT + 0.02 < lastT) return;

    const pt = pointAlong(pts, bestT);
    setPos(pt);
    setLastT(bestT);

    const segTotal = strokes
      .slice(0, segIdx)
      .reduce((a: any, p: any) => a + getSegLen(p), 0);
    const total = strokes.reduce((a: any, p: any) => a + getSegLen(p), 0);
    const current = segTotal + getSegLen(pts) * bestT;
    const prog = current / total;

    setProgress(prog);
    onProgress(prog);
  }

  function onPointerUp(e: any) {
    if (!active) return;
    const svg = svgRef.current;
    if (!svg) return;
    (svg as any).releasePointerCapture?.(e.pointerId);
    setActive(false);

    const pts = strokes[segIdx];
    const end = pointAlong(pts, 1);
    const nearEnd = Math.hypot(pos.x - end.x, pos.y - end.y) < 8;

    if (nearEnd && segIdx < strokes.length - 1) {
      setSegIdx(segIdx + 1);
      setLastT(0);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={220}
        height={230}
        className="bg-slate-50 rounded-xl border-2 border-slate-200 touch-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* dotted guide paths */}
        {strokes.map((pts: any, i: any) => (
          <polyline
            key={i}
            points={pts.map((p: any) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={5}
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
        ))}

        {/* clickable start circles */}
        {strokes.map((pts: any, i: any) => (
          <circle
            key={`start-${i}`}
            cx={pts[0].x}
            cy={pts[0].y}
            r={7}
            fill={i === segIdx ? "yellow" : "lightgrey"}
            style={{ cursor: i === segIdx ? "pointer" : "not-allowed" }}
            onPointerDown={i === segIdx ? onPointerDownCircle : undefined}
          />
        ))}

        {/* solid drawn strokes */}
        {strokes.slice(0, segIdx + 1).map((pts: any, i: any) => {
          const isCurrent = i === segIdx;
          const total = strokes.reduce((a: any, p: any) => a + getSegLen(p), 0);
          const prev = strokes
            .slice(0, i)
            .reduce((a: any, p: any) => a + getSegLen(p), 0);
          const local = isCurrent
            ? Math.max(
                0,
                Math.min(1, (progress * total - prev) / getSegLen(pts))
              )
            : 1;
          const steps = 150;
          const drawn: any[] = [];
          for (let s = 0; s <= steps; s++) {
            const tt = Math.min(1, (s / steps) * local);
            drawn.push(pointAlong(pts, tt));
          }
          return (
            <polyline
              key={`solid-${i}`}
              points={drawn.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#1d4ed8"
              strokeWidth={5}
              strokeLinecap="round"
            />
          );
        })}

        {/* draggable marker */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={9}
          fill="green"
          stroke="white"
          strokeWidth={2}
          style={{
            cursor: active ? "grabbing" : "grab",
            boxShadow: active ? "0 0 10px 2px #ff8652" : "none",
            animation: active ? "blink 0.8s infinite alternate" : "none",
          }}
          onPointerDown={onPointerDownCircle}
        />
      </svg>
    </div>
  );
}

function WriteLetter() {
  const [val, setVal] = useState("a");
  const [upperDone, setUpperDone] = useState(0);
  const [lowerDone, setLowerDone] = useState(0);
  // Use a more lenient threshold to handle floating-point precision
  const done = upperDone >= 0.99 && lowerDone >= 0.99;

  // Inject dotted handwriting font
  useEffect(() => {
    const id = "handwriting-font-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @font-face { font-family: 'KGPrimaryDots'; src: url('/fonts/KGPrimaryDots.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Dotline'; src: url('/fonts/Dotline.ttf') format('truetype'); font-display: swap; }
      .handwriting { font-family: 'KGPrimaryDots','Dotline','Patrick Hand','Comic Sans MS',cursive; }
      .dotted-text { font-family: 'KGPrimaryDots','Dotline','Patrick Hand','Comic Sans MS',cursive; letter-spacing: 2px; }
    `;
    document.head.appendChild(style);
  }, []);

  // Reset progress when the letter changes
  useEffect(() => {
    setUpperDone(0);
    setLowerDone(0);
  }, [val]);

  // Function to handle Next button click
  const handleNext = () => {
    const nextLetter = String.fromCharCode(val.charCodeAt(0) + 1);
    if (/^[a-zA-Z]$/.test(nextLetter)) {
      // console.log('hello')
      setVal(nextLetter);
    } else {
      // console.log('h')
      setVal("b");
    }
  };

  // Function to handle Prev button click
  const handlePrev = () => {
    const prevLetter = String.fromCharCode(val.charCodeAt(0) - 1);
    setVal(prevLetter);
  };

  // Handle input change with validation
  const handleInputChange = (e: any) => {
    const input = e.target.value.slice(0, 1); // Restrict to single character
    if (/^[a-zA-Z]$/.test(input)) {
      // Only allow alphabetic letters
      setVal(input.toLowerCase());
    } else if (input === "") {
      // Allow clearing the input
      setVal("");
    }
  };

  // Calculate progress percentage
  const progressPercent = Math.round(upperDone * 50 + lowerDone * 50);

  return (
    <div
      className={`relative rounded-2xl border-4 border-blue-300 p-5 handwriting ${
        done ? "bg-green-400" : "bg-white"
      }`}
    >
      <div className="flex gap-3 items-center mt-[1rem]">
        <input
          value={val}
          onChange={handleInputChange}
          className="px-3 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg w-40"
          placeholder="Enter a letter"
          maxLength={1}
        />
        <div className="flex-1 flex items-center gap-3">
          <div className="h-3 flex-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="min-w-[60px] text-sm font-bold text-slate-700">
            {progressPercent}%
          </div>
        </div>
        {done && val.toLowerCase() !== "z" && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-0 px-4 py-2 rounded-lg font-bold shadow bg-green-600 text-white hover:bg-green-700"
          >
            Next
          </button>
        )}
        {done && val.toLowerCase() === "z" && (
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded-lg font-bold shadow bg-blue-600 text-white hover:bg-blue-700"
          >
            Prev
          </button>
        )}
        {/* {!done && (
          <button 
            disabled={true} 
            className="px-4 py-2 rounded-lg font-bold shadow bg-slate-300 text-slate-500 cursor-not-allowed"
          >
            Next
          </button>
        )} */}
      </div>

      <div className="flex items-center justify-center gap-8 mb-2">
        <div className="text-6xl dotted-text select-none">
          {(val || "A").toUpperCase()}
        </div>
        <div className="text-6xl dotted-text select-none">
          {(val || "a").toLowerCase()}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <div className="text-center font-bold text-slate-600 mb-2">
            Uppercase
          </div>
          <PathTracer letter={val} isUpper onProgress={setUpperDone} />
        </div>
        <div>
          <div className="text-center font-bold text-slate-600 mb-2">
            Lowercase
          </div>
          <PathTracer letter={val} isUpper={false} onProgress={setLowerDone} />
        </div>
      </div>
      <p className="text-slate-500 text-sm mt-3">
        The dot can only move along the dotted path.
      </p>
    </div>
  );
}

const TOOLS = [
  "Blending Board",
  "Make the Word",
  "Decoding",
  "Write the Letter",
] as const;
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
type ToolType =
  | "Blending Board"
  | "Make the Word"
  | "Decoding"
  | "Write the Letter";
interface Window {
  handlePhonicsBackButton: () => void;
  submitTimeSpent?: (formData: FormData) => void;
  lastSentTimes?: Record<string, number>;
  __PHONICS_PLAY__?: (id: string) => void; // Include if needed for other parts of your code
}
export default function PhonicsIsFunApp({
  isLiveClass,
  role_name,
  setIsToogle,
  isTogglevalue,
  setButtonData,
  data,
}) {
  const [active, setActive] = useState<ToolType | null>(null);
  const [blendSel, setBlendSel] = useState<PickItem[]>([]);
  const [makeA, setMakeA] = useState<PickItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hideSoundWallHeader, setHideSoundWallHeader] = useState(false);
  const menuIconRef = useRef(null);
  function handlePick(label: string, id: number | string) {
    if (active === "Blending Board") {
      setBlendSel((prev: any) =>
        prev.length >= 3 ? prev : [...prev, { label, id }]
      );
    } else if (active === "Make the Word") {
      console.log(makeA, label, id, "this is make the word");
      setMakeA((prev: any) => [...prev, { label, id }]);
    }
  }
  const [timeSpent, setTimeSpent] = useState({});
  const [currentToolStartTime, setCurrentToolStartTime] = useState<
    number | null
  >(null);
  const [previousTool, setPreviousTool] = useState<ToolType | null>(null);
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
    formData.append("tool", toolName);
    formData.append("time_spent", seconds.toString());
    console.log(
      `Sending data for ${toolName}: ${seconds}s at ${new Date().toISOString()}`
    );
    if (typeof window.submitTimeSpent === "function") {
      window.submitTimeSpent(formData);
    } else {
      console.log("Time spent:", { tool: toolName, time_spent: seconds });
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
        const toolToTrack =
          previousTool || (!previousTool && !isInitialLoad ? "home" : null);
        if (toolToTrack) {
          const timeSpent = Math.round((now - currentToolStartTime) / 1000);
          if (timeSpent > 0) {
            sendTimeSpentData(toolToTrack, timeSpent);
            setTimeSpent((prev: any) => ({
              ...prev,
              [toolToTrack]: (prev[toolToTrack] || 0) + timeSpent,
            }));
          }
        }
      }
      setCurrentToolStartTime(now);
      setPreviousTool(active);
      setIsInitialLoad(false);
    }
  }, [
    active,
    previousTool,
    sendTimeSpentData,
    isInitialLoad,
    currentToolStartTime,
  ]);

  useEffect(() => {
    return () => {
      const now = Date.now();
      const toolToTrack = previousTool || (isInitialLoad ? "home" : null);
      if (toolToTrack && currentToolStartTime) {
        const timeSpentOnCurrent = Math.round(
          (now - currentToolStartTime) / 1000
        );
        if (timeSpentOnCurrent > 0) {
          sendTimeSpentData(toolToTrack, timeSpentOnCurrent);
          setTimeSpent((prev: any) => ({
            ...prev,
            [toolToTrack]: (prev[toolToTrack] || 0) + timeSpentOnCurrent,
          }));
        }
      }
    };
  }, [previousTool, currentToolStartTime, sendTimeSpentData, isInitialLoad]);

  const handleBackButton = () => {
    const now = Date.now();
    if (active && currentToolStartTime) {
      const timeSpentOnCurrent = Math.round(
        (now - currentToolStartTime) / 1000
      );
      if (timeSpentOnCurrent > 0) {
        sendTimeSpentData(active, timeSpentOnCurrent);
        setTimeSpent((prev: any) => ({
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

    const closeButton = document.getElementById("closing-btn-in-rails");
    if (closeButton) {
      closeButton.addEventListener("click", handleBackButton);
    } else {
      console.warn(
        'Back button with ID "closing-btn-in-rails" not found in DOM'
      );
    }

    const observer = new MutationObserver(() => {
      const button = document.getElementById("closing-btn-in-rails");
      if (button) {
        button.addEventListener("click", handleBackButton);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      delete (window as any).handlePhonicsBackButton;
      if (closeButton) {
        closeButton.removeEventListener("click", handleBackButton);
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
  async function doBlend(
    setDisplay: (s: string) => void,
    blendSel: Picked[],
    signal: AbortSignal
  ): Promise<void> {
    stopAllAudio();
    if (blendSel.length < 2) {
      setDisplay("Pick at least 2 sounds");
      return;
    }
    const phonemeSeq = blendSel.map((s) => `/${s.id}/`).join(" ");
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
          const speakText =
            (s.label || "").replace(/\s*\(.*?\)/g, "").trim() || s.label;

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
                .finally(() =>
                  signal.removeEventListener("abort", abortHandler)
                );
            };
            audio.play().catch((err) => {
              activeAudios.delete(audio);
              if (!(err instanceof DOMException && err.name === "AbortError")) {
                console.warn("Audio playback failed, falling back to TTS", err);
                speakTTS(speakText, { rate: 0.65, cancel: true })
                  .then(() => setTimeout(resolve, 600))
                  .catch(reject)
                  .finally(() =>
                    signal.removeEventListener("abort", abortHandler)
                  );
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
    } catch (err: any) {
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
      ...initial.END_DOUBLE,
    ];

    // Check sounds with id property first
    const soundWithId = allSounds.find((s) => "id" in s && s.id === phonemeId);
    if (soundWithId) return soundWithId.audio;

    // Check BlendItems (no id property, use lab instead)
    const blendSound = initial.INITIAL_BLENDS.find((s) => s.lab === phonemeId);
    if (blendSound) return blendSound.audio;

    // Check BlendEndItems (no id property, use lab instead)
    const blendEndSound = initial.END_BLENDS.find((s) => s.lab === phonemeId);
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

  useEffect(() => {
    const id= data.id;
    const speakText=data?.speakText;
    const audio =  data?.audio;
    const label = data?.label;
    console.log(data,"data append");
    playPhoneme(id, speakText, audio);
    handlePick(label,id)
  }, [data]);

  return (
    <div className="min-h-screen flex  bg-gradient-to-br from-indigo-400 to-violet-500 py-6 px-4 rounded-md border border-red-600">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-6">
        <h1 className="text-center text-lg md:text-4xl font-black text-slate-700 drop-shadow mb-1">
          {active ? `🎯 ${active}` : "🎉 Phonics is Fun!"}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
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
              src={
                isSidebarOpen
                  ? "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/close.png"
                  : "https://d3g74fig38xwgn.cloudfront.net/sound_wall/images/sidemenu.png"
              }
              alt={isSidebarOpen ? "Close Menu" : "Open Menu"}
              className="w-full h-auto"
            />
          </div>

          {/* Dropdown Menu */}
          {isSidebarOpen && (
            <div className="absolute   mt-2  bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg rounded-2xl z-50 p-3 top-[-0.5rem] left-[3rem]">
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
              ${
                active === t
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
          {active === "Blending Board" && (
            <BlendingBoard
              selection={blendSel}
              onClear={() => setBlendSel([])}
              onBlend={doBlend}
            />
          )}
          {active === "Make the Word" && (
            <MakeTheWord tiles={makeA} onClear={() => setMakeA([])} />
          )}
          {active === "Decoding" && <Decoding />}
          {active === "Write the Letter" && <WriteLetter />}
        </div>
        {!active && (
          <div className="mt-2">
            <h2 className="text-center text-2xl font-black text-slate-700 mb-3">
              🧱 Sound Wall
            </h2>
            <p className="text-center text-slate-600 text-sm mb-4">
              Click sounds to hear them. Use them in the tools above.
            </p>
            <SoundWall
              onPick={handlePick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
            />
          </div>
        )}

        {/* Sound Wall for specific tools (except Write the Letter) */}
        {active && active !== "Write the Letter" && (
          <div className="mt-8">
            {!hideSoundWallHeader && (
              <h2 className="text-center text-2xl font-black text-slate-700 mb-3">
                🧱 Sound Wall
              </h2>
            )}
            {!hideSoundWallHeader && (
              <p className="text-center text-slate-600 text-sm mb-4">
                Click sounds to hear them. Use them in the tools above.
              </p>
            )}
            <SoundWall
              onPick={handlePick}
              isTogglevalue={isTogglevalue}
              role_name={role_name}
              isLiveClass={isLiveClass}
              setButtonData={setButtonData}
            />
          </div>
        )}
      </div>
      {isLiveClass === "true" && role_name === "tutor" && (
        <div className="flex flex-col items-center gap-[10px]">
          <div className="text-xl">Student Access</div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isTogglevalue}
              onChange={(e) => setIsToogle(e.target.checked)} // ✅ true or false
            />
            <div
              className="w-[50px] h-[30px] bg-gray-600 rounded-full transition-all duration-200
        peer-checked:bg-purple-400
        before:content-[''] before:absolute before:top-1/2 before:left-[5px]
        before:-translate-y-1/2 before:w-[20px] before:h-[20px]
        before:bg-transparent before:rounded-full
        before:border-[5px] before:border-white
        before:shadow-[5px_2px_7px_rgba(8,8,8,0.26)]
        before:transition-all before:duration-200
        peer-checked:before:translate-x-[20px] peer-checked:before:bg-white"
            ></div>
          </label>
        </div>
      )}
    </div>
  );
}
