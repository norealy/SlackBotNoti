## Build login google cấp tài nguyên cho slack

### Luồng Code xử lý trong phần Login Google


├── common                 //code module

│   ├── BaseServer.js


├── slack-google           //Pipeline of Slack and Google

│   ├── index.js

├── test                   //Unit test files

├── views

│   ├── ViewsDesign.js

├── img

├── .env.example

├── .gitignore

├── package.json


### Luồng thiết kế Login Google


Bước 1: Sẽ viết 1 hàm `JWT` thực hiện `sign` `idChannel, idUserSlack` để xác định người `add APP`

- Code
```
const idUserSlack = event.inviter;
const idChannel = event.channel;
const accessToken = jwt.sign({
	header: {alg: "HS256", typ: "JWT"},
	payload:{idUserSlack:idUserSlack,idChannel:idChannel},
	expiresIn:27000
},Env.chatServiceGet("JWT_KEY"))
onsole.log(accessToken);
```

Bước 2: Thực hiện `urlRequestAuthor` ngay trên `view.open` của `addCalendarToChannel` (sẽ bớt đi được 1 router)

- Code
```
const urlRequestAuthor = `https://accounts.google.com/signin/oauth?access_type=${access_type}&scope=${scopeGoogle}&response_type=${response_type}&client_id=${Env.chatServiceGet("GOOGLE_CLIENT_ID")}&redirect_uri=${Env.chatServiceGet("REDIRECT_URI")}&state=${accessToken}`;
```
```
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
					"url": urlRequestAuthor,
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

```

Bước 3: Viết thêm một ROUTER để hứng `code`

- Code

```
async sendCode(req, res, next) {
		const code = req.query.code;
		console.log("Code :", code)
		const uri = "http://localhost:5000/watch-set-access-token";
		const data = {
			code: code
		}
		const options1 = {
			method: 'POST',
			headers: {'content-type': 'application/json'},
			data: JSON.stringify(data),
			url: uri,
		};
		try {
			await Axios(options1);
			return res.status(200).send('oke');
		} catch (e) {

			console.log(e);
			return res.status(403).send("Error");
		}
	}
```
- Kết quả

`Code : 4/0AY0e-g7D_0D8MTConKaRl_rAOsaJnsupOLlKHh8X2TXn7Cfqt4tBu2FKOD8fbVRQ15ZFYQ`

Bước 4: Thực hiện việc lấy `accessToken`

- Code

```
	async setAccessToken(req, res, next) {
		try {
			const code  = req.body.code

			const urlGetToken = "https://oauth2.googleapis.com/token";
			let data1 = {
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				code: code,
				grant_type: "authorization_code",
				redirect_uri: redirectUrlGoogle,
			};
			const options = {
				method: 'POST',
				headers: {'content-type': 'application/x-www-form-urlencoded'},
				data: qs.stringify(data1),
				url: urlGetToken,
			};
			const result = await Axios(options);
			console.log(result.data);
			const accessTokenGoogle = result.data.access_token;
			console.log(accessTokenGoogle)
			return res.status(200).send("OK");
			//return res.status(200).send("Post Code ok");
		} catch (error) {
			console.log(error)
			return res.status(403).send(error);
		}
	}
}
```
- Kết Quả
```
 {
  access_token: 'ya29.a0AfH6SMD1SEpI_L-i7fDXm0ltaUEbUfgkbsqsnTa6kv___mB0X9DgMV5fWgejAPp5kB74Voe-Iqz_OBPl97h8Hbiyk9nRsho9HYmLFwYlPcwkRT6DIBqZaQVevz0AMMkYCVfZn4Rc6g5TxQoZr8rX7A3N_8xoyyWA7KYPUa5ic4G6',
  expires_in: 3599,
  scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly',
  token_type: 'Bearer',
  id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAzYjJkMjJjMmZlY2Y4NzNlZDE5ZTViOGNmNzA0YWZiN2UyZWQ0YmUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NjU4NDc2NjA2NTItMDdkczFpYXE0ZnFkZWFpNW92ZW1tYmpscG9zY2VyYnMuYXBwcy5nb29nbGV1c2VyY29udGVu
dC5jb20iLCJhdWQiOiI5NjU4NDc2NjA2NTItMDdkczFpYXE0ZnFkZWFpNW92ZW1tYmpscG9zY2VyYnMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYzNDY4MTA3NjAxNDI1NjI4MDIiLCJhdF9oYXNoIjoiaFFWMkNsSHVQQUh4dEpFSDl4WVktUSIsIm5hbWUiOiJUdeG6pW4gTmd1eeG7hW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9s
aDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2p4Ymhpc3gwRUx6SVZocFF6Z3hkVXAzV2lQUjNJVHhPckt2TVR6VWc9czk2LWMiLCJnaXZlbl9uYW1lIjoiVHXhuqVuIiwiZmFtaWx5X25hbWUiOiJOZ3V54buFbiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjEyMTk0MDIwLCJleHAiOjE2MTIxOTc2MjB9.qFUaibxpkNVo4N96_wYKoro9Fpb
Lgg22tEHmE4o1mZ-noAz1PQi02oQMO0roj8by1aV5iTN8zqVsx8dNCzkZGVJarpSFt-mTX3I2g36ecVBY7A8sHBt3v2YdWiBDooP_lypvpMupP_94GsBoniclNwr6Y_IjAtgt6lSHmwTg9v2tFC2EJgeJeEVfZjtdCHif1l9NvL3JNOkB-mq3QqA-Dt2ohThIcSFKiY_IVjyxcIZkY2YnCpI4qegKVSADEweuTF6X20KcXGPBQGSAV5tEOousDjHiDta5oG3
YbFcSnRrDn-K6rNnNnWDqDR5-UOak4rcv4eMLo7xiB4L5CGh0EA'
}

```
- Lưu Info vs refresh_token vào DB
	+ Code

```
const options1 = {
				method:"GET",
				headers: {'Authorization': `Bearer ${accessTokenGoogle}` },
				url: "https://www.googleapis.com/oauth2/v3/userinfo",
			}
			const result1 = await Axios(options1);
			//console.log(result1.data);
				GoogleAccount.query()
					.insert({
						id: result1.data.sub,
						name: result1.data.name,
						refresh_token: result.data.refresh_token,
						created_at: null,
						updated_at: null,
					})
					.then((data) => {
						//console.log('Thanh Cong');
						return 1;
					})
					.catch((err) => {
					//	console.log(err);
					return 0;
					});
 ```


### 3 kiểu login trên slack

- Kiểu 1 khi người dùng `add App` trên slack và 1 `channel` cụ thể, thì sẽ thực hiện `postMessage` gửi về `channel` link đăng nhập

	+ Code
		```
  	const option = {
				method:"POST",
				headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
				data:{
					"channel":event.channel,
					"blocks": viewsDesign.loginGoogle
				},
				url: `https://slack.com/api/chat.postMessage`
			}
			const done = await Axios(option);
			//console.log(done.data);
		return res.status(200).send("done");
  	```
	+	Kết Quả

	```
 	{
  ok: true,
  channel: 'C01L7R9KT8X',
  ts: '1612260386.000500',
  message: {
    bot_id: 'B01KLEPH36V',
    type: 'message',
    text: "This content can't be displayed.",
    user: 'U01KE0ZMHPE',
    ts: '1612260386.000500',
    team: 'T01K36QJEHZ',
    bot_profile: {
      id: 'B01KLEPH36V',
      deleted: false,
      name: 'test',
      updated: 1611114238,
      app_id: 'A01JN7DS7QF',
      icons: [Object],
      team_id: 'T01K36QJEHZ'
    },
    blocks: [ [Object], [Object], [Object], [Object] ]
  }
}



- Kiểu 2 khi người dùng chưa đăng nhập nhưng thực hiện việc `list event` thì sẽ bắn ra `views settings` với phương thức `views.open` bắt người dùng phải  login

	+ Code
	+ Img

- Kiểu 3 khi trong `channel` cụ thể người dùng sẽ dùng câu lệnh `/cal setting` hoặc khi ở `Home app` thực hiện việc login cũng sẽ bắn ra 1 `view settings` bắt người dùng login

	+ Code

		`Khi người dùng /cal settings`

		```
  		const data = {
						"trigger_id": req.body.trigger_id,
						"view": viewsDesign.addCalendarToChannel
					}
					const options = {
						method: 'POST',
						headers: {'Authorization': `Bearer ${TOKEN_BOT}`},
						data: data,
						url: `https://slack.com/api/views.open`
					};
					const result = await Axios(options);
					return res.status(202).send(`Thank you call BOT-NOTI !
            If you want assistance please enter: /cal --help`);
				}
  	```

+ Kết quả
```
 data: {
    ok: true,
    view: {
      id: 'V01LNK2P9HQ',
      team_id: 'T01K36QJEHZ',
      type: 'modal',
      blocks: [Array],
      private_metadata: '',
      callback_id: '',
      state: [Object],
      hash: '1612260640.zU7zMdFi',
      title: [Object],
      clear_on_close: false,
      notify_on_close: false,
      close: [Object],
      submit: [Object],
      previous_view_id: null,
      root_view_id: 'V01LNK2P9HQ',
      app_id: 'A01JN7DS7QF',
      external_id: '',
      app_installed_team_id: 'T01K36QJEHZ',
      bot_id: 'B01KLEPH36V'
    }
  }
}

```



