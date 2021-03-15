const {Model} = require("objection");
const Channel = require("./Channel");

class ChannelsCalendar extends Model {
  /* tableName */
  static get tableName() {
    return "channels_calendar";
  }

  /* idColumn */
  static get idColumn() {
    return ["id_calendar", "id_channel"];
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id_calendar", "id_channel"],
      properties: {
        id_calendar: {type: "string"},
        id_channel: {type: "string"},
        watch: {type: "boolean", default: true},
      },
    };
  }

  static get relationMappings() {
    return {
      channel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: "channels_calendar.id_calendar",
          to: "channel.id",
        },
      },
    };
  }
}

module.exports = ChannelsCalendar;
