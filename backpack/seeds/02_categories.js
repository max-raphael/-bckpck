
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('categories').del()
    .then(function () {
      // Inserts seed entries
      return knex('categories').insert([
        {id: 1, category: 'politics'},
        {id: 2, category: 'environment'}
      ])
      .then(function () {
        return knex.raw(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))`)
      })
    })
};
