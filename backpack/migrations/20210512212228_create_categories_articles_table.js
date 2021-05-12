
exports.up = function(knex) {
    return knex.schema.createTable('categories_articles', table => {
        table.integer('category_id').notNullable()
        table.foreign('category_id').references('categories.id').onDelete('CASCADE')
        table.integer('article_id').notNullable()
        table.foreign('article_id').references('articles.id').onDelete('CASCADE')
        table.timestamps(true, true)
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('categories_articles')
  };
  