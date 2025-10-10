import React, { useEffect, useState } from 'react';

// ---------------- Types ----------------
export type LevelKey = 'Elementary' | 'Beginner' | 'Intermediate' | 'Advanced';
export interface VocabItem {
  word: string;
  meaning: string;
  sentence: string;
  quote: string;
  phrase: string;
  phraseMeaning?: string;
  image?: string;
}
export type Dataset = Record<LevelKey, VocabItem[]>;

// ---------------- Data (inline) ----------------
const DATA: Dataset = {
  Elementary: [
    { word: 'snake', meaning: 'A long, thin reptile with no legs', sentence: 'The snake moved quietly through the grass.', quote: '“Even snakes are afraid of snakes.” – Proverb', phrase: 'Snake in the grass' },
    { word: 'cat', meaning: 'A small animal often kept as a pet', sentence: 'The cat slept on the sofa all day.', quote: '“Curiosity killed the cat.” – Proverb', phrase: 'Let the cat out of the bag' },
    { word: 'pig', meaning: 'A farm animal with a flat nose', sentence: 'The pig rolled happily in the mud.', quote: '“Don’t cast pearls before swine.” – Proverb', phrase: 'Eat like a pig' },
    { word: 'fish', meaning: 'An animal that lives in water and has fins', sentence: 'We saw colorful fish in the pond.', quote: '“A big fish in a small pond.” – Proverb', phrase: 'Fish out of water' },
    { word: 'duck', meaning: 'A bird that swims and quacks', sentence: 'The duck swam across the lake.', quote: '“Like water off a duck’s back.” – Proverb', phrase: 'Sitting duck' },
    { word: 'dolphin', meaning: 'A smart sea animal with a curved mouth', sentence: 'The dolphin jumped over the waves.', quote: '“The sea, once it casts its spell, holds one in its net of wonder forever.” – Cousteau', phrase: 'Swim with dolphins' },
    { word: 'zebra', meaning: 'An animal with black and white stripes', sentence: 'The zebra ran across the field.', quote: 'Nature always wears the colors of the spirit. – Emerson', phrase: 'Zebra crossing' },
    { word: 'panda', meaning: 'A large black and white bear from China', sentence: 'The panda ate bamboo for lunch.', quote: 'Save the pandas.', phrase: 'Panda eyes' },
    { word: 'hippo', meaning: 'A very large animal that lives in water', sentence: 'The hippo rested in the river.', quote: 'Big as a hippopotamus.', phrase: 'Hungry as a hippo' },
    { word: 'crocodile', meaning: 'A large reptile with a long mouth and sharp teeth', sentence: 'We saw a crocodile sunbathing.', quote: 'Crocodile tears.', phrase: 'Crocodile tears' },
    { word: 'octopus', meaning: 'A sea animal with eight arms', sentence: 'The octopus hid behind a rock.', quote: 'Arms like an octopus.', phrase: 'Arms like an octopus' },
    { word: 'penguin', meaning: 'A black and white bird that cannot fly but swims well', sentence: 'The penguin slid on the ice.', quote: 'March of the penguins.', phrase: 'March of the penguins' },
  ],
  Beginner: [
    { word: 'the', meaning: 'used to talk about one specific thing', sentence: 'The sun rises in the east.', quote: 'The proof of the pudding is in the eating.', phrase: 'hit the nail on the head' },
    { word: 'a', meaning: 'used before one thing, not specific', sentence: 'She bought a red umbrella.', quote: 'A stitch in time saves nine.', phrase: 'a blessing in disguise' },
    { word: 'some', meaning: 'a small number or amount', sentence: 'I have some good news for you.', quote: 'Some things are better left unsaid.', phrase: 'make some noise' },
    { word: 'you', meaning: 'the person being spoken to', sentence: 'You can sit here.', quote: 'You miss 100% of the shots you don’t take. – Gretzky', phrase: 'you bet' },
    { word: 'he', meaning: 'a male person already known', sentence: 'He plays football after school.', quote: 'He who laughs last laughs best.', phrase: 'he-man' },
    { word: 'she', meaning: 'a female person already known', sentence: 'She loves to draw.', quote: 'She believed she could, so she did.', phrase: 'she-wolf' },
    { word: 'we', meaning: 'the speaker and others', sentence: 'We are going to the park.', quote: 'We rise by lifting others.', phrase: 'we the people' },
    { word: 'they', meaning: 'other people or things', sentence: 'They are watching a movie.', quote: 'They also serve who only stand and wait. – Milton', phrase: 'they say' },
    { word: 'me', meaning: 'the person who is speaking (object of I)', sentence: 'Please give me the book.', quote: 'Excuse me while I kiss the sky.', phrase: 'me-time' },
    { word: 'are', meaning: 'present form of be used with you/we/they', sentence: 'They are ready to go.', quote: 'We are what we repeatedly do. – Aristotle', phrase: 'are to' },
    { word: 'was', meaning: 'past form of be with I/he/she/it', sentence: 'She was late to class.', quote: 'It was the best of times, it was the worst of times. – Dickens', phrase: 'was about to' },
    { word: 'were', meaning: 'past form of be with you/we/they', sentence: 'We were happy yesterday.', quote: 'If wishes were horses, beggars would ride.', phrase: 'were to' },
  ],
  Intermediate: [
    { word: 'advice', meaning: 'A suggestion about what someone should do', sentence: 'She gave me advice about studying.', quote: 'We ask for advice but we mean approval. – Erica Jong', phrase: 'Take someone’s advice' },
    { word: 'adventure', meaning: 'An exciting or unusual experience', sentence: 'Their hike turned into a real adventure.', quote: 'Life is either a daring adventure or nothing. – Helen Keller', phrase: 'Seek adventure' },
    { word: 'apologize', meaning: 'To say sorry for something', sentence: 'He apologized for being late.', quote: 'Never ruin an apology with an excuse. – Benjamin Franklin', phrase: 'Apologize sincerely' },
    { word: 'arrive', meaning: 'To reach a place', sentence: 'Trains arrive every hour.', quote: 'Wherever you go, go with all your heart. – Confucius', phrase: 'Arrive on time' },
    { word: 'assist', meaning: 'To help someone', sentence: 'The nurse will assist the doctor.', quote: 'We can’t help everyone, but everyone can help someone. – Reagan', phrase: 'assist with' },
    { word: 'attempt', meaning: 'To try to do something', sentence: 'They attempt to solve the puzzle.', quote: 'Do or do not. There is no try. – Yoda', phrase: 'attempt to' },
    { word: 'balance', meaning: 'To keep things steady or equal', sentence: 'She learned to balance study and play.', quote: 'Life is about balance.', phrase: 'strike a balance' },
    { word: 'benefit', meaning: 'A good result or help from something', sentence: 'Exercise has many benefits.', quote: 'A benefit is a gift you give yourself.', phrase: 'benefit from' },
    { word: 'borrow', meaning: 'To take and use something and return it later', sentence: 'May I borrow your book?', quote: 'Neither a borrower nor a lender be. – Shakespeare', phrase: 'borrow time' },
  ],
  Advanced: [
    { word: 'achievement', meaning: 'Something important done successfully', sentence: 'Winning the award was a big achievement.', quote: 'Happiness lies in the joy of achievement and the thrill of creative effort. – F.D. Roosevelt', phrase: 'Sense of achievement' },
    { word: 'challenge', meaning: 'A difficult task', sentence: 'Climbing the mountain was a challenge.', quote: 'Accept the challenges so that you can feel the exhilaration of victory. – George Patton', phrase: 'Rise to the challenge' },
    { word: 'opinion', meaning: 'A personal belief', sentence: 'In my opinion, reading is relaxing.', quote: 'Everyone is entitled to his own opinion, but not his own facts. – D.P. Moynihan', phrase: 'Difference of opinion' },
    { word: 'precision', meaning: 'Great accuracy and exactness', sentence: 'The surgeon worked with precision.', quote: 'Measure twice, cut once.', phrase: 'precision work' },
    { word: 'resilience', meaning: 'The ability to recover quickly', sentence: 'The town showed resilience after the storm.', quote: 'Fall seven times, stand up eight.', phrase: 'build resilience' },
    { word: 'vision', meaning: 'A plan or picture of the future', sentence: 'The leader shared a clear vision.', quote: 'Vision without action is a daydream. – Japanese Proverb', phrase: 'share the vision' },
    { word: 'synthesize', meaning: 'To combine parts into a whole', sentence: 'Researchers synthesized data from many studies.', quote: 'Science is the acceptance of what works and a rejection of what does not. – Jacob Bronowski', phrase: 'synthesize ideas' },
    { word: 'nuance', meaning: 'A small but important difference in meaning or sound', sentence: 'She noticed the nuance in his tone.', quote: 'Details create the big picture. – John Wooden', phrase: 'nuanced view' },
  ],
};

// ---------------- UI helpers ----------------
const COLORS = {
  bg: 'bg-[#143650]',
  accent: 'bg-[#7B1F2B]',
  dim: 'opacity-50',
  button: 'bg-[#15A6FF]',
  buttonAlt: 'bg-[#2CD36F]'
};

function shuffle<T>(arr: T[]): T[] { const a = arr.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

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
  if (!text) return; const u = new SpeechSynthesisUtterance(text); if (voice) u.voice = voice; u.rate = rate; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}

function AudioButton({ onClick, small=false }: { onClick: () => void; small?: boolean }) {
  return (
    <button onClick={(e)=>{e.stopPropagation(); onClick();}} className={`rounded-full ${COLORS.button} hover:brightness-110 active:scale-95 flex items-center justify-center ${small?'w-8 h-8':'w-10 h-10'} shadow-lg`}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className={`${small?'w-4 h-4':'w-5 h-5'}`}>
        <path d='M3 10v4h4l5 5V5L7 10H3zm13.54-1.46a5 5 0 010 7.07l-1.41-1.41a3 3 0 000-4.24l1.41-1.42zm2.83-2.83a9 9 0 010 12.73l-1.41-1.41a7 7 0 000-9.9l1.41-1.42z'/>
      </svg>
    </button>
  );
}

function TranslateLink({ text }: { text: string }) {
  const [lang, setLang] = useState('hi');
  const url = `https://translate.google.com/?sl=en&tl=${lang}&text=${encodeURIComponent(text)}&op=translate`;
  return (
    <div className='flex items-center gap-2 mt-2'>
      <select className='border rounded px-2 py-1 text-sm text-slate-800' value={lang} onChange={e=>setLang(e.target.value)} onClick={(e) => e.stopPropagation()}>
        <option value='hi'>Hindi</option><option value='ar'>Arabic</option><option value='es'>Spanish</option><option value='ta'>Tamil</option><option value='te'>Telugu</option><option value='bn'>Bengali</option><option value='ml'>Malayalam</option>
      </select>
      <a className='underline text-sm text-white/90' href={url} target='_blank' rel='noreferrer'>Translate meaning</a>
    </div>
  );
}

function FlipHint() { return <div className='text-center text-sm text-slate-300 mt-2'>Tap to flip for sentence, quote & idiom</div>; }

function CardFront({ item, level, onListenWord, onListenMeaning }: { item: VocabItem; level: LevelKey; onListenWord: () => void; onListenMeaning?: () => void }) {
  return (
    <div className='relative w-full h-full p-4'>
      <div className='absolute left-3 top-3'><AudioButton onClick={onListenWord} /></div>
      <div className='text-center mt-6'><div className='text-3xl font-bold text-white drop-shadow-sm'>{item.word}</div></div>
      <div className='flex items-center justify-center mt-6 w-full'>
        {level === 'Elementary' ? (
          <div className='w-48 h-48 rounded-2xl bg-white/90 border border-white/70 flex items-center justify-center text-slate-400 shadow-inner'>image placeholder</div>
        ) : (
          item.meaning ? (
            <section className='bg-white/90 rounded-xl p-3 shadow text-slate-900 w-full'>
              <div className='flex items-center justify-between'><h4 className='font-semibold'>Meaning</h4>{onListenMeaning && <AudioButton small onClick={onListenMeaning} />}</div>
              <p className='text-sm mt-1'>{item.meaning}</p>
              <TranslateLink text={item.meaning} />
            </section>
          ) : null
        )}
      </div>
      <FlipHint />
    </div>
  );
}

function CardBack({ item, level, onListenPart }: { item: VocabItem; level: LevelKey; onListenPart: (t: string) => void }) {
  return (
    <div className='relative w-full h-full p-4 text-slate-900'>
      <div className='space-y-3 mt-1'>
        {level === 'Elementary' && item.meaning && (
          <section className='bg-white/90 rounded-xl p-3 shadow'>
            <div className='flex items-center justify-between'><h4 className='font-semibold'>Meaning</h4><AudioButton small onClick={()=>onListenPart(item.meaning)} /></div>
            <p className='text-sm mt-1'>{item.meaning}</p>
            <TranslateLink text={item.meaning} />
          </section>
        )}
        {item.sentence && (
          <section className='bg-white/90 rounded-xl p-3 shadow'>
            <div className='flex items-center justify-between'><h4 className='font-semibold'>Sentence</h4><AudioButton small onClick={()=>onListenPart(item.sentence)} /></div>
            <p className='text-sm mt-1'>{item.sentence}</p>
          </section>
        )}
        {item.quote && (
          <section className='bg-white/90 rounded-xl p-3 shadow'>
            <div className='flex items-center justify-between'><h4 className='font-semibold'>Quote</h4><AudioButton small onClick={()=>onListenPart(item.quote)} /></div>
            <p className='text-sm mt-1 whitespace-pre-wrap break-words'>{item.quote}</p>
          </section>
        )}
        {item.phrase && (
          <section className='bg-white/90 rounded-xl p-3 shadow'>
            <div className='flex items-center justify-between'><h4 className='font-semibold'>Idiom / Phrase</h4><AudioButton small onClick={()=>onListenPart(item.phrase + (item.phraseMeaning ? '. Meaning: ' + item.phraseMeaning : ''))} /></div>
            <p className='text-sm mt-1'><span className='font-medium'>{item.phrase}</span>{item.phraseMeaning ? <> — <span>{item.phraseMeaning}</span></> : null}</p>
          </section>
        )}
      </div>
    </div>
  );
}

// --------------- Review ---------------
const REVIEW_LINES = ['Time to review!', 'Quick check time!', 'Let’s recap these words!', 'Review round—ready?', 'Mini quiz time!', 'Your turn to show it!'];

type QBase = { id: string; type: string; prompt: string; wordsUsed: string[] };

type MatchPair = { left: string; right: string; correct: string };
export type QMatch = QBase & { type: 'match'; pairs: MatchPair[] };
export type QFill = QBase & { type: 'fill'; sentence: string; correct: string; options: string[] };
export type QMCQ = QBase & { type: 'mcq'; meaning: string; options: string[]; answer: string };
export type QIdiom = QBase & { type: 'idiom'; idiom: string; options: string[]; answer: string };

type AnyQ = QMatch | QFill | QMCQ | QIdiom;

function buildReview(slice: VocabItem[]): AnyQ[] {
  const pool = slice.slice();
  const questions: AnyQ[] = [];
  const used = new Set<string>();
  const chooseWords = (n: number) => shuffle(pool.filter(w => !used.has(w.word))).slice(0, n);
  const count = Math.random() < 0.5 ? 2 : 3;
  for (let i = 0; i < count; i++) {
    const type = shuffle(['match','fill','mcq','idiom'])[0] as AnyQ['type'];
    if (type === 'match') {
      const words = chooseWords(4); words.forEach(w=>used.add(w.word));
      const pairs: MatchPair[] = shuffle(words).map(w => ({ left: w.word, right: w.meaning, correct: w.word }));
      questions.push({ id: 'qmatch-'+i, type: 'match', prompt: 'Drag each word to its meaning.', pairs, wordsUsed: words.map(w=>w.word) });
      continue;
    }
    if (type === 'fill') {
      const [correct] = chooseWords(1); used.add(correct.word);
      const distractors = chooseWords(3);
      const options = shuffle([correct.word, ...distractors.map(d=>d.word)]);
      questions.push({ id: 'qfill-'+i, type: 'fill', prompt: 'Drag the correct word into the blank.', sentence: correct.sentence, correct: correct.word, options, wordsUsed: [correct.word, ...distractors.map(d=>d.word)] });
      continue;
    }
    if (type === 'mcq') {
      const [target] = chooseWords(1); used.add(target.word);
      const distractors = chooseWords(3);
      const options = shuffle([target.word, ...distractors.map(d=>d.word)]);
      questions.push({ id: 'qmcq-'+i, type: 'mcq', prompt: 'Which word matches this meaning?', meaning: target.meaning, options, answer: target.word, wordsUsed: [target.word, ...distractors.map(d=>d.word)] });
      continue;
    }
    if (type === 'idiom') {
      const [target] = chooseWords(1); used.add(target.word);
      const idiom = target.phrase;
      const correct = 'When the problem was obvious, the teacher mentioned the ' + idiom + ' to the class.';
      const options = shuffle([correct, 'He ate the ' + idiom + ' for breakfast.', 'She painted the ' + idiom + ' in blue and red.', 'They counted the ' + idiom + ' on their fingers.']);
      questions.push({ id: 'qidiom-'+i, type: 'idiom', prompt: 'Choose the sentence that correctly uses: “' + idiom + '”.', idiom, options, answer: correct, wordsUsed: [target.word] });
      continue;
    }
  }
  return questions;
}

function QMatchView({ q, onCorrect, onWrong }: { q: QMatch; onCorrect: () => void; onWrong: () => void }) {
  const [targets, setTargets] = useState<Record<string, string | null>>(() => Object.fromEntries(q.pairs.map(p => [p.right, null])));
  const allPlaced = Object.values(targets).every(v => v);
  function allowDrop(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(e: React.DragEvent, right: string) { const left = e.dataTransfer.getData('text/plain'); setTargets(s => ({ ...s, [right]: left })); }
  function check() { const ok = q.pairs.every(p => targets[p.right] === p.left); ok ? onCorrect() : onWrong(); }
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='space-y-2'>{shuffle(q.pairs).map(p => (<div key={p.left} draggable onDragStart={e=>e.dataTransfer.setData('text/plain', p.left)} className='px-3 py-2 bg-white text-slate-800 rounded shadow cursor-grab'>{p.left}</div>))}</div>
      <div className='space-y-2'>
        {q.pairs.map(p => (
          <div key={p.right} onDragOver={allowDrop} onDrop={e=>onDrop(e,p.right)} className='p-3 rounded border border-white/30 min-h-[44px] flex items-center justify-between'>
            <span className='text-sm opacity-90 pr-3'>{p.right}</span>
            <span className='px-3 py-1 rounded bg-white text-slate-800 min-w-[100px] text-center'>{targets[p.right] || ''}</span>
          </div>
        ))}
        {allPlaced && <div className='text-right'><button onClick={check} className={`mt-2 px-4 py-2 rounded-full ${COLORS.buttonAlt} text-white`}>Submit</button></div>}
      </div>
    </div>
  );
}

function QFillView({ q, onCorrect, onWrong }: { q: QFill; onCorrect: () => void; onWrong: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => { setPicked(null); }, [q.id]);

  // find the word position without regex
  function findIndex(sentence: string, word: string) {
    const s = sentence.toLowerCase();
    const w = word.toLowerCase();
    let i = s.indexOf(w);
    const isLetter = (ch: string) => /[a-z]/i.test(ch);
    while (i !== -1) {
      const before = i > 0 ? s[i-1] : ' ';
      const after = i + w.length < s.length ? s[i + w.length] : ' ';
      if (!isLetter(before) && !isLetter(after)) return i;
      i = s.indexOf(w, i + 1);
    }
    return -1;
  }
  const idx = findIndex(q.sentence, q.correct);
  const before = idx >= 0 ? q.sentence.slice(0, idx) : q.sentence;
  const after = idx >= 0 ? q.sentence.slice(idx + q.correct.length) : '';

  const allowDrop = (e: React.DragEvent) => e.preventDefault();
  function onDrop(e: React.DragEvent) { setPicked(e.dataTransfer.getData('text/plain')); }
  function check() { (picked === q.correct) ? onCorrect() : onWrong(); }

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
        {q.options.map(o => (<div key={o} draggable onDragStart={e=>e.dataTransfer.setData('text/plain', o)} className='px-3 py-2 bg-white text-slate-800 rounded shadow cursor-grab'>{o}</div>))}
      </div>
      {picked && <div className='text-right mt-3'><button onClick={check} className={`px-4 py-2 rounded-full ${COLORS.buttonAlt} text-white`}>Submit</button></div>}
    </div>
  );
}

function QMCQView({ q, onCorrect, onWrong }: { q: QMCQ; onCorrect: () => void; onWrong: () => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  function pick(o: string) { setChoice(o); (o === q.answer) ? onCorrect() : onWrong(); }
  return (
    <div>
      <div className='mb-4'>Meaning: <span className='font-medium'>{q.meaning}</span></div>
      <div className='grid grid-cols-2 gap-2'>
        {q.options.map((o,i) => (
          <button key={o} onClick={()=>pick(o)} className={`px-3 py-2 rounded bg-white text-slate-800 text-left hover:brightness-95 ${choice===o?'ring-2 ring-emerald-400':''}`}>
            <span className='mr-2 font-mono'>{String.fromCharCode(65+i)}.</span> {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function QIdiomView({ q, onCorrect, onWrong }: { q: QIdiom; onCorrect: () => void; onWrong: () => void }) {
  function pick(o: string) { (o === q.answer) ? onCorrect() : onWrong(); }
  return (
    <div className='space-y-2'>
      {q.options.map((o,i) => (
        <button key={i} onClick={()=>pick(o)} className='w-full text-left px-3 py-2 rounded bg-white text-slate-800 hover:brightness-95'>
          <span className='mr-2 font-mono'>{String.fromCharCode(65+i)}.</span> {o}
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ slice, onClose }: { slice: VocabItem[]; onClose: () => void }) {
  const [queue] = useState(() => buildReview(slice));
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(false);
  const cur = queue[idx];
  function next() { setCorrect(false); if (idx === queue.length - 1) onClose(); else setIdx(idx + 1); }
  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-3xl rounded-2xl p-4 shadow-xl bg-[#183F5D] text-white'>
        <div className='flex items-center justify-between mb-1'><h3 className='text-xl font-semibold'>{shuffle(REVIEW_LINES)[0]}</h3><button onClick={onClose} className='text-white/70 hover:text-white'>✕</button></div>
        <p className='text-sm mb-3 opacity-80'>{cur.prompt}</p>
        <div className='bg-white/5 rounded-xl p-4 min-h-[220px]'>
          {cur.type==='match' && <QMatchView q={cur as QMatch} onCorrect={()=>setCorrect(true)} onWrong={()=>setCorrect(false)} />}
          {cur.type==='fill' && <QFillView q={cur as QFill} onCorrect={()=>setCorrect(true)} onWrong={()=>setCorrect(false)} />}
          {cur.type==='mcq' && <QMCQView q={cur as QMCQ} onCorrect={()=>setCorrect(true)} onWrong={()=>setCorrect(false)} />}
          {cur.type==='idiom' && <QIdiomView q={cur as QIdiom} onCorrect={()=>setCorrect(true)} onWrong={()=>setCorrect(false)} />}
        </div>
        <div className='flex justify-end gap-2 mt-3'>
          {correct ? <button onClick={next} className={`px-4 py-2 rounded-full ${COLORS.buttonAlt} text-white font-semibold`}>Continue</button> : <span className='text-xs opacity-80'>Answer correctly to continue</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------- Main ----------------
export default function VocabTool() {
  const [data] = useState<Dataset>(DATA);
  const [active, setActive] = useState<LevelKey>('Elementary');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [listened, setListened] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [queue, setQueue] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewSlice, setReviewSlice] = useState<VocabItem[] | null>(null);
  const voice = useFemaleVoice();

  const list = data[active] || [];
  const current = list[index];
  const prev = list[index-1];

  function markListened(i: number) { setListened(s => new Set(s).add(i)); }

  function advance() {
    const willCount = listened.has(index) && !completed.has(index);
    const nextQueue = willCount ? [...queue, index] : queue.slice();
    const nextCompleted = new Set(completed);
    if (willCount) nextCompleted.add(index);

    if (nextQueue.length > 0 && nextQueue.length % 8 === 0) {
      const slice = nextQueue.slice(-8).map(i => list[i]).filter(Boolean) as VocabItem[];
      if (slice.length === 8) { setReviewSlice(slice); setShowReview(true); }
    }

    setCompleted(nextCompleted);
    setQueue(nextQueue);
    setFlipped(false);
    if (index < list.length - 1) setIndex(index + 1);
  }

  function next() { advance(); }

  if (!current) return <div className={`${COLORS.bg} min-h-screen text-white flex items-center justify-center`}>No data.</div>;

  const listenWord = () => { speak(current.word, voice, 0.95); markListened(index); };
  const listenMeaning = () => { if (current.meaning) { speak(current.meaning, voice, 0.98); markListened(index); } };
  const listenPart = (t: string) => { speak(t, voice, 0.98); markListened(index); };

  return (
    <div className={`${COLORS.bg} min-h-screen w-full p-4 md:p-8 text-white`}>
      <div className='max-w-5xl mx-auto'>
        <div className='flex gap-2 mb-4 flex-wrap'>
          {(['Elementary','Beginner','Intermediate','Advanced'] as LevelKey[]).map(lvl => (
            <button key={lvl} onClick={()=>{setActive(lvl); setIndex(0); setFlipped(false); setListened(new Set()); setCompleted(new Set()); setQueue([]); setShowReview(false); setReviewSlice(null);}} className={`px-4 py-2 rounded-full ${active===lvl?'bg-white/20':'bg-white/10 hover:bg-white/20'}`}>{lvl} <span className='opacity-70 ml-1 text-xs'>({data[lvl]?.length||0})</span></button>
          ))}
        </div>

        <div className='relative h-[420px] md:h-[480px]'>
          {prev && (
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[260px] md:w-[320px] h-[360px] rounded-3xl ${COLORS.accent} ${COLORS.dim} shadow-2xl`}>
              <div className='w-full h-full rounded-3xl overflow-hidden'>
                <div className='w-full h-full p-4 text-center text-white/80 flex flex-col items-center justify-center'>{prev.word}</div>
              </div>
            </div>
          )}

          <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[300px] md:w-[420px] h-[400px] rounded-3xl ${COLORS.accent} shadow-2xl`} onClick={()=>setFlipped(!flipped)}>
            <div className='relative w-full h-full'>
              {!flipped ? (
                <div className='h-full rounded-2xl bg-white/10 border border-white/10 shadow-lg overflow-hidden'>
                  <CardFront item={current} level={active} onListenWord={listenWord} onListenMeaning={active!=='Elementary'? listenMeaning: undefined} />
                </div>
              ) : (
                <div className='h-full rounded-2xl bg-white/10 border border-white/10 shadow-lg overflow-auto'>
                  <CardBack item={current} level={active} onListenPart={listenPart} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='mt-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-56 h-2 rounded-full bg-white/20 overflow-hidden'><div className='h-full bg-white/80' style={{ width: `${((index+1)/list.length)*100}%` }} /></div>
            <span className='text-xs opacity-80'>{index+1}/{list.length}</span>
          </div>
          <div className='flex items-center gap-2'>
            <button onClick={next} className='w-12 h-12 rounded-full bg-white/70 text-slate-800 flex items-center justify-center text-2xl hover:bg-white'>→</button>
          </div>
        </div>

        <div className='mt-3 text-xs opacity-70'>Completed this set: {queue.length}</div>
      </div>

      {showReview && reviewSlice && reviewSlice.length===8 && (
        <ReviewModal slice={reviewSlice} onClose={()=>setShowReview(false)} />
      )}
    </div>
  );
}
