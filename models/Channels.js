const { Model } = require("objection");

class Channels extends Model {
  /* tableName */
  static get tableName() {
    return "channels";
  }

  /* idColumn */
  static get idColumn() {
    return "id";
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],
      properties: {
        id: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 255 },
        created_at: { default: null },
      },
    };
  }

  static get relationMappings() {
    const GoogleAccount = require('./GoogleAccount');
    const MicrosoftAccount = require('./MicrosoftAccount');
    return {
      channel_google_account: {
        relation: Model.ManyToManyRelation,
        modelClass: GoogleAccount,
        join: {
          from: 'channels.id',
          through: {
            // channel_google_account is the join table.
            from: 'channel_google_account.id_channel',
            to: 'channel_google_account.id_account'
          },
          to: 'google_account.id'
        }
      },
      channel_microsoft_account: {
        relation: Model.ManyToManyRelation,
        modelClass: MicrosoftAccount,
        join: {
          from: 'channels.id',
          through: {
            // channel_google_account is the join table.
            from: 'channel_microsoft_account.id_channel',
            to: 'channel_microsoft_account.id_account'
          },
          to: 'microsoft_account.id'
        }
      },
    }

  }

}

module.exports = Channels;
