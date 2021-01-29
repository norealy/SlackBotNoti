
exports.up = function(knex) {
    return knex.schema.createTable('microsoft_account_calendar', function(table) {
        table.string('id_calendar').references('id').inTable('microsoft_calendar').notNull();
        table.string('id_account').references('id').inTable('microsoft_account').notNull();
        table.primary(['id_calendar', 'id_account']);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('microsoft_account_calendar');
};
