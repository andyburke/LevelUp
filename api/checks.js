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

exports.organizationAuth = function( request, response, next )
{
    var apiSecret = request.param( 'apiSecret' );
    var apiKey = request.param( 'organizationId' ) || request.param( 'apiKey' );

    if ( !apiKey )
    {
        response.json( 'You must specify an apiKey or use a properly formatted organization url.', 400 );
        return;
    }
    
    models.Organization.findById( apiKey, function( error, organization ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }

        if ( !organization )
        {
            response.json( 'Could not locate an organization with id: ' + apiKey, 404 );
            return;
        }

        if ( apiSecret )
        {
            if ( organization.apiSecret == apiSecret )
            {
                request.organization = organization;
                next();
            }
            else
            {
                response.json( 'Invalid apiSecret.', 403 );
                return;
            }
        }
        else
        {
            if ( !request.session.user )
            {
                response.json( 'You must have a valid session if you want to access an organization without using your apiSecret.', 403 );
                return;
            }

            if ( organization.ownerIds.indexOf( request.session.user._id ) != -1 )
            {
                request.organization = organization;
                next();
                return;
            }
            
            response.json( 'You are not an owner for this organization.', 403 );
            return;
        }
    });
}

exports.ownsContext = function( request, response, next ) {
    if ( !request.organization )
    {
        response.json( 'Internal server error: organization is not set.', 500 );
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
        
        if ( !context.organizationId.equals( request.organization._id ) )
        {
            response.json( 'You do not own this context.', 403 );
            return;
        }

        request.context = context;
        next();
    });
}

exports.ownsAchievementClass = function( request, response, next ) {
    if ( !request.organization )
    {
        response.json( 'Internal server error: organization is not set.', 500 );
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
        
        if ( !achievementClass.organizationId.equals( request.organization._id ) )
        {
            response.json( 'You do not own this context.', 403 );
            return;
        }

        request.achievementClass = achievementClass;
        next();
    });
}