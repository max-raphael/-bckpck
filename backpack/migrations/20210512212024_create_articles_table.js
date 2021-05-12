
exports.up = function(knex) {
    return knex.schema.createTable('articles', table => {
        table.increments(),
        table.string('title').notNullable().defaultsTo('')
        table.string('url').notNullable().defaultsTo('')
        table.string('author').notNullable().defaultsTo('')
        table.string('image').notNullable().defaultsTo('')
        table.integer('website_id').notNullable()
        table.foreign('website_id').references('websites.id')
        table.timestamps(true, true)
    })
  };
  
  exports.down = function(knex) {
    knex.schema.dropTable('articles')
  };
  