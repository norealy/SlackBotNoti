
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('microsoft_account').del()
    .then(function () {
      // Inserts seed entries
      return knex('microsoft_account').insert([
        {id: 'id_ms1', name: 'name1',refresh_token: 'refresh_token1',created_at:null,updated_at:null},
        {id: 'id_ms2', name: 'name2',refresh_token: 'refresh_token2',created_at:null,updated_at:null},
        {id: 'id_ms3', name: 'name3',refresh_token: 'refresh_token3',created_at:null,updated_at:null},
      ]);
    });
};
