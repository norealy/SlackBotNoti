
const ENV = require('../utils/Env');
const stateSecretAzure = ENV.get("AZURE_STATE", 'RANDOMID@@--123');
const stateAzure = Buffer.from(stateSecretAzure).toString('base64')
const redirectUrlAzure = ENV.get("AZURE_REDIRECT", "http://localhost:5100/auth/microsoft");
const scopeAzure = "calendars.readwrite";
const azureIdAzure = ENV.get("AZURE_ID");
const urlRequestAuthor = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${azureIdAzure}&response_type=code&redirect_uri=${redirectUrlAzure}&response_mode=query&scope=${scopeAzure}`; //&state=${stateAzure}

const deleteEvent = {
	"title": {
		"type": "plain_text",
		"text": "BOT NOTI CALENDARS",
		"emoji": true
	},
	"type": "modal",
	"close": {
		"type": "plain_text",
		"text": "Close",
		"emoji": true
	},
	"blocks": [
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "YES"
					},
					"style": "primary",
					"action_id": "buttonUpdate"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "NO !"
					},
					"style": "danger",
					"action_id": "buttonDelete"
				}
			]
		}
	]
}

const listEvent = [
	{
		"type": "header",
		"text": {
			"type": "plain_text",
			"text": "List event calendar",
			"emoji": true
		}
	},
	{
		"type": "section",
		"fields": [
			{
				"type": "mrkdwn",
				"text": "*Triển Khai dự án mới*"
			},
			{
				"type": "mrkdwn",
				"text": "1:00PM-2:00PM"
			},
			{
				"type": "mrkdwn",
				"text": "_phòng họp số 1_"
			},
			{
				"type": "mrkdwn",
				"text": "27-02-2021"
			}
		],
		"accessory": {
			"type": "button",
			"text": {
				"type": "plain_text",
				"text": "Edit",
				"emoji": true
			},
			"style": "primary",
			"value": "buttonUpdate",
			"action_id": "buttonUpdate"
		}
	},
	{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "<https://example.com|View request>"
		}
	}
]

const listCalendar = [
	{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "*List calendar*"
		},
		"accessory": {
			"type": "radio_buttons",
			"initial_option": {
				"value": "value-0",
				"text": {
					"type": "plain_text",
					"text": "Calendar 1"
				}
			},
			"options": [
				{
					"text": {
						"type": "plain_text",
						"text": "Calendar 1",
						"emoji": true
					},
					"value": "value-0"
				},
				{
					"text": {
						"type": "plain_text",
						"text": "Calendar 2",
						"emoji": true
					},
					"value": "value-1"
				},
				{
					"text": {
						"type": "plain_text",
						"text": "Calendar 3",
						"emoji": true
					},
					"value": "value-2"
				}
			],
			"action_id": "radio_buttons-action"
		}
	},
	{
		"type": "actions",
		"elements": [
			{
				"type": "button",
				"text": {
					"type": "plain_text",
					"emoji": true,
					"text": "Show Calendar"
				},
				"style": "primary",
				"value": "buttonSubmit",
				"action_id": "buttonSubmit"
			}
		]
	}
]

const addCalendarToChannel = {
	"title": {
		"type": "plain_text",
		"text": "BOT NOTI CALENDARS ",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Submit",
		"emoji": true
	},
	"type": "modal",
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "System settings calendars",
				"emoji": true
			}
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "plain_text",
					"text": "Google Account :",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "Microsoft Account :",
					"emoji": true
				}
			]
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "plain_text",
					"text": "xdatgd@gmail.com",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "tuanna99qn@outlook.com",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "googledemo1@gmail.com",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "microsoftdemo1@outlook.com",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "googledemo2@gmail.com",
					"emoji": true
				}
			]
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Login Google"
					},
					"style": "primary",
					"url": "https://google.com",
					"action_id": "addGoogle"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Login microsoft"
					},
					"style": "primary",
					"url": urlRequestAuthor,
					"action_id": "addMicrosoft"
				}
			]
		},
		{
			"type": "input",
			"element": {
				"type": "checkboxes",
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "Calendar1",
							"emoji": true
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Calendar2",
							"emoji": true
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Calendar3",
							"emoji": true
						},
						"value": "value-2"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Calendar4",
							"emoji": true
						},
						"value": "value-3"
					}
				]
			},
			"label": {
				"type": "plain_text",
				"text": "List calendars :",
				"emoji": true
			}
		}
	]
}

let timeStart =
{
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": "Time start event"
	},
	"accessory": {
		"type": "timepicker",
		"initial_time": "13:30",
		"placeholder": {
			"type": "plain_text",
			"text": "Select time",
			"emoji": true
		},
		"action_id": "timepicker-action"
	}
}
let timeEnd =
{
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": "Time end event"
	},
	"accessory": {
		"type": "timepicker",
		"initial_time": "14:00",
		"placeholder": {
			"type": "plain_text",
			"text": "Select time",
			"emoji": true
		},
		"action_id": "timepicker-action2"
	}
}

let dateEnd = {
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": "Date end of the event all day "
	},
	"accessory": {
		"type": "datepicker",
		"initial_date": "2021-02-18",
		"placeholder": {
			"type": "plain_text",
			"text": "Date event at ",
			"emoji": true
		},
		"action_id": "datepicker-action1"
	}
}

const addEvent = {
	"title": {
		"type": "plain_text",
		"text": "BOT NOTI CALENDARS ",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Submit",
		"emoji": true
	},
	"type": "modal",
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Edit event calendar",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Calendar :"
			},
			"accessory": {
				"type": "users_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select a calendar",
					"emoji": true
				},
				"action_id": "users_select-action"
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Edit a title",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": " "
			},
			"accessory": {
				"type": "checkboxes",
				"action_id": "allday",
				"options": [
					{
						"value": "true",
						"text": {
							"type": "plain_text",
							"text": "All day"
						}
					}
				]
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Date of the event"
			},
			"accessory": {
				"type": "datepicker",
				"initial_date": "2021-02-18",
				"placeholder": {
					"type": "plain_text",
					"text": "Date event at ",
					"emoji": true
				},
				"action_id": "datepicker-action"
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Location",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "Every day",
							"emoji": true
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Every week",
							"emoji": true
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Every month",
							"emoji": true
						},
						"value": "value-2"
					}
				],
				"action_id": "static_select-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Repeat",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "At time of event",
							"emoji": true
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "15 minutes before",
							"emoji": true
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "30 minutes before",
							"emoji": true
						},
						"value": "value-2"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "1 hours before",
							"emoji": true
						},
						"value": "value-3"
					}
				],
				"action_id": "static_select-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Remind me",
				"emoji": true
			}
		}
	]
}

const editEvent = {
	"type": "modal",
	"title": {
		"type": "plain_text",
		"text": "My App",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Submit",
		"emoji": true
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Edit event calendar",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Calendar :"
			},
			"accessory": {
				"type": "users_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select a calendar",
					"emoji": true
				},
				"action_id": "users_select-action"
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Edit a title",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Date of the event"
			},
			"accessory": {
				"type": "datepicker",
				"initial_date": "2021-02-18",
				"placeholder": {
					"type": "plain_text",
					"text": "Date event at ",
					"emoji": true
				},
				"action_id": "datepicker-action"
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Location",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "Every day",
							"emoji": true
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Every week",
							"emoji": true
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Every month",
							"emoji": true
						},
						"value": "value-2"
					}
				],
				"action_id": "static_select-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Repeat",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "At time of event",
							"emoji": true
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "15 minutes before",
							"emoji": true
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "30 minutes before",
							"emoji": true
						},
						"value": "value-2"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "1 hours before",
							"emoji": true
						},
						"value": "value-3"
					}
				],
				"action_id": "static_select-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Remind me",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Do you want to delete event?"
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Delete",
					"emoji": true
				},
				"style": "danger",
				"value": "buttonDelete",
				"action_id": "buttonDelete"
			}
		}
	]
}

module.exports = {
	addCalendarToChannel,
	addEvent,
	editEvent,
	timeEnd,
	timeStart,
	dateEnd,
	listCalendar,
	listEvent,
	deleteEvent
}
