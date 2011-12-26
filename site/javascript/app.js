var apiServer = '';

function QueryParameters()
{
    var result = {};

    if (window.location.search)
    {
        // split up the query string and store in an associative array
        var params = window.location.search.slice(1).split("&");
        for (var i = 0; i < params.length; i++)
        {
            var tmp = params[i].split("=");
            result[tmp[0]] = unescape(tmp[1]);
        }
    }

    return result;
}

function SetActivePage( page )
{
    $('.navItem').removeClass( 'active' );
    var activeItem = $('#nav-' + page );
    $(activeItem).addClass( 'active' );
    $(activeItem).parents( '.dropdown' ).addClass( 'active' );
}

var g_TemplateCache = {};
var g_OrganizationCache = {};
var g_ContextCache = {};

function renderTemplate( elementSelector, template, data, callback ) {
    if ( g_TemplateCache[ template ] )
    {
        $(elementSelector).html( Mustache.to_html( g_TemplateCache[ template ], data ) );
        if ( callback )
        {
            callback();
        }
    }
    else
    {
        $.ajax({
            url: template,
            dataType: "text",
            success: function( contents ) {
                g_TemplateCache[ template ] = contents;
                renderTemplate( elementSelector, template, data, callback );
            }
        });
    }
}

var currentUser = null;

var app = Sammy( function() {
    this.debug = true;
    
    this.get( '#/', function() {
        SetActivePage( 'about' );
        renderTemplate( '#main', "/templates/home.mustache", null );
    });
    
    this.get( '#/API', function() {
        SetActivePage( 'api' );
        renderTemplate( '#main', "/templates/api.mustache", null );
    });
    
    this.get( '#/SignUp', function() {
        SetActivePage( 'signup' );
        renderTemplate( '#main', "/templates/signup.mustache", null );
    });
    
    this.get( '#/Pricing', function() {
        SetActivePage( 'pricing' );
        renderTemplate( '#main', "/templates/pricing.mustache", null );
    });
    
    this.get( '#/MyAccount', function() {
        SetActivePage( 'myaccount' );
        if ( !currentUser )
        {
            $('#main').toggleLoading();
            $.ajax({
                url: apiServer + '/User',
                type: 'GET',
                dataType: 'json',
                success: function( data ) {
                    $('#main').toggleLoading();
                    currentUser = data;
                    renderTemplate( '#main', '/templates/myaccount.mustache', currentUser );
                },
                error: function( response, status, error ) {
                    $('#main').toggleLoading();
                    console.log( error );
                }
            });
        }
        else
        {
            renderTemplate( '#main', '/templates/myaccount.mustache', currentUser );
        }
    });
    
    this.get( '#/User/:hash', function() {
        $('#main').toggleLoading();

        $.ajax({
            url: apiServer + '/User/' + this.params[ 'hash' ],
            type: 'GET',
            dataType: 'json',
            success: function( data ) {
                $('#main').toggleLoading();
                renderTemplate( '#main', '/templates/user.mustache', data );
            },
            error: function( response, status, error ) {
                $('#main').toggleLoading();
                console.log( error );
            }
        });
    });
    
    this.get( '#/ManageOrganizations', function() {
        SetActivePage( 'manageorganizations' );
        $('#main').toggleLoading();
        
        $.ajax({
            url: apiServer + '/Organizations',
            type: 'GET',
            dataType: 'json',
            success: function( organizations ) {
                $('#main').toggleLoading();
                
                for ( var index = 0; index < organizations.length; ++index )
                {
                    g_OrganizationCache[ organizations[ index ]._id ] = organizations[ index ];
                }
                
                renderTemplate( '#main', '/templates/manageorganizations.mustache', { 'organizations': organizations } );
            },
            error: function( response, status, error ) {
                $('#main').toggleLoading();
                console.log( error );
            }
        });
    });
    
    this.get( '#/CreateOrganization', function() {
        renderTemplate( '#main', '/templates/createorganization.mustache' ); 
    });
    
    this.get( '#/ManageOrganization/:organizationId', function () {
        $( '#main' ).toggleLoading();
        
        var organizationId = this.params[ 'organizationId' ];
        $.ajax({
            url: apiServer + '/Organization/' + organizationId,
            type: 'GET',
            dataType: 'json',
            success: function( organization ) {
                $( '#main' ).toggleLoading();
                
                g_OrganizationCache[ organization._id ] = organization;
                
                renderTemplate( '#main', '/templates/manageorganization.mustache', organization, function() {
                    $( '#contexts' ).toggleLoading();
                    $.ajax({
                        url: apiServer + '/Organization/' + organizationId + '/Contexts',
                        type: 'GET',
                        dataType: 'json',
                        success: function( contexts ) {
                            $( '#contexts' ).toggleLoading();
                            
                            for ( var contextIndex = 0; contextIndex < contexts.length; ++contextIndex )
                            {
                                g_ContextCache[ contexts[ contextIndex ]._id ] = contexts[ contextIndex ];
                            }
                            
                            renderTemplate( '#contexts', '/templates/contextlist.mustache', { 'organization': organization, 'contexts': contexts } );
                        },
                        error: function( response, status, error ) {
                            $( '#contexts' ).toggleLoading();
                            console.log( error );
                        }
                    });
                });
            },
            error: function( response, status, error ) {
                $( '#main' ).toggleLoading();
                console.log( error );
            }
        });
    });
    
    this.get( '#/CreateContext/:organizationId', function() {
        $( '#main' ).toggleLoading();
        
        var organizationId = this.params[ 'organizationId' ];
        var organization = g_OrganizationCache[ organizationId ];
        
        if ( !organization )
        {
            $.ajax({
                url: apiServer + '/Organization/' + organizationId,
                type: 'GET',
                dataType: 'json',
                success: function( organization ) {
                    g_OrganizationCache[ organization._id ] = organization;
                    
                    renderTemplate( '#main', '/templates/createcontext.mustache', { 'organization': organization }, function() {
                        $( '#main' ).toggleLoading(); 
                    });
                },
                error: function( response, status, error ) {
                    $( '#main' ).toggleLoading();
                    console.log( error );
                }
            });
        }
        else
        {
            renderTemplate( '#main', '/templates/createcontext.mustache', { 'organization': organization }, function() {
                $( '#main' ).toggleLoading(); 
            });
        }
    });

    this.get( '#/ManageOrganization/:organizationId/ManageContext/:contextId', function () {
        $( '#main' ).toggleLoading();
        
        var organizationId = this.params[ 'organizationId' ];
        var contextId = this.params[ 'contextId' ];
        var context = g_ContextCache[ contextId ];
        
        if ( !context )
        {
            $.ajax({
                url: apiServer + '/Organization/' + organizationId + '/Context/' + context._id,
                type: 'GET',
                dataType: 'json',
                success: function( context ) {
                    $( '#main' ).toggleLoading();
                    
                    g_ContextCache[ context._id ] = context;
                    
                    renderTemplate( '#main', '/templates/managecontext.mustache', context, function() {
                        $( '#main' ).toggleLoading();
                    });
                },
                error: function( response, status, error ) {
                    $( '#main' ).toggleLoading();
                    console.log( error );
                }
            });
            
        }
        else
        {
            renderTemplate( '#main', '/templates/managecontext.mustache', context, function() {
                $( '#main' ).toggleLoading();
            });
        }
    });
});

$(function() {
    $.ajax({
        url: apiServer + '/User',
        type: 'GET',
        dataType: 'json',
        success: function( data ) {
            currentUser = data;
            $('.authenticated').show();
            $('.unauthenticated').hide();
        },
        error: function( response, status, error ) {
            $('.authenticated').hide();
            $('.unauthenticated').show();
        }
    });
    
    $('.topbar').dropdown();
    
    app.run('#/');
});

function HandleAuthentication( resource, form )
{
    var email = $(form).find( "input[type=text][name=email]" ).val();
    var password = $(form).find( "input[type=password][name=password]" ).val();

    $(form).find( "input[type=text][name=email]" ).val( '' );
    $(form).find( "input[type=password][name=password]" ).val( '' );

    $(form).toggleLoading();
    
    $.ajax({
        url: apiServer + '/' + resource,
        type: 'POST',
        data: JSON.stringify({
            'email': email,
            'password': password
        }),
        dataType: 'json',
        contentType: 'application/json',
        cache: false,
        success: function( data ) {
            if ( resource == 'User' )
            {
                currentUser = data;
            }
            $('.authenticated').show();
            $('.unauthenticated').hide();
            $(form).toggleLoading();
            
            var queryParams = QueryParameters();
            if ( queryParams.after )
            {
                app.setLocation( queryParams.after );
            }
            else
            {
                app.setLocation( '#/MyAccount' );
            }
        },
        error: function( response, status, error ) {
            $(form).toggleLoading();
            console.log( error );
        }
    });    
}

$('.button-signup').live( 'click', function( event ) {
    event.preventDefault();    
    var form = $(this).parents( 'form:first' );
    HandleAuthentication( 'User', form );
});

$('.button-signin').live( 'click', function( event ) {
    event.preventDefault();    
    var form = $(this).parents( 'form:first' );
    HandleAuthentication( 'Session', form );
});

$('.button-signout').live( 'click', function( event ) {
    event.preventDefault();
    $.ajax({
        url: apiServer + '/Session',
        type: 'DELETE',
        success: function( data ) {
            currentUser = null;
            $('.authenticated').hide();
            $('.unauthenticated').show();
            app.setLocation( '#/' );
        },
        error: function( response, status, error ) {
            console.log( error );
        }
    });    
});

$('.update-account-button').live( 'click', function( event ) {
    event.preventDefault();
    var button = this;
    var form = $(this).parents( 'form:first' );

    var toBeUpdated = {};
    var email = $(form).find( "#email" ).val();
    if ( email != currentUser.email )
    {
        toBeUpdated.email = email;
    }
    
    var password = $(form).find( "#password" ).val();
    if ( password && password.length )
    {
        toBeUpdated.password = password;
    }
    
    var nickname = $(form).find( "#nickname" ).val();
    if ( nickname != currentUser.nickname )
    {
        toBeUpdated.nickname = nickname;
    }
    
    var location = $(form).find( "#location" ).val();
    if ( location != currentUser.location )
    {
        toBeUpdated.location = location;
    }

    var bio = $(form).find( "#bio" ).val();
    if ( bio != currentUser.bio )
    {
        toBeUpdated.bio = bio;
    }
    
    // only send if toBeUpdated has at least one key
    for ( var key in toBeUpdated )
    {
        $(button).button( 'loading' );
        $(form).toggleLoading();

        $.ajax({
            url: apiServer + '/User',
            type: 'PUT',
            data: JSON.stringify( toBeUpdated ),
            dataType: 'json',
            contentType: 'application/json',
            success: function( data ) {
                currentUser = data;
                $(form).toggleLoading();
                $(button).button( 'complete' );
                setTimeout( function() {
                    $(button).button( 'reset' );
                }, 2000 );
            },
            error: function( response, status, error ) {
                $(form).toggleLoading();
                console.log( error );
                $(button).button( 'reset' );
            }
        });

        break; // we break, no matter what, because we just wanted to see if there was a key in toBeUpdated
    }
});

$('.reset-account-button').live( 'click', function( event ) {
    event.preventDefault();
    var form = $(this).parents( 'form:first' );

    // TODO: prompt for confirmation, maybe use bootstrap-modal.js?
    
    for ( var key in currentUser )
    {
        $(form).find( '#' + key ).val( currentUser[ key ] );
        $(form).find( '#' + key ).html( currentUser[ key ] );
    }
});

$('.button-create-organization').live( 'click', function( event ) {
    event.preventDefault();
    var form = $(this).parents( 'form:first' );

    $(form).toggleLoading();

    var name = $(form).find( '#name' ).val();
    var url = $(form).find( '#url' ).val();
    var description = $(form).find( '#description' ).val();

    $.ajax({
        url: apiServer + '/Organization',
        type: 'POST',
        data: JSON.stringify({
            'name': name,
            'url': url,
            'description': description
        }),
        dataType: 'json',
        contentType: 'application/json',
        cache: false,
        success: function( organization ) {
            $(form).toggleLoading();
            app.setLocation( '#/ManageOrganizations' );
        },
        error: function( response, status, error ) {
            $(form).toggleLoading();
            console.log( error );
        }
    });
});

$('.update-organization-button').live( 'click', function( event ) {
    event.preventDefault();
    var button = this;
    var form = $(this).parents( 'form:first' );

    var toBeUpdated = {};

    var organizationId = $(form).find( '#id' ).val();
    var organization = g_OrganizationCache[ organizationId ];
    
    if ( !organization )
    {
        console.log( "Should have the organization cached at this point..." );
        return;
    }

    var name = $(form).find( "#name" ).val();
    if ( name != organization.name )
    {
        toBeUpdated.name = name;
    }
    
    var url = $(form).find( "#url" ).val();
    if ( url != organization.url )
    {
        toBeUpdated.url = url;
    }

    var description = $(form).find( "#description" ).val();
    if ( description != organization.description )
    {
        toBeUpdated.description = description;
    }
    
    // only send if toBeUpdated has at least one key
    for ( var key in toBeUpdated )
    {
        $(button).button( 'loading' );
        $(form).toggleLoading();

        $.ajax({
            url: apiServer + '/Organization/' + organizationId,
            type: 'PUT',
            data: JSON.stringify( toBeUpdated ),
            dataType: 'json',
            contentType: 'application/json',
            success: function( organization ) {
                g_OrganizationCache[ organization._id ] = organization;
                $(form).toggleLoading();
                $(button).button( 'complete' );
                setTimeout( function() {
                    $(button).button( 'reset' );
                }, 2000 );
            },
            error: function( response, status, error ) {
                $(form).toggleLoading();
                console.log( error );
                $(button).button( 'reset' );
            }
        });

        break; // we break, no matter what, because we just wanted to see if there was a key in toBeUpdated
    }
});

$('.reset-organization-button').live( 'click', function( event ) {
    event.preventDefault();
    var form = $(this).parents( 'form:first' );

    // TODO: prompt for confirmation, maybe use bootstrap-modal.js?
    
    var organizationId = $(form).find( '#id' ).val();
    var organization = g_OrganizationCache[ organizationId ];
    
    if ( !organization )
    {
        console.error( 'Organization should be set.' );
        return;
    }
    
    for ( var key in organization )
    {
        $(form).find( '#' + key ).val( organization[ key ] );
        $(form).find( '#' + key ).html( organization[ key ] );
    }
});

$('.button-create-context').live( 'click', function( event ) {
    event.preventDefault();
    var form = $(this).parents( 'form:first' );

    $(form).toggleLoading();

    var name = $(form).find( '#name' ).val();
    var url = $(form).find( '#url' ).val();
    var description = $(form).find( '#description' ).val();
    var organizationId = $(form).find( '#organizationId' ).val();
    
    $.ajax({
        url: apiServer + '/Organization/' + organizationId + '/Context',
        type: 'POST',
        data: JSON.stringify({
            'name': name,
            'url': url,
            'description': description
        }),
        dataType: 'json',
        contentType: 'application/json',
        cache: false,
        success: function( context ) {
            $(form).toggleLoading();
            
            g_ContextCache[ context._id ] = context;
            
            app.setLocation( '#/ManageOrganization/' + organizationId );
        },
        error: function( response, status, error ) {
            $(form).toggleLoading();
            console.log( error );
        }
    });
});

$('.update-context-button').live( 'click', function( event ) {
    event.preventDefault();
    var button = this;
    var form = $(this).parents( 'form:first' );

    var toBeUpdated = {};

    var contextId = $(form).find( '#id' ).val();
    var context = g_ContextCache[ contextId ];
    
    var organizationId = $(form).find( '#organizationId' ).val();
    var organization = g_OrganizationCache[ organizationId ];
    
    if ( !context || !organization )
    {
        console.log( 'Cache Error' );
        return;
    }

    var name = $(form).find( "#name" ).val();
    if ( name != organization.name )
    {
        toBeUpdated.name = name;
    }
    
    var url = $(form).find( "#url" ).val();
    if ( url != organization.url )
    {
        toBeUpdated.url = url;
    }

    var description = $(form).find( "#description" ).val();
    if ( description != organization.description )
    {
        toBeUpdated.description = description;
    }
    
    // only send if toBeUpdated has at least one key
    for ( var key in toBeUpdated )
    {
        $(button).button( 'loading' );
        $(form).toggleLoading();

        $.ajax({
            url: apiServer + '/Organization/' + organizationId + '/Context/' + contextId,
            type: 'PUT',
            data: JSON.stringify( toBeUpdated ),
            dataType: 'json',
            contentType: 'application/json',
            success: function( context ) {
                g_ContextCache[ context._id ] = context;
                $(form).toggleLoading();
                $(button).button( 'complete' );
                setTimeout( function() {
                    $(button).button( 'reset' );
                }, 2000 );
            },
            error: function( response, status, error ) {
                $(form).toggleLoading();
                console.log( error );
                $(button).button( 'reset' );
            }
        });

        break; // we break, no matter what, because we just wanted to see if there was a key in toBeUpdated
    }
});

$('.reset-context-button').live( 'click', function( event ) {
    event.preventDefault();
    var form = $(this).parents( 'form:first' );

    // TODO: prompt for confirmation, maybe use bootstrap-modal.js?
    
    var contextId = $(form).find( '#id' ).val();
    var context = g_ContextCache[ contextId ];
    
    if ( !context )
    {
        console.error( 'Context should be set.' );
        return;
    }
    
    for ( var key in context )
    {
        $(form).find( '#' + key ).val( context[ key ] );
        $(form).find( '#' + key ).html( context[ key ] );
    }
});