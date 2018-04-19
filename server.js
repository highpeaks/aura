
var express = require('express');
var app = express();

var clustering = require('density-clustering');
var dbscan = new clustering.DBSCAN();

var port = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
