var models = require( './models.js' );
var checks = require( './checks.js' );

var sha1 = require( 'sha1' );

exports.bindToApp = function( app ) {
    
    app.post( '/api/1.0/Session', function( request, response ) {
        
        if ( request.session.user )
        {
            response.json( { 'created': false, 'user': request.session.user } );
            return;   
        }
        
        var email = null;
        var password = null;
        
        if ( request.headers.authorization )
        {
            var parts = request.headers.authorization.split(' ');
            var scheme = parts[ 0 ];
            var credentials = new Buffer( parts[ 1 ], 'base64' ).toString().split( ':' );
        
            if ( 'Basic' != scheme )
            {
                response.json( 'Basic authorization is the only supported authorization scheme.', 400 );
                return;
            }
    
            email = credentials[ 0 ];
            password = credentials[ 1 ];
        }
        else
        {
            email = request.param( 'email' );
            password = request.param( 'password' );
        }
        
        if ( !email || !password )
        {
            response.json( 'You must specify an email and a password, either using basic HTTP authentication or as part of the json-encoded post body.', 400 );
            return;
        }
        
        models.User.findOne( { 'email': email.toLowerCase() }, function( error, user ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !user )
            {
                response.json( 'Could not locate a user with the email: ' + email, 404 );
                return;
            }
            
            if ( user.passwordHash && ( sha1( password ) != user.passwordHash ) )
            {
                response.json( 'Invalid password.', 403 );
                return;
            }
            
            request.session.user = user;
            request.session.save();
            response.json( { 'created': true } );
        });
    });
    
    app.del( '/api/1.0/Session', checks.user, function( request, response ) {
        if ( !request.session )
        {
            response.json( 'No current session.', 404 );
            return;
        }
    
        request.session.destroy( function() {} );
        response.json( { 'removed': true } )
    });    
}