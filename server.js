var express = require( 'express' );
var sha1 = require( 'sha1' );

var dbHost = process.env[ 'MONGO_HOST' ] != null ? process.env[ 'MONGO_HOST' ] : 'localhost';
var dbPort = process.env[ 'MONGO_PORT' ] != null ? process.env[ 'MONGO_PORT' ] : 27017;
var dbName = process.env[ 'LEVELUP_DB' ] != null ? process.env[ 'LEVELUP_DB' ] : 'levelup-test';

var mongoose = require( 'mongoose' );
mongoose.connect( dbHost, dbName, dbPort );

var mongo = require( 'mongodb' );
var sessionDb = new mongo.Db( dbName, new mongo.Server( dbHost, dbPort, { auto_reconnect: true } ), {} );
var mongoStore = require( 'connect-mongodb' );

var sessionSecret = process.env[ 'LEVELUP_SECRET' ] != null ? sha1( process.env[ 'LEVELUP_SECRET' ] ) : sha1( __dirname + __filename + process.env[ 'USER' ] );

console.log( sessionSecret );

var app = express.createServer(
    express.static( __dirname + '/site' ),
    express.bodyParser(),
    express.cookieParser(),
    express.session({
            cookie: { maxAge: 60000 * 60 * 24 * 30 }, // 30 days
            secret: sessionSecret,
            store: new mongoStore( { db: sessionDb } )
    })
);

var apiModules = [
    require( './api/Sessions.js' ),
    require( './api/Users.js' ),
    require( './api/Contexts.js' ),
    require( './api/Organizations.js' ),
    require( './api/AchievementClasses.js' ),
    require( './api/Achievements.js' )
];

for ( var moduleIndex = 0; moduleIndex < apiModules.length; ++moduleIndex )
{
    apiModules[ moduleIndex ].bindToApp( app );
}

app.listen( process.env.LEVELUP_PORT || 8000 );
