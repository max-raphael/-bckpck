
exports.up = function(knex) {
  return knex.schema.createTable('websites', table => {
      table.increments(),
      table.string('websites').notNullable().defaultsTo('')
      table.timestamps(true, true)
  })
};

exports.down = function(knex) {
  knex.schema.dropTable('websites')
};
