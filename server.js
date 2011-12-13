var express = require( 'express' );

var dbHost = process.env[ 'MONGO_HOST' ] != null ? process.env[ 'MONGO_HOST' ] : 'localhost';
var dbPort = process.env[ 'MONGO_PORT' ] != null ? process.env[ 'MONGO_PORT' ] : 27017;
var dbName = process.env[ 'LEVELUP_DB' ] != null ? process.env[ 'LEVELUP_DB' ] : 'levelup-test';

var mongoose = require( 'mongoose' );
mongoose.connect( dbHost, dbName, dbPort );

var app = express.createServer(
    express.static( __dirname + '/site' ),
    express.bodyParser(),
    express.cookieParser()
);

var contexts = require( './api/Contexts.js' );
contexts.bindToApp( app );

var organizations = require( './api/Organizations.js' );
organizations.bindToApp( app );

var achievementClasses = require( './api/AchievementClasses.js' );
achievementClasses.bindToApp( app );

var achievements = require( './api/Achievements.js' );
achievements.bindToApp( app );

app.listen( process.env.LEVELUP_PORT || 8000 );
