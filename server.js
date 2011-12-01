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

var censoredFields = {
    'Organization': { 'email': true , 'passwordHash': true, 'apiSecret': true }
}

function checkOrganizationAuth( request, response, next )
{
    var apiKey = request.param( 'apiKey' );
    models.Organization.findById( apiKey, function( error, organization ) {
        if ( error )
        {
            response.json( error.message ? error.message : error, 500 );
            return;
        }

        if ( !organization )
        {
            response.json( 'Could not locate an organization with api key: ' + apiKey, 404 );
            return;
        }

        var apiSecret = request.param( 'apiSecret' );
        var password = request.param( 'password' );
        if ( !( organization.secret || organization.passwordHash ) || ( apiSecret && organization.secret == apiSecret ) || ( password && organization.passwordHash == sha1( password ) ) )
        {
            request.organization = organization;
            next();
            return;
        }

        response.json( 'Invalid authentication credentials.', 403 );
    });
}

app.get( '/Organization/:organizationId', function( request, response ) {
    models.Organization.findById( request.params.organizationId, function( error, organization ) {
        if ( error )
        {
            response.json( error.message ? error.message : error, 500 );
            return;
        }
        
        if ( !organization )
        {
            response.json( 'No organization found for the id: ' + request.params.organizationId, 404 );
            return;
        }
        
        var censoredOrganization = {};
        for ( var key in organization._doc )
        {
            if ( !( key in censoredFields[ 'Organization' ] ) )
            {
                censoredOrganization[ key ] = organization[ key ];
            }
        }

        response.json( censoredOrganization );
    });
});

app.get( '/Organization', checkOrganizationAuth, function( request, response ) {
    response.json( request.organization );
});

app.post( '/Organization', function( request, response ) {
    var email = request.param( 'email' );
    var password = request.param( 'password' );
    var name = request.param( 'name' );
    var description = request.param( 'description' );
    var url = request.param( 'url' );
    
    var newOrganization = new models.Organization();
    newOrganization.apiSecret = sha1( 'SO SECRET!' + email + password + name + new Date() );
    newOrganization.email = email ? email.toLowerCase() : '';
    newOrganization.passwordHash = password ? sha1( password ) : '';
    newOrganization.name = name ? name : '';
    newOrganization.description = description ? description : '';
    newOrganization.url = url ? url : '';
    
    newOrganization.save( function( error ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }

        response.json( newOrganization );
    });
});

app.post( '/Context', checkOrganizationAuth, function( request, response ) {
    
    var newContext = new models.Context();
    newContext.organizationId = req.organization.id;
    newContext.name = request.param( 'name' );
    newContext.description = request.param( 'description' );
    newContext.image = request.param( 'image' );
    newContext.url = request.param( 'url' );

    newContext.save( function( error ) {
        if ( error )
        {
            response.json( error.message ? error.message : error, 500 );
            return;
        }

        response.json( newContext );
    });
});

app.get( '/Context/:contextId', function( request, response ) {
    models.Context.findById( request.params.contextId, function( error, context ) {
        if ( error )
        {
            response.json( error.message ? error.message : error, 500 );
            return;
        }
        
        if ( !context )
        {
            response.json( 'No context for for context id: ' + request.params.contextId, 404 );
            return;
        }
        
        response.json( context );        
    });
});

app.get( '/Achievements/:personIdHash/:contextId?', function( request, response ) {
    models.Entity.findOne( { 'idHash': request.params.entityIdHash }, function( error, entity ) {
        if ( error )
        {
            response.json( error.message ? error.message : error, 500 );
            return;
        }
        
        if ( !entity )
        {
            // Should we send an error instead?
            response.json( [] );
            return;
        }

        var criteria = { 'entityId': entity.id };
        if ( request.params.contextId )
        {
            criteria.contextId = request.params.contextId;
        }
        
        var stream = models.Achievement.find( criteria ).stream();

        stream.on( 'data', function ( achievement ) {
            if ( stream.readable )
            {
                response.write( JSON.stringify( achievement ) );
            }
        });
        
        stream.on( 'error', function ( streamError ) {
            response.json( streamError, 500 );
        });
        
        stream.on('close', function () {
            response.end();
        });

    });
});

app.listen( process.env.PORT || 8000 );
