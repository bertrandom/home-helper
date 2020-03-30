
exports.up = function(knex) {
    return knex.schema.createTable('requests', table => {
        table.increments('id').primary();
        table.string('first_name');
        table.string('last_name');
        table.string('email');
        table.string('phone_number');
        table.string('street_address');
        table.string('city');
        table.string('state');
        table.string('zipcode');
        table.string('preferred_time_of_day');
        table.date('preferred_date');
        table.text('request_text');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.enu('request_state', ['submitted', 'vendor_selected', 'funded', 'vendor_paid', 'complete']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('requests');
};
