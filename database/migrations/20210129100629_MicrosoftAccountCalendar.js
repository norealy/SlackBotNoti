
exports.up = function(knex) {
    return knex.schema.createTable('MicrosoftAccountCalendar', function(t) {
        t.string('idMSCalendar').references('id').inTable('MicrosoftCalendar').notNull();
        t.string('idMSAccount').references('id').inTable('MicrosoftAccount').notNull();
        t.primary(['idMSCalendar', 'idMSAccount']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('MicrosoftAccountCalendar');
};