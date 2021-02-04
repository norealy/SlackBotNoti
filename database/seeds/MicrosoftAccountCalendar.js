
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('microsoft_account_calendar').del()
    .then(function () {
      // Inserts seed entries
      return knex('microsoft_account_calendar').insert([
        {id_calendar: 'id_calendarMS1', id_account: 'id_ms1',created_at:null},
        {id_calendar: 'id_calendarMS2', id_account: 'id_ms2',created_at:null},
        {id_calendar: 'id_calendarMS3', id_account: 'id_ms3',created_at:null},
      ]);
    });
};
