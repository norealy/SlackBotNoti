const {Model} = require("objection");

class Channel extends Model {
  /* tableName */
  static get tableName() {
    return "channel";
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
        id: {type: "string"},
        name: {type: "string", minLength: 1, maxLength: 255},
      },
    };
  }

  static get relationMappings() {
    const GoogleAccount = require("./GoogleAccount");
    const GoogleCalendar = require("./GoogleCalendar");
    const MicrosoftAccount = require("./MicrosoftAccount");
    const MicrosoftCalendar = require("./MicrosoftCalendar");
    return {
      channel_google_account: {
        relation: Model.ManyToManyRelation,
        modelClass: GoogleAccount,
        join: {
          from: 'channel.id',
          through: {
            // channel_google_account is the join table.
            from: 'channel_google_account.id_channel',
            to: 'channel_google_account.id_account'
          },
          to: 'google_account.id'
        }
      },
      channel_google_calendar: {
        relation: Model.ManyToManyRelation,
        modelClass: GoogleCalendar,
        join: {
          from: 'channel.id',
          through: {
            // channel_google_calendar is the join table.
            from: 'channel_google_calendar.id_channel',
            to: 'channel_google_calendar.id_calendar'
          },
          to: 'google_calendar.id'
        }
      },
      channel_microsoft_account: {
        relation: Model.ManyToManyRelation,
        modelClass: MicrosoftAccount,
        join: {
          from: 'channel.id',
          through: {
            // channel_microsoft_account is the join table.
            from: 'channel_microsoft_account.id_channel',
            to: 'channel_microsoft_account.id_account'
          },
          to: 'microsoft_account.id'
        }
      },
      channel_microsoft_calendar: {
        relation: Model.ManyToManyRelation,
        modelClass: MicrosoftCalendar,
        join: {
          from: 'channel.id',
          through: {
            // channel_microsoft_calendar is the join table.
            from: 'channel_microsoft_calendar.id_channel',
            to: 'channel_microsoft_calendar.id_calendar'
          },
          to: 'microsoft_calendar.id'
        }
      },
    };
  }
}

module.exports = Channel;
