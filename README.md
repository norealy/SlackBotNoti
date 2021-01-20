# Create app with Slack

Bước 1: Truy cập [Slack api](https://api.slack.com/apps)

Bước 2: Create New App

Bước 3: Add features and functionality

Bước 4: Install your app

Bước 5: Manage Distribution => add OAuth Redirect URLs => Submit App

- Sau khi tạo xong sẽ được cấp`Client ID` `Client Secret`
![alt text](public/image/anh1.PNG)
# Luồng OAuth2 
![alt text](public/image/oath.png)

Bước 1: Gửi người dùng ủy quyền và / hoặc cài đặt
Ứng dụng web hoặc thiết bị di động của bạn phải chuyển hướng người dùng đến URL sau:`https://slack.com/oauth/authorize`

Các giá trị sau phải được chuyển dưới dạng tham số GET:

`client_id` - được cấp khi bạn tạo ứng dụng của mình (bắt buộc)

`scope` - quyền yêu cầu (xem bên dưới) (bắt buộc)

`redirect_uri` - URL để chuyển hướng trở lại (xem bên dưới) (tùy chọn)

![alt text](public/image/url.PNG)

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

![alt text](public/image/add.PNG)

- List app
```
const options = {
method: 'GET',
headers: { 'Authorization': `Bearer ${accessTokenSlack}` },
url: `https://slack.com/api/conversations.list`
};
```

![alt text](public/image/list.PNG)


# Điều tra cách Lắng nghe event message từ app slack


  - Tài liệu tham khảo tại 
  - - [Event Subscriptions](https://api.slack.com/apps/A01K257T7GA/event-subscriptions?)
  - - [Using the Slack Events API](https://api.slack.com/apis/connections/events-api)

## Đăng ký các loại sự kiện
- Để bắt đầu làm việc với API sự kiện, bạn cần tạo ứng dụng Slack nếu chưa có.

- Trong khi quản lý ứng dụng của bạn, hãy tìm trang cấu hình **"Event Subscriptions"** và sử dụng nút gạt để "Enable". 
![Enalbe](public/image/eventson.png)
Bạn sẽ có thể chọn tất cả các loại sự kiện mà bạn muốn đăng ký.
![option](public/image/scopeBot.png)

- Events API Request URLs

Tất cả event đăng ký đều nhận được một HTTP POST chứa dữ liệu để phản hồi lại hoạt động.

Để đăng ký được Events API Request URLs qua các bước sau :

Bước 1 : Khi nhập đường dẫn redirect_url vào thanh nhập, client gửi request tạo redirect_url với Slack.
Bước 2 : Slack nhận đường link gửi lại cho phía endpoint 1 property trong request là "challenge". Rồi Slack đợi phản hồi từ phía endpoint.
Bước 3 : Phía endpoint kiểm tra trong request có value của challenge , sau đó gửi lại vs status 200 và value của challenge.
Bước 4 : Phía Slack kiểm tra giá trị của Challenge để xác nhận đăng ký thành công hay thất bại.

Hình minh họa luồng:

```js
@startuml
Client->Subcriptions: request
Subcriptions->EndPoint: Send challenge
EndPoint->Subcriptions: Return status 200, challenge
Subcriptions->Client: Created ok
@enduml
```
Hình ảnh khi đăng ký thành công.
![Enalbe](public/image/verification.png)


Code thực hiện đăng ký redirect url và log các thông báo khi có sự kiện đã đăng ký đến.
```
const challenge = req.body.challenge;
if (challenge) {
    return res.status(200).send(challenge);
}
console.log(req.body.event) 
return res.status(202).send("Ok");

```

## Chọn đăng ký sự kiện
Sau khi định cấu hình và xác thực URL Yêu cầu của bạn, đã đến lúc đăng ký các loại sự kiện hữu ích hoặc cần thiết cho ứng dụng của bạn.
![Enalbe](public/image/event_subscriptions.png)

- **Team Events** - đây là những sự kiện yêu cầu phạm vi OAuth tương ứng.

- **Bot Events** - đăng ký các sự kiện thay mặt cho người dùng bot của ứng dụng của bạn.

## Nhận sự kiện
- URL Yêu cầu của bạn sẽ nhận được yêu cầu cho mỗi sự kiện phù hợp với đăng ký . Một yêu cầu, một sự kiện.
- 
- Khi một sự kiện trong đăng ký thì một yêu cầu HTTP POST đến Redirect URL có định dạng sau:

![Enalbe](public/image/dataEvent.png)

- Các loại sự kiện có thể tham khảo tài liệu tại [https://api.slack.com/events](https://api.slack.com/events)