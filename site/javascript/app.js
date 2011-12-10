;(function($) {
  var app = $.sammy('#main', function() {
    this.debug = true;

    this.get('#/', function() {
      $('#main').text('');
    });

    this.get('#/test', function() {
      $('#main').text('Hello World');
    });
  });

  $(function() {
    app.run('#/');
  })
})(jQuery);