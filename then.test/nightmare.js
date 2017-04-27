// nightmare
var Nightmare = require('nightmare');		

exports = module.exports = function() {

    var o = {
        x: 1024,
        y: 0,
        width: 800,
        height: 600,
        dock: true,
        show: true,
        openDevTools: { mode: '' }
    };
    
    return Nightmare( o );
    
}