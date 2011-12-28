var models = require( './models.js' );

var sha1 = require( 'sha1' );

exports.user = function( request, response, next )
{
    if ( request.session.user )
    {
        next();
        return;
    }

    var authorization = request.headers.authorization;
    if ( authorization )
    {
        var parts = authorization.split(' ');
        var scheme = parts[0];
        var credentials = new Buffer( parts[ 1 ], 'base64' ).toString().split( ':' );
    
        if ( 'Basic' != scheme )
        {
            response.send( 'Basic authorization is the only supported authorization scheme.', 400 );
            return;
        }
        
        var email = credentials[ 0 ];
        var password = credentials[ 1 ];
        
        models.User.findOne( { 'email': email.toLowerCase() }, function( error, user ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !user )
            {
                response.json( 'Could not locate a user with email addres: ' + email, 404 );
                return;
            }
            
            if ( user.passwordHash != sha1( password ) )
            {
                response.json( 'Invalid password.', 403 );
                return;
            }
            
            request.session.user = user;
            request.session.save();
            next();
            return;
        });

        return;
    }

    var apiSecret = request.param( 'apiSecret' );
    var apiKey = request.param( 'apiKey' );

    if ( apiSecret && apiKey )
    {
    
        models.User.findById( apiKey, function( error, user ) {
            if ( error )
            {
                request.json( error, 500 );
                return;
            }
            
            if ( !user )
            {
                request.json( 'Could not find a user with key: ' + apiKey, 404 );
                return;
            }
    
            if ( user.apiSecret != apiSecret )
            {
                request.json( 'Invalid apiSecret.', 403 );
                return;
            }
            
            request.session.user = user;
            request.session.save();
            next();
            return;
        });
        
        return;
    }
    
    response.json( 'No valid authentication method used (session, authorization, apiKey/apiSecret).', 403 );
    return;
}

exports.ownsContext = function( request, response, next ) {

    if ( !request.session.user )
    {
        response.json( 'Server error: user session does not exist.  Please report this problem.', 500 );
        return;
    }
    
    models.Context.findById( request.params.contextId, function( error, context ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( !context )
        {
            response.json( 'No context for id: ' + request.params.contextId, 404 );
            return;
        }
        
        if ( context.owners.indexOf( request.session.user.hash ) != -1 )
        {
            request.context = context;
            next();
            return;
        }

        response.json( 'You are not authorized to access this resource.', 403 );
        return;
    });
}