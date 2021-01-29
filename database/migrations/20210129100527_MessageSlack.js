exports.up = function(knex) {
    return knex.schema.createTable('message_slack', function(table) {
        table.increments('id').unsigned().primary();
        table.string('id_channel').references('id').inTable('channels').notNull();
        table.string('text').nullable();
        table.string('type').nullable();
        table.dateTime('time_send').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('message_slack');
};