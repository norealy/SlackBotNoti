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
      },
    };
  }

  static get relationMappings() {
    const ChannelGoogleCalendar = require("./ChannelGoogleCalendar");
    return {
      channel_google_calendar: {
        relation: Model.HasManyRelation,
        modelClass: ChannelGoogleCalendar,
        join: {
          from: "google_calendar.id",
          to: "channel_google_calendar.id_calendar",
        },
      }
    }
  }
}

module.exports = GoogleCalendar;
