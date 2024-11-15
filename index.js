import ollama from 'ollama';
import readline from 'readline-sync'

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

const category = 'AI technology';
const subcategory = 'Siri';

class Person {
  constructor(props) {
    this.name = props.name;
    this.age = props.age;
    this.gender = props.gender;
    this.personality = props.personality;
  }
  system() {
    return `Your name is ${this.name}. ${this.age} years old ${this.gender}. ${this.personality}. This is an English classroom. We are discussing some theme in English. category is ${category}. subcategory is ${subcategory}. Don't comment too long sentence.`;
  }
  user(summary) {
    return `Please comment something by your own words.
# Discussion
${summary}
`
  }
}


const students = [
  new Person({
    name: 'Kenny',
    age: 18,
    gender: 'man',
    personality: 'You have a positive mindset and favors adventurous ideas. He is unafraid of failure and always thinks about the future.'
  }),
  new Person({
    name: 'Hange',
    age: 18,
    gender: 'woman',
    personality: 'You have a negative mindset and constantly thinks about failure. She dislikes being disliked by others and prefers the safest solutions whenever possible.'
  }),
]


const me = new Person({
    name: 'Biri',
    age: 20,
    gender: 'man',
});
const discussion = new Discussion();

for (let i = 0; i < 5; i++) {
  const q = readline.question('You: ');
  process.stdout.write(`\n`);
  discussion.push(me.name, q);
  for (let j = 0; j < 2; j++) {
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
  }
}

console.info(discussion.summarize());

