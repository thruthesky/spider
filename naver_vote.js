// nightmare
var Nightmare = require('nightmare');		


// jquery
var window = require("jsdom").jsdom().defaultView;
var $ = require("jquery")( window );


// sqlite
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('spider.sqlite');


// info
var kinUrl = "http://kin.naver.com/qna/detail.nhn?d1id=11&dirId=110803&docId=274993389&qb=7ZmU7IOB7JiB7Ja0&enc=utf8&section=kin&rank=1&search_sort=0&spq=0&pid=TnoMwdpySo8sstnMVUVsssssszw-430176&sid=cCyfTZxlgSQaI2U2eep3tw%3D%3D";
var vote = 'Y';


doVote();


function doVote() {
    
    db.get("SELECT * FROM naver_id", [], function(err, row) {
        if ( err ) return console.error(err);
        if ( row ) {
            console.log(`naver_id: `, row);
            doNightmare( row, doVote );
        }
        else {
            console.log("No more");
        }
    });

}

function doNightmare( row, callback ) {
    var nightmare = Nightmare({
        //openDevTools: { mode: '' },
        show: true,
        x: 1024,
        y: 0,
        dock: true
    });
    nightmare
        .goto("http://philgo.com/etc/ip.php")
        .wait(5000)
        .end()
        .then( re => {
            console.log(re);
            callback();
         } )
        .catch( err => console.error( err ) );

        // .goto('http://www.naver.com')                 // main page
        // .click("#login .lg_global_btn")
        // .type('input[name="id"]', row['id'])
        // .type('input[name="pw"]', row['password'])
        // .click('input.btn_global')
        // .wait('.section_minime')
        // .goto( kinUrl )
        // .wait(".u_likeit_layer")
        // .evaluate(() => {
        //     var layer = document.querySelectorAll('.u_likeit_layer');
        //     function position(elem) {
        //         var left = 0,
        //             top = 0;
        //         do {
        //             left += elem.offsetLeft;
        //             top += elem.offsetTop;
        //         } while ( elem = elem.offsetParent );

        //         return { left: left, top: top };
        //     }
        //     var p = position( layer[0] );
        //     // console.log("P: ", p);
        //     document.querySelector("body").scrollTop = p.top;
        // })
        // .wait(1000)
        // .end()
        // .then( result => {} )
        // .catch( err => console.error(err) );
}





// clearCache();



// var url_kin = "http://kin.naver.com/qna/detail.nhn?d1id=11&dirId=110803&docId=274993389&qb=7ZmU7IOB7JiB7Ja0&enc=utf8&section=kin&rank=1&search_sort=0&spq=0&pid=TnoMwdpySo8sstnMVUVsssssszw-430176&sid=cCyfTZxlgSQaI2U2eep3tw%3D%3D";

// var h;

// nightmare
//     .clearCache()
//     .goto('http://www.naver.com')                 // main page
//     .click("#login .lg_global_btn")
//     .type('input[name="id"]', 'masarapsisig')
//     .type('input[name="pw"]', 'goodtalk6')
//     .click('input.btn_global')
//     .wait('.section_minime')
//     .goto( url_kin )
//     .wait(".u_likeit_layer")
//     .wait(100)
//     .evaluate(() => {
//         var layer = document.querySelectorAll('.u_likeit_layer');
//         function position(elem) {
//             var left = 0,
//                 top = 0;
//             do {
//                 left += elem.offsetLeft;
//                 top += elem.offsetTop;
//             } while ( elem = elem.offsetParent );

//             return { left: left, top: top };
//         }
//         var p = position( layer[0] );
//         // console.log("P: ", p);
//         document.querySelector("body").scrollTop = p.top;
//     })
//     .wait(1000)
//     .click(".toobad a")
//     .then( (result) => {
//         console.log("then: ");
//     })
//     .catch(function (error) {
//         console.error('Search failed:', error);
//     });


