const { addEvent } = template;
let viewDT = payload.view;
//"response_action": "update",
const { action_id = null, selected_options = null } = payload.actions[0];
if (action_id === "allday" && selected_options.length === 0) {
  console.log("all day false");
  viewDT.blocks.splice(5, 1);
  viewDT.blocks.splice(5, 0, addEvent.blocks[6]);
  viewDT.blocks.splice(6, 0, addEvent.blocks[7]);
}

else if (action_id === "allday" && selected_options.length > 0) {
  console.log("all day true");
  viewDT.blocks.splice(5, 2);
  viewDT.blocks.splice(5, 0, addEvent.blocks[5]);
}
console.log("payload find tringger_id:", payload.trigger_id);

let data = {
  "view_id": payload["container"]["view_id"],
  "view": addEvent.blocks.splice(5, 2)
}
const options = {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${Env.chatServiceGOF("BOT_TOKEN")}` },
  data: data,
  url: `${Env.chatServiceGOF("API_URL")}${Env.chatServiceGOF("API_VIEW_UPDATE")}`
};
return Axios(options);
