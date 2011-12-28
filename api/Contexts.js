var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    app.post( '/Context', checks.user, function( request, response ) {
        
        var newContext = new models.Context();
        newContext.owners = [ request.session.user.hash ];
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
    
    app.put( '/Context/:contextId', checks.user, checks.ownsContext, function( request, response ) {
        request.context.name = request.param( 'name' ) != undefined ? request.param( 'name' ) : request.context.name;
        request.context.description = request.param( 'description' ) != undefined ? request.param( 'description' ) : request.context.description;
        request.context.image = request.param( 'image' ) != undefined ? request.param( 'image' ) : request.context.image;
        request.context.url = request.param( 'url' ) != undefined ? request.param( 'url' ) : request.context.url;
        request.context.owners = request.param( 'owners' ) ? request.param( 'owners' ) : request.context.owners;
        
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
    
    app.del( '/Context/:contextId', checks.user, checks.ownsContext, function( request, response ) {
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
        models.Context.find( { 'owners': request.session.user.hash }, function( error, contexts ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( contexts );
        });
    });
    
    app.post( '/Context/:contextId/Owners/:ownerHash', checks.user, checks.ownsContext, function( request, response ) {
        request.context.owners.push( request.params.ownerHash );
        request.context.save( function( error ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( request.context );
        });
    });
    
    app.del( '/Context/:contextId/Owners/:ownerHash', checks.user, checks.ownsContext, function( request, response ) {
        if ( request.context.owners.indexOf( request.params.ownerHash ) != -1 )
        {
            request.context.owners.splice( request.context.owners.indexOf( request.params.ownerHash ), 1 );
            if ( request.context.owners.length == 0 )
            {
                response.json( 'Cannot remove last owner.', 403 );
                return;
            }

            request.context.save( function( error ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                response.json( request.context );
            });
        }
        else
        {
            response.json( request.context );
        }
    });
}
