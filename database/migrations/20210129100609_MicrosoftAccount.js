exports.up = function(knex) {
    return knex.schema.createTable('microsoft_account', function(table) {
        table.string('id').primary().notNull();
        table.string('name').notNull();
        table.string('refresh_token').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('microsoft_account');
};