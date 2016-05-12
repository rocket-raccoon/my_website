// Dependencies
var http = require('http');

var port = 3000;
var run_server = function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World, this is going to be my personal website!');
};
http.createServer(run_server).listen(port);
console.log("Server started on localhost: " + port);
