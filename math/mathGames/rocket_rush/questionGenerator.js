// questionGenerator.js

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateOptions(correct) {
  const options = new Set();
  options.add(correct);

  while (options.size < 5) {
    const fake = correct + random(-10, 10);
    if (fake !== correct && fake >= 0) {
      options.add(fake);
    }
  }

  return shuffle([...options]);
}

// ----------------------------
// EASY: simple add & sub
// ----------------------------
function generateEasyQuestion() {
  const a = random(1, 20);
  const b = random(1, 20);

  const question = `${a} + ${b}`;
  const answer = a + b;

  return { question, answer };
}


// ----------------------------
// MEDIUM: bigger add/sub + small multiply
// ----------------------------
function generateMediumQuestion() {
  const type = random(1, 2); // 1:add 2:sub 3:mul

  let a, b, question, answer;

  if (type === 1) {
    a = random(5, 40);
    b = random(5, 4);
    question = `${a} + ${b}`;
    answer = a + b;
  } else if (type === 2) {
    a = random(5, 40);
    b = random(5, 40);
    if (b > a) [a, b] = [b, a];
    question = `${a} - ${b}`;
    answer = a - b;
  } 

  return { question, answer };
}

// ----------------------------
// HARD: 3 digit add, 2 digit sub, harder multiply
// ----------------------------
function generateHardQuestion() {
  const type = random(1, 3); // 1:add 2:sub 3:mul

  let a, b, question, answer;

  if (type === 1) {
    a = random(10, 80);
    b = random(10, 80);
    question = `${a} + ${b}`;
    answer = a + b;
  } else if (type === 2) {
    a = random(10, 80);
    b = random(10, 80);
    if (b > a) [a, b] = [b, a];
    question = `${a} - ${b}`;
    answer = a - b;
  } else {
    a = random(10, 80);
    b = random(10, 80);
    question = `${a} × ${b}`;
    answer = a * b;
  }

  return { question, answer };
}

// ----------------------------
// MAIN FUNCTION
// ----------------------------
export function generateQuestions(level) {
  const questions = [];
  const used = new Set();

  while (questions.length < 20) {
    let q;

    if (level === "easy") q = generateEasyQuestion();
    else if (level === "medium") q = generateMediumQuestion();
    else if (level === "hard") q = generateHardQuestion();
    else throw new Error("Invalid level");

    // Avoid duplicate questions
    if (used.has(q.question)) continue;

    used.add(q.question);

    const options = generateOptions(q.answer);

    questions.push({
      id: questions.length + 1,
      question: q.question,
      options: options,
      answer: q.answer,
    });
  }

  return questions;
}
