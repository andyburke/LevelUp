var models = require( './models.js' );
var checks = require( './checks.js' );

var censoredFields = {
    'apiSecret': true
};

exports.bindToApp = function( app ) {
    app.post( '/Organization', checks.user, function( request, response ) {
        var name = request.param( 'name' );
        var description = request.param( 'description' );
        var url = request.param( 'url' );
        
        var newOrganization = new models.Organization();
        newOrganization.name = name ? name : '';
        newOrganization.description = description ? description : '';
        newOrganization.url = url ? url : '';
        newOrganization.updateApiSecret();
        newOrganization.ownerIds = [ request.session.user._id ];
        
        newOrganization.save( function( saveError ) {
            if ( saveError )
            {
                response.json( saveError, 500 );
                return;
            }
    
            response.json( newOrganization );
        });
    });
    
    app.put( '/Organization/:organizationId', checks.organizationAuth, function( request, response ) {
        request.organization.name = request.param( 'name' ) ? request.param( 'name' ) : request.organization.name;
        request.organization.description = request.param( 'description' ) ? request.param( 'description' ) : request.organization.description;
        request.organization.url = request.param( 'url' ) ? request.param( 'url' ) : request.organization.url;
        request.organization.ownerIds = request.param( 'ownerIds' ) ? request.param( 'ownerIds' ) : request.organization.ownerIds;
        
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
            
            if ( request.session.user && organization.ownerIds.indexOf( request.session.user._id ) != -1 )
            {
                // if we're logged in and an owner, send back an uncensored version
                response.json( organization );
                return;
            }
            
            response.json( organization.censored( { 'apiSecret': true, 'ownerIds': true } ) );
        });
    });
    
    app.del( '/Organization/:organizationId', checks.organizationAuth, function( request, response ) {
        if ( request.organization._id != request.params.organizationId )
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
}