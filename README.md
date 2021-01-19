# Create app with Slack

Bước 1: Truy cập [Slack api](https://api.slack.com/apps)

Bước 2: Create New App

Bước 3: Add features and functionality

Bước 4: Install your app

Bước 5: Manage Distribution => add OAuth Redirect URLs => Submit App

- Sau khi tạo xong sẽ được cấp`Client ID` `Client Secret`
![alt text](https://github.com/norealy/SlackBotNoti/blob/zipPush/public/image/anh1.PNG)
# Luồng OAuth2 
![alt text](https://github.com/norealy/SlackBotNoti/blob/zipPush/public/image/oath.png)

Bước 1: Gửi người dùng ủy quyền và / hoặc cài đặt
Ứng dụng web hoặc thiết bị di động của bạn phải chuyển hướng người dùng đến URL sau:`https://slack.com/oauth/authorize`

Các giá trị sau phải được chuyển dưới dạng tham số GET:

`client_id` - được cấp khi bạn tạo ứng dụng của mình (bắt buộc)

`scope` - quyền yêu cầu (xem bên dưới) (bắt buộc)

`redirect_uri` - URL để chuyển hướng trở lại (xem bên dưới) (tùy chọn)

![alt text](https://github.com/norealy/SlackBotNoti/blob/zipPush/public/image/url.PNG)

`state` - chuỗi duy nhất được trả lại khi hoàn thành (tùy chọn)

`team` - Slack ID nhóm của một không gian làm việc để cố gắng hạn chế đối với (tùy chọn)

Bước 2: Nếu người dùng cho phép ứng dụng của bạn, Slack sẽ chuyển hướng trở lại `redirect_uri` được chỉ định của bạn với `code` tạm thời trong parameter GET , cũng như `state` nếu bạn đã cung cấp ở bước trước. Nếu các trạng thái không khớp, yêu cầu có thể đã được tạo bởi bên thứ ba và bạn nên hủy bỏ quy trình.

NOTE : Authorization codes chỉ được đổi một lần và hết hạn sau 10 phút kể từ khi cấp.

Bước 3: Gửi code để lấy access token

Thực hiện mã ủy quyền `oath.access` bằng API method `https://slack.com/api/oauth.access` 

`client_id` - có khi created your app (required)

`client_secret` - có khi you created your app (required)

`code` -  authorization code tạm thời (required)

`redirect_uri` - phải đúng với URL ban đầu



Mã Phàn hồi
```
{
    "access_token": "xoxp-23984754863-2348975623103",
    "scope": "read"
}
```

- ADD APP with Slack 
``` 
const data = {
"name":"acbdd"
}
const options = {
method: 'POST',
headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${accessTokenSlack}` }, //
data: data,
url: "https://slack.com/api/conversations.create",
};
```

![alt text](https://github.com/norealy/SlackBotNoti/blob/zipPush/public/image/add.PNG

- List app
```
const options = {
method: 'GET',
headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
url: `https://slack.com/api/conversations.list`
};
```

![alt text](https://github.com/norealy/SlackBotNoti/blob/zipPush/public/image/list.PNG)
