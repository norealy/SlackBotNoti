## Build login google cấp tài nguyên cho slack

### Luồng Code xử lý trong phần Login Google


├── common                 //code module

│   ├── BaseServer.js  // Router (watch-send-code, )


├── slack-google           //Pipeline of Slack and Google

│   ├── index.js  // Ro

├── test                   //Unit test files

├── .env.example

├── .gitignore

├── package.json



### Luồng OAuth2.0


![img](./slack-google/img/uyquyen.PNG)

![text](./slack-google/img/accecess.PNG)


### Luồng thiết kế Login Google


Bước 1: Sẽ viết 1 hàm `JWT` thực hiện `sign` `idChenal, idGoogle` để xác định người `add APP`

- Code
```
const accessToken = jwt.sign({
header: {alg: "HS256", typ: "JWT"},
payload:{idChenal:"123",idGoogle:"123454"},
expiresIn:27000
},JWT_KEY)
```

Bước 2: Thực hiện `urlRequestAuthor` ngay trên `view.open` của `addCalendarToChannel` (sẽ bớt đi được 1 router)

- Code
```
const urlRequestAuthor = `https://accounts.google.com/signin/oauth?access_type=${access_type}&scope=${scopeGoogle}&response_type=${response_type}&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrlGoogle}&state=${accessToken}`;// const abc = (req,res)=>{
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
  access_token: 'ya29.a0AfH6SMAv_-88tnl5G9fhfytO-26pfy_t9RHfmcUuiJ8vl3JrwB2w4kwQarkCd3HFudGh8WxwQ2NMMOGQkcv05w4zyblQ8rMyevCRMQLGWmc4NDZCmLjVYqhoUBeKj5g2mV-a5uHFM2DEZ6G6M4nZeaoEM4KnMG38XekUr9D-C7A',
  expires_in: 3599,
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
  token_type: 'Bearer'
}

```

