var x;
var xlen = 0;
var fcus = false;
var xc = Array();

function initList(num){
	xlen = num;
	num = Number(num);
	x = new Array(num+1);
	for (let i=0;i<=xlen+1;i++ ){
		x[i] = 0;
	}
}

function keyCheck(event){
  if( fcus ) return;
  key = event.key;
  console.log(key);
  if ( key == 'Enter' ) {
    $('#addBtn').click();
    return;
  }
  p = $('#numTxt').val();
  if ( key == "Backspace" ) {
    $('#numTxt').val( p.slice(0,p.length-1) );
    return;
  }
  if( /^[0-9\-!]+$/.test(key) )
  {
    $('#numTxt').val( $('#numTxt').val() + key );
    return;
  }
}

function startX(){
  $('#bsBeforeR').css("display","none");
  $('#inputDiv').css("display","block");
  $('#showDiv').css("display","block");
  document.addEventListener("keydown", keyCheck );
  $("#bsSaveBtn").removeClass("disabled");
}

function refreshLR(){
	y = ""
  if( xc.length != 0 )
		for (let i=1;i<=xlen;i++) {
      if ( xc.includes(i) == true )
			  y = y + "<span class=yl># " + i + " : " + x[i] + "</span>";
      else
        y = y + "# " + i + " : " + x[i];
		  y = y + "<br />";
		}
  else
    for (let i=1;i<=xlen;i++) {
        y = y + "# " + i + " : " + x[i];
		    y = y + "<br />";
		}
	$('#bsShowDiv').html(y);
	$('#numTxt').val("");
	$('#numTxt').focus();
}

function min(a,b){
  if (a<=b) return a;
  return b;
}

function max(a,b){
  if (a>=b) return a;
  return b;
}

function inc(num,flag=true){
  if (flag) {
    x[num] = x[num] + 1;
    xc.push(num);
  } else {
    x[num] = x[num] - 1;
    xc.push(num);
  }
}

function rollback(){
  for( i in xc)
    inc(xc[i],false);
}

function proc(str){
	
  $('#numTxt').attr("placeholder","");

  if ( /^[0-9]+$/.test(str) ){ // Only a num
    str = Number(str);
    inc(str);
    x = x.slice(0,xlen+1);
    return;
  }
	
  if ( /^[0-9]+-[0-9]+/.test(str) ) {  // A - B
    str = str.split('-');
    str[0] = Number(str[0]);
    str[1] = Number(str[1]);
    xfrom = min( str[0], str[1] );
    xto = max( str[0], str[1] );
    for (let i=xfrom;i<=xto;i++)
      inc(i);
    x = x.slice(0,xlen+1);
    return;
  }
	
  if ( /^-[0-9]+/.test(str) ) {
    str = str.slice(1);
    str = Number(str);
    if( str<=0 ) return;
      inc(str,false);
    x = x.slice(0,xlen+1);
    return;
  }
	
  $('#numTxt').attr("placeholder","Failed to recognize.");

}

function addNum(){
	num = $('#numTxt').val();
  num = num.replace(" ","");
	
  if ( /!/.test(num) ) {
    rollback();
    refreshLR();
		xc = Array();
    return;
  }
	
	xc = Array();
	
  num = num.split(',');
	
  for ( i in num )
    proc( num[i] );
	
	refreshLR();

}

function cntConfirm(){
  let xv = Number($('#cntTxt').val());
  if( xv>=1000 )
    console.log("Too much data... (" + String(xv) + ")");
	initList( xv );
  refreshLR();
  startX();
}

function getBlob(){
	y = ""
		for (let i=1;i<=xlen;i++) {
			y = y + i + "," + x[i];
		  y = y + "\n";
		}
	blob = new Blob( [y] , { type: 'text/comma-separated-values', endings:'transparent' } );
	url =  URL.createObjectURL(blob);
  $('#csvBlobA').attr("href",url);
  $('#csvBlobBtn').css("display","block");
  $('#csvBlobA').css("color","#ffffff");
  $('#csvBlobBtn').addClass("btn-success");
  $('#dlBtn').html("Update .csv file link ->");
}

function gotJSONData(){
  let p = $('#inJSONTa').val();
  try {
    x = JSON.parse(p);
  } catch (e) {
    console.log(e);
    $("#submitJSONBtn").addClass("btn-danger");
    $("#bsReadJSONH").html("Bad JSON data. Retry:");
    return;
  }
  xlen = x.length - 1;
  refreshLR();
  startX();
}

function bsLoadFrom(num){
  if ( num > 0 ) {
    x = JSON.parse(window.localStorage.getItem( "count-" + String(num) ) );
    xlen = x.length - 1;
    $('#inputDiv').css("display","block");
    $('#showDiv').css("display","block");
    $('#cntDiv').css("display","none");
    refreshLR();
    $('#bsBeforeR').css("display","none");
    document.addEventListener("keydown", 
			     );
  }
}

function bsLoadData(){
  for( let i=1; i<=5; i++ )
  {
    istr = String(i);
    if( window.localStorage.getItem('count-' + istr ) === null )
      $('#bsLoadA' + istr).html("#" + istr + ", empty");
    else {
      let xlen = JSON.parse(window.localStorage.getItem('count-' + istr)).length - 1;
      $('#bsLoadA' + istr).html("#" + istr + ", length: " + String(xlen));
    }
  }
}

function bsSaveTo(num){
  num = Number(num);
  if ( num > 0 ) {
    console.log( "Saving to #" + String(num) );
    window.localStorage.setItem( "count-" + String(num) , JSON.stringify(x) );
    console.log( JSON.stringify(x) );
  }
}

function bsSaveData(){
  for( let i=1; i<=5; i++ )
  {
    istr = String(i);
    if( window.localStorage.getItem('count-' + istr ) === null )
      $('#bsSaveA' + istr).html("#" + istr + ", empty");
    else {
      let xlen = JSON.parse(window.localStorage.getItem('count-' + istr)).length;
      $('#bsSaveA' + istr).html("#" + istr + ", length: " + String(xlen));
    }
  } 
}

function shareByJSON(){
  let r = JSON.stringify(x);
  $('#mdJSONTxt').html(r);
}

$('#bsSaveBtn').click(bsSaveData);
$('#bsLoadBtn').click(bsLoadData);
$('#submitJSONBtn').click(gotJSONData);
$('#numconfBtn').click(cntConfirm);
for( let i=1;i<=5;i++ ){
  $('#bsSaveA' + i).click( function(){ bsSaveTo(i)} );
  $('#bsLoadA' + i).click( function(){ bsLoadFrom(i)} );
}
$('#dlBtn').click(getBlob);
$('#addBtn').click(addNum);
$('#numTxt').focus( (function(){fcus = true;}) );
$('#numTxt').blur( (function(){fcus = false;}) );
$('#numTxt').keydown( (function(g){if(g.key=='Enter') $('#addBtn').click();}) );
$('#bsShareJSONBtn').click(shareByJSON);
