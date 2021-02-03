
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('channels').del()
    .then(function () {
      // Inserts seed entries
      return knex('channels').insert([
        {id: 'id_channel1', name: 'name1',created_at:null},
        {id: 'id_channel2', name: 'name2',created_at:null},
        {id: 'id_channel3', name: 'name3',created_at:null},
      ]);
    });
};
