
exports.up = function(knex) {
  return knex.schema.createTable('websites', table => {
      table.increments(),
      table.string('website').notNullable().defaultsTo('')
      table.timestamps(true, true)
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('websites')
};
