exports.up = function (knex) {
  return knex.schema.createTable('channels_calendar', function (table) {
    table.string('id_calendar').notNull();
    table.string('id_channel').references('id').inTable('channels').notNull();
    table.primary(['id_calendar', 'id_channel']);
    table.boolean('watch').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('channels_calendar');
};
