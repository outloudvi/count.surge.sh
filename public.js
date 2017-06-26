x = undefined;
xlen = 0;
fcus = false;
xc = Array();

function e(eid) {
  return document.getElementById(eid);
}

function testStorage(){
  if ( window.localStorage === false )
    e('tsrgBtn').innerHTML = "LocalStorage is not supported :(" ;
  else {
    e('tsrgBtn').innerHTML = "LocalStorage is supported. Yay!" ;
    e('tsrgBtn').disabled = true;
    e('saveBtn').disabled = false;
    e('readBtn').disabled = false;
  }
}

function saveData(){
  window.localStorage.setItem( "count", JSON.stringify(x) );
  e('saveBtn').innerHTML = "Saved";
}

function readData(){
  readed = window.localStorage.getItem( "count" );
  readed = JSON.parse(readed);
  x = readed;
  refreshLR();
  e('readBtn').innerHTML = "Readed";
}

function initList(num){
	xlen = num;
	num = Number(num);
	x = new Array(num+1);
	for ( i=0;i<=xlen+1;i++ ){
		x[i] = 0;
	}
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
	e('showDiv').innerHTML = y;
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
	
  if ( /^[0-9]+$/.test(str) ){ // Only a num
    str = Number(str);
    inc(str);
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
    return;
  }
	
  if ( /^-[0-9]+/.test(str) ) {
    str = str.slice(1);
    str = Number(str);
    if( str<=0 ) return;
      inc(str,false);
    return;
  }
	
}

function addNum(){
	num = e('numTxt').value;
	
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

function getBlob(){
	y = ""
		for (i=1;i<=xlen;i++) {
			y = y + i + "," + x[i];
		  y = y + "\n";
		}
	blob = new Blob( [y] , { type: 'text/comma-separated-values', endings:'transparent' } );
	url =  URL.createObjectURL(blob);
	e('getcsvDiv').innerHTML = "<a id=getcsvA download='count.csv' href=' " + url + " '>Click here to download CSV</a>";
  e('getcsvA').click();
  e('getcsvDiv').innerHTML = "";
}

function cntConfirm(){
	e('cntDiv').style.display = "none";
	initList( Number(e('cntTxt').value) );
	e('inputDiv').style.display = "block";
	e('showDiv').style.display = "block";
  refreshLR();
  document.addEventListener("keydown", keyCheck );
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


e('tsrgBtn').addEventListener("click", testStorage);
e('numconfBtn').addEventListener("click", cntConfirm);
e('addBtn').addEventListener("click", addNum);
e('dlBtn').addEventListener("click", getBlob);
e('saveBtn').addEventListener("click", saveData);
e('readBtn').addEventListener("click", readData);
e('numTxt').addEventListener("focus", (function(){fcus = true;}) );
e('numTxt').addEventListener("blur", (function(){fcus = false;}) );
e('numTxt').addEventListener("keydown", (function(g){if(g.key=='Enter') e('addBtn').click();}) );

