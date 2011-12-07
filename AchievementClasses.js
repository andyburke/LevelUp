var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    /*
    app.post( '/AchivementClass', checks.organizationAuth, function( request, response ) {
        
        var newContext = new models.Context();
        newContext.organizationId = request.organization._id;
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
    
    app.put( '/Context/:contextId', checks.organizationAuth, checks.ownsContext, function( request, response ) {
        request.context.name = request.param( 'name' ) ? request.param( 'name' ) : request.context.name;
        request.context.description = request.param( 'description' ) ? request.param( 'description' ) : request.context.description;
        request.context.image = request.param( 'image' ) ? request.param( 'image' ) : request.context.image;
        request.context.url = request.param( 'url' ) ? request.param( 'url' ) : request.context.url;
    
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
    
    app.del( '/Context/:contextId', checks.organizationAuth, checks.ownsContext, function( request, response ) {
        request.context.remove( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( { 'removed': true } );
        });
    });
    
    app.get( '/Contexts/:organizationId', function( request, response ) {
        models.Context.find( { 'organizationId': request.params.organizationId }, function( error, contexts ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( contexts );
        });
    });
    
    app.get( '/ContextStream/:organizationId', function( request, response ) {
        var stream = models.Context.find( { 'organizationId': request.params.organizationId } ).stream();
    
        stream.on( 'data', function ( context ) {
            if ( stream.readable )
            {
                response.write( JSON.stringify( context ) );
            }
        });
        
        stream.on( 'error', function ( streamError ) {
            response.json( streamError, 500 );
        });
        
        stream.on( 'close', function () {
            response.end();
        });
    });
    */
}
