
exports.up = function(knex) {
    return knex.schema.createTable('categories_articles', table => {
        table.integer('category_id').notNullable()
        table.foreign('category_id').references('category_id').onDelete('CASCADE')
        table.integer('article_id').notNullable()
        table.foreign('article_id').references('article_id').onDelete('CASCADE')
        table.timestamps(true, true)
    })
  };
  
  exports.down = function(knex) {
    knex.schema.dropTable('categories_articles')
  };
  