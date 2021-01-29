exports.up = function(knex) {
    return knex.schema.createTable('GoogleAccountCalendar', function(t) {
        t.string('idGGCalendar').references('id').inTable('GoogleCalendar').notNull();
        t.string('idGGAccount').references('id').inTable('GoogleAccount').notNull();
        t.primary(['idGGCalendar', 'idGGAccount']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('GoogleAccountCalendar');
};