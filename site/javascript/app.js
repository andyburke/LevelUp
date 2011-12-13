function SetActivePage( page )
{
    $('.navItem').removeClass( 'active' );
    $('#nav-' + page).addClass( 'active' );
}

;(function($) {
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

  var app = $.sammy('#main', function() {
    this.debug = true;

    this.templates = {};
    
    this.get('#/', function() {
        SetActivePage( 'about' );
        renderTemplate( '#main', "/templates/home.mustache", null );
    });

    this.get('#/API', function() {
        SetActivePage( 'api' );
        renderTemplate( '#main', "/templates/api.mustache", null );
    });

    this.get('#/SignUp/User', function() {
        SetActivePage( 'signup' );
        renderTemplate( '#main', "/templates/user.signup.mustache", null );
    });

    this.get('#/SignUp/Developer', function() {
        SetActivePage( 'signup' );
        renderTemplate( '#main', "/templates/developer.signup.mustache", null );
    });

    this.get('#/Pricing', function() {
        SetActivePage( 'pricing' );
        renderTemplate( '#main', "/templates/pricing.mustache", null );
    });
  });

  $(function() {
    $('#topbar').dropdown();
    app.run('#/');
  })
})(jQuery);