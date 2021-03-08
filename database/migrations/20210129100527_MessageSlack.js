exports.up = function (knex) {
  return knex.schema.createTable('message_slack', function (table) {
    table.string('id').primary().notNull();
    table.string('id_channel').references('id').inTable('channels').notNull();
    table.string('text').nullable();
    table.string('type').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('message_slack');
};
