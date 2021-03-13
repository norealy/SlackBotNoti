const {Model} = require("objection");

class ChannelMicrosoftAccount extends Model {
  static get tableName() {
    return "channel_microsoft_account";
  }

  /* idColumn */
  static get idColumn() {
    return ["id_channel", "id_account"];
  }

  /* jsonSchema */
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id_channel", "id_account"],
      properties: {
        id_channel: {type: "string"},
        id_account: {type: "string"},
      },
    };
  }

  static get relationMappings() {
    const Channels = require("./Channels");
    const MicrosoftAccount = require("./MicrosoftAccount");
    return {
      channels: {
        relation: Model.HasOneRelation,
        modelClass: Channels,
        join: {
          from: "channel_microsoft_account.id_channel",
          to: "channels.id",
        },
      },
      microsoft_account: {
        relation: Model.HasOneRelation,
        modelClass: MicrosoftAccount,
        join: {
          from: "channel_microsoft_account.id_account",
          to: "microsoft_account.id",
        },
      },
    };
  }
}

module.exports = ChannelMicrosoftAccount;
