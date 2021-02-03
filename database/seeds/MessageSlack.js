
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('message_slack').del()
    .then(function () {
      // Inserts seed entries
      return knex('message_slack').insert([
        {id: 'message_slack1', id_channel: 'id_channel1',text: 'text',type: 'type',created_at:null,updated_at:null},
        {id: 'message_slack2', id_channel: 'id_channel2',text: 'text',type: 'type',created_at:null,updated_at:null},
        {id: 'message_slack3', id_channel: 'id_channel3',text: 'text',type: 'type',created_at:null,updated_at:null},
      ]);
    });
};
