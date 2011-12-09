var models = require( './models.js' );
var checks = require( './checks.js' );

var sha1 = require( 'sha1' );

var censoredFields = {
    'email': true ,
    'passwordHash': true,
    'apiSecret': true
};

exports.bindToApp = function( app ) {
    app.post( '/Organization', function( request, response ) {
        var email = request.param( 'email' );
        var password = request.param( 'password' );
        var name = request.param( 'name' );
        var description = request.param( 'description' );
        var url = request.param( 'url' );
        
        var newOrganization = new models.Organization();
        newOrganization.email = email ? email.toLowerCase() : '';
        newOrganization.passwordHash = password ? sha1( password ) : '';
        newOrganization.name = name ? name : '';
        newOrganization.description = description ? description : '';
        newOrganization.url = url ? url : '';
        newOrganization.updateApiSecret();
        
        models.Organization.findOne( { 'email': email }, function( error, organization ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( organization )
            {
                response.json( { 'error': 'An organization associated with this email address already exists.' }, 409 );
                return;
            }
    
            newOrganization.save( function( saveError ) {
                if ( saveError )
                {
                    response.json( saveError, 500 );
                    return;
                }
        
                response.json( newOrganization );
            });
        });
    });
    
    app.put( '/Organization', checks.organizationAuth, function( request, response ) {
        request.organization.passwordHash = request.param( 'password' ) ? sha1( request.param( 'password' ) ) : request.organization.passwordHash;
        request.organization.name = request.param( 'name' ) ? request.param( 'name' ) : request.organization.name;
        request.organization.description = request.param( 'description' ) ? request.param( 'description' ) : request.organization.description;
        request.organization.url = request.param( 'url' ) ? request.param( 'url' ) : request.organization.url;
        
        function save()
        {
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
        }
        
        if ( request.param( 'email' ) )
        {
            models.Organization.findOne( { 'email': request.param( 'email' ).toLowerCase() }, function( error, existingOrganization ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                if ( existingOrganization )
                {
                    response.json( 'An organization already exists with the email you are requesting to use.', 409 );
                    return;
                }
    
                request.organization.email = request.param( 'email' ).toLowerCase();
                save();
                return;
            });
        }
        else
        {
            save();
        }
        
    });
    
    app.get( '/Organization', checks.organizationAuth, function( request, response ) {
        response.json( request.organization );
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
            
            var censoredOrganization = {};
            for ( var key in organization._doc )
            {
                if ( !( key in censoredFields ) )
                {
                    censoredOrganization[ key ] = organization[ key ];
                }
            }
    
            response.json( censoredOrganization );
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