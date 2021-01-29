exports.up = function(knex) {
    return knex.schema.createTable('GoogleAccount', function(t) {
        t.string('id').primary().notNull();
        t.string('name').notNull();
        t.string('refreshToken').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('GoogleAccount');
};