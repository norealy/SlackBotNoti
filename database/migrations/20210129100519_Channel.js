exports.up = function(knex) {
    return knex.schema.createTable('Channel', function(t) {
        t.string('id').primary().notNull();
        t.string('name').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('Channel');
};