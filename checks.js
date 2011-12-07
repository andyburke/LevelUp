var models = require( './models.js' );

var sha1 = require( 'sha1' );

exports.organizationAuth = function( request, response, next )
{
    if ( request.organization )
    {
        next();
        return;
    }

    var apiKey = request.param( 'apiKey' );
    if ( apiKey )
    {
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
            if ( ( apiSecret && organization.secret == apiSecret ) || ( password && organization.passwordHash == sha1( password ) ) )
            {
                request.organization = organization;
                next();
                return;
            }
    
            response.json( 'Invalid authentication credentials.', 403 );
        });
        
        return;
    }
    
    var authorization = request.headers.authorization;
    if ( !authorization )
    {
        response.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"');
        response.send( 'Unauthorized', 401 );
        return;
    }

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

    models.Organization.findOne( { 'email': email.toLowerCase() }, function( error, organization ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( organization.passwordHash != sha1( password ) )
        {
            response.send( 'Invalid password.', 401 );
            return;
        }
        
        request.organization = organization;
        next();
        return;
    });
}