
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('google_account_calendar').del()
    .then(function () {
      // Inserts seed entries
      return knex('google_account_calendar').insert([
        {id_calendar: 'id_calendarGG1', id_account: 'id_gg1',created_at:null},
        {id_calendar: 'id_calendarGG2', id_account: 'id_gg2',created_at:null},
        {id_calendar: 'id_calendarGG3', id_account: 'id_gg3',created_at:null},
      ]);
    });
};
