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
      $('#main').text('');
    });

    this.get('#/test', function() {
        renderTemplate( '#main', "/templates/organization.mustache", { name: 'Test', email: 'test@test.com' } );
    });
  });

  $(function() {
    app.run('#/');
  })
})(jQuery);