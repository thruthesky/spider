// nightmare
var Nightmare = require('nightmare');		


// jquery
var window = require("jsdom").jsdom().defaultView;
var $ = require("jquery")( window );


// sqlite
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('spider.sqlite');

// spawn for child process
const spawn = require('cross-spawn').spawn;



// Variables
var HMA_exe_path = "c:\\Program Files (x86)\\HMA! Pro VPN\\bin\\HMA! Pro VPN.exe";
var appPosition = {
    x: 700, y: 0,
    width: 1024, height: 600
};
var kinUrl = "http://kin.naver.com/qna/detail.nhn?d1id=9&dirId=9020104&docId=274226392&qb=7ZWE66as7ZWA&enc=utf8&section=kin&rank=2&search_sort=0&spq=0&pid=TnVBdwpVuFssscIib4Vssssss5C-234232&sid=xquiSJlusQyVysEmhy6jMg%3D%3D";
kinUrl = "http://kin.naver.com/qna/detail.nhn?d1id=9&dirId=9020104&docId=271155938&qb=7ZWE66as7ZWA&enc=utf8&section=kin&rank=3&search_sort=0&spq=0";
kinUrl = "http://kin.naver.com/qna/detail.nhn?d1id=11&dirId=110803&docId=274993389&qb=7ZmU7IOB7JiB7Ja0&enc=utf8&section=kin&rank=1&search_sort=0&spq=0";
var vote = 'N'; // Y 이면 공감. 'Y' 가 아닌 모든 값은 '비공감'(광고)



/// preprocess
var kinDocId = getDocId();

/// run
var iUsers = 0;
getUsers( doVote );


function doVote( users ) {
    if ( iUsers >= users.length ) return;
    var user = users[iUsers];
    console.log("User ID: ", user['id']);
    checkVoted( user, ( user, y ) => {
        iUsers ++;
        if ( y ) { // 이미 공감했으면,
            console.log(`Already voted: ${user['id']}`);
            return doVote( users );
        }
        else {
            console.log(`Going to vote: ${user['id']}`);
        }
        doNightmare( user, () => {
            //console.log(`i: ${iUsers}, users in nightmare: `, users);
            console.log(`Vote done by : ${user['id']}`);
            recordVoted( user, () => doVote( users ) );
        });
    });

            // doNightmare( row, () => {
            //     db.run("INSERT INTO naver_vote_relation (id, docId) VALUES ( ?, ? )", [ row['id'], kinDocId ] , ( err, res ) => {
            //         if ( err ) { console.log( err ); }
            //         else {
            //             doVote();
            //         }
            //     } );
            // } );
            

}

function doNightmare( user, callback ) {
    if ( ! user ) return callback();
    if ( user['id'] === void 0 || user['id'] == '' ) return callback();

    var nightmare = Nightmare({
        //openDevTools: { mode: '' },
        show: true,
        x: appPosition.x,
        y: appPosition.y,
        width: appPosition.width,
        height: appPosition.height,
        dock: true
    });
    var vote_type = vote == 'Y' ? 'good' : 'adver';
                                            // if ( user['type'] == 'facebook' ) {
                                            //     console.log(`Facebook Login: ${user['id']}`);
                                            // }
    changeIPAddress();
    nightmare
        .wait( 22000 ) // Hide My Ass 가 IP 를 변경 할 때 까지, 대기. 최소 22 초가 필요. 인터넷이 느릴 수록 더 필요

                                    // .goto("http://philgo.com/etc/ip.php")
                                    // .wait(5000)
                                    // .end()
                                    // .then( re => {
                                    //     console.log(re);
                                    //     callback();
                                    //  } )
                                    // .catch( err => console.error( err ) );

        .goto('http://www.naver.com')                       // 네이버 홈
        .click("#login .lg_global_btn")                     // 로그인 페이지 클릭
        .type('input[name="id"]', user['id']).wait(200)
        .type('input[name="pw"]', user['password']).wait(500)
        .click('input.btn_global')
        .wait('.section_minime').wait(300)                            // 로그인 완료
        .click("a.an_a.mn_kin")             // 옵션: 지식인 페이지로 한번 이동.
        .goto( kinUrl )                     // 해당 지식인 글로 이동.
        .wait(".u_likeit_layer").wait(100)              // 공감 찾기.
        .evaluate(() => {                               // 공감으로 스크롤.
            var layer = document.querySelectorAll('.u_likeit_layer');
            function position(elem) {
                var left = 0,
                    top = 0;
                do {
                    left += elem.offsetLeft;
                    top += elem.offsetTop;
                } while ( elem = elem.offsetParent );

                return { left: left, top: top };
            }
            var p = position( layer[0] );
            // console.log("P: ", p);
            document.querySelector("body").scrollTop = p.top;
        }).wait(1000)
        .click("li." + vote_type + " a")              // 비/공감 클릭
        .wait(2000)                                 //
        .end()
        .then( result => {
            callback();
        })
        .catch( err => console.error(err) );
}



function changeIPAddress() {
    let proc = spawn( HMA_exe_path, [ '-changeip' ] );
    
    proc.stdout.on('data', (data) => {
        console.log("data on changeIPAddress: ", String(data));
    });

    proc.stderr.on('data', (data) => {
        console.log("errror data on changeIPAddress: ", data.toString());
    });

    proc.on('close', (code) => {
        if ( code ) { // true if error.
            console.log("Failed with code: ", code);
        }
        else {
            console.log("HMA -ipchange success:" );
        }
    });
}


function getDocId() {
    var d = kinUrl.split('docId=');
    var n = d[1].split('&');
    console.log(`Naver KIN Document ID:  ${n[0]}`);
    return n[0];
}


function getUsers( callback ) {
    db.all(`SELECT * FROM naver_id`, [], function(err, rows) {
        if ( err ) return console.log ( err );
        if ( rows ) {
            callback( rows );
        }
        else {
            console.error("No users in database");
        }
    });
}

function checkVoted( user, callback ) {
    db.get("SELECT * FROM naver_vote_relation WHERE id=? AND docId=?", [ user['id'], kinDocId ], ( err, row ) => {
        if ( err ) {
            console.log( err );           // 에러
            callback( user, true );         // 에러 있으면 공감 한 거으로 함.
        }
        else {
            if ( row ) callback( user, true );  // 공감 했음.
            else callback( user, false );   // 공감 안 했음.
        }
    })
}

function recordVoted( user, callback ) {
    db.run("INSERT INTO naver_vote_relation (id, docId) VALUES ( ?, ? )", [ user['id'], kinDocId ] , ( err, res ) => {
        if ( err ) {
            console.log( err );
        }
        callback();
    })
}