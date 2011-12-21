var apiServer = '';

function SetActivePage( page )
{
    $('.navItem').removeClass( 'active' );
    $('#nav-' + page).addClass( 'active' );
}

var templateCache = {};

function renderTemplate( elementSelector, template, data ) {
    if ( templateCache[ template ] )
    {
        $(elementSelector).html( Mustache.to_html( templateCache[ template ], data ) );
    }
    else
    {
        $.ajax({
            url: template,
            dataType: "text",
            success: function( contents ) {
                templateCache[ template ] = contents;
                renderTemplate( elementSelector, template, data );
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
        success: function( data ) {
            if ( resource == 'User' )
            {
                currentUser = data;
            }
            $('.authenticated').show();
            $('.unauthenticated').hide();
            $(form).toggleLoading();
            app.setLocation( '#/MyAccount' );
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
    email = $(form).find( "#email" ).val();
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