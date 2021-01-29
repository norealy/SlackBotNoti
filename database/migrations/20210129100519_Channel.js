exports.up = function(knex) {
    return knex.schema.createTable('channels', function(table) {
        table.string('id').primary().notNull();
        table.string('name').notNull();
<<<<<<< HEAD
=======
        table.timestamp('created_at').defaultTo(knex.fn.now())
>>>>>>> feature/NEOS_VN_BNT-15
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('channels');
<<<<<<< HEAD
};
=======
};
>>>>>>> feature/NEOS_VN_BNT-15
