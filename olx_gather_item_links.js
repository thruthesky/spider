// nightmare
var Nightmare = require('nightmare');		
var nightmare = Nightmare({
    //openDevTools: { mode: '' },
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




nightmare
//   .goto('https://www.olx.ph/login')                 // login
//   .type('input[name="mobile"]', '09287005122')
//   .type('input[name="password"]', 'Asdf99**')
//   .click('#login_button')
//   .wait('a.login.button')
  .goto('https://www.olx.ph/mobile-phones-tablets') // mobile phone category.
  .evaluate(function () {
        return document.querySelector('body').innerHTML;
  })
  .end()
  .then(function (result) {
        var $row = $(result).find("#listingsRow");
        var $ex = $row.find(".row.expanded");
        var $cols = $ex.find(".columns");

        // $cols.forEach( function( e ) {
        for ( var item of $cols ) {
            var $item = $(item);
            var href = $item.find('a').prop('href');
            console.log( href );
            saveLink( href );
        }
        console.log( $cols.length );
  })
  
  .catch(function (error) {
    console.error('Search failed:', error);
  });

function saveLink( link ) {
  
  db.get("SELECT * FROM pages WHERE link=?", [ link ], function(err, row) {
    if ( err ) throw err;
    if ( row ) {
      console.log(`link: already inserted: `, row);
    }
    else {
      db.run("INSERT INTO pages (domain, link) VALUES ( ?, ? )", [ 'olx', link ] , ( err, res ) => {
        console.log( err );
        console.log( res );
      } );
    }
  });
}
