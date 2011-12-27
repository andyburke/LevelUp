var models = require( './models.js' );

var sha1 = require( 'sha1' );

exports.user = function( request, response, next )
{
    if ( !request.session.user )
    {
        response.json( 'You must be logged in to access this resource.', 403 );
        return;
    }

    next();
}

exports.ownsContext = function( request, response, next ) {
    var apiSecret = request.param( 'apiSecret' );
    var apiKey = request.param( 'apiKey' );

    function foundUser( user )
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
            
            if ( context.ownerIds.indexOf( user._id ) != -1 )
            {
                request.context = context;
                next();
                return;
            }
    
            response.json( 'You are not authorized to access this resource.', 403 );
            return;
        });
    }
    
    if ( request.session.user )
    {
        foundUser( request.session.user );
        return;
    }
    
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
        
        foundUser( user );
    });
}

exports.ownsAchievementClass = function( request, response, next ) {
    if ( !request.context )
    {
        response.json( 'Internal server error: context is not set.', 500 );
        return;
    }
    
    models.AchievementClass.findById( request.params.classId, function( error, achievementClass ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( !achievementClass )
        {
            response.json( 'No achievement class for id: ' + request.params.classId, 404 );
            return;
        }
        
        if ( !achievementClass.contextId.equals( request.context._id ) )
        {
            response.json( 'You do not own this context.', 403 );
            return;
        }

        request.achievementClass = achievementClass;
        next();
    });
}