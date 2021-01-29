exports.up = function(knex) {
    return knex.schema.createTable('message_slack', function(table) {
        table.increments('id').unsigned().primary();
        table.string('id_channel').references('id').inTable('channels').notNull();
        table.string('text').nullable();
        table.string('type').nullable();
<<<<<<< HEAD
        table.dateTime('time_send').nullable();
=======
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
>>>>>>> feature/NEOS_VN_BNT-15
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('message_slack');
<<<<<<< HEAD
};
=======
};
>>>>>>> feature/NEOS_VN_BNT-15
