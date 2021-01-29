exports.up = function(knex) {
    return knex.schema.createTable('SlackCalendar', function(t) {
        t.string('idCalendar').notNull();
        t.string('idChannel').references('id').inTable('Channel').notNull();
        t.primary(['idCalendar', 'idChannel']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('SlackCalendar');
};
