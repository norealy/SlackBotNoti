exports.up = function(knex) {
    return knex.schema.createTable('MessageSlack', function(t) {
        t.increments('id').unsigned().primary();
        t.string('idChannel').references('id').inTable('Channel').notNull();
        t.string('text').nullable();
        t.string('type').nullable();
        t.dateTime('timeSend').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('MessageSlack');
};