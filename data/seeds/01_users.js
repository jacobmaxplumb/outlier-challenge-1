const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      username: 'Captain Marvel',
      password: bcrypt.hashSync('foobar', 8)
    },
  ]);
};