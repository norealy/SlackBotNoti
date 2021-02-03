
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('google_calendar').del()
    .then(function () {
      // Inserts seed entries
      return knex('google_calendar').insert([
        {id: 'id_calendarGG1', name: 'google_calendar name',created_at:null},
        {id: 'id_calendarGG2',  name: 'google_calendar name2',created_at:null},
        {id: 'id_calendarGG3',  name: 'google_calendar name3',created_at:null},
      ]);
    });
};
