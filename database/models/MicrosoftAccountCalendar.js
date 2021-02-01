const Model = require('../baseModel');
const MicrosoftCalendar = require('./MicrosoftCalendar');
const MicrosoftAccount = require('./MicrosoftAccount');

class MicrosoftAccountCalendar extends Model {
    static get tableName() {
        return 'microsoft_account_calendar';
    }

    /* idColumn */
    static get idColumn() {
        return ['id_calendar', 'id_account'];
    }

    /* jsonSchema */
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id_calendar', 'id_account'],
            properties: {
                id_calendar: { type: 'string' },
                id_account: { type: 'string' },
                created_at: { default: null },
            }
        };
    }

    static get relationMappings() {
        return {
            microsoftCal: {
                relation: Model.BelongsToOneRelation,
                modelClass: MicrosoftCalendar,
                join: {
                    from: 'microsoft_account_calendar.id_calendar',
                    to: 'microsoft_calendar.id'
                }
            },
            microsoftAcc: {
                relation: Model.BelongsToOneRelation,
                modelClass: MicrosoftAccount,
                join: {
                    from: 'microsoft_account_calendar.id_account',
                    to: 'microsoft_account.id'
                }
            }
        }
    }
}

module.exports = MicrosoftAccountCalendar