

# TODO

## 만달루용에 심카드 많음.

* 안드로이드 emulator 로 OS 버전, IP 를 바꾸어 가면서, 실제로 사용 할 좋은 아이디를 만든다.
    * 로그인도 자주 하고, 검색도 자주 하고, 블로그도 만들고, 메일도 실제로 사용하고 지식인 답변도 한다.
    * 그래서 안짤리는 아이디를 만든다.




## Authentication


This is very important tool that should not be used by others.
So, it should have a authentication check.

If It can access http://witheng.com/spider.php?auth=xxxxxx with valid response, then it's okay to go.

or not, it should be error.

So, you can actually control it.





# OLX phone number getting.

1. run `node olx_gather_item_links.js`
2. run `node olx_get_phone_number.js`

you can run both together.


# 네이버 공감

## DB 구조

naver_id <=> vote_relation <=> vote_link

* naver_id 는 사용자 id, pw 를 넣는다.

* voate_link 는 어떤 지식인 글을 테러 할 지.

* vote_relation 은 어떤 사용자가 어떤 링크를 공감 했는지 표시.


### naver_id

* type 에 facebook 값이 들어가면 facebook id, pw 로 로그인을 한다.
* ip 가 philippines 이면 필리핀 아이디로 접속한다.


### vote_link

* type 이 좋아요, 


# For Developers

* 개발을 최대한 간단히 한다.

* 완전히 SQLite 를 사용한다.

    * 예를 들어, 일반 사용자가 사이트 접속 ID, PW 정보를 그냥 DB Browser for SQLite 를 사용해서 바로 집어 넣는다
