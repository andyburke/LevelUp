var models = require( './models.js' );

var sha1 = require( 'sha1' );

exports.user = function( request, response, next )
{
    if ( request.session.user )
    {
        next();
        return;
    }
    
    var email = null;
    var password = null;

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
        
        email = credentials[ 0 ];
        password = credentials[ 1 ];
    }
    else
    {
        email = request.param( 'email' );
        password = request.param( 'password' );
    }

    if ( !email )
    {
        response.json( 'You must specify an email and password to authenticate.', 400 );
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
}

exports.contextPermission = function( request, response, next ) {

    if ( request.param( 'apiKey' ) )
    {
        models.Context.findOne( { 'apiKey': request.param( 'apiKey' ) }, function( error, context ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !context || ( request.params.contextId && !context._id.equals( request.params.contextId ) ) )
            {
                response.json( 'You are not authorized to access this resource.', 403 );
                return;
            }
            
            request.context = context;
            next();
        });
        
        return;
    }

    if ( request.session.user && request.params.contextId )
    {
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
            
            if ( context.owners.indexOf( request.session.user.hash ) == -1 )
            {
                response.json( 'You are not authorized to access this resource.', 403 );
                return;
            }
    
            request.context = context;
            next();
        });
        
        return;
    }
    

    response.json( 'You are not authorized to access this resource.', 403 );
}

exports.ownsAchievementClass = function( request, response, next ) {
    if ( !request.session.user )
    {
        response.json( 'Server programming error: user session does not exist when checking achievement class ownership.  Please report this problem.', 500 );
        return;
    }
    
    if ( !request.context )
    {
        response.json( 'Server programming error: context is not set when checking achievement class ownership.  Please report this problem.', 500 );
        return;
    }
    
    models.AchievementClass.findById( request.params.achievementClassId, function( error, achievementClass ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( !achievementClass )
        {
            response.json( 'No achievement class for id: ' + request.params.achievementClassId, 404 );
            return;
        }
        
        if ( !achievementClass.contextId.equals( request.context._id ) )
        {
            response.json( 'Context with id ' + request.context._id + ' does not own achievement class with id ' + achievementClass._id, 403 );
            return;
        }
        
        request.achievementClass = achievementClass;
        next();
    });
}
