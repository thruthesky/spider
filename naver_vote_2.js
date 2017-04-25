// nightmare
var Nightmare = require('nightmare');		

// jquery
var window = require("jsdom").jsdom().defaultView;
var $ = require("jquery")( window );

// sqlite
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('spider.sqlite');



// http client
var Client = require('node-rest-client').Client;
var client = new Client();
var args = {
	requestConfig: { timeout: 1000 },
	responseConfig: { timeout: 1000 }
};


var nightmare;      // global variable.


var data = loadYamlConfiguration();


naverVote();

function naverVote() {
    if ( 1 ) changeIpAddress();     // changeIpAddress() => change ip => ipChanged()
    else naverGetUser();
}
function ipChanged() {
    naverGetUser();
}
function naverGetUser() {           // naverGetUser() => naverOpen() => naverLogin()
    var user = getUser();
    if ( user == null ) process.exit();
    checkIfVoted( user, naverVote, naverOpen );
}

function naverLoginFailed( user ) {
    console.log(`( ${user['id']} ) Login failed: Going to another vote.`);
    naverVote();
}
function naverVoteSuccess( user ) {
    console.log(`( ${user['id']} ) Success: Going to another vote.`);
    recordVoted( user, naverVote );
}

function naverOpen( user ) {
    console.log(`( ${user['id']} ) naverOpen() - Going to open login page`);
    var o = {
        x: data['config']['app x'],
        y: data['config']['app y'],
        width: data['config']['app width'],
        height: data['config']['app height'],
        dock: true
    };
    if ( data['config']['show window'] == 'y' ) o['show'] = true;
    if ( data['config']['show devtool'] == 'y' ) o['openDevTools'] = { mode: '' };

    nightmare = Nightmare( o );
    




    if ( data['config']['naver main page first'] == 'y' ) {
        nightmare
            .goto('http://www.naver.com')                       // 네이버 홈
            .click("#login .lg_global_btn")                     // 로그인 페이지로 클릭하여 이동
            .wait('input[name="id"]');
    }
    else {
            nightmare
                .goto('https://nid.naver.com/nidlogin.login')         // 로그인 페이지로 바로 이동.
    }

    nightmare.then( () => {
        console.log(`( ${user['id']} ) Naver login page is now open. Going to Login ...`);
        naverLogin( user );
    } );
}


/**
 * 
 * 
 * @param {*} user 
 * 
 * // naverLogin() => naverLoginFailed()
 * // naverLogin() => naverOpenKinDocumnt() => naverVoteSuccess()
 */
function naverLogin( user ) {
    console.log(`( ${user['id']} ) Now Login ...`);
    nightmare
        .type('input[name="id"]', user['id'])
        .type('input[name="pw"]', user['password'])
        .evaluate( () => {
            return document.querySelector('body').innerHTML;
        })
        .then( body => {
            console.log(`( ${user['id']} ) ID and Password had been typed in.`);
            var $body = $(body);
            if ( $body.find("input#ip_on").length ) {
                console.log("Found IP Security:");
                var $smart = $body.find("#smart_LEVEL")
                var lv = parseInt($smart.val());
                if ( lv == 1 ) {
                    console.log(`( ${user['id']} ) IP security is ON(${lv}). Going to OFF: `);
                    nightmare.click('input#ip_on').wait(2000).then( () => naverLogin_ClickLoginButton( user ) );
                }
            }
            else {
                console.log(`( ${user['id']} ) IP Security option NOT found on login page.`);
                naverLogin_ClickLoginButton( user );
            }
        })
}


function naverLogin_ClickLoginButton( user ) {
    console.log(`( ${user['id']} ) Going to click LOGIN button...`);
    nightmare
            .click('input.btn_global')              // login
            .wait('body')
            .wait( 3000 ) // 3 초 동안 대기. 충분한 시간.
            .evaluate(() => {
                return document.querySelector('body').innerHTML;
            })
            .then ( body => {

                var $body = $(body);
                var error = '';

                console.log(`( ${user['id']} ) Login check: `);
                var n = $body.find('.protection_content').length;
                if ( n ) {
                    var text = $body.find('.protection_content').text();
                    error = `( ${user['id']} ) Blocked because: ${text}`;
                }

                var $err = $body.find('#err_common');
                if ( $err.length ) {
                    var text = $body.find('#err_common').text();
                    error = `( ${user['id']} ) Login failed because: ${text}`;
                }


                if ( error ) {
                    console.log( error );
                    nightmare
                        .end()
                        .then( () => naverLoginFailed( user ) ).catch( e => console.log("Caught : ", e ));
                }
                else {
                    nightmare
                        .wait('.section_minime').wait( getPause() )               // 로그인 완료 표시
                        .then( () => {
                            console.log(`( ${user['id']} ) Login Success.`);
                            naverOpenKinDocument( user );
                        });
                    
                }
            });
}

function naverOpenKinDocument( user ) {

    if ( getKeyword() ) {
        var k = getKeyword();
        console.log(`( ${user['id']} ) Going to search keyword: ${k}`);
        nightmare
            // 해당 지식인 검색해서 클릭하여 이동 ( 사람 처럼 ), 단 실제 검색 후 검색 결과에서 클릭하지 않음.
            .click("a.an_a.mn_kin").wait('#topSearch').wait( getPause() )             // 지식인 페이지로 한번 이동.
            .type( 'input[name="query"]', k )        // 지식인 검색.
            .click( '.search_btn' ).wait('#search_result');     // 지식인 결과.
    }

    var vote = getVote();
    nightmare
        .goto( getKinUrl() )                     // 해당 지식인 글로 바로 이동.
        .wait(".u_likeit_layer").wait(1000)              // 공감 찾기.
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
        .click("li." + vote + " a")              // 비/공감 클릭
        .wait( getPause() )                                 //
        // .wait( 10 * 1000 )
        .end()
        .then( () => {
            console.log(`( ${user['id']} ) Success on Vote: ${vote}`);
            naverVoteSuccess( user );
        })
        .catch( err => console.error(err) );
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
    var vote = data['search']['vote'];
    return vote == 'y' ? 'good' : 'adver';
}
function getPause() {
    var pause = data['config']['click pause'] * 1000;
    // console.log("getPuase(): ", pause);
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


function checkIfVoted( user, alreadyVotedCallback, notVotedCallback ) {
    if ( ! user ) return null;
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

        if ( b ) { // 이미 공감했으면,
            console.log(`Already voted: ${user['id']}`);
            alreadyVotedCallback( user );
        }
        else {
            console.log(`Going to vote: ${user['id']}`);
            notVotedCallback( user );
        }
    });
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
        console.log( 'Naver vote data:', o);
        return o;
    } catch (e) {
        console.log(e);
    }
}




// before connect.
var myIp = null;
var currIp = null;


function changeIpAddress() {
    if ( myIp == null ) {
        getMyIpAddress();
    }
    else {
        renewIpAddress();
    }
}

function getMyIpAddress() {
    var req = client.get("http://witheng.com/spider.php?auth=italkcenter", args, (data, response) => {
        var res = JSON.parse( data.toString() ); 
        myIp = res['ip'];
        console.log(`My IP: ${myIp}`);
        renewIpAddress();
    });
    
    req.on('error', (err) => {
        console.log(`Fail to get My IP address. retry in 0.2s ...`);
        setTimeout( getMyIpAddress, 200 );
    });

req.on('requestTimeout', function (req) {
	console.log('request has expired');
	req.abort();
});

req.on('responseTimeout', function (res) {
	console.log('response has expired');

});

}

function renewIpAddress( ) {
    var req = client.get("http://witheng.com/spider.php?auth=italkcenter", args, (data, response) => {
        var res = JSON.parse( data.toString() ); 
        var newIp = res['ip'];
        if ( newIp == myIp || newIp == currIp ) {
            console.log(`IP NOT changed: renewing again in 0.2s ( Org IP: ${myIp}, Curr IP: ${currIp} ) ...`);
            setTimeout( renewIpAddress, 200 );
        }
        else {
            currIp = newIp;
            console.log(`IP has changed: My IP: ${myIp}. Rewed IP: ${newIp}`);
            console.log(`Going to vote.`);
            ipChanged();
        }
    });
    
    req.on('error', (err) => {
        console.log(`Fail to renew address. retry in 0.2s ...`);
        setTimeout( renewIpAddress, 200 );
    });

    req.on('requestTimeout', function (req) {
        console.log('request has expired');
        req.abort();
    });

    req.on('responseTimeout', function (res) {
        console.log('response has expired');

    });
}



function recordVoted( user, callback ) {
    db.run("INSERT INTO naver_vote_relation (id, docId) VALUES ( ?, ? )", [ user['id'], getDocId() ] , ( err, res ) => {
        if ( err ) {
            console.log( err );
        }
        callback();
    });
}

