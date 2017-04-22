// nightmare
var Nightmare = require('nightmare');		
var nightmare = Nightmare({
    openDevTools: { mode: '' },
    show: true,
    x: 1024,
    y: 0,
    dock: true
});

// jquery
var window = require("jsdom").jsdom().defaultView;
var $ = require("jquery")( window );


clearCache();



var url_kin = "http://kin.naver.com/qna/detail.nhn?d1id=11&dirId=110803&docId=274993389&qb=7ZmU7IOB7JiB7Ja0&enc=utf8&section=kin&rank=1&search_sort=0&spq=0&pid=TnoMwdpySo8sstnMVUVsssssszw-430176&sid=cCyfTZxlgSQaI2U2eep3tw%3D%3D";

var h;

nightmare
    .clearCache()
    .goto('http://www.naver.com')                 // main page
    .click("#login .lg_global_btn")
    .type('input[name="id"]', 'masarapsisig')
    .type('input[name="pw"]', 'goodtalk6')
    .click('input.btn_global')
    .wait('.section_minime')
    .goto( url_kin )
    .wait(".u_likeit_layer")
    .wait(100)
    .evaluate(() => {
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
    })
    .wait(1000)
    .click(".toobad a")
    .then( (result) => {
        console.log("then: ");
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });




function clearCache() {
    nightmare.action('clearCache',
        function(name, options, parent, win, renderer, done) {
            parent.respondTo('clearCache', function(done) {
            win.webContents.session.clearCache(done);
        });
        done();
        },
        function(done) {
            this.child.call('clearCache', done);
        });
}