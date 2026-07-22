# Ubuntu에 Nginx 설치 및 서버 블록 설정 완벽 가이드

Nginx는 가볍고 높은 성능을 자랑하는 웹 서버, 리버스 프록시, 로드 밸런서 등으로 널리 사용됩니다. 이 가이드에서는 Ubuntu 22.04 환경에서 Nginx를 설치하고, 기본적인 설정을 거쳐 여러 웹사이트를 호스팅할 수 있는 '서버 블록(Server Blocks)'을 설정하는 방법까지 단계별로 안내합니다.

## 1. Nginx 설치하기

가장 먼저, 패키지 목록을 최신 상태로 업데이트하고 Nginx를 설치합니다.

```bash
sudo apt update
sudo apt install nginx -y
```

설치가 완료되면 Nginx 서비스가 자동으로 시작됩니다.

## 2. 방화벽 설정

Ubuntu에서는 `ufw`(Uncomplicated Firewall)를 사용하여 방화벽을 관리합니다. Nginx는 설치 시 `ufw`에 몇 가지 프로필을 등록합니다.

사용 가능한 Nginx 프로필을 확인합니다.

```bash
sudo ufw app list
```

출력 결과에서 다음과 같은 프로필을 볼 수 있습니다.

-   **Nginx HTTP**: 80번 포트 (암호화되지 않은 일반 웹 트래픽)
-   **Nginx HTTPS**: 443번 포트 (TLS/SSL 암호화된 트래픽)
-   **Nginx Full**: 80번과 443번 포트 모두 허용

가장 기본적인 `Nginx HTTP` 프로필을 허용해 보겠습니다.

```bash
sudo ufw allow 'Nginx HTTP'
```

방화벽 상태를 확인하여 규칙이 잘 적용되었는지 확인합니다.

```bash
sudo ufw status
```

## 3. 웹 서버 상태 확인

Nginx 서비스가 정상적으로 실행되고 있는지 확인합니다.

```bash
systemctl status nginx
```

`active (running)`이라는 메시지가 보이면 성공입니다. 이제 웹 브라우저에서 서버의 공인 IP 주소로 접속하여 Nginx 기본 환영 페이지가 나타나는지 확인하세요.

## 4. Nginx 주요 명령어 (프로세스 관리)

Nginx 서비스를 관리하기 위한 주요 `systemctl` 명령어는 다음과 같습니다.

-   **서비스 중지**: `sudo systemctl stop nginx`
-   **서비스 시작**: `sudo systemctl start nginx`
-   **서비스 재시작**: `sudo systemctl restart nginx`
-   **설정 파일 다시 불러오기 (서비스 중단 없음)**: `sudo systemctl reload nginx`
-   **부팅 시 자동 시작 비활성화**: `sudo systemctl disable nginx`
-   **부팅 시 자동 시작 활성화**: `sudo systemctl enable nginx`

## 5. 서버 블록(Server Blocks) 설정하기

서버 블록은 Apache의 가상 호스트(Virtual Host)와 같은 개념으로, 하나의 서버에서 여러 도메인의 웹사이트를 호스팅할 수 있게 해줍니다.

예를 들어, `your_domain.com`이라는 도메인을 위한 서버 블록을 설정해 보겠습니다.

### 5.1. 디렉토리 구조 생성

먼저, 웹 콘텐츠를 저장할 디렉토리를 생성합니다. `/var/www` 디렉토리 아래에 도메인 이름으로 폴더를 만드는 것이 일반적입니다.

```bash
sudo mkdir -p /var/www/your_domain.com/html
```

소유권을 현재 사용자에게 부여하여 파일 수정이 용이하도록 합니다.

```bash
sudo chown -R $USER:$USER /var/www/your_domain.com/html
```

그리고 모든 사용자가 웹 콘텐츠를 읽을 수 있도록 권한을 설정합니다.

```bash
sudo chmod -R 755 /var/www
```

### 5.2. 테스트용 HTML 파일 생성

방금 만든 디렉토리에 간단한 `index.html` 파일을 생성합니다.

```bash
nano /var/www/your_domain.com/html/index.html
```

파일 내용은 다음과 같이 작성합니다.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to your_domain.com!</title>
</head>
<body>
    <h1>Success! The your_domain.com server block is working!</h1>
</body>
</html>
```

### 5.3. 서버 블록 파일 생성

Nginx 설정 파일은 `/etc/nginx/`에 있습니다. 이 중 `sites-available` 디렉토리에 서버 블록 설정을 추가하고, `sites-enabled`에 링크하여 활성화하는 방식을 사용합니다.

`sites-available`에 새로운 설정 파일을 생성합니다.

```bash
sudo nano /etc/nginx/sites-available/your_domain.com
```

파일에 다음 내용을 입력합니다. `your_domain.com` 부분은 실제 도메인으로 변경해야 합니다.

```nginx
server {
    listen 80;
    listen [::]:80;

    root /var/www/your_domain.com/html;
    index index.html index.htm index.nginx-debian.html;

    server_name your_domain.com www.your_domain.com;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 5.4. 서버 블록 활성화

`sites-enabled` 디렉토리에 방금 만든 설정 파일의 심볼릭 링크를 생성하여 서버 블록을 활성화합니다.

```bash
sudo ln -s /etc/nginx/sites-available/your_domain.com /etc/nginx/sites-enabled/
```

### 5.5. Nginx 설정 테스트 및 재시작

새로운 설정에 문법적 오류가 없는지 테스트합니다.

```bash
sudo nginx -t
```

`syntax is ok`와 `test is successful` 메시지가 나타나면 성공입니다. 이제 Nginx를 재시작하여 변경사항을 적용합니다.

```bash
sudo systemctl restart nginx
```

이제 웹 브라우저에서 `http://your_domain.com`으로 접속하면, "Success! The your_domain.com server block is working!" 메시지가 담긴 페이지를 볼 수 있습니다.

## 마무리

이것으로 Ubuntu에 Nginx를 설치하고, 기본적인 방화벽 설정과 서버 블록을 구성하는 전체 과정을 마쳤습니다. 이제 여러분은 이 서버 블록 설정을 응용하여 하나의 서버에서 여러 개의 웹사이트를 효율적으로 관리할 수 있습니다.
