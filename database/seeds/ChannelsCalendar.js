
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('channels_calendar').del()
    .then(function () {
      // Inserts seed entries
      return knex('channels_calendar').insert([
        {id_calendar: "id_calendar1", id_channel: 'id_channel1',watch:true,created_at:null,updated_at:null},
        {id_calendar: "id_calendar2", id_channel: 'id_channel2',watch:true,created_at:null,updated_at:null},
        {id_calendar: "id_calendar3", id_channel: 'id_channel3',watch:true,created_at:null,updated_at:null},
      ]);
    });
};
