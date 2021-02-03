
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('google_account').del()
    .then(function () {
      // Inserts seed entries
      return knex('google_account').insert([
        { id: 'id_gg1', name: 'name1', refresh_token: 'refresh_token1' ,created_at:null,updated_at:null},
        { id: 'id_gg2', name: 'name2', refresh_token: 'refresh_token2' ,created_at:null,updated_at:null},
        { id: 'id_gg3', name: 'name3', refresh_token: 'refresh_token3' ,created_at:null,updated_at:null},
      ]);
    });
};
