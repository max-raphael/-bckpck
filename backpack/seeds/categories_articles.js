
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('categories_articles').del()
    .then(function () {
      // Inserts seed entries
      return knex('categories_articles').insert([
        {category_id: 1, article_id: 1},
        {category_id: 2, article_id: 2}
      ]);
    });
};
