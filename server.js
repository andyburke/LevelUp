var models = require( './models.js' );
var checks = require( './checks.js' );

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

app.post( '/Organization', function( request, response ) {
    var email = request.param( 'email' );
    var password = request.param( 'password' );
    var name = request.param( 'name' );
    var description = request.param( 'description' );
    var url = request.param( 'url' );
    
    var newOrganization = new models.Organization();
    newOrganization.email = email ? email.toLowerCase() : '';
    newOrganization.passwordHash = password ? sha1( password ) : '';
    newOrganization.name = name ? name : '';
    newOrganization.description = description ? description : '';
    newOrganization.url = url ? url : '';
    newOrganization.updateApiSecret();
    
    models.Organization.findOne( { 'email': email }, function( error, organization ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( organization )
        {
            response.json( { 'error': 'An organization associated with this email address already exists.' }, 409 );
            return;
        }

        newOrganization.save( function( saveError ) {
            if ( saveError )
            {
                response.json( saveError, 500 );
                return;
            }
    
            response.json( newOrganization );
        });
    });
});

app.put( '/Organization', checks.organizationAuth, function( request, response ) {
    request.organization.passwordHash = request.param( 'password' ) ? sha1( request.param( 'password' ) ) : request.organization.passwordHash;
    request.organization.name = request.param( 'name' ) ? request.param( 'name' ) : request.organization.name;
    request.organization.description = request.param( 'description' ) ? request.param( 'description' ) : request.organization.description;
    request.organization.url = request.param( 'url' ) ? request.param( 'url' ) : request.organization.url;
    
    function save()
    {
        // update the api secret before saving
        request.organization.updateApiSecret();
        
        request.organization.save( function( saveError ) {
            if ( saveError )
            {
                response.json( saveError, 500 );
                return;
            }
            
            response.json( request.organization );
        });
    }
    
    if ( request.param( 'email' ) )
    {
        models.Organization.findOne( { 'email': request.param( 'email' ).toLowerCase() }, function( error, existingOrganization ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( existingOrganization )
            {
                response.json( 'An organization already exists with the email you are requesting to use.', 409 );
                return;
            }

            request.organization.email = request.param( 'email' ).toLowerCase();
            save();
            return;
        });
    }
    else
    {
        save();
    }
    
});

app.get( '/Organization', checks.organizationAuth, function( request, response ) {
    response.json( request.organization );
});

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

app.del( '/Organization/:organizationId', checks.organizationAuth, function( request, response ) {
    if ( !request.isAdmin && request.organization._id != request.params.organizationId )
    {
        response.json( 'Unauthorized', 401 );
        return;
    }
    
    request.organization.remove( function( error ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        response.json( { 'removed': true } );
    });
});


app.post( '/Context', checks.organizationAuth, function( request, response ) {
    
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
