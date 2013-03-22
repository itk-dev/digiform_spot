
var imagefolder='http://images.spot.ereolen.dk/books/';

function show ( sid ) {

    if (!sid) return false;
    
    listid='b' + sid
    
    var s="";
    for ( k=0; k<menudata.list[listid].length; k++){
      var id=menudata.list[listid][k];
      e = booktable[id];
      if(e) {
        s += '<img src="' + imagefolder + e.i + '" rel="' + e.id + '" width="' + e.w + '" height="' + e.h + '" alt="' + e.t + '" />'
      }
    }
    $('#imageribbon').html(s);
    
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
                     onClick: function() {go(this);}
                     });
 
    // swipe
    init_touchwipe(imageflowObj);
    
    return false;
}

function go(ele) {

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
  	$("a#inline").fancybox({
    'overlayOpacity' : 0.9,
    'hideOnContentClick': false,
		'hideOnOverlayClick' : false
	}).click();

}

var booktable=new Array();
var imageflowObj;

function init_touchwipe(imageflowObj){

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
function make_item(ele){
  return '<a href="#" onclick="return show(' + ele.sid + ');">'+ ele.label +'</a>';
}

$(document).ready(function(){
    // keyboard 
   // $('.myinput').keyboard({ layout: 'danish-qwerty' });

   // menuen

   var s = '<ul id="menu">'
   for ( i = 0; i < menudata.menu.length; i++) {
     s += '<li>' + make_item( menudata.menu[i][0] );

     s += '<ul>'
     for ( j=1; j < menudata.menu[i].length; j++) {
       s += '<li class="sub">' + make_item( menudata.menu[i][j] ) + '</li>';
     }
     s += '</ul>'  
     
     s += '</li>'
   }
   s += '</ul>'
   
   $('#menucontainer').html(s);

   
   // data til imageflow
    for ( i=0; i < bookdata.length; i++ ) {
      var e=bookdata[i];
      booktable[e.id]=e;
    }  

    $( "#menu" ).menu({ icons: { submenu: "ui-icon-blank" }, position: { my: "left top", at: "left bottom" } });    
    
    // imageflow
    show(menudata.first);    

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

});
