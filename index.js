#!/usr/bin/env node

import ollama from 'ollama';
import readline from 'readline-sync'

const config = {
  me: {
    name: 'John',
    age: 26,
    gender: 'man'
  },
  others: [
    {
      name: 'Kenji',
      age: 40,
      gender: 'man',
      personality: 'You are a professor of computer science.'
    },
    {
      name: 'Taro',
      age: 40,
      gender: 'man',
      personality: 'You are a professor of policy management.'
    },
    {
      name: 'Emma',
      age: 40,
      gender: 'woman',
      personality: 'You are a journalist for 20 years.'
    },
  ]
}
class Discussion {
  constructor() {
    this.talk = [];
  }
  push(name, comment) {
    this.talk.push({ name, comment });
  }
  summarize() {
    return this.talk.reduce((a, { name, comment }) => a + '\n' + `${name}: ${comment}`, '');
  }
}


class Person {
  constructor(props) {
    this.name = props.name;
    this.age = props.age;
    this.gender = props.gender;
    this.personality = props.personality;
  }
  system() {
    return `Your name is ${this.name}. ${this.age} years old ${this.gender}. ${this.personality}. This is an English classroom. We are discussing some theme in English`;
  }
  user(summary) {
    return `Please comment something by your own words. less than 3 sentences.
# Discussion
${summary}
`
  }
}

const students = config.others.map(c => new Person(c));
const me = new Person(config.me);
students.push(me);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const discussion = new Discussion();


async function showPrompt() {
  const q = readline.question('You: ');
  if (q === '') {
    return;
  } else if (q === 'translate') {
    const latest = discussion.talk[discussion.talk.length - 1];
    const comment = latest.comment;
    const response = await ollama.chat({ model: 'gemma2:latest', messages: [
      {
        'role': 'system',
        'content': 'You are a good interpreter. translate English to Japanese without irrelevant comments.'
      },
      {
        'role': 'user',
        'content': `${comment}`,
      }
    ]});
    process.stdout.write(`${latest.name}: ${response.message.content}\n\n`);
    await showPrompt();
    return;
  }
  process.stdout.write(`\n`);
  discussion.push(me.name, q);
}

async function main() {
  showPrompt();
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < students.length; j++) {
      const response = await ollama.chat({ model: 'llama3.2', messages: [
        {
          role: 'system',
          content: students[j].system(),
        }, {
          role: 'user',
          content: students[j].user(discussion.summarize()),
        }
      ]});
      discussion.push(students[j].name, response.message.content);
      process.stdout.write(`${students[j].name}: ${response.message.content}\n\n`);
      showPrompt();
    }
  }
}

if (import.meta.url === new URL('', import.meta.url).href) {
  main();
}

