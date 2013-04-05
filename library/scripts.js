
var imagefolder='http://images.spot.ereolen.dk/books/';

var idleTime = 0;
var carouselObj;
var maxImagesInList = 75;

var max_image_width = 330;
var max_image_height = 500;
var image_border = 3;
var space_between_images = 0.20; // procent
var number_of_images = 3;

Array.prototype.shuffle = function () {
  for (var i = this.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = this[i];
    this[i] = this[j];
    this[j] = tmp;
  }
  return this;
}

function show_banner (sid) {

    // bland listen af numre
    menudata.list[sid].shuffle();

    // haandter visning af maxelementer
    var listlength = menudata.list[sid].length
    if ( listlength > maxImagesInList ) {
      listlength = maxImagesInList;
    }

    // create banner-html
    var s = '';
    for ( var k = 0; k < listlength; k++){
      var id = menudata.list[sid][k];
      // menudata og booktable har data fra forskellige kilder
      var e = booktable[id];
      if(e) {
        s += '<li id="isbn_' + id + '"><img src="' + imagefolder + e.i + '" width="' + e.w + '" height="' + e.h + '" alt="' + e.t + '" /></li>'
      }
    }

    var el = document.createElement('ul');
    $(el).html(s);

    // slet tidligere carousel - er det nødvendigt?
    if(carouselObj) $('.imagebanner').jcarousel('destroy');

    // overfør data
    $('.imagebanner').html(el);

    // tildel click-funktion
    $.each( menudata.list[sid].slice(0, listlength), function( key, isbn ) { $('#isbn_' + isbn).click( function() { show_popupbox(isbn);return false;} ) });

    // opret carousel - animation http://jqueryui.com/effect/#easing
    carouselObj = $('.imagebanner').jcarousel({ 'wrap': 'circular', 'animation': { 'duration': 800, 'easing':   'easeOutExpo'  } });

    // $('.imagebanner').delegate('li', 'itemfirstout.jcarousel', function(event, carousel) {
        // console.log( booktable[$(this).attr('id').slice(5)].t );
    // });
    banner_recalculate();
}

function banner_recalculate() {

  var banner_width = $('.imagebanner').outerWidth(true);
  var new_width = banner_width / number_of_images;

  var new_image_margin = Math.floor( new_width * space_between_images );
  var new_image_width = Math.floor( new_width - new_image_margin )
  var new_image_height =  Math.floor( new_image_width * max_image_height / max_image_width )

  var new_banner_width = number_of_images * ( new_image_width + 2 * image_border ) + ( number_of_images -1 ) * new_image_margin
  var new_banner_margin = Math.floor(( banner_width - new_banner_width ) / 2);
  var new_banner_height = new_image_height + 2 * image_border

  //console.log(banner_width+' '+ new_banner_width +' '+ new_image_margin+' '+new_image_width+' '+new_image_height+' '+new_banner_margin);
  $('.imagebanner img').css( { 'margin-right' : new_image_margin, 'width' : new_image_width, 'height' : new_image_height } );
  $('.imagebanner').css( { 'height' : new_banner_height, 'margin-left' : new_banner_margin, 'margin-right' : new_banner_margin } );

  var banner_height = $('.wrapper').outerHeight() - $('.body-header').outerHeight() - $('#menucontainer').outerHeight();
  var banner_padding = Math.floor(( banner_height - new_banner_height ) /2 );
  $('#imagecontainer').css( { 'padding-top' : banner_padding, 'padding-bottom' : banner_padding });
  
}

function create_events() {

    $('.imagebanner-left').click(function() { idleTime=0; $('.imagebanner').jcarousel('scroll', '-=1'); return false; });
    $('.imagebanner-right').click(function() { idleTime=0; $('.imagebanner').jcarousel('scroll', '+=1'); return false; });

    // swipe
    $("body").touchwipe({
           wipeLeft: function() { $('.imagebanner-right').click(); },
           wipeRight: function() { $('.imagebanner-left').click(); },
         //  wipeUp: function() { alert("up"); },
         //  wipeDown: function() { alert("down"); },
           min_move_x: 20,
           min_move_y: 20,
           preventDefaultEvents: true
      });

    // inaktiv-checkeren...
    setInterval(function() { idleTime+= 5; if(idleTime>10) { $('.imagebanner-right').click();} }, 5000);
    $("body").on('mousemove', function (e) { idleTime = 0; });
    $("body").on('keypress',  function (e) { idleTime = 0; });

    // resize will trigger new size of banner
    $(window).on('resize', banner_recalculate);

}

function create_menu(){

  var make_item = function(ele){ return '<a href="#" ' + ( ele.sid ? 'id="menu_' + ele.sid : 'class="nolink"' ) + '">'+ ele.label +'</a>'; }

  var s = '<ul id="menu">'
  for ( var i = 0; i < menudata.menu.length; i++) {
    s += '<li>' + make_item( menudata.menu[i][0] );

    if ( menudata.menu[i].length > 1 ) {
      s += '<ul>'
      for ( var j = 1; j < menudata.menu[i].length; j++) {
        s += '<li class="sub">' + make_item( menudata.menu[i][j] ) + '</li>';
      }
      s += '</ul>'
    }
    s += '</li>'
  }
  s += '</ul>'

  $('#menucontainer').html(s);
  $('#menu').menu({ icons: { submenu: "ui-icon-blank" }, position: { my: "left top", at: "left bottom" } });

  $.each( menudata.list, function( key, value ) { $('#menu_' + key).click( function() { $('#menu').menu("collapseAll", null, true); show_banner(key);return false;} ) });
  $('.nolink').click( function() { return false });
}

function show_popupbox(isbn) {

  // rydop
  $('#message').html('');
  $('input:text').val('');

  //
  if (booktable[isbn].d == null) {
    booktable[isbn].d = '';
  }

  $('#bookdata').html( '<div><h3>' + booktable[isbn].t + '</h3><img class="popup-image" src="' + imagefolder + booktable[isbn].i + '" />' + booktable[isbn].d + '</div>');

  // gem values i formen
  $('#isbn').val(isbn);
  $('#titel').val(booktable[isbn].t);
  $('#type').val(booktable[isbn].s);

    // vis boksen (ifald den tidligere er fadeout
  $('#popup').show();  // hide efter submit 4 sek
  $('#myform').show(); // hide efter submit

  // sæt fancyboks op og aktiver den
  $("#inline").fancybox().click();

}

$(document).ready(function(){

  // keyboard
  $('#email').keyboard({ openOn : '', stayOpen : true,
     layout : 'custom',
     customLayout: {
        'default' : [
          "@ 1 2 3 4 5 6 7 8 9 0 + @ {b}",
          "q w e r t y u i o p \u00e5 \u00a8",
          " a s d f g h j k l \u00e6 \u00f8 ' ",
          "{shift} < z x c v b n m , . - ",
          "{accept} {cancel}"
        ],
        'shift' : [
          '\u00bd ! " # \u00a4 % & / ( ) = ? \u0300 {b}',
          "Q W E R T Y U I O P \u00c5 ^",
          "A S D F G H J K L \u00c6 \u00d8 * ",
          "{shift} > Z X C V B N M ; : _ ",
          "{accept} {cancel}"
        ]
      }
    });

  $('.keyimg').click(function(){ $('#email').getkeyboard().reveal();});

  // menuen
  create_menu();

  // imagebanner
  show_banner(menudata.first);

  // initialiser evetns
  create_events();

  // submit
  $("form").submit(function() {

      // meget simpel emailvalidering
      if ( this.param1.value.search(/.*@.*/) == -1 ) {
         this.param1.focus();
         $('#message').html('<div class="message-info"><p>Skriv din email adresse</p></div>');
         return false;
      }

      // udtræk indhold - klar til ajax
      var str = $("form").serialize();

      $.ajax({
          type: 'POST',
          url: '/cgi-bin/sendlink.pl',
          data: str,
          success: function(data) {
              // efter submit
              // vis resultat

              if (data == "1") {
                $('#message').html('<div class="message-success"><p>Din email er sendt.</p></div>');
              }
              else {
                $('#message').html('<div class="message-error"><p>Der er sket en fejl, prøv igen.</p></div>');
              }

              // skjul formularen
              $('#myform').hide();
              // tøm indhold i formularen
              $('input:text').val('');

              // fadeout hele popup og luk den til sidst
              $('#popup').fadeOut(4000, function(){ $.fancybox.close() } );

              },
          dataType: 'html',
          error: function(jqXHR, textmsg) {
                $('#message').html('<div class="message-error"><p>Der er sket en hændelsestype: ' + textmsg + ' , prøv igen.</p></div>');
              }

        });
      return false;
    });
});
