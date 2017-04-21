var Nightmare = require('nightmare');		
var nightmare = Nightmare({ show: true });

nightmare
  .goto('https://www.olx.ph/login')
  .type('input[name="mobile"]', '09287005122')
  .type('input[name="password"]', 'Asdf99**')
  .click('#login_button')
  .wait('a.login.button')
//   .evaluate(function () {
//     return document.querySelector('#zero_click_wrapper .c-info__title a').href;
//   })
  .end()
  .then(function (result) {
    console.log(result);
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });
