/**
 * Show modals view edit event to slack
 * @param {Object} payload
 * @param {Object} template
 * @param {Array} timePicker
 * @returns {Promise}
 */
const handlerEditEvent = async (payload, template) => {
  const { trigger_id = null, channel = null, eventEditDT = null, idAcc = null } = payload;

  // console.log("eventEditDT :", eventEditDT);

  const channel_id = channel.id;
  const { editEvent } = template;
  let editView = JSON.stringify(editEvent);
  editView = JSON.parse(editView);
  editView.callback_id = `${editView.callback_id}/${eventEditDT.id}`;
  const chanCals = await ChannelsCalendar.query().where({ id_channel: channel_id });
  for (let i = 0, length = chanCals.length; i < length; i++) {
    const item = chanCals[i];
    const calendar = await MicrosoftCalendar.query().findById(item.id_calendar);
    const selectCalendars = {
      "text": {
        "type": "plain_text",
        "text": calendar.name,
        "emoji": true
      },
      "value": calendar.id
    }
    if (calendar.id === eventEditDT.idCalendar) {
      editView.blocks[1].accessory.initial_option = selectCalendars;
    }
    editView.blocks[1].accessory.options.push(selectCalendars);
  }
  editView.blocks[2].element.initial_value = eventEditDT.subject;
  if (eventEditDT.locations[0]) {
    editView.blocks[8].element.initial_value = eventEditDT.locations[0].displayName;
  }
  const account = await MicrosoftAccount.query().findById(idAcc);

  const datetimeStart = moment(eventEditDT.start.dateTime).utc(true).utcOffset(account.timezone).format("YYYY-MM-DD.hh:ss");
  const datetimeEnd = moment(eventEditDT.end.dateTime).utc(true).utcOffset(account.timezone).format("YYYY-MM-DD.hh:ss");
  editView.blocks[4].accessory.initial_date = datetimeStart.split('.')[0];
  const lengthEditBlocks = editView.blocks.length;
  if(eventEditDT.recurrence){
    editView.blocks[lengthEditBlocks -2].element.initial_option = repeatInitOption(eventEditDT.recurrence.pattern.type);
  }
  editView.blocks[lengthEditBlocks -1].element.initial_option = reminderStartInitOptions(eventEditDT.reminderMinutesBeforeStart);
  if (eventEditDT.isAllDay) {
    editView.blocks.splice(6, 2);
    editView.blocks[5].accessory.initial_date = datetimeEnd.split('.')[0];
    editView.blocks[3].accessory.initial_options =
      [
        {
          "value": "true",
          "text": {
            "type": "plain_text",
            "text": "All day"
          }
        }
      ]

  } else {
    const initialOption = {
      "text": {
        "type": "plain_text",
        "text": datetimeStart.split('.')[1],
        "emoji": true
      },
      "value": datetimeStart.split('.')[1]
    }
    const initialOption2 = {
      "text": {
        "type": "plain_text",
        "text": datetimeEnd.split('.')[1],
        "emoji": true
      },
      "value": datetimeEnd.split('.')[1]
    }
    editView.blocks[6].accessory.initial_option = initialOption;
    editView.blocks[7].accessory.initial_option = initialOption2;
    editView.blocks.splice(5, 1);
  }
  const data = {
    trigger_id: trigger_id,
    view: editView,
  };

  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
    data: data,
    url:
      Env.chatServiceGet("API_URL") +
      Env.chatServiceGet("API_VIEW_OPEN"),
  };
  return Axios(options);
};
