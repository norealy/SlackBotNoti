
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('microsoft_calendar').del()
    .then(function () {
      // Inserts seed entries
      return knex('microsoft_calendar').insert([
        { id: 'id_calendarMS1', name: ' microsoft_calendar name',address_owner:"address_owner", created_at: null },
        { id: 'id_calendarMS2', name: ' microsoft_calendar name2',address_owner:"address_owner", created_at: null },
        { id: 'id_calendarMS3', name: ' microsoft_calendar name3',address_owner:"address_owner", created_at: null },
      ]);
    });
};
