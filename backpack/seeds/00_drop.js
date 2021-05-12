
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('categories_articles').del()
    .then(() => {return knex('articles').del()})
    .then(() => {return knex('categories').del()})
    .then(() => {return knex('websites').del()})    
};
