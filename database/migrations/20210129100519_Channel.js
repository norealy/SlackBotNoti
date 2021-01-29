exports.up = function(knex) {
    return knex.schema.createTable('channels', function(table) {
        table.string('id').primary().notNull();
        table.string('name').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('channels');
};