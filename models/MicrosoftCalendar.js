const {Model} = require("objection");

class MicrosoftCalendar extends Model {
  static get tableName() {
    return "microsoft_calendar";
  }

  /* idColumn */
  static get idColumn() {
    return "id";
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "address_owner"],
      properties: {
        id: {type: "string"},
        name: {type: "string"},
        address_owner: {type: "string"},
      },
    };
  }

  static get relationMappings() {
    const ChannelMicrosoftCalendar = require("./ChannelMicrosoftCalendar");
    return {
      channel_microsoft_calendar: {
        relation: Model.HasManyRelation,
        modelClass: ChannelMicrosoftCalendar,
        join: {
          from: "microsoft_calendar.id",
          to: "channel_microsoft_calendar.id_calendar",
        },
      }
    }
  }
}

module.exports = MicrosoftCalendar;
