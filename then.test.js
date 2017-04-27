
// jquery
var window = require("jsdom").jsdom().defaultView;
var $ = require("jquery")( window );

var vo = require('vo');

var nightmare = require('./then.test/nightmare')();



//the generator accepts the selector to get the first search result
var run = function*(selector) {
  //declare the result and wait for Nightmare's queue defined by the following chain of actions to complete
  var result = yield nightmare
    //load a url
    .goto('http://yahoo.com')
    //simulate typing into an element identified by a CSS selector
    //here, Nightmare is typing into the search bar
    // .type('input[title="Search"]', 'github nightmare')
    // //click an element identified by a CSS selector
    // //in this case, click the search button
    // .click('#uh-search-button')
    //wait for an element identified by a CSS selector
    //in this case, the body of the results
    .wait('body')
    //execute javascript on the page
    //here, the function is getting the HREF of the first match do the selector parameter
    //note the selector is passed in as the second argument to evaluate
    .evaluate(function(selector) {
      return document.querySelector(selector)
        .innerHTML;
    }, selector);

  //queue and end the Nightmare instance along with the Electron instance it wraps
  yield nightmare.end();

  //return the HREF
  return result;
};

//use `vo` to execute the generator function, allowing parameters to be passed to the generator
// vo(run)('body', function(err, result) {
//   if (err) {
//     console.error('an error occurred: ' + err);
//   }
//   console.log('result length.', result.length );
// });


function* work() {
    yield nightmare.goto('http://work.org').wait(500);
    return true;
}
vo( run, work )( 'body', function ( err, res ) {
    console.error("error: ", err);
    console.log(" res: " , res );

});
// function* abc() {
//     yield mare.goto("http://work.org/abc-library/").wait(500);
//     return true;
// }

// function* backend() {
//     yield mare.goto("http://work.org/backend/").wait(500);
//     return true;
// }

// function* backend02() {
//     yield mare.goto("http://work.org/backend-0.2/").wait(500);
//     return true;
// }

// vo( [ work, abc ] )( 'abc', 'def' );
// //vo( backend )();
// //vo( backend02 )();
