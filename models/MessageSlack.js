const {Model} = require("objection");
const Channels = require("./Channels");

class MessageSlack extends Model {
  static get tableName() {
    return "message_slack";
  }

  /* idColumn */
  static get idColumn() {
    return "id";
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "id_channel"],
      properties: {
        id: {type: "string"},
        id_channel: {type: "string"},
        text: {type: "string", minLength: 3, maxLength: 255},
        type: {type: "string"},
        created_at: {default: null},
        updated_at: {default: null},
      },
    };
  }

  static get relationMappings() {
    return {
      channel: {
        relation: Model.BelongsToOneRelation,
        modelClass: Channels,
        join: {
          from: "message_slack.id_calendar",
          to: "channel.id",
        },
      },
    };
  }
}

module.exports = MessageSlack;
