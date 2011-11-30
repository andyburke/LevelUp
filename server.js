var models = require( './models.js' );

var express = require( 'express' );

var sha1 = require( 'sha1' );

var dbHost = process.env[ 'MONGO_HOST' ] != null ? process.env[ 'MONGO_HOST' ] : 'localhost';
var dbPort = process.env[ 'MONGO_PORT' ] != null ? process.env[ 'MONGO_PORT' ] : 27017;
var dbName = process.env[ 'LEVELUP_DB' ] != null ? process.env[ 'LEVELUP_DB' ] : 'levelup-test';

var mongoose = require( 'mongoose' );
mongoose.connect( dbHost, dbName, dbPort );

var app = express.createServer(
    express.static(__dirname + '/public'),  
    express.bodyParser(),
    express.cookieParser()
);

function checkAPIKey( req, res, next )
{
    var apiKey = req.param( 'apiKey' );
    models.APIConsumer.findById( apiKey, function( err, apiConsumer ) {
        if ( err )
        {
            res.json( err, 500 );
            return;
        }

        if ( !apiConsumer )
        {
            res.json( 'Could not locate an API consumer account with api key: ' + apiKey, 404 );
            return;
        }

        var apiSecret = req.param
        if ( apiConsumer.secret != apiSecret )
        {
            res.json( 'Invalid API secret.', 403 );
            return;
        }

        req.apiConsumer = apiConsumer;
        next();
    });
}

app.get( '/APIConsumer', checkAPIKey, function( req, res ) {
    res.json( req.apiConsumer );
});

app.post( '/APIConsumer', function( req, res ) {
    var email = req.param( 'email' );
    var password = req.param( 'password' );
    var name = req.param( 'name' );
    var description = req.param( 'description' );
    var url = req.param( 'url' );
    
    var newAPIConsumer = new models.APIConsumer();
    newAPIConsumer.email = email ? email.toLowerCase() : null;
    newAPIConsumer.passwordHash = password ? sha1( password ) : null;
    newAPIConsumer.name = name;

    function saveNewAPIConsumer()
    {
        newAPIConsumer.save( function( err ) {
            if ( err )
            {
                res.json( err, 500 );
                return;
            }

            res.json( newAPIConsumer );
        });
    }
    
    if ( newAPIConsumer.email )
    {
        models.APIConsumer.findOne( { 'email': email.toLowerCase() }, function( err, apiConsumer ) {
            if ( apiConsumer )
            {
                res.json( 'An API consumer already exists with this email!', 500 );
                return;
            }
            
            saveNewAPIConsumer();
        });
    }
    else
    {
        saveNewAPIConsumer();
    }
});

app.get( '/Achievements/:entityIdHash/:contextId?', function( req, res ) {
    models.Entity.findOne( { 'idHash': req.params.entityIdHash }, function( err, entity ) {
        if ( err )
        {
            res.json( err, 500 );
            return;
        }
        
        if ( !entity )
        {
            // Should we send an error instead?
            res.json( [] );
            return;
        }

        var criteria = { 'entityId': entity.id };
        if ( req.params.contextId )
        {
            criteria.contextId = req.params.contextId;
        }
        
        var stream = models.AchievementEvent.find( criteria ).stream();

        stream.on( 'data', function ( event ) {
            if ( stream.readable )
            {
                res.write( JSON.stringify( event ) );
            }
        });
        
        stream.on( 'error', function ( streamError ) {
            res.json( streamError, 500 );
        });
        
        stream.on('close', function () {
            res.end();
        });

    });
});

app.listen( process.env.PORT || 8000 );
