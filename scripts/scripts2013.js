
var imagefolder='http://images.spot.ereolen.dk/books/';
var idleTime = 0;
var imageflowObj;

Array.prototype.shuffle = function () {
  for (var i = this.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = this[i];
    this[i] = this[j];
    this[j] = tmp;
  }
  return this;
}


function show_imagebanner (sid, maxele) {

    // HACK: try not to initialize more than one image_banner on the same time
    if (imageflowObj && imageflowObj.firstRefresh) return;

    // bland listen af numre
    menudata.list[sid].shuffle();

    // haandter visning af maxelementer
    var listlength = menudata.list[sid].length
    if ( maxele && listlength>maxele ) {
      listlength=maxele;
    }

    var s='';
    for ( var k = 0; k < listlength; k++){
      var id = menudata.list[sid][k];
      var e = booktable[id];
      if(e) {
        s += '<img src="' + imagefolder + e.i + '" rel="' + id + '" width="' + e.w + '" height="' + e.h + '" alt="' + e.t + '" />'
      }
    }

    var el = document.createElement('div');
    $(el).attr('id', 'imageribbon').html(s);
    $('#imagecontainer').html(el);    
   
    imageflowObj = new ImageFlow();

    imageflowObj.init({ ImageFlowID:'imageribbon',
                     circular: true,
                     slider: false,
                     reflections: false,
                     reflectionP: 0,
                     imagesHeight:0.8,
                     scrollbarP: 0.5,
                     captions: false,
                     imageFocusMax: 1,
                     imageFocusM: 0.9,
                     xstep: 150,
                     onClick: function() {show_popupbox(this);}
                     });
}

function init_movements() {
    // antager at det aktuelle imageflowobj indeholder imageflow-objectet

    // swipe
    $("body").touchwipe({
           wipeLeft: function() { imageflowObj.MouseWheel.handle(-1) },
           wipeRight: function() { imageflowObj.MouseWheel.handle(1) },
         //  wipeUp: function() { alert("up"); },
         //  wipeDown: function() { alert("down"); },
           min_move_x: 20,
           min_move_y: 20,
           preventDefaultEvents: true
      });

    // nav-buttons
    $("#slider-arrow-left").click(function() {
      imageflowObj.MouseWheel.handle(1);
    });

    $("#slider-arrow-right").click(function() {
      imageflowObj.MouseWheel.handle(-1);
    });
}

function create_menu(){

  var make_item = function(ele){ return '<a href="#" id="menu_' + ele.sid + '">'+ ele.label +'</a>'; }

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

  $.each( menudata.list, function( key, value ) { $('#menu_' + key).click( function() { $('#menu').menu("collapseAll", null, true); show_imagebanner(key);return false;} ) });
}

function show_popupbox(ele) {

  isbn = $(ele).attr('rel')
  if(!isbn) return;

	// rydop
	$('#result').html('');
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
  show_imagebanner(menudata.first, 30);

  // set øvrige events op
  init_movements();

  // submit
	$("form").submit(function() {

      // meget simpel emailvalidering
      if ( this.param1.value.search(/.*@.*/) == -1 ) {
         this.param1.focus();
         $('#result').html('<div class="message-info"><p>Skriv din email adresse</p></div>');
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
                $('#result').html('<div class="message-success"><p>Din email er sendt.</p></div>');
              }
              else {
                $('#result').html('<div class="message-error"><p>Der er sket en fejl, prøv igen.</p></div>');
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
                $('#result').html('<div class="message-error"><p>Der er sket en hændelsestype: ' + textmsg + ' , prøv igen.</p></div>');
              }


        });
      return false;
    });

    // inaktiv-checkeren...
    setInterval(function() { idleTime+= 5; if(idleTime>10) { idleTime=0; $("#slider-arrow-right").click();} }, 5000);

    $("body").mousemove(function (e) {
        idleTime = 0;
    });
    $("body").keypress(function (e) {
        idleTime = 0;
    });

});
