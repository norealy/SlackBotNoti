const {Model} = require("objection");
const GoogleCalendar = require("./GoogleCalendar");
const GoogleAccount = require("./GoogleAccount");

class GoogleAccountCalendar extends Model {
  static get tableName() {
    return "google_account_calendar";
  }

  /* idColumn */
  static get idColumn() {
    return ["id_calendar", "id_account"];
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id_calendar", "id_account"],
      properties: {
        id_calendar: {type: "string"},
        id_account: {type: "string"},
      },
    };
  }

  static get relationMappings() {
    return {
      googleCal: {
        relation: Model.BelongsToOneRelation,
        modelClass: GoogleCalendar,
        join: {
          from: "google_account_calendar.id_calendar",
          to: "google_calendar.id",
        },
      },
      googleAcc: {
        relation: Model.BelongsToOneRelation,
        modelClass: GoogleAccount,
        join: {
          from: "google_account_calendar.id_account",
          to: "google_account.id",
        },
      },
    };
  }
}

module.exports = GoogleAccountCalendar;
