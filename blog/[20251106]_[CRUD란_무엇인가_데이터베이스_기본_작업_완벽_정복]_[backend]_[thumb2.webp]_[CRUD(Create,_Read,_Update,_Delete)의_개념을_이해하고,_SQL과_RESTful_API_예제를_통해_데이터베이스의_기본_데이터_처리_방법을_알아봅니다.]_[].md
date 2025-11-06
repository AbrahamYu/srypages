
# CRUD란 무엇인가? 데이터베이스 기본 작업 완벽 정복

소프트웨어 개발, 특히 백엔드나 데이터베이스를 다루다 보면 CRUD라는 용어를 반드시 마주치게 됩니다. CRUD는 데이터 관리의 가장 기본적인 네 가지 기능을 나타내는 약어로, 대부분의 애플리케이션이 데이터를 다루는 핵심적인 방식을 설명합니다. 이 글에서는 CRUD의 각 구성 요소를 자세히 알아보고, 실제 예제를 통해 완벽히 이해해 보겠습니다.

## CRUD의 정의

CRUD는 다음 네 단어의 첫 글자를 딴 약어입니다.

- **Create (생성)**: 새로운 데이터를 만듭니다.
- **Read (읽기)**: 기존 데이터를 조회하고 읽습니다.
- **Update (수정)**: 기존 데이터를 변경합니다.
- **Delete (삭제)**: 기존 데이터를 제거합니다.

이 네 가지 작업은 데이터베이스 시스템에서 데이터를 관리하기 위한 필수적인 기능의 집합입니다.

## 1. Create (생성)

Create는 말 그대로 새로운 데이터 레코드나 객체를 생성하는 작업을 의미합니다. 예를 들어, 사용자가 회원가입을 하거나, 새로운 블로그 글을 작성하는 경우가 여기에 해당합니다.

**SQL 예제 (`INSERT`)**

관계형 데이터베이스(RDBMS)에서는 `INSERT` 구문을 사용하여 새로운 데이터를 테이블에 추가합니다.

```sql
INSERT INTO users (username, email, password)
VALUES ('gemini-user', 'gemini@example.com', 'password123');
```

**RESTful API 예제 (`POST`)**

웹 애플리케이션에서는 클라이언트가 서버에 새로운 데이터 생성을 요청할 때 주로 HTTP `POST` 메서드를 사용합니다.

```http
POST /api/users
Content-Type: application/json

{
  "username": "gemini-user",
  "email": "gemini@example.com",
  "password": "password123"
}
```

## 2. Read (읽기)

Read는 데이터베이스에 저장된 데이터를 조회하는 작업을 의미합니다. 특정 조건에 맞는 데이터를 찾거나, 전체 데이터 목록을 가져오는 경우가 여기에 해당합니다.

**SQL 예제 (`SELECT`)**

`SELECT` 구문은 테이블에서 데이터를 조회하는 데 사용됩니다. `WHERE` 절을 사용하여 특정 조건에 맞는 데이터만 가져올 수 있습니다.

```sql
-- 모든 사용자 조회
SELECT * FROM users;

-- 특정 사용자 조회
SELECT * FROM users WHERE username = 'gemini-user';
```

**RESTful API 예제 (`GET`)**

`GET` 메서드는 서버로부터 정보를 요청(조회)하는 데 사용됩니다.

```http
-- 모든 사용자 목록 조회
GET /api/users

-- 특정 사용자 정보 조회
GET /api/users/gemini-user
```

## 3. Update (수정)

Update는 이미 존재하는 데이터를 수정하는 작업을 의미합니다. 사용자가 자신의 프로필 정보를 변경하거나, 게시글의 내용을 수정하는 경우가 여기에 해당합니다.

**SQL 예제 (`UPDATE`)**

`UPDATE` 구문은 테이블의 기존 레코드를 수정합니다. `WHERE` 절로 어떤 레코드를 수정할지 지정해야 합니다.

```sql
UPDATE users
SET email = 'new-email@example.com'
WHERE username = 'gemini-user';
```

**RESTful API 예제 (`PUT` 또는 `PATCH`)**

`PUT`은 리소스 전체를 교체하는 의미가 강하고, `PATCH`는 리소스의 일부만 수정할 때 사용됩니다.

```http
PATCH /api/users/gemini-user
Content-Type: application/json

{
  "email": "new-email@example.com"
}
```

## 4. Delete (삭제)

Delete는 데이터베이스에서 특정 데이터를 영구적으로 제거하는 작업을 의미합니다. 사용자가 회원 탈퇴를 하거나, 게시글을 삭제하는 경우가 여기에 해당합니다.

**SQL 예제 (`DELETE`)**

`DELETE` 구문은 테이블에서 레코드를 삭제합니다. `WHERE` 절을 사용하지 않으면 테이블의 모든 데이터가 삭제될 수 있으므로 주의해야 합니다.

```sql
DELETE FROM users WHERE username = 'gemini-user';
```

**RESTful API 예제 (`DELETE`)**

`DELETE` 메서드는 지정된 리소스를 삭제하도록 서버에 요청합니다.

```http
DELETE /api/users/gemini-user
```

## 마무리

CRUD는 데이터 중심의 애플리케이션을 구축하는 데 있어 가장 기본적이고 핵심적인 개념입니다. 사용자가 웹사이트와 상호작용하며 만들어내는 거의 모든 행동은 결국 데이터베이스에 대한 CRUD 작업 중 하나로 귀결됩니다.

이 네 가지 기본 작업을 명확히 이해하면 데이터베이스를 설계하고, API를 구축하며, 전체적인 애플리케이션의 데이터 흐름을 파악하는 데 큰 도움이 될 것입니다.
