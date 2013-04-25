// ITK, Aarhus Kommunes Biblioteker, 2013

var spotdatatype = 'ebog';

var carousel = { };

var myConfig = {
  folder : 'http://images.spot.ereolen.dk/books/',
  max_image_width : 330,
  max_image_height : 500,
  image_border : 3, // pixels
  space_between_images : 0.20, // procent
  number_of_images : 3, // visible
  id_prefix_images : 'imb', // some unique chars
  animation : 1000, 
  opacity : 0.8
};

var SET_OF_IMAGES = 3; // the visible set og one before/after

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

    // handle nearly empty lists
    if ( spotdata.list[sid].length < SET_OF_IMAGES * myConfig.number_of_images ) return;

    // bland listen af numre
    spotdata.list[sid].shuffle();

    // create banner-html
    var s = '';
    $.each( spotdata.list[sid], function( key, isbn ) {

      s += '<li><img id="' + myConfig.id_prefix_images + key + '" data-isbn="' + isbn + '" src="' + myConfig.folder + spotdata.isbn[isbn].i + '" width="' + myConfig.max_image_width + '" height="' + myConfig.max_image_height + '" alt="" /></li>'
      if ( key >= SET_OF_IMAGES * myConfig.number_of_images - 1) return false;
    });

    var el = document.createElement('ul');
    $(el).html(s);

    // slet tidligere carousel - er det nødvendigt?
    if(carousel.obj) $('.imagebanner').jcarousel('destroy');

    // overfør data
    $('.imagebanner').html(el);

    // opret carousel - animation http://jqueryui.com/effect/#easing
    carousel.obj = $('.imagebanner').jcarousel({ 'wrap': 'circular','animation': { 'duration': myConfig.animation, 'easing':   'easeInOutCubic'  } });

    // initialiser pointer
    carousel.max_pointer = Math.floor( spotdata.list[sid].length / myConfig.number_of_images );
    carousel.current_sid = sid;
    
    // set the last set of images to the last images in the total list
    carousel.pointer = 1;
    update_li_content(-1);

    carousel.scroll_in_action = 0;

    banner_recalculate();
}

function banner_recalculate(onlyImg) {
  // the banner_width = (width+border) * number_of_images + (margin between images) * ( number_of_images - 1 )
  // margin between images = (some factor) * (width+border)
  // calculate width...

  var banner_width = $('.imagebanner').outerWidth(true);

  var new_image_width_and_border = Math.floor( banner_width / ( myConfig.number_of_images +  myConfig.space_between_images * (myConfig.number_of_images -1 ) ) )
  var new_image_width = new_image_width_and_border - 2 * myConfig.image_border
  var new_image_margin = Math.floor( myConfig.space_between_images * new_image_width_and_border )

  var new_image_height =  Math.floor( new_image_width * myConfig.max_image_height / myConfig.max_image_width )

  var new_banner_width = myConfig.number_of_images * new_image_width_and_border + ( myConfig.number_of_images -1 ) * new_image_margin
  var new_banner_margin = Math.floor(( banner_width - new_banner_width ) / 2);
  var new_banner_height = new_image_height + 2 * myConfig.image_border

  $('.imagebanner img').css( { 'margin-right' : new_image_margin, 'width' : new_image_width, 'height' : new_image_height } );
  $('.imagebanner').css( { 'height' : new_banner_height, 'margin-left' : new_banner_margin, 'margin-right' : new_banner_margin } );

  var banner_height = $('.wrapper').outerHeight() - $('.body-header').outerHeight() - $('#menucontainer').outerHeight();
  var banner_padding = Math.floor(( banner_height - new_banner_height ) /2 );
  $('#imagecontainer').css( { 'padding-top' : banner_padding, 'padding-bottom' : banner_padding });
}

function modulo(a,b) {
  // helper function - handle negative numbers
  var res = a % b;
  return res < 0 ? res + b : res;
}

function update_li_content(offset){
  // update one of the 3 set of images (before, current, next)

  carousel.pointer += offset;

  var list_id = myConfig.number_of_images * modulo( carousel.pointer+offset, carousel.max_pointer)
  var set_id = myConfig.number_of_images * modulo( carousel.pointer+offset, SET_OF_IMAGES)

  for ( i=0; i < myConfig.number_of_images; i++) {
    var isbn = spotdata.list[carousel.current_sid][list_id+i]
    var src  = myConfig.folder + spotdata.isbn[isbn].i
    $('#' + myConfig.id_prefix_images + (set_id+i)).attr('src', src ).data('isbn', isbn);
  }
}

function scroll(evnt){
  carousel.idleTime=0;
  if(!carousel.scroll_in_action) {
     carousel.scroll_in_action = 1;
     $('.navbutton').css('opacity', myConfig.opacity);
     update_li_content(evnt.data.offset);

     var relative_offset = ( evnt.data.offset > 0 ? '+=' : '-=' ) + myConfig.number_of_images;
     $('.imagebanner').jcarousel('scroll', relative_offset,  true, function() { carousel.scroll_in_action = 0; $('.navbutton').css('opacity', 1); } )
  }
  return false;
}

function create_events() {

   // navi-buttons
   $('.imagebanner-left').click( { offset: -1 }, scroll);
   $('.imagebanner-right').click( { offset: 1 }, scroll);

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

    // pile-tasterne
    $("body").on('keyup', function (e) { if (event.which == 39) { $('.imagebanner-right').click()} else if (event.which == 37) { $('.imagebanner-left').click()} });

    // inaktiv-checkeren...
    carousel.idleTime = 0;
    setInterval(function() { carousel.idleTime+= 5; if(carousel.idleTime>10) { $('.imagebanner-right').click();} }, 5000);
    $("body").on('mousemove', function (e) { carousel.idleTime = 0; });
    $("body").on('keypress',  function (e) { carousel.idleTime = 0; });

    // resize will trigger new size of banner
    $(window).on('resize', banner_recalculate);

    // click on img-elements should trigger popup
    $(".imagebanner").on("click", "img", function(event){ show_popupbox($(this).data('isbn'));return false; });

}

function create_menu(){

  var make_item = function(ele){ return '<a href="#" class="menu_' + ( ele.sid ? ele.sid : 'nolink' ) + '">'+ ele.label +'</a>'; }

  var s = '<ul id="menu">'
  for ( var i = 0; i < spotdata.menu.length; i++) {
    s += '<li>' + make_item( spotdata.menu[i][0] );

    if ( spotdata.menu[i].length > 1 ) {
      s += '<ul>'
      for ( var j = 1; j < spotdata.menu[i].length; j++) {
        s += '<li class="sub">' + make_item( spotdata.menu[i][j] ) + '</li>';
      }
      s += '</ul>'
    }
    s += '</li>'
  }
  s += '</ul>'

  $('#menucontainer').html(s);
  $('#menu').menu({ icons: { submenu: "ui-icon-blank" }, position: { my: "left top", at: "left bottom" } });

  $.each( spotdata.list, function( key, value ) { $('.menu_' + key).click( function() { $('#menu').menu("collapseAll", null, true); show_banner(key); return false} ) });
  $('.menu_nolink' ).click( function() { return false });
}

function show_popupbox(isbn) {

  // rydop
  $('#message').html('');
  $('input:text').val('');

  //
  if (spotdata.isbn[isbn].d == null) {
    spotdata.isbn[isbn].d = '';
  }

  $('#bookdata').html( '<div><h3>' + spotdata.isbn[isbn].t + '</h3><img class="popup-image" src="' + myConfig.folder + spotdata.isbn[isbn].i + '" />' + spotdata.isbn[isbn].d + '</div>');

  // gem values i formen
  $('#isbn').val(isbn);
  $('#titel').val(spotdata.isbn[isbn].t);
  $('#type').val(spotdatatype);

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
  show_banner(spotdata.first);

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
