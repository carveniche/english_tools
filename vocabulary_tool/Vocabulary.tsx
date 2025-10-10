import React, { useEffect, useRef, useState } from 'react';
import { Globe, Save, X, ChevronDown,LoaderCircle  } from "lucide-react";

// ====================== Types ======================
export type LevelKey = string;

export interface VocabItem {
  word: string;
  meaning: string | null;
  sentence: string | null;
  quote: string | null;
  phrase: string | null;
  phraseMeaning: string | null;
  image?: string | null;
  translated_word: string | null;
  translated_meaning?: string | null; 
  translated_phrase?: string | null; 
  translated_phraseMeaning?: string | null; 
  translated_quote?: string | null; 
  translated_sentence?: string | null;   
}

export interface Category {
  id: number;
  name: string;
}

export interface JsonData {
  set: number | null;
  is_completed: boolean;
  word_list: VocabItem[];
  questions: any[];
  categories: Category[];
  is_translated: boolean;
  languages: { code: string; name: string }[];
}

export type Dataset = Record<LevelKey, VocabItem[]>;

// ====================== Data Processing ======================
const initializeJsonData = (toolData: any): JsonData[] => {
  if (!toolData || !toolData.words_data || !toolData.categories) {
    console.warn('Invalid toolData: Missing toolData, words_data, or categories. Returning default JsonData.');
    return [{ set: null, is_completed: false, word_list: [], questions: [], categories: [], is_translated: false, languages: [] }];
  }

  const { words_data, categories ,languages } = toolData;

  if (!words_data[0]) {
    console.error('Error: words_data[0] is missing. Expected an object with is_completed boolean.');
    return [{ set: null, is_completed: false, word_list: [], questions: [], categories: [], is_translated: false, languages: [] }];
  }

  if (typeof words_data[0].is_completed !== 'boolean') {
    console.error(`Error: is_completed is not a boolean in words_data[0]. Received: ${words_data[0].is_completed}. Defaulting to false.`);
  }
  if (!languages || !Array.isArray(languages)) {
    console.warn('Warning: toolData.languages is missing or not an array.');
    return [{ set: null, is_completed: false, word_list: [], questions: [], categories: [], is_translated: false, languages: [] }];
  }

  return [{
    set: words_data[0].set || null,
    is_completed: typeof words_data[0].is_completed === 'boolean' ? words_data[0].is_completed : false,
    is_translated: words_data[0].is_translated || false,
    languages: toolData.languages|| [],
    word_list: words_data[0].word_list?.map((item: any) => ({
      word: item.word || '',
      meaning: item.meaning || null,
      sentence: item.sentence || null,
      quote: item.quote || null,
      phrase: item.phrase || null,
      phraseMeaning: item.phraseMeaning || null,
      image: item.image || null,
      translated_word: item.translated_word || null,
      translated_meaning: item.translated_meaning || null,
      translated_phrase: item.translated_phrase || null,
      translated_phraseMeaning: item.translated_phraseMeaning || null,
      translated_quote: item.translated_quote || null,
      translated_sentence: item.translated_sentence || null,
    })) || [],
    questions: words_data[0].questions || [],
    categories: categories.map((cat: any) => ({
      id: cat.id || 0,
      name: cat.name || '',
    })) || [],
  }];
};

const initializeData = (jsonData: JsonData[]): Dataset => {
  const categories = jsonData[0]?.categories || [];
  const wordList = jsonData[0]?.word_list || [];
  return categories.reduce((acc: Dataset, cat: Category) => ({
    ...acc,
    [cat.name]: wordList,
  }), {} as Dataset);
};

// ====================== Generate Synthetic Questions ======================
const generateSyntheticQuestions = (wordList: VocabItem[]): any[] => {
  return wordList.map((item) => ({
    question: { question: `Complete the action: ____ Place any answer.` },
    options: [item.word, ...shuffle(wordList.filter(w => w.word !== item.word)).slice(0, 2).map(w => w.word)],
  }));
}; 


// ====================== Build DND Overrides ======================
const buildDNDOverrides = (jsonData: JsonData[]): Record<LevelKey, Record<string, { s: string; o: string[] }>> => {
  const questions = jsonData[0]?.questions?.length > 0 ? jsonData[0].questions : generateSyntheticQuestions(jsonData[0]?.word_list || []);
  return jsonData[0].categories.reduce((acc: Record<LevelKey, Record<string, { s: string; o: string[] }>>, cat: Category) => ({
    ...acc,
    [cat.name]: questions.reduce((qAcc: Record<string, { s: string; o: string[] }>, q: any) => {
      const word = q.options.find((o: string) => jsonData[0].word_list.some((w: VocabItem) => w.word === o)) || '';
      if (!word) return qAcc;
      const options = q.options.length > 0 ? q.options : q.question.question.includes('option:') ? q.question.question.split('option:')[1].split(',').map((o: string) => o.trim()) : [];
      return { ...qAcc, [word.toLowerCase()]: { s: q.question.question.replace('\\n', ' ').trim(), o: options } };
    }, {} as Record<string, { s: string; o: string[] }>),
  }), {} as Record<LevelKey, Record<string, { s: string; o: string[] }>>);
};

// ====================== Translation Support ======================
function langName(code: string | null, languages: { code: string; name: string }[]): string {
  const f = languages.find(l => l.code === code);
  return f ? f.name : '';
}

// ====================== Helpers ======================
const COLORS = {
  bg: 'bg-[#0F2A3D]',
  dim: 'opacity-50',
  button: 'bg-[#15A6FF]',
  buttonAlt: 'bg-[#2CD36F]',
};

const GRADS = [
  'bg-gradient-to-br from-pink-200 to-yellow-200',
  'bg-gradient-to-br from-sky-200 to-teal-100',
  'bg-gradient-to-br from-purple-200 to-rose-100',
  'bg-gradient-to-br from-green-200 to-lime-100',
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function useFemaleVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    function pick() {
      const voices = window.speechSynthesis.getVoices();
      const f = voices.filter(v => /female|woman|samantha|victoria|eva|zira|linda|google us english|google uk english/i.test(v.name + ' ' + v.lang));
      setVoice(f[0] || voices[0] || null);
    }
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  }, []);
  return voice;
}

function speak(text: string, voice: SpeechSynthesisVoice | null, rate = 1) {
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}


function AudioButton({ onClick, small = false }: { onClick: () => void; small?: boolean }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title='Listen' className={`rounded-full ${COLORS.button} hover:brightness-110 active:scale-95 flex items-center justify-center ${small ? 'w-8 h-8' : 'w-10 h-10'} shadow-lg`}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className={`${small ? 'w-4 h-4' : 'w-5 h-5'}`}>
        <path d='M3 10v4h4l5 5V5L7 10H3zm13.54-1.46a5 5 0 010 7.07l-1.41-1.41a3 3 0 000-4.24l1.41-1.42zm2.83-2.83a9 9 0 010 12.73l-1.41-1.41a7 7 0 000-9.9l1.41-1.42z'/>
      </svg>
    </button>
  );
}

function FlipHint() {
  return <div className='text-center text-sm text-white/90 mt-2'>Tap to flip for sentence, quote, and idiom</div>;
}


function CardFront({ item, level, onListenWord, gradIdx, lang, jsonData }: { item: VocabItem; level: LevelKey; onListenWord: () => void; gradIdx: number; lang: string | null; jsonData: JsonData[] }) {
  const [imageFailed, setImageFailed] = useState(false);
  const langLabel = langName(lang, jsonData[0]?.languages || []);
  console.log("CardFront props:", { item, lang, langLabel });
  return (
    <div className={`relative w-full h-full rounded-3xl p-3 shadow-2xl ${GRADS[gradIdx % GRADS.length]}`}>
      <div className='absolute left-3 top-3'><AudioButton onClick={onListenWord} /></div>
      <div className='h-full rounded-2xl bg-white/90 border border-white/70 shadow-inner overflow-hidden p-4 flex flex-col'>
        <div className='text-center mt-1 mb-2'>
          <div className='text-4xl font-bold text-slate-900'>{item.word}</div>
          {lang && item.translated_word && langLabel ? (
            <div className='text-lg mt-1 italic text-slate-700'>[{langLabel}] {item.translated_word}</div>
          ) : lang && !item.translated_word ? (
            <div className='text-sm mt-1 italic text-red-400 text-center mx-auto'>Translation not available</div>
          ) : null}
        </div>
        <div className="flex-1 flex items-center justify-center w-full h-[11rem]">
          {item.image && !imageFailed ? (
            <img
              src={item.image}
              alt={`${item.word} image`}
              className="max-w-full max-h-full rounded-2xl object-contain border border-slate-200 bg-white"
              onError={() => setImageFailed(true)}
            />
          // ) : (
          //   <div className="w-full h-full rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
          //     image placeholder
          //   </div>
          // )
          ):(
            <div className="w-full h-full rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900">
              {item.meaning ? (
                <p className="text-base px-4 text-center">{item.meaning}</p>
              ) : (
                <p className="text-base px-4 text-center text-slate-400"></p>
              )}
            </div>
          )}
          
        </div>
        <FlipHint />
      </div>
    </div>
  );
}
function CardBack({ item, level, onListenPart ,lang, jsonData}: { item: VocabItem; level: LevelKey; onListenPart: (t: string) => void ; lang: string | null; jsonData: JsonData[]}) {
  const langLabel = langName(lang, jsonData[0]?.languages || []);
  return (
    <div className={`relative w-full h-full rounded-3xl p-3 shadow-2xl ${GRADS[1]}`}>
      <div className='h-full rounded-2xl bg-white/90 border border-white/70 shadow-inner overflow-auto p-4 text-slate-900 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100 scrollbar-rounded scroll-smooth'>
        <div className='text-center mb-3'>
          <div className='text-3xl font-bold text-slate-900'>{item.word}</div>
        </div>
        <div className='space-y-4'>
          { item.meaning && (
            <section className='bg-white rounded-xl p-4 shadow'>
              <div className='flex items-center justify-between'><h4 className='font-semibold'>Meaning</h4><AudioButton small onClick={() => onListenPart(item.meaning || '')} /></div>
              <p className='text-base mt-2 '>{item.meaning || ''}</p>
               {lang && item.translated_meaning && langLabel ? (
            <div className='text-sm mt-1 italic text-blue-500'> {item.translated_meaning}</div>
          ) : lang && !item.translated_meaning ? (
            <div className='text-sm mt-1 italic text-red-400 text-center mx-auto'>Translation not available</div>
            // <LoaderCircle className="animate-spin w-4 h-4 text-center text-blue-500 mx-auto" />
            // <p>Translation not available</p>
          ) : null}
            </section>
          )}
          
          {item.sentence && (
            <section className='bg-white rounded-xl p-4 shadow'>
              <div className='flex items-center justify-between'><h4 className='font-semibold'>Sentence</h4><AudioButton small onClick={() => onListenPart(item.sentence || '')} /></div>
              <p className='text-base mt-2'>{item.sentence || 'No sentence available'}</p>
             {lang && item.translated_sentence && langLabel ? (
            <div className='text-sm mt-1 italic text-blue-500'> {item.translated_sentence}</div>
          ) : lang && !item.translated_sentence ? (
            <div className='text-sm mt-1 italic text-red-400 text-center mx-auto'>Translation not available</div>
            // <LoaderCircle className="animate-spin w-4 h-4 text-center text-blue-500 mx-auto" />
            // <p>Translation not available</p>
          ) : null}
            </section>
          )}
           
          {item.quote && (
            <section className='bg-white rounded-xl p-4 shadow'>
              <div className='flex items-center justify-between'><h4 className='font-semibold'>Quote</h4><AudioButton small onClick={() => onListenPart(item.quote || '')} /></div>
              <p className='text-base mt-2 whitespace-pre-wrap break-words'>{item.quote || 'No quote available'}</p>
             {lang && item.translated_quote && langLabel ? (
            <div className='text-sm mt-1 italic text-blue-500'> {item.translated_quote}</div>
          ) : lang && !item.translated_quote ? (
            <div className='text-sm mt-1 italic text-red-400 text-center mx-auto'>Translation not available</div>
            // <LoaderCircle className="animate-spin w-4 h-4 text-center text-blue-500 mx-auto" />
            // <p>Translation not available</p>
          ) : null}
            </section>
          )}
           
          {item.phrase && (
            <section className='bg-white rounded-xl p-4 shadow'>
              <div className='flex items-center justify-between'><h4 className='font-semibold'>Idiom / Phrase</h4><AudioButton small onClick={() => onListenPart(item.phrase && item.phraseMeaning ? `${item.phrase}. Meaning: ${item.phraseMeaning}` : item.phrase || '')} /></div>
              <p className='text-base mt-2'><span className='font-medium'>{item.phrase}</span>{item.phraseMeaning ? <> - <span>{item.phraseMeaning}</span></> : ' - '}</p>
            {lang && item.translated_phrase && langLabel ? (
            <div className='text-sm mt-1 italic text-blue-500'> {item.translated_phrase}</div>
          ) : lang && !item.translated_phrase ? (
            <div className='text-sm mt-1 italic text-red-400 text-center mx-auto'>Translation not available</div>
            // <LoaderCircle className="animate-spin w-4 h-4 text-center text-blue-500 mx-auto" />
            // <p>Translation not available</p>
          ) : null}
            </section>
          )}
            
        </div>
      </div>
    </div>
  );
}

// ====================== Review Models ======================
const REVIEW_LINES = ['Time to review!', 'Quick check time!', 'Let us recap these words!', 'Review round - ready?', 'Mini quiz time!', 'Your turn to show it!'];

type QBase = { id: string; type: string; prompt: string; wordsUsed: string[] };
// export type QFill = QBase & { type: 'fill'; sentence: string; correct: string; options: string[] };
// export type QMCQ = QBase & { type: 'mcq'; meaning: string; options: string[]; answer: string };
export type QFill = QBase & { type: 'fill'; sentence: string; correct: string; options: string[] };
export type QMCQ = QBase & { type: 'mcq'; meaning: string; options: string[]; answer: string };
export type QMatch = QBase & { type: 'match'; pairs: { word: string; meaning: string; translated_meaning :string|null;translated_word :string|null }[] };
type AnyQ = QFill | QMCQ | QMatch;

function buildFillFrom(target: VocabItem, level: LevelKey, dndOverrides: Record<LevelKey, Record<string, { s: string; o: string[] }>>): QFill | null {
  const ov = (dndOverrides[level] && dndOverrides[level][target.word.toLowerCase()]) || null;
  if (ov && ov.s && ov.o && ov.o.length >= 3) {
    const options = ov.o.slice(0, 3);
    if (!options.includes(target.word)) {
      return null;
    }
    return { id: 'fill-' + target.word, type: 'fill', prompt: 'Drag the correct word into the blank.', sentence: ov.s, correct: target.word, options, wordsUsed: options };
  }
  return null;
}

function buildMCQFrom(words: VocabItem[]): QMCQ {
  const target = shuffle(words)[0];
  const opts = shuffle([target.word, ...shuffle(words.filter(w => w.word !== target.word)).slice(0, 3).map(w => w.word)]).slice(0, 4);
  return { id: 'qmcq-' + target.word, type: 'mcq', prompt: 'Which word matches this meaning?', meaning: target.meaning || '', options: opts, answer: target.word, wordsUsed: opts };
}

function buildMatchFrom(words: VocabItem[]): QMatch {
  const shuffledWords = shuffle(words).slice(0, 4);
  const pairs = shuffledWords.map(w => ({ word: w.word, meaning: w.meaning || '',translated_meaning:w.translated_meaning || '',translated_word:w.translated_word || '' }));
  return {
    id: 'match-' + shuffledWords.map(w => w.word).join('-'),
    type: 'match',
    prompt: 'Match each word to its correct meaning.',                                                                                                        
    pairs,
    wordsUsed: pairs.map(p => p.word),
  };
}

function buildReview(slice: VocabItem[], level: LevelKey, dndOverrides: Record<LevelKey, Record<string, { s: string; o: string[] }>>): AnyQ[] {
  const pool = slice.slice();
  const total = 3 + (Math.random() < 0.5 ? 1 : 0);
  const out: AnyQ[] = [];
  const wordsCopy = shuffle(pool);

  for (let i = 0; i < total; i++) {
    const choice = Math.random() * 3;
    if (choice < 1 && wordsCopy[i % wordsCopy.length]) {
      const q = buildFillFrom(wordsCopy[i % wordsCopy.length], level, dndOverrides);
      out.push(q || buildMCQFrom(wordsCopy));
    } else if (choice < 2) {
      out.push(buildMCQFrom(wordsCopy));
    } else {
      out.push(buildMatchFrom(wordsCopy));
    }
  }

  return out;
}

// ====================== Review Views ======================
function QFillView({ q, onCorrect, onWrong }: { q: QFill; onCorrect: () => void; onWrong: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const hasCheckedRef = useRef(false);
console.log(hasCheckedRef,"hasCheckedRef")
  useEffect(() => {
    setPicked(null);
    setWrong(false);
    hasCheckedRef.current = false;
  }, [q.id]);

  useEffect(() => {
    if (picked && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      const isCorrect = picked.toLowerCase() === q.correct.toLowerCase();
      if (isCorrect) {
        onCorrect();
      } else {
        setWrong(true);
        onWrong();
      }
    }
  }, [picked, q.correct, onCorrect, onWrong]);

  function findIndex(sentence: string, word: string) {
    const s = sentence.toLowerCase();
    const w = word.toLowerCase();
    let i = s.indexOf(w);
    const isLetter = (ch: string) => /[a-z]/i.test(ch);
    while (i !== -1) {
      const before = i > 0 ? s[i - 1] : ' ';
      const after = i + w.length < s.length ? s[i + w.length] : ' ';
      if (!isLetter(before) && !isLetter(after)) return i;
      i = s.indexOf(w, i + 1);
    }
    return -1;
  }

  const placeholder = '___';
  const hole = q.sentence.indexOf(placeholder);
  const idx = hole >= 0 ? hole : findIndex(q.sentence, q.correct);
  const before = idx >= 0 ? q.sentence.slice(0, idx) : q.sentence;
  const after = idx >= 0 ? q.sentence.slice(idx + (hole >= 0 ? placeholder.length : q.correct.length)) : '';

  const allowDrop = (e: React.DragEvent) => e.preventDefault();
  function onDrop(e: React.DragEvent) {
    const newPicked = e.dataTransfer.getData('text/plain');
    setPicked(newPicked);
    setWrong(false);
    hasCheckedRef.current = false;
  }
 console.log('q.sentence',q.sentence)
 console.log('before',before)
 console.log('after',after)
  return (
    <div>
      <div className='mb-3 text-white/90'>
        <span>{before}</span>
        <span onDragOver={allowDrop} onDrop={onDrop} className='inline-flex items-center align-baseline'>
          <span className='mx-1 px-3 py-1 bg-white text-slate-800 rounded min-w-[120px] text-center inline-block'>{picked || '_____'} </span>
        </span>
        <span>{after}</span>
      </div>
      <div className='flex gap-2 flex-wrap'>
        {q.options.map(o => (
          <div key={o} draggable onDragStart={e => e.dataTransfer.setData('text/plain', o)} className='px-3 py-2 bg-white text-slate-800 rounded shadow cursor-grab'>
            {o}
          </div>
        ))}
      </div>
      {wrong && <div className='mt-3 text-amber-200 text-sm'>🙂 Try again!</div>}
    </div>
  );
}

function QMCQView({ q, onCorrect, onWrong }: { q: QMCQ; onCorrect: () => void; onWrong: () => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  console.log('i mced',choice)
  console.log('answer',q.answer)
  function pick(o: string) {
    setChoice(o);
    setWrong(false);
    if (o === q.answer) onCorrect();
    else {
      setWrong(true);
      onWrong();
    }
  }
  return (
    <div>
      <div className='mb-4'>Meaning: <span className='font-medium'>{q.meaning}</span></div>
      <div className='grid grid-cols-2 gap-2'>
        {q.options.map((o, i) => (
          <button key={o} onClick={() => pick(o)} className={`px-3 py-2 rounded bg-white text-slate-800 text-left hover:brightness-95 ${choice === o ? 'ring-2 ring-emerald-400' : ''}`}>
            <span className='mr-2 font-mono'>{String.fromCharCode(65 + i)}.</span> {o}
          </button>
        ))}
      </div>
      {wrong && <div className='mt-3 text-amber-200 text-sm'>🙂 Try again!</div>}
    </div>
  );
}

function QMatchView({ q, onCorrect, onWrong }: { q: QMatch; onCorrect: () => void; onWrong: () => void }) {
  const [matches, setMatches] = useState<Record<string, string | null>>(() =>
    q.pairs.reduce((acc, p) => ({ ...acc, [p.meaning]: null }), {} as Record<string, string | null>)
  );
  const [wrong, setWrong] = useState(false);
  const hasCheckedRef = useRef(false);
  // const allWords = q.pairs.map(p =>  p.translated_word,p.word);
  const allWords = q.pairs.map(p => [p.translated_word, p.word]);
  const availableWords = shuffle(allWords.filter(w => !Object.values(matches).includes(w[1])));

  useEffect(() => {
    if (Object.values(matches).every(w => w !== null) && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      const allCorrect = q.pairs.every(p => matches[p.meaning] === p.word);
      if (allCorrect) {
        onCorrect();
      } else {
        setWrong(true);
        onWrong();
      }
    }
    console.log(q,"q")
  }, [matches, q.pairs, onCorrect, onWrong]);

  const allowDrop = (e: React.DragEvent) => e.preventDefault();
  function onDrop(meaning: string, word: string) {
    setMatches(prev => {
      const newMatches = { ...prev, [meaning]: word };
      return newMatches;
    });
    setWrong(false);
    hasCheckedRef.current = false;
  }
  function clearMatch(meaning: string) {
    setMatches(prev => ({ ...prev, [meaning]: null }));
    setWrong(false);
    hasCheckedRef.current = false;
  }

  return (
    <div>
      <div className='mb-4'>Match the words to their meanings:</div>
      <div className='space-y-3'>
        {q.pairs.map(p => (
          <div key={p.meaning} className='flex items-center gap-3'>
            <div className='flex-1 bg-white/10 p-2 rounded text-white'>{p.meaning}
            {p.translated_meaning?(<p className='text-[12px] text-yellow-400'style={{color:'skyblue'}}>{p.translated_meaning}</p>):''}</div>
            <div
              onDragOver={allowDrop}
              onDrop={(e) => onDrop(p.meaning, e.dataTransfer.getData('text/plain'))}
              className='w-32 px-3 py-2 bg-white text-slate-800 rounded shadow min-h-[40px] text-center flex items-center justify-between'
            >
              <span>{matches[p.meaning] || 'Drop word'}</span>
              {matches[p.meaning] && (
                <button
                  onClick={() => clearMatch(p.meaning)}
                  className='ml-2 text-red-600 hover:text-red-800'
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* <div className='flex gap-2 flex-wrap mt-4'>
        {availableWords.map(w => (
          <div
            key={w[1]}
            draggable
            onDragStart={e => e.dataTransfer.setData('text/plain', w)}
            className='px-3 py-2 bg-white text-slate-800 rounded shadow cursor-grab'
          >
            {w[1]}
            {w[0]?.length>0?(<p className='text-[12px] text-yellow-400'style={{color:'yellow'}}>{w[0]}</p>):''}</div>
          </div>
        ))}
      </div> */}
      <div className="flex gap-2 flex-wrap mt-4">
  {availableWords.map(w => (
    <div
      key={w[1]}
      draggable
      onDragStart={e => e.dataTransfer.setData('text/plain', w[1]|| '')}
      className="px-3 py-2 bg-white text-slate-800 rounded shadow cursor-grab"
    >
      {w[1]}
      {w[0] && w[0]?.length > 0 ? (
        <p className="text-[12px]" style={{ color: 'skyblue' }}>
          {w[0]}
        </p>
      ):''}
    </div>
  ))}
</div>

      {wrong && <div className='mt-3 text-amber-200 text-sm'>🙂 Try again!</div>}
    </div>
  );
}

function ReviewSheet({ items, lang, onClose, jsonData }: { items: VocabItem[]; lang?: string | null; onClose: () => void; jsonData: JsonData[] }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const voice = useFemaleVoice();
  const cur = items[i];
  const listen = (t: string) => speak(t, voice, 0.98);
  return (
    <div className='fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4'>
      <div className='bg-[#183F5D] text-white rounded-2xl p-5 w-full max-w-5xl shadow-2xl'>
        <div className='flex items-center justify-between mb-3'><h4 className='text-lg font-semibold'>Review words</h4><button onClick={onClose} className='text-white/80'>✕</button></div>
        <div className='relative h-[44vh]'>
          <div className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[85%] md:w-[50%] h-[90%] perspective-1000'>
            <div className={`relative w-full h-full transition-transform duration-800 ease-in-out transform-style-preserve-3d ${flip ? 'rotate-y-180' : ''}`}>
              <div className='absolute w-full h-full backface-hidden'>
                <CardFront item={cur} level={'Elementary'} onListenWord={() => listen(cur.word)} gradIdx={i} lang={lang || null} jsonData={jsonData} />
              </div>
              <div className='absolute w-full h-full backface-hidden rotate-y-180'>
                <CardBack item={cur} level={'Elementary'} onListenPart={listen} lang={lang || null} jsonData={jsonData}/>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-between mt-3'>
          <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className='px-3 py-2 rounded bg-white/80 text-slate-900 disabled:opacity-50'>Prev</button>
          <div>{i + 1}/{items.length}</div>
          <button onClick={() => setI(Math.min(items.length - 1, i + 1))} disabled={i === items.length - 1} className='px-3 py-2 rounded bg-white/80 text-slate-900 disabled:opacity-50'>Next</button>
        </div>
        <div className='text-right mt-3'>
          <button onClick={onClose} className={`px-4 py-2 rounded-full ${COLORS.buttonAlt} text-white`}>Done reviewing</button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ slice, level, lang, onClose, jsonData, categoryId, setJsonData }: { slice: VocabItem[]; level: LevelKey; lang: string | null; onClose: () => void; jsonData: JsonData[], categoryId: number, setJsonData: React.Dispatch<React.SetStateAction<JsonData[]>> }) {
  const [queue] = useState(() => buildReview(slice, level, buildDNDOverrides(jsonData)));
  const [idx, setIdx] = useState(0);
  const [ok, setOk] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [showSheet, setShowSheet] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const isCompletedRef = useRef<boolean>(false);

  function submitQuizAttempts(status: 'inprogress' | 'completed') {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000).toString();
    const formData = new FormData();
    formData.append('time_spent', timeSpent);
    formData.append('status', status);
    formData.append('set_id', (jsonData[0]?.set || 0).toString());
    formData.append('category_id', categoryId.toString());

    if (typeof window.submitTimeSpent === 'function') {
      window.submitTimeSpent(formData);
      console.log(`Quiz submission (${status}):`, {
        time_spent: timeSpent,
        status,
        set_id: jsonData[0]?.set || 0,
        category_id: categoryId
      });
    } else {
      console.log(`Quiz time spent (${status}):`, {
        time_spent: timeSpent,
        status,
        set_id: jsonData[0]?.set || 0,
        category_id: categoryId
      });
    }
  }

  async function markSetAsCompleted(setId: number, categoryId: number) {
    const formData = new FormData();
    formData.append('set_id', setId.toString());
    formData.append('category_id', categoryId.toString());
    //  formData.append('set_id', setId.toString());
    formData.append('is_completed', 'true');

    if (typeof window.submitSetCompletion === 'function') {
      try {
        const response = await window.submitSetCompletion(formData);
        console.log("✅ Set marked as completed:", response);
        setJsonData(prev => [{
          ...prev[0],
          is_completed: true
        }]);
      } catch (err) {
        console.error("❌ Error marking set as completed:", err);
      }
    } else {
      console.warn("⚠️ submitSetCompletion is not defined on window");
      console.log('set_id',setId.toString(),'category_id', categoryId.toString())
      setJsonData(prev => [{
        ...prev[0],
        is_completed: true
      }]);
    }
  }

  function next() {
    const isLastQuiz = idx === queue.length - 1;

    setOk(false);
    setWrongCount(0);

    if (isLastQuiz) {
      isCompletedRef.current = true;
      submitQuizAttempts('completed');
      // markSetAsCompleted(jsonData[0]?.set || 0);
      // markSetAsCompleted(jsonData[0]?.set || 0, categoryId)
      markSetAsCompleted(jsonData[0]?.set || 0, categoryId);
      onClose();
    } else {
      setIdx(idx + 1);
    }
  }

  function handleWrong() {
    setWrongCount(c => c + 1);
  }

  const cur = queue[idx];
  const isLastQuiz = idx === queue.length - 1;
console.log(cur,"curcurcur")
  return (
    <div className='absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl rounded-2xl p-5 shadow-xl bg-[#183F5D] text-white'>
        <div className='flex items-center justify-between mb-1'>
          <h3 className='text-xl font-semibold'>{shuffle(REVIEW_LINES)[0]}</h3>
          <button onClick={() => {
            if (!isCompletedRef.current) {
              submitQuizAttempts('inprogress');
            }
            onClose();
          }} className='text-white/70 hover:text-white'>✕</button>
        </div>
        <p className='text-sm mb-3 opacity-80'>{cur.prompt}</p>
        <div className='bg-white/5 rounded-xl p-4 min-h-[260px]'>
          {cur.type === 'fill' && <QFillView q={cur as QFill} onCorrect={() => { setOk(true); }} onWrong={() => { setOk(false); handleWrong(); }} />}
          {cur.type === 'mcq' && <QMCQView q={cur as QMCQ} onCorrect={() => { setOk(true); }} onWrong={() => { setOk(false); handleWrong(); }} />}
          {cur.type === 'match' && <QMatchView q={cur as QMatch} onCorrect={() => { setOk(true); }} onWrong={() => { setOk(false); handleWrong(); }} />}
        </div>
        <div className='flex justify-between items-center mt-3'>
          <div>
            {wrongCount >= 2 && !ok && (
              <button onClick={() => setShowSheet(true)} className={`px-3 py-1 rounded ${COLORS.button} text-white`}>Review words</button>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-3'>
              {ok && (
                <>
                  <span className='text-2xl'>😊</span>
                  <span className='text-yellow-300 text-2xl'>★★★★★</span>
                </>
              )}
              <button
                onClick={next}
                disabled={!ok}
                className={`px-4 py-2 rounded-full ${ok ? COLORS.buttonAlt : 'bg-gray-200/50 text-gray-600 cursor-not-allowed'} text-white font-semibold`}
              >
                {isLastQuiz ? 'Submit' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showSheet && <ReviewSheet items={slice} lang={lang} onClose={() => { setShowSheet(false); setWrongCount(0); }} jsonData={jsonData} />}
    </div>
  );
}


// ====================== Date Helpers ======================
function LanguageBanner({ 
  lang, 
  onSet, 
  jsonData, 
  categoryId, 
  setJsonData, 
  setData, 
  setOpen, 
  hasPracticedAgain, 
  setIsLanguageLoading,
  isLanguageLoading
}: { 
  lang: string | null; 
  onSet: (code: string) => void; 
  jsonData: JsonData[]; 
  categoryId: number; 
  setJsonData: React.Dispatch<React.SetStateAction<JsonData[]>>; 
  setData: React.Dispatch<React.SetStateAction<Dataset>>; 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hasPracticedAgain: boolean;
  setIsLanguageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLanguageLoading: boolean;
}) {
  const [v, setV] = useState(lang || jsonData[0]?.languages[0]?.code || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (hasPracticedAgain) {
      setOpen(true);
      return;
    }
    setError(null);
    if (!jsonData[0]?.languages?.some(lng => lng.code === v)) {
      setError(`Invalid language code: ${v}`);
      return;
    }
    setIsLanguageLoading(true);
    onSet(v);
    const languageName = langName(v, jsonData[0]?.languages || []) || 'Unknown';
    const formData = new FormData();
    formData.append('translate_code', v);
    formData.append('language', languageName);
    formData.append('is_translated', "true");
    formData.append('set_id', (jsonData[0]?.set || 1).toString());
    formData.append('category_id', categoryId.toString());

    if (typeof window.checkToolSubmit === 'function') {
      try {
        const response = await window.checkToolSubmit(formData);
        console.log("✅ Language save response:", response);
        const newJsonData = initializeJsonData(response);
        setJsonData(newJsonData);
        setData(initializeData(newJsonData));
      } catch (err) {
        console.error("❌ Error saving language:", err);
        setError("Failed to save language. Please try again.");
      } finally {
        setIsLanguageLoading(false);
      }
    } else {
      console.warn("⚠️ checkToolSubmit is not defined on window");
      setError("Language saving is not available.");
      setIsLanguageLoading(false);
    }
  };

  return (
    <div className="bg-white/10 text-slate-100 rounded-xl p-4 shadow-xl border border-slate-700 max-w-sm w-full">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">Choose translation language</h2>
      </div>
      <p className="text-xs text-slate-400 mb-3 leading-snug">
        This will be shown on flip and on word/meaning. Audio remains <span className="font-medium text-slate-200">English</span>.
      </p>
      <div className="flex gap-2 items-center justify-center mx-auto">
        {jsonData[0]?.languages?.length > 0 ? (
          <select
            className="border max-h-[300px] overflow-auto border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white/70 text-black flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={v}
            onChange={(e) => {
              if (!isLanguageLoading) {
                setV(e.target.value);
                e.currentTarget.size = 1;
                e.currentTarget.blur();
              }
            }}
            onFocus={(e) => !isLanguageLoading && (e.currentTarget.size = 5)}
            onBlur={(e) => (e.currentTarget.size = 1)}
            disabled={isLanguageLoading}
          >
            {jsonData[0].languages.map((lng: { code: string; name: string }) => (
              <option key={lng.code} value={lng.code}>
                {lng.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-slate-400">No languages available</p>
        )}
        <button
          onClick={handleSave}
          disabled={!jsonData[0]?.languages?.length || !v || isLanguageLoading}
          className={`flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-md shadow transition ${
            jsonData[0]?.languages?.length && v && !isLanguageLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>
      {error && <div className="mt-2 text-red-400 text-xs">{error}</div>}
    </div>
  );
}

// function istDateKey(): string {
//   const now = new Date();
//   const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
//   return fmt.format(now);
// }

declare global {
  interface Window {
    submitTimeSpent: (formData: FormData) => void;
    checkToolSubmit: (formData: FormData) => Promise<any>;
    submitSetCompletion: (formData: FormData) => Promise<any>;
  }
}

// ====================== Main ======================
interface VocabToolProps {
toolData: {
    category_id?: number; // Explicitly optional
    words_data: any[];
    categories: Category[];
    languages: { code: string; name: string }[];
  };
}

// Inside VocabTool component
// Inside VocabTool component
export default function VocabTool({ toolData }: VocabToolProps) {
  console.log("Received VocabTool tool data:", toolData);

  const [jsonData, setJsonData] = useState<JsonData[]>(() => initializeJsonData(toolData));
  const [data, setData] = useState<Dataset>(() => initializeData(jsonData));
  const [active, setActive] = useState<LevelKey>(() => {
    const savedCategory = localStorage.getItem('lastCategoryName');
    const categories = jsonData[0]?.categories || [];
    return savedCategory && categories.some((cat: Category) => cat.name === savedCategory)
      ? savedCategory
      : jsonData[0]?.categories[0]?.name || 'Elementary';
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [listened, setListened] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [queue, setQueue] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewSlice, setReviewSlice] = useState<VocabItem[] | null>(null);
  const [langByLevel, setLangByLevel] = useState<Record<LevelKey, string | null>>(() => {
    return jsonData[0]?.categories.reduce((acc: Record<LevelKey, string | null>, cat: Category) => ({
      ...acc,
      [cat.name]: null,
    }), {} as Record<LevelKey, string | null>) || {};
  });
  const [dailyLimitReached, setDailyLimitReached] = useState(jsonData[0]?.is_completed || false);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(() => {
    const savedCategoryId = localStorage.getItem('lastCategoryId');
    const categories = jsonData[0]?.categories || [];
    return savedCategoryId && categories.some((cat: Category) => cat.id === parseInt(savedCategoryId))
      ? parseInt(savedCategoryId)
      : jsonData[0]?.categories[0]?.id || 0;
  });
  const [hideCategories, setHideCategories] = useState<boolean>(jsonData[0]?.is_completed || false); // Initialize based on is_completed
  const [open, setOpen] = useState(false);
  const [hasPracticedAgain, setHasPracticedAgain] = useState(false);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Sync hideCategories with is_completed
  useEffect(() => {
    setHideCategories(jsonData[0]?.is_completed || hasPracticedAgain); // Include hasPracticedAgain to keep categories hidden
  }, [jsonData[0]?.is_completed, hasPracticedAgain]);

  // Save category to localStorage
  useEffect(() => {
    localStorage.setItem('lastCategoryName', active);
    localStorage.setItem('lastCategoryId', currentCategoryId.toString());
  }, [active, currentCategoryId]);

  // Submit vocab attempts
  const submitVocabAttempts: () => void = () => {
    if (jsonData[0]?.is_completed) return;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000).toString();
    const formData = new FormData();
    formData.append('time_spent', timeSpent);
    formData.append('status', 'inprogress');
    formData.append('set_id', (jsonData[0]?.set || 0).toString());
    formData.append('category_id', currentCategoryId.toString());
    formData.append('category_name', active);

    if (typeof window.submitTimeSpent === 'function') {
      window.submitTimeSpent(formData);
      console.log('Vocab submission (inprogress):', {
        time_spent: timeSpent,
        status: 'inprogress',
        set_id: jsonData[0]?.set || 0,
        category_id: currentCategoryId,
        category_name: active
      });
    } else {
      console.log('Vocab time spent (inprogress):', {
        time_spent: timeSpent,
        status: 'inprogress',
        set_id: jsonData[0]?.set || 0,
        category_id: currentCategoryId,
        category_name: active
      });
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Handle Rails close button
  useEffect(() => {
    const closeButton = document.getElementById('closing-btn-in-rails');
    if (closeButton) {
      const handleClose = () => {
        localStorage.removeItem('lastCategoryId');
        localStorage.removeItem('lastCategoryName');
        if (!jsonData[0]?.is_completed) {
          submitVocabAttempts();
        }
        const backendCategoryId = toolData?.category_id;
        const categories = jsonData[0]?.categories || [];
        if (backendCategoryId && categories.some((cat: Category) => cat.id === backendCategoryId)) {
          const selectedCategory = categories.find((cat: Category) => cat.id === backendCategoryId);
          if (selectedCategory) {
            setActive(selectedCategory.name);
            setCurrentCategoryId(backendCategoryId);
          } else {
            const defaultCategory = categories[0]?.name || 'Elementary';
            const defaultCategoryId = categories[0]?.id || 0;
            setActive(defaultCategory);
            setCurrentCategoryId(defaultCategoryId);
          }
        } else {
          const defaultCategory = categories[0]?.name || 'Elementary';
          const defaultCategoryId = categories[0]?.id || 0;
          setActive(defaultCategory);
          setCurrentCategoryId(defaultCategoryId);
        }
      };
      closeButton.addEventListener('click', handleClose);
      return () => {
        closeButton.removeEventListener('click', handleClose);
      };
    } else {
      console.warn('⚠️ Rails close button (#closing-btn-in-rails) not found in DOM');
    }
  }, [jsonData, currentCategoryId, toolData, submitVocabAttempts]);

  // Fetch next set when is_completed changes
  useEffect(() => {
    const fetchNextSet = async () => {
      if (jsonData[0]?.is_completed && jsonData[0]?.set !== null && !hasPracticedAgain) {
        const nextSetId = jsonData[0].set + 1;
        const formData = new FormData();
        formData.append('set_id', nextSetId.toString());
        formData.append('category_id', currentCategoryId.toString());
        if (langByLevel[active]) {
          formData.append('translate_code', langByLevel[active]!);
          formData.append('is_translated', "true");
        }
        if (typeof window.checkToolSubmit === 'function') {
          try {
            setIsLanguageLoading(true);
            const response = await window.checkToolSubmit(formData);
            console.log("✅ Fetched next set:", response);
            const newJsonData = initializeJsonData(response);
            setJsonData(newJsonData);
            setData(initializeData(newJsonData));
            const categories = newJsonData[0]?.categories || [];
            const backendCategoryId = toolData?.category_id || response?.category_id;
            if (backendCategoryId && categories.some((cat: Category) => cat.id === backendCategoryId)) {
              const selectedCategory = categories.find((cat: Category) => cat.id === backendCategoryId);
              if (selectedCategory) {
                setActive(selectedCategory.name);
                setCurrentCategoryId(backendCategoryId);
              } else {
                const defaultCategory = categories[0]?.name || 'Elementary';
                const defaultCategoryId = categories[0]?.id || 0;
                setActive(defaultCategory);
                setCurrentCategoryId(defaultCategoryId);
              }
            } else {
              const savedCategory = localStorage.getItem('lastCategoryName');
              const savedCategoryId = localStorage.getItem('lastCategoryId');
              if (savedCategory && categories.some((cat: Category) => cat.name === savedCategory)) {
                setActive(savedCategory);
                setCurrentCategoryId(parseInt(savedCategoryId || '0'));
              } else {
                const defaultCategory = categories[0]?.name || 'Elementary';
                const defaultCategoryId = categories[0]?.id || 0;
                setActive(defaultCategory);
                setCurrentCategoryId(defaultCategoryId);
              }
            }
            setDailyLimitReached(newJsonData[0]?.is_completed || false);
            setHideCategories(newJsonData[0]?.is_completed || hasPracticedAgain); // Keep categories hidden if practiced again
          } catch (err) {
            console.error("❌ Error fetching next set:", err);
            setJsonData([{ set: null, is_completed: false, word_list: [], questions: [], categories: [], is_translated: false, languages: [] }]);
            setData({});
            setDailyLimitReached(false);
            setHideCategories(false);
          } finally {
            setIsLanguageLoading(false);
          }
        } else {
          console.warn("⚠️ checkToolSubmit is not defined on window");
        }
      } else {
        setData(initializeData(jsonData));
        const categories = jsonData[0]?.categories || [];
        const backendCategoryId = toolData?.category_id;
        if (backendCategoryId && categories.some((cat: Category) => cat.id === backendCategoryId)) {
          const selectedCategory = categories.find((cat: Category) => cat.id === backendCategoryId);
          if (selectedCategory) {
            setActive(selectedCategory.name);
            setCurrentCategoryId(backendCategoryId);
          } else {
            const defaultCategory = categories[0]?.name || 'Elementary';
            const defaultCategoryId = categories[0]?.id || 0;
            setActive(defaultCategory);
            setCurrentCategoryId(defaultCategoryId);
          }
        } else {
          const savedCategory = localStorage.getItem('lastCategoryName');
          const savedCategoryId = localStorage.getItem('lastCategoryId');
          if (savedCategory && categories.some((cat: Category) => cat.name === savedCategory)) {
            setActive(savedCategory);
            setCurrentCategoryId(parseInt(savedCategoryId || '0'));
          } else {
            const defaultCategory = categories[0]?.name || 'Elementary';
            const defaultCategoryId = categories[0]?.id || 0;
            setActive(defaultCategory);
            setCurrentCategoryId(defaultCategoryId);
          }
        }
        setDailyLimitReached(jsonData[0]?.is_completed || false);
        setHideCategories(jsonData[0]?.is_completed || hasPracticedAgain); // Keep categories hidden if practiced again
      }
      setIndex(0);
      setFlipped(false);
      setListened(new Set());
      setCompleted(new Set());
      setQueue([]);
      setShowReview(false);
      setReviewSlice(null);
    };

    fetchNextSet();
  }, [toolData, jsonData[0]?.is_completed]);

  const handleCategoryChange = async (cat: Category) => {
    console.log({ id: cat.id, name: cat.name });
    if (!jsonData[0]?.is_completed) {
      submitVocabAttempts();
    }
    const formData = new FormData();
    formData.append('category_id', cat.id.toString());
    formData.append('category_name', cat.name);
    if (langByLevel[cat.name]) {
      formData.append('translate_code', langByLevel[cat.name]!);
      formData.append('is_translated', "true");
    }
    if (typeof window.checkToolSubmit === 'function') {
      try {
        setIsLanguageLoading(true);
        const response = await window.checkToolSubmit(formData);
        console.log("✅ response from checkToolSubmit for category:", response);
        const newJsonData = initializeJsonData(response);
        setJsonData(newJsonData);
        setData(initializeData(newJsonData));
        setCurrentCategoryId(cat.id);
        setDailyLimitReached(newJsonData[0]?.is_completed || false);
        setHideCategories(newJsonData[0]?.is_completed || hasPracticedAgain); // Keep categories hidden if practiced again
      } catch (err) {
        console.error("❌ Error in checkToolSubmit for category:", err);
        setJsonData([{ set: null, is_completed: false, word_list: [], questions: [], categories: [], is_translated: false, languages: [] }]);
        setData({});
        setDailyLimitReached(false);
        setHideCategories(false);
      } finally {
        setIsLanguageLoading(false);
      }
    } else {
      console.warn("⚠️ checkToolSubmit is not defined on window");
      setJsonData([{ set: null, is_completed: false, word_list: [], questions: [], categories: [], is_translated: false, languages: [] }]);
      setData({});
      setDailyLimitReached(false);
      setHideCategories(false);
    }
    setActive(cat.name);
    setIndex(0);
    setFlipped(false);
    setListened(new Set());
    setCompleted(new Set());
    setQueue([]);
    setShowReview(false);
    setReviewSlice(null);
  };

  const chosenLang = langByLevel[active] || null;
  const voice = useFemaleVoice();
  const list = data[active] || [];
  const current = list[index];
  const prev = list[index - 1];

  function markListened(i: number) { setListened(s => new Set(s).add(i)); }

  function advance() {
    if (jsonData[0]?.is_completed) {
      setDailyLimitReached(true);
      setHideCategories(true); // Ensure categories remain hidden
      return;
    }

    if (!listened.has(index)) return;
    const willCount = listened.has(index) && !completed.has(index);
    const nextQueue = willCount ? [...queue, index] : queue.slice();
    const nextCompleted = new Set(completed);
    if (willCount) nextCompleted.add(index);

    // if (nextQueue.length > 0 && nextQueue.length % 8 === 0) {
    if (index === list.length - 1 && !showReview) {
      // const slice = nextQueue.slice(-8).map(i => list[i]).filter(Boolean) as VocabItem[];
      const slice = nextQueue.map(i => list[i]).filter(Boolean) as VocabItem[];
      // if (slice.length === 8) {
      if (slice.length > 0) {
        setReviewSlice(slice);
        setShowReview(true);
      }
    }

    setCompleted(nextCompleted);
    setQueue(nextQueue);
    setFlipped(false);
    if (index < list.length - 1) setIndex(index + 1);
  }

  function back() {
    if (index > 0) {
      setIndex(index - 1);
      setFlipped(false);
    }
  }

  if (!current) return <div className={`${COLORS.bg} min-h-screen text-white flex items-center justify-center`}>No data available.</div>;

  const listenWord = () => { speak(current.word, voice, 0.95); markListened(index); };
  const listenPart = (t: string) => { speak(t, voice, 0.98); markListened(index); };

  const gradIdx = index % GRADS.length;
  const canAdvance = listened.has(index) && !jsonData[0]?.is_completed;

  return (
    <div className={`${COLORS.bg} max-h-[82vh] w-full p-2 sm:p-4 md:p-8 text-white rounded-md relative overflow-auto scrollbar-hidden`}>
      <style>
        {`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .scrollbar-hidden::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hidden {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @media (max-width: 640px) {
            .card-container {
              height: 50vh;
            }
          }
          @media (min-width: 641px) and (max-width: 768px) {
            .card-container {
              height: 50vh;
            }
          }
          @media (min-width: 769px) {
            .card-container {
              height: 50vh;
            }
          }
        `}
      </style>
      <div className='max-w-4xl mx-auto'>
        {isLanguageLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-50 rounded-lg">
            <LoaderCircle className="animate-spin w-6 h-6 text-blue-500" />  <pre className='font-semibold'> Loading your data...</pre>
          </div>
        )}
        <div className='mb-4 text-center'></div>
        <div className='flex items-center justify-between mb-3 gap-2 flex-wrap'>
          {/* Conditionally render category selection only if hideCategories is false */}
          {!hideCategories && (
            <>
              <div className='lg:hidden flex w-full gap-2 justify-start items-center'>
                <select
                  className='border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white/70 text-black w-1/2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                  value={active}
                  onChange={(e) => {
                    if (!isLanguageLoading) {
                      const selectedCategory = jsonData[0]?.categories.find((cat: Category) => cat.name === e.target.value);
                      if (selectedCategory) {
                        handleCategoryChange(selectedCategory);
                      }
                    }
                  }}
                  disabled={isLanguageLoading}
                >
                  {jsonData[0]?.categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {index === 0 && !chosenLang && !jsonData[0]?.is_completed && (
                  <div className='w-1/2'>
                    <LanguageBanner
                      lang={chosenLang}
                      jsonData={jsonData}
                      categoryId={currentCategoryId}
                      onSet={(code) => setLangByLevel((prev) => ({ ...prev, [active]: code }))}
                      setJsonData={setJsonData}
                      setData={setData}
                      setOpen={setOpen}
                      hasPracticedAgain={hasPracticedAgain}
                      setIsLanguageLoading={setIsLanguageLoading}
                      isLanguageLoading={isLanguageLoading}
                    />
                  </div>
                )}
              </div>
              <div className='hidden md:hidden lg:flex gap-2 flex-wrap'>
                {jsonData[0]?.categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    onClick={() => !isLanguageLoading && handleCategoryChange(cat)}
                    className={`px-3 py-1.5 text-sm rounded-full ${
                      active === cat.name ? 'bg-[#FF8652]' : 'bg-white/10 hover:bg-white/20'
                    } ${isLanguageLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={isLanguageLoading}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className='flex items-center justify-between mb-3 gap-2 flex-wrap'>
          {index === 0 && !chosenLang && !jsonData[0]?.is_completed && !hideCategories && (
            <div className='hidden lg:block w-full sm:w-[280px] absolute top-4 right-4 sm:right-4 z-50'>
              <LanguageBanner
                lang={chosenLang}
                jsonData={jsonData}
                categoryId={currentCategoryId}
                onSet={(code) => setLangByLevel((prev) => ({ ...prev, [active]: code }))}
                setJsonData={setJsonData}
                setData={setData}
                setOpen={setOpen}
                hasPracticedAgain={hasPracticedAgain}
                setIsLanguageLoading={setIsLanguageLoading}
                isLanguageLoading={isLanguageLoading}
              />
            </div>
          )}
        </div>

        {open && (
          <div
            className='absolute inset-0 bg-black/40 flex items-center justify-center z-50'
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <div className='relative bg-yellow-50 border-l-4 border-yellow-400 rounded-2xl shadow-xl w-11/12 sm:w-80 p-5 animate-fadeIn'>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                className='absolute top-2 right-2 text-gray-500 hover:text-gray-800'
              >
                <X size={20} />
              </button>
              <div className='flex items-start space-x-3'>
                <svg
                  className='h-6 w-6 text-yellow-500 flex-shrink-0 mt-1'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v2m0 4h.01M12 5h.01M12 20a8 8 0 100-16 8 8 0 000 16z' />
                </svg>
                <div>
                  <h3 className='text-base font-semibold text-yellow-800'>
                    Daily Limit Reached
                  </h3>
                  <p className='mt-1 text-sm text-yellow-700'>
                    You’ve reached today’s limit. Please come back tomorrow for more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='w-full h-full'>
          {dailyLimitReached && (
            <div className='absolute inset-0 bg-black/80 flex items-center justify-center z-50'>
              <div className='text-center text-amber-200 text-base sm:text-lg font-semibold px-4'>
                Daily limit is over. Come back tomorrow to practice another set!
              </div>
             <button
  onClick={() => {
    if (!jsonData[0]?.is_completed) {
      submitVocabAttempts();
    }
    setJsonData(prev => [{ ...prev[0], is_completed: false }]);
    setHideCategories(true);
    setShowReview(false);
    setDailyLimitReached(false);
    setHasPracticedAgain(true);
    setIndex(0);
    setFlipped(false);
    setListened(new Set());
    setCompleted(new Set());
    setQueue([]);
    setReviewSlice(null);
  }}
  className='absolute bottom-6 sm:bottom-8 mt-4 px-4 py-2 rounded-full bg-[#2CD36F] text-white font-semibold hover:brightness-110 active:scale-95 text-sm sm:text-base'
>
  Practice Again
</button>
            </div>
          )}
          <div className='relative card-container'>
            {prev && (
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[80vw] sm:w-[280px] md:w-[320px] h-[80%] sm:h-[85%] rounded-3xl ${COLORS.dim}`}>
                <div className='w-full h-full rounded-3xl overflow-hidden'>
                  <div className='w-full h-full p-2 sm:p-3'>
                    <div className={`w-full h-full rounded-3xl ${GRADS[(gradIdx + 3) % GRADS.length]} shadow-xl border border-white/20 flex items-center justify-center text-white/90 text-lg sm:text-xl`}>
                      {prev.word}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[90vw] sm:w-[80vw] md:w-[45%] h-[80%] sm:h-[85%] perspective-1000'>
              <div 
                className={`relative w-full h-full transition-transform duration-800 ease-in-out transform-style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`} 
                onClick={() => !isLanguageLoading && setFlipped(!flipped)}
              >
                <div className='absolute w-full h-full backface-hidden'>
                  <CardFront item={current} level={active} onListenWord={listenWord} gradIdx={gradIdx} lang={chosenLang} jsonData={jsonData} />
                </div>
                <div className='absolute w-full h-full backface-hidden rotate-y-180'>
                  <CardBack item={current} level={active} onListenPart={listenPart} lang={chosenLang} jsonData={jsonData} />
                </div>
              </div>
            </div>
          </div>
          <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-2 w-full sm:w-auto'>
              <div className='w-48 sm:w-64 md:w-72 h-2 rounded-full bg-white/20 overflow-hidden'>
                <div className='h-full bg-white/80' style={{ width: `${((index + 1) / list.length) * 100}%` }} />
              </div>
              <div className='text-xs opacity-80'>{index + 1}/{list.length}</div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={back}
                disabled={index === 0}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center rounded-full text-xl sm:text-2xl font-bold transition-all duration-300 ease-in-out ${
                  index === 0
                    ? 'bg-gray-200/50 text-gray-600 cursor-not-allowed border-gray-300/50'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:from-gray-200 hover:to-gray-300 cursor-pointer border-gray-400'
                } border shadow-md hover:shadow-xl active:scale-95 disabled:scale-100`}
              >
                ←
              </button>
              <button
                onClick={advance}
                disabled={!canAdvance}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center rounded-full text-xl sm:text-2xl font-bold transition-all duration-300 ease-in-out ${
                  canAdvance
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:from-gray-200 hover:to-gray-300 cursor-pointer border-gray-400'
                    : 'bg-gray-200/50 text-gray-600 cursor-not-allowed border-gray-300/50'
                } border shadow-md hover:shadow-xl active:scale-95 disabled:scale-100`}
              >
                →
              </button>
            </div>
          </div>
          {!listened.has(index) && (
            <div className='mt-2 text-center text-amber-200 text-sm'>Listen to any audio to move forward</div>
          )}
          <div className='mt-3 text-xs opacity-80'>Completed this set: {queue.length}{chosenLang ? ` • Translation: ${langName(chosenLang, jsonData[0]?.languages || [])}` : ''}</div>
        </div>
      </div>
      {/* reviewSlice.length === 8 && */}
      {showReview && reviewSlice &&  (
        <ReviewModal slice={reviewSlice} level={active} lang={chosenLang} onClose={() => setShowReview(false)} jsonData={jsonData} categoryId={currentCategoryId} setJsonData={setJsonData} />
      )}
    </div>
  );
}


