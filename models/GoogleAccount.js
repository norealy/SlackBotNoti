const { Model } = require("objection");

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
        id: { type: "string" },
        name: { type: "string" },
        refresh_token: { type: "string" },
        created_at: { default: null },
        updated_at: { default: null },
      },
    };
  }

  static get relationMappings() {
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
      }
    }
  }
}

module.exports = GoogleAccount;
