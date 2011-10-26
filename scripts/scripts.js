
var imagefolder='http://digiformspot.etek.dk/books/';


function go(isbn) {
// kaldes fra flashen 
  titel='Dummy';

	// t�m indhold i html
	$('#result').html('');

  // hvis der ikke er en beskrivelse indsætter vi en default tekst
  if (booktable[isbn].d == null) {
    booktable[isbn].d = 'Der er ingen yderlig beskrivelse';
  }
	$('#bookdata').html( '<div><h3>' + booktable[isbn].t + '</h3><img class="popup-image" src="' + imagefolder + 'isbn' + isbn + '.jpg" />' + booktable[isbn].d + '</div>');

	// slet indholdet
	$('input:text').val(''); 
	
	// gem isbn/titel i formen
	$('#isbn').val(isbn);
	$('#titel').val(titel);	
	
    // vis boksen (ifald den tidligere er fadeout
  $('#popup').show();  // hide efter submit 4 sek
	$('#myform').show(); // hide efter submit	
	
	// s�t fancyboks op og aktiver den
  	$("a#inline").fancybox({
		'hideOnContentClick': false,
		'hideOnOverlayClick' : false
	}).click();

}

var booktable=new Array();

$(document).ready(function(){
    // keyboard 
    $('.myinput').keyboard({ layout: 'danish-qwerty' });

    // data til imageflow
    var s='';
    for ( i=0; i < bookdata.length; i++ ) {
      var e=bookdata[i];
      booktable[e.id]=e;
      s += '<img src="' + imagefolder + 'isbn' + e.id + '.jpg" longdesc="' + e.id + '" width="' + e.w + '" height="' + e.h + '" alt="' + e.t + '" />'
    }
    $('#imageribbon').html(s);

    // imageflow
    var instanceOne = new ImageFlow();
    instanceOne.init({ ImageFlowID:'imageribbon',
                     circular: true,
                     slider: false,
                     reflections: false, 
                     reflectionP: 0.4,
                     imagesHeight:0.8,
                     scrollbarP: 0.5, 
                     captions: false,
                     imageFocusMax: 1,
                     xstep: 150,
                     onClick: function() {go(this.url);}
                     });
    // swipe
    $("#main").touchwipe({
           wipeLeft: function() { instanceOne.MouseWheel.handle(1) },
           wipeRight: function() { instanceOne.MouseWheel.handle(-1) },
         //  wipeUp: function() { alert("up"); },
         //  wipeDown: function() { alert("down"); },
           min_move_x: 20,
           min_move_y: 20,
           preventDefaultEvents: true
      });
      
    // nav-buttons  
    $("#slider-arrow-left").click(function() { 
      instanceOne.MouseWheel.handle(1);
    });

    $("#slider-arrow-right").click(function() { 
      instanceOne.MouseWheel.handle(-1);
    });

  // submit
	  $("form").submit(function() {

      // meget simpel emailvalidering
      if ( this.param1.value.search(/.*@.*/) == -1 ) {
         this.param1.focus();
         $('#result').html('Skriv din email');		
         return false;
       }

      // udtr�k indhold - klar til ajax
      var str = $("form").serialize();
      
      $.ajax({
          type: 'POST',
          url: '/cgi-bin/sendlink.pl',
          data: str,
          success: function(data) {  
              // efter submit 
              // vis resultat
              $('#result').html(data); 
              
              // skjul formularen
              $('#myform').hide();
              // t�m indhold i formularen
              $('input:text').val(''); 
              
              // fadeout hele popup og luk den til sidst
              $('#popup').fadeOut(4000, function(){ $.fancybox.close() } );
              
              },
          dataType: 'html'
        });
      return false;
    });

});
