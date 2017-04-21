// nightmare
var Nightmare = require('nightmare');		
var nightmare = Nightmare({
    // openDevTools: { mode: '' },
    show: true,
    x: 1024,
    y: 0,
    dock: true
});
// jquery
var window = require("jsdom").jsdom().defaultView;
var $ = require("jquery")( window );

// sqlite
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('spider.sqlite');



loginOlx();
getPhoneNumber();



function getPhoneNumber() {
    
    db.get("SELECT * FROM pages WHERE link IS NOT NULL AND phone_number IS NULL", [], function(err, row) {
        if ( err ) throw err;
        console.log("query: ");
        if ( row ) {
            console.log(`crawl: `, row);
            gotoPage( row );
        }
    });

}



function loginOlx() {
    nightmare
        .goto('https://www.olx.ph/login')                 // login
        .type('input[name="mobile"]', '09287005122')
        .type('input[name="password"]', 'Asdf99**')
        .click('#login_button')
        .wait('a.login.button');
}
function gotoPage( row ) {

    var url = 'https://www.olx.ph' + row['link'];

    console.log("url: ", url);
    //console.log("nightmare: ", nightmare);

    nightmare
      .goto( url )
        //.click("a#sendPMBtn")
        .evaluate(function () {
                return document.querySelector('body').innerHTML;
        })
        .then(function ( body ) {
            var $body = $( body );
            console.log( $body );

            var number = $body.find("#real_mobile_number").find("strong").text();

            console.log("number: ", number);

            db.run("UPDATE pages SET phone_number=? WHERE idx=?", [ number, row['idx'] ] , ( err, res ) => {
                if ( err ) {
                    console.error("phone number update erorr: ", err);
                }
                else {
                    console.log("phone update success: ", number);
                    getPhoneNumber();
                }
            });
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
}