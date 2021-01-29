exports.up = function(knex) {
    return knex.schema.createTable('microsoft_calendar', function(table) {
        table.string('id').primary().notNull();
        table.string('name').notNull();
        table.string('address_owner').notNull();
<<<<<<< HEAD
=======
        table.timestamp('created_at').defaultTo(knex.fn.now());
>>>>>>> feature/NEOS_VN_BNT-15
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('microsoft_calendar');
};
<<<<<<< HEAD
=======

>>>>>>> feature/NEOS_VN_BNT-15
