var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    app.post( '/Context', checks.user, function( request, response ) {
        
        var newContext = new models.Context();
        newContext.ownerIds = [ request.session.user._id ];
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
    
    app.put( '/Context/:contextId', checks.ownsContext, function( request, response ) {
        request.context.name = request.param( 'name' ) ? request.param( 'name' ) : request.context.name;
        request.context.description = request.param( 'description' ) ? request.param( 'description' ) : request.context.description;
        request.context.image = request.param( 'image' ) ? request.param( 'image' ) : request.context.image;
        request.context.url = request.param( 'url' ) ? request.param( 'url' ) : request.context.url;
        request.context.ownerIds = request.param( 'ownerIds' ) ? request.param( 'ownerIds' ) : request.context.ownerIds;
        
        request.context.save( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( request.context );
        });
    });
    
    app.get( '/Context/:contextId', function( request, response ) {
        models.Context.findById( request.params.contextId, function( error, context ) {
            if ( error )
            {
                response.json( error, 500 );
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
    
    app.del( '/Context/:contextId', checks.ownsContext, function( request, response ) {
        request.context.remove( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( { 'removed': true } );
        });
    });
    
    app.get( '/Contexts', checks.user, function( request, response ) {
        models.Context.find( { 'ownerIds': request.session.user._id }, function( error, contexts ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( contexts );
        });
    });   
}
