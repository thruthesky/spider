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
/// preprocess

var data = loadYamlConfiguration();

console.log( 'data:', data);




/// run
doVote();


function doVote() {
    var user = getUser();
    if ( ! user ) { process.exit(); }
    checkVoted( user, ( y ) => {
        
                        if ( y ) { // 이미 공감했으면,
                            console.log(`Already voted: ${user['id']}`);
                            return doVote();
                        }
                        else {
                            console.log(`Going to vote: ${user['id']}`);
                        }
        
        doNightmare( user, () => {
            //console.log(`i: ${iUsers}, users in nightmare: `, users);
            console.log(`Vote done by : ${user['id']}`);
            recordVoted( user, () => doVote() );
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

    console.log("doNightmare for: ", user);

    var nightmare = Nightmare({
        // openDevTools: { mode: '' },
        show: true,
        x: appPosition.x,
        y: appPosition.y,
        width: appPosition.width,
        height: appPosition.height,
        dock: true
    });
    var vote_type = getVote() == 'y' ? 'good' : 'adver';
                                            // if ( user['type'] == 'facebook' ) {
                                            //     console.log(`Facebook Login: ${user['id']}`);
                                            // }

    if ( data['config']['change ip'] == 'y' ) {
        
        changeIPAddress();
        
        nightmare
            .wait( data['config']['wait until ip change'] * 1000 );

    }
    nightmare
        //.wait( 22000 ) // Hide My Ass 가 IP 를 변경 할 때 까지, 대기. 최소 22 초가 필요. 인터넷이 느릴 수록 더 필요
                                    // .goto("http://philgo.com/etc/ip.php")
                                    // .wait(5000)
                                    // .end()
                                    // .then( re => {
                                    //     console.log(re);
                                    //     callback();
                                    //  } )
                                    // .catch( err => console.error( err ) );

    ;
    if ( data['config']['login'] == 'n' ) {
        nightmare.goto('http://naver.com');
    }
    else {
        if ( data['config']['naver main page first'] == 'y' ) {
            nightmare
                .goto('http://www.naver.com')                       // 네이버 홈
                .click("#login .lg_global_btn")                     // 로그인 페이지로 클릭하여 이동
        }
        else {
                nightmare
                    .goto('https://nid.naver.com/nidlogin.login')         // 로그인 페이지로 바로 이동.
        }
    }
    
    if ( data['config']['login'] == 'n' ) {
        
    }
    else {
        nightmare
            .type('input[name="id"]', user['id'])
            //.wait( getPause() )
            .type('input[name="pw"]', user['password'])
            //.wait( getPause() )
            .click('input.btn_global')
            .wait('body')
            .wait( 3000 )                        // 주의 : 'body' 태그가 나오자 마자 바로 evaluate 하면, .protection_content 가 없어서, 에러가 난다. 약 3 초 기다려, dom 이 모두 로드될 때 까지 야한다. 다른 좋은 방법을 찾기 어렵다.
    }
    nightmare
        .evaluate(() => {
            console.log("evaluate");
            var n = document.querySelectorAll('.protection_content').length;
            if ( n ) {
                console.log("evaludate: after login: ", n);
                return document.querySelector('.protection_content').innerText;
            }
            return '';
        })
        .then ( err => {
            if ( err ) {
                console.log("Login success. BUT blocked because: ", err);
                return nightmare
                    .end()
                    .then(() => {
                        callback();
                    })
                    .catch();
            }
            else {
                console.log("Login success.");
                if ( data['config']['login'] == 'y' ) {
                    nightmare
                    .wait('.section_minime').wait( getPause() )                            // 로그인 완료
                
                }
                

                if ( getKeyword() ) {
                    nightmare
                        // 해당 지식인 검색해서 클릭하여 이동 ( 사람 처럼 ), 단 실제 검색 후 검색 결과에서 클릭하지 않음.
                        .click("a.an_a.mn_kin").wait('#topSearch').wait( getPause() )             // 지식인 페이지로 한번 이동.
                        .type( 'input[name="query"]', getKeyword() ) // 지식인 검색.
                        .click( '.search_btn' ).wait('#search_result')

                        // 문제: 감색을 한 다음, 지식인 링크를 클릭하면, 새창이 열린다. 그러면 컨트롤이 안되어서 '공감'이 안된다.
                        //
                        // .wait( '[href*="'+ getDocId() +'"]' )
                        // .click( '[href*="'+ getDocId() +'"]' )
                }

                nightmare
                .goto( getKinUrl() )                     // 해당 지식인 글로 바로 이동.
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
                }).wait( getPause() )
                .click("li." + vote_type + " a")              // 비/공감 클릭
                .wait( getPause() )                                 //
                .end()
                .then( result => {
                    callback();
                })
                .catch( err => console.error(err) );
            }
        })
        .catch( e => {
            console.log("error caught after login: ", e);
            callback();
        });
        
        
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
    var url = data['search']['url'];
    var d = url.split('docId=');
    var n = d[1].split('&');
    // console.log(`Naver KIN Document ID:  ${n[0]}`);
    return n[0];
}

function getKeyword() {
    return data['search']['keyword'];
}
function getKinUrl() {
    return data['search']['url'];
}
function getVote() {
    return data['search']['vote'];
}
function getPause() {
    var pause = data['config']['click pause'] * 1000;
    console.log("getPuase(): ", pause);
    return pause;
}



function getUser() {
    var users = Object.keys( data.id );
    if ( data['iUser'] === void 0 ) data['iUser'] = 0;
    if ( data['iUser'] >= users.length ) return null;

    var id = users[ data.iUser ];

    var user = { id: id, password: data['id'][id] };
    data.iUser ++;
    console.log("getUser: ", user);
    return user;
}

// function getUsers( callback ) {

//     // db.all(`SELECT * FROM naver_id`, [], function(err, rows) {
//     //     if ( err ) return console.log ( err );
//     //     if ( rows ) {
//     //         callback( rows );
//     //     }
//     //     else {
//     //         console.error("No users in database");
//     //     }
//     // });
// }

function checkVoted( user, callback ) {
    if ( ! user ) return;
    var b = true;
    db.get("SELECT * FROM naver_vote_relation WHERE id=? AND docId=?", [ user['id'], getDocId() ], ( err, row ) => {
        if ( err ) {
            console.log( err );           // 에러
            // callback( user, true );         // 에러 있으면 공감 한 거으로 함.
            b = true;
        }
        else {
            if ( row ) b = true;  // 공감 했음.
            else b = false;   // 공감 안 했음.
        }
        callback( b );
    });
}

function recordVoted( user, callback ) {
    db.run("INSERT INTO naver_vote_relation (id, docId) VALUES ( ?, ? )", [ user['id'], getDocId() ] , ( err, res ) => {
        if ( err ) {
            console.log( err );
        }
        callback();
    })
}


function loadYamlConfiguration() {
    var yaml = require('js-yaml');
    var fs   = require('fs');
    var str  = fs.readFileSync('data.yml').toString();
                                            // console.log( 'str: ', str);
    var arr  = str.split('# -----------------');
                                            // console.log(arr);
    var o = {};
    // Get document, or throw exception on error
    try {
        o['config'] = yaml.load( arr[1] );
        o['search'] = yaml.load( arr[2] );
        o['id'] = yaml.load( arr[3] );
        /*
        var fUsers = yaml.load( arr[4] );
        if ( fUsers ) {
            var keys = Object.keys( fUsers );
            if ( keys.length ) {
                for ( var id of keys ) {
                    o['id'][ id ] = { password: fUsers[ id ], 'type': 'facebook' };
                }
            }
        }
        */
        return o;
    } catch (e) {
        console.log(e);
    }
}