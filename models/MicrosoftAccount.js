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
        created_at: {default: null},
        updated_at: {default: null},
      },
    };
  }
  static get relationMappings() {
    const MicrosoftCalendar = require("./MicrosoftCalendar");
    return {
      microsoft_calendar: {
        relation: Model.ManyToManyRelation,
        modelClass: MicrosoftCalendar,
        join: {
          from: 'microsoft_account.id',
          through: {
            // channel_microsoft_account is the join table.
            from: 'microsoft_account_calendar.id_account',
            to: 'microsoft_account_calendar.id_calendar'
          },
          to: 'microsoft_calendar.id'
        }
      }
    }
  }
}

module.exports = MicrosoftAccount;
