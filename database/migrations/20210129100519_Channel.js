exports.up = function (knex) {
  return knex.schema.createTable('channel', function (table) {
    table.string('id').primary().notNull();
    table.string('name').notNull();
    table.timestamp('created_at').defaultTo(knex.fn.now())
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('channel');
};
