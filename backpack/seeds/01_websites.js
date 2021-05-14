
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('websites').del()
    .then(function () {
      // Inserts seed entries
      return knex('websites').insert([
        {id: 1, website: 'nytimes'},
        {id: 2, website: 'washingtonpost'}
      ])
      .then(function () {
        return knex.raw(`SELECT setval('websites_id_seq', (SELECT MAX(id) FROM websites))`)
      })
    });
};
