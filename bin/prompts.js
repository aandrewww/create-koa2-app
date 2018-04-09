const prompts = require('prompts');

async function pickDatabase() {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick database',
    choices: [
      { title: 'Mysql', value: 'mysql', selected: true },
      { title: 'PostgreSQL', value: 'postgresql' },
      { title: 'MongoDB', value: 'mongodb' },
      { title: 'Nothing', value: 'none' }
    ],
    initial: 0
  });

  return response.value;
}

async function chooseRedis() {
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Do you want support redis?',
    initial: true
  });

  return response.value;
}

module.exports.pickDatabase = pickDatabase;
module.exports.chooseRedis = chooseRedis;
