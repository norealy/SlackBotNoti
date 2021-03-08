const {Model} = require("objection");

class GoogleCalendar extends Model {
  static get tableName() {
    return "google_calendar";
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
        name: {type: "string"},
        created_at: {default: null},
      },
    };
  }
}

module.exports = GoogleCalendar;
