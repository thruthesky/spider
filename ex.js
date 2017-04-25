var Nightmare = require('nightmare');		
var nightmare = Nightmare({ show: true });

openGoogle();

function openGoogle() {
    console.log("Open google.com: ")
    nightmare.goto("http://google.com")
        .wait("#lst-ib").wait(10000)
        .then( () => {
            console.log("Waiting for Google is done. Going to open Olx.");
            openOlx();
         } );
}
function openOlx() {
    console.log("Opening Olx: ");
    nightmare.goto("http://olx.com.ph/")
        .wait("#searchKeyword").wait(10000)
        .then( () => {
            console.log("Waiting for Olx is done. Going to open facebook");
            openFacebook();
        });
}
function openFacebook() {
    console.log("Opening Facebook: ");
    nightmare.goto("http://facebook.com/")
        .wait("#email").wait(10000)
        .then( () => {
            console.log("Waiting for Facebook is done. Going to open Philgo");
            openPhilgo();
        });
}
function openPhilgo() {
    console.log("Opening Philgo: ");
    nightmare.goto("http://philgo.com/")
        .wait(".search-key").wait(10000)
        .then( () => {
            console.log("Waiting for Philgo is done. Going to finish.");
            endScript();
        });
}
function endScript() {
    nightmare.end().then();
    process.exit();
}