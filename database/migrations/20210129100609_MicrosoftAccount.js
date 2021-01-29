exports.up = function(knex) {
    return knex.schema.createTable('microsoft_account', function(table) {
        table.string('id').primary().notNull();
        table.string('name').notNull();
        table.string('refresh_token').notNull();
<<<<<<< HEAD
=======
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
>>>>>>> feature/NEOS_VN_BNT-15
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('microsoft_account');
<<<<<<< HEAD
};
=======
};

>>>>>>> feature/NEOS_VN_BNT-15
