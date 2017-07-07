var x = undefined;
var xlen = 0;
fcus = false;
xc = Array();

function e(eid) {
  return document.getElementById(eid);
}

function initList(num){
	xlen = num;
	num = Number(num);
	x = new Array(num+1);
	for ( i=0;i<=xlen+1;i++ ){
		x[i] = 0;
	}
}

function startX(){
  document.addEventListener("keydown", keyCheck );
  $("#bsSaveBtn").removeClass("disabled");
}

function refreshLR(){
	y = ""
  if( xc.length != 0 )
		for (i=1;i<=xlen;i++) {
      if ( xc.includes(i) == true )
			  y = y + "<span class=yl># " + i + " : " + x[i] + "</span>";
      else
        y = y + "# " + i + " : " + x[i];
		  y = y + "<br />";
		}
  else
    for (i=1;i<=xlen;i++) {
        y = y + "# " + i + " : " + x[i];
		    y = y + "<br />";
		}
	e('bsShowDiv').innerHTML = y;
	e('numTxt').value = "";
	e('numTxt').focus();
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
	
  e('numTxt').placeholder = "";

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
    for (i=xfrom;i<=xto;i++)
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
	
  e('numTxt').placeholder = "Failed to recognize.";

}

function addNum(){
	num =  e('numTxt').value;
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
	e('bsBeforeR').style.display = "none";
  let xv = Number(e('cntTxt').value);
  if( xv>=1000 )
    console.log("Too much data... (" + String(xv) + ")")
	initList( xv );
	e('inputDiv').style.display = "block";
	e('showDiv').style.display = "block";
  refreshLR();
  startX();
}

function getBlob(){
	y = ""
		for (i=1;i<=xlen;i++) {
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
  let p = e('inJSONTa').value;
  try {
    x = JSON.parse(p);
  } catch (e) {
    console.log(e);
    $("#submitJSONBtn").addClass("btn-danger");
    $("#bsReadJSONH").html("Bad JSON data. Retry:");
    return;
  }
  e('bsBeforeR').style.display = "none";
	e('inputDiv').style.display = "block";
	e('showDiv').style.display = "block";
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
    document.addEventListener("keydown", keyCheck );
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
//    $('#bsSaveBtn').html("Saved");
//    $('#numTxt').focus( function(){ $('#bsSaveBtn').html("Save");} );
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

function keyCheck(event){
  if( fcus ) return;
  key = event.key;
  console.log(key);
  if ( key == 'Enter' ) {
    e('addBtn').click();
    return;
  }
  p = e('numTxt').value;
  if ( key == "Backspace" ) {
    e('numTxt').value = p.slice(0,p.length-1);
    return;
  }
  if( /^[0-9\-!]+$/.test(key) )
  {
    e('numTxt').value = e('numTxt').value + key;
    return;
  }
}

function shareByJSON(){
  let r = JSON.stringify(x);
  e('mdJSONTxt').innerHTML = r;
}

$('#bsSaveBtn').click(bsSaveData);
$('#bsLoadBtn').click(bsLoadData);
e('submitJSONBtn').addEventListener("click", gotJSONData);
e('numconfBtn').addEventListener("click", cntConfirm);
for( let i=1;i<=5;i++ ){
  $('#bsSaveA' + i).click( function(){ bsSaveTo(i)} );
  $('#bsLoadA' + i).click( function(){ bsLoadFrom(i)} );
}
e('dlBtn').addEventListener("click", getBlob);
e('addBtn').addEventListener("click", addNum);
e('numTxt').addEventListener("focus", (function(){fcus = true;}) );
e('numTxt').addEventListener("blur", (function(){fcus = false;}) );
e('numTxt').addEventListener("keydown", (function(g){if(g.key=='Enter') e('addBtn').click();}) );
e('bsShareJSONBtn').addEventListener("click", shareByJSON );