const {Model} = require("objection");

class GoogleAccount extends Model {
  static get tableName() {
    return "google_account";
  }

  /* idColumn */
  static get idColumn() {
    return "id";
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "refresh_token"],
      properties: {
        id: {type: "string"},
        name: {type: "string"},
        refresh_token: {type: "string"},
      },
    };
  }

  static get relationMappings() {
    const Channel = require("./Channel");
    const GoogleCalendar = require("./GoogleCalendar");
    return {
      google_calendar: {
        relation: Model.ManyToManyRelation,
        modelClass: GoogleCalendar,
        join: {
          from: 'google_account.id',
          through: {
            // channel_google_account is the join table.
            from: 'google_account_calendar.id_account',
            to: 'google_account_calendar.id_calendar'
          },
          to: 'google_calendar.id'
        }
      },
      channel: {
        relation: Model.ManyToManyRelation,
        modelClass: Channel,
        join: {
          from: 'google_account.id',
          through: {
            // channel_google_account is the join table.
            from: 'channel_google_account.id_account',
            to: 'channel_google_account.id_channel'
          },
          to: 'channel.id'
        }
      },
    };
  }
}

module.exports = GoogleAccount;
