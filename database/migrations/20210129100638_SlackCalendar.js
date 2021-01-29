exports.up = function(knex) {
    return knex.schema.createTable('slack_calendar', function(table) {
        table.string('id_calendar').notNull();
        table.string('id_channel').references('id').inTable('channels').notNull();
        table.primary(['id_calendar', 'id_channel']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('slack_calendar');
};
