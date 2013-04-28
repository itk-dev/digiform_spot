// ITK, Aarhus Kommunes Biblioteker, 2013

var spotdatatype = 'ebog';

var carousel = { };

var myConfig = {
  folder : 'http://images.spot.ereolen.dk/books/',
  max_image_width : 330,
  max_image_height : 500,
  image_border : 3, // pixels
  space_between_images : 0.20, // procent
  visible_images : 3, // synlige
  set_of_images: 3, // de synlige sæt, før/aktivt/efter
  id_prefix_images : 'imb', // tilfældige unikke tegn
  animation : 1000, // tid i ms
  opacity : 0.8 // opacity til knapper når animation er aktiv
};

Array.prototype.shuffle = function () {
  for (var i = this.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = this[i];
    this[i] = this[j];
    this[j] = tmp;
  }
  return this;
}

function create_banner (current_list) {


  // bland listen af numre
  current_list.shuffle();

  // håndter lister af forskellig længde
  var listlength;
  if ( current_list.length < myConfig.set_of_images * myConfig.visible_images ) {
    listlength = current_list.length;
    carousel.small_list = true;
  } else {
    listlength = myConfig.set_of_images * myConfig.visible_images;
    carousel.small_list = false;
  }
  //console.log(current_list.length)

  // dan banner-html
  var s = '';
  for ( i = 0; i < listlength; i++) {
     s += create_li_element (i, current_list[i])
  };

  var el = document.createElement('ul');
  $(el).html(s);

  // slet tidligere carousel
  if(carousel.obj) $('.imagebanner').jcarousel('destroy');

  // overfør data
  $('.imagebanner').html(el);

  // opret carousel - animation http://jqueryui.com/effect/#easing
  carousel.obj = $('.imagebanner').jcarousel({ 'wrap': 'circular','animation': { 'duration': myConfig.animation, 'easing':   'easeInOutCubic'  } });

  // initialiser pointer
  carousel.max_pointer = Math.floor( current_list.length / myConfig.visible_images );
  carousel.current_list = current_list;

  // det sidste sæt skal indeholde de sidste billeder i listen - dette trick ordner dette
  carousel.pointer = 1;
  update_banner(-1);

  carousel.scroll_in_action = false;

  // opdater størrelser i css
  banner_recalculate();
}

function modulo(a,b) {
  // håndterer negative tal (i modsætning til %)
  var res = a % b;
  return res < 0 ? res + b : res;
}

function update_banner(offset){
  // håndterer visningen af den lange liste

  // skip hvis listen er lille
  if(carousel.small_list) return;

  carousel.pointer += offset;

  var list_id = myConfig.visible_images * modulo( carousel.pointer+offset, carousel.max_pointer)
  var set_id = myConfig.visible_images * modulo( carousel.pointer+offset, myConfig.set_of_images)

  // udskift det resp. set med de nye billeder fra listen
  for ( i=0; i < myConfig.visible_images; i++) {
    update_li_element(set_id+i, carousel.current_list[list_id+i])
  }
}

function banner_recalculate(onlyImg) {
  // banner_width = (width+border) * visible_images + (margin between images) * ( visible_images - 1 )
  // margin between images = (some factor) * (width+border)
  // beregn width

  var banner_width = $('.imagebanner').outerWidth(true);

  var new_image_width_and_border = Math.floor( banner_width / ( myConfig.visible_images +  myConfig.space_between_images * (myConfig.visible_images -1 ) ) )
  var new_image_width = new_image_width_and_border - 2 * myConfig.image_border
  var new_image_margin = Math.floor( myConfig.space_between_images * new_image_width_and_border )

  var new_image_height =  Math.floor( new_image_width * myConfig.max_image_height / myConfig.max_image_width )

  var new_banner_width = myConfig.visible_images * new_image_width_and_border + ( myConfig.visible_images -1 ) * new_image_margin
  var new_banner_margin = Math.floor(( banner_width - new_banner_width ) / 2);
  var new_banner_height = new_image_height + 2 * myConfig.image_border

  $('.imagebanner img').css( { 'margin-right' : new_image_margin, 'width' : new_image_width, 'height' : new_image_height } );
  $('.imagebanner').css( { 'height' : new_banner_height, 'margin-left' : new_banner_margin, 'margin-right' : new_banner_margin } );

  var banner_height = $('.wrapper').outerHeight() - $('.body-header').outerHeight() - $('#menucontainer').outerHeight();
  var banner_padding = Math.floor(( banner_height - new_banner_height ) /2 );
  $('#imagecontainer').css( { 'padding-top' : banner_padding, 'padding-bottom' : banner_padding });
}

function scroll(evnt){
  // håndter skiftet af billeder

  // karusellen skifter så nulstil idletime
  carousel.idleTime=0;

  // fortsæt kun hvis der ikke er en aktiv scroll
  if(!carousel.scroll_in_action) {
     carousel.scroll_in_action = true;
     $('.navbutton').css('opacity', myConfig.opacity);
     update_banner(evnt.data.offset);

     var relative_offset = ( evnt.data.offset > 0 ? '+=' : '-=' ) + myConfig.visible_images;
     $('.imagebanner').jcarousel('scroll', relative_offset,  true, function() { carousel.scroll_in_action = false; $('.navbutton').css('opacity', 1); } )
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
    setInterval(function() { carousel.idleTime+= 3; if(carousel.idleTime>=9) { $('.imagebanner-right').click();} }, 3000);
    $("body").on('mousemove', function (e) { carousel.idleTime = 0; });
    $("body").on('keypress',  function (e) { carousel.idleTime = 0; });

    // resize vil ændre størrelser som hermed opdateres
    $(window).on('resize', banner_recalculate);

    // klik på billede skal trigge popup
    $(".imagebanner").on("click", "img", function(event){ show_popupbox($(this).data('isbn'));return false; });

}

function create_li_element (key, value) {
  // opretter li element til brug i banneret
  return '<li><img id="' + myConfig.id_prefix_images + key + '" data-isbn="' + value + '" src="' + myConfig.folder + spotdata.isbn[value].i + '" width="' + myConfig.max_image_width + '" height="' + myConfig.max_image_height + '" alt="" /></li>'
}

function update_li_element(key, value){
  // opdaterer li element i banneret
  $('#' + myConfig.id_prefix_images + key).attr('src', myConfig.folder + spotdata.isbn[value].i ).data('isbn', value);
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

  $.each( spotdata.list, function( key, value ) { $('.menu_' + key).click( function() { $('#menu').menu("collapseAll", null, true); create_banner( value ); return false })});
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
  create_banner(spotdata.list[spotdata.first]);

  // initialiser events
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
