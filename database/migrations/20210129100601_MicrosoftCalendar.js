exports.up = function(knex) {
    return knex.schema.createTable('MicrosoftCalendar', function(t) {
        t.string('id').primary().notNull();
        t.string('name').notNull();
        t.string('addressOwner').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('MicrosoftCalendar');
};