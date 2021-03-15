const {Model} = require("objection");

class MicrosoftAccount extends Model {
  static get tableName() {
    return "microsoft_account";
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
    const MicrosoftCalendar = require('./MicrosoftCalendar')
    return {
      microsoft_calendar: {
        relation: Model.ManyToManyRelation,
        modelClass: MicrosoftCalendar,
        join: {
          from: 'microsoft_account.id',
          through: {
            // microsoft_account_calendar is the join table.
            from: 'microsoft_account_calendar.id_account',
            to: 'microsoft_account_calendar.id_calendar'
          },
          to: 'microsoft_calendar.id'
        },
      },
      channel: {
        relation: Model.ManyToManyRelation,
        modelClass: Channel,
        join: {
          from: 'microsoft_account.id',
          through: {
            // channel_microsoft_calendar is the join table.
            from: 'channel_microsoft_account.id_account',
            to: 'channel_microsoft_account.id_channel'
          },
          to: 'channel.id'
        }
      },
    };
  }
}

module.exports = MicrosoftAccount;
