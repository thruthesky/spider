var my = function( age ) {
    console.log("my() => Going to run new Promise() now");
    return new Promise( ( resolve, reject ) => {
        console.log("Inside Promise => wait for 3s");
        setTimeout(()=>{
            if ( age > 50 ) reject('Old');
            else resolve('Young');
        }, 3000);
    });
}
console.log("Begin...");
my(70)
    .then( m => console.log("You are: ", m))
    .catch( err => console.error("ERROR: You are : ", err ));
console.log("End...");