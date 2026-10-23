(function(){
'use strict';
/* Finales de peones: Descubre → Observa → Comprende → Practica → Comprueba.
   Todas las jugadas del alumnado se validan con Chess, la misma biblioteca de Aprende Ajedrez.
   No contiene cuestionarios ni respuestas de opción múltiple. */
var G=window.DATA_GROUPS,L=window.DATA_LESSONS,Chess=window.Chess,A=window.C17FinalesAssets;
if(!G||!L||!Chess||!A)throw Error('No se pudieron cargar los recursos educativos.');
var $=function(id){return document.getElementById(id);};
var LABELS=['Descubre','Observa','Comprende','Practica','Comprueba'];
var PROGRESS_KEY='aa_finales_peones_v1',LAST_KEY='aa_finales_ultimo_v1',PAUSE_KEY='aa_finales_pausa_v1';
var progress={},group='all',index=0,stage=0,speed=1,auto=true,lesson=null,game=null,selected='',choices=[],hint=false,completed=[false,false],message='',messageKind='',demoDone=false;
var demoTimeout=0,autoTimeout=0,wrongTimeout=0,transitionTimeout=0,renderGeneration=0,animation=null;
try{var obj=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');if(obj&&typeof obj==='object'&&!Array.isArray(obj))progress=obj;}catch(e){}
try{var last=Number(localStorage.getItem(LAST_KEY));if(last>=1&&last<=L.length)index=last-1;}catch(e){}
try{auto=localStorage.getItem(PAUSE_KEY)!=='1';}catch(e){}
function store(key,value){try{localStorage.setItem(key,value);}catch(e){}}
function squareName(i){return 'abcdefgh'[i%8]+(8-Math.floor(i/8));}
function sqindex(s){return(8-Number(s[1]))*8+s.charCodeAt(0)-97;}
function fen(p){
 var a=Array(64).fill('.');
 (p.w+' '+p.b).split(/\s+/).forEach(function(t){a[sqindex(t.slice(1))]=t[0];});
 var rows=[];
 for(var rank=0;rank<8;rank++){
   var row='',n=0;
   for(var f=0;f<8;f++){var pc=a[rank*8+f];if(pc==='.')n++;else{if(n)row+=n;n=0;row+=pc;}}
   if(n)row+=n;rows.push(row);
 }
 return rows.join('/')+' w - - 0 1';
}
function list(){return group==='all'?L:L.filter(function(x){return x.g===Number(group);});}
function currentLesson(){return list()[index];}
function cancelTimers(){
 clearTimeout(demoTimeout);clearTimeout(autoTimeout);clearTimeout(wrongTimeout);clearTimeout(transitionTimeout);
 demoTimeout=autoTimeout=wrongTimeout=transitionTimeout=0;
 if(animation){animation.remove();animation=null;}
 renderGeneration++;
}
function moveObject(uci){return{from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||'q'};}
function playedMove(){var u=lesson.best;try{return game.move(moveObject(u));}catch(e){return null;}}
function resetGame(){game=new Chess(fen(lesson));selected='';choices=[];demoDone=false;}
function renderSteps(){
 var nav=$('fp-steps');nav.replaceChildren();
 LABELS.forEach(function(label,i){
  var btn=document.createElement('button');
  btn.className='fp-step'+(i===stage?' current':'')+((i<stage||i===3&&completed[0]||i===4&&completed[1])?' done':'');
  btn.type='button';btn.textContent=i+1;btn.setAttribute('aria-label','Paso '+(i+1)+': '+label);
  btn.setAttribute('aria-current',String(i===stage?'step':'false'));btn.title=label;
  btn.onclick=function(){goStage(i);};nav.appendChild(btn);
 });
}
function addMarker(from,to,color){
 var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('class','fp-overlay');svg.setAttribute('viewBox','0 0 800 800');
 var defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
 var mark=document.createElementNS('http://www.w3.org/2000/svg','marker');
 mark.setAttribute('id','fp-head');mark.setAttribute('viewBox','0 0 10 10');mark.setAttribute('refX','7');mark.setAttribute('refY','5');
 mark.setAttribute('markerWidth','6');mark.setAttribute('markerHeight','6');mark.setAttribute('orient','auto-start-reverse');
 var tip=document.createElementNS('http://www.w3.org/2000/svg','path');
 tip.setAttribute('d','M 0 0 L 10 5 L 0 10 z');tip.setAttribute('fill',color);mark.appendChild(tip);defs.appendChild(mark);svg.appendChild(defs);
 var a=sqindex(from),b=sqindex(to),x1=(a%8+.5)*100,y1=(Math.floor(a/8)+.5)*100,x2=(b%8+.5)*100,y2=(Math.floor(b/8)+.5)*100;
 var line=document.createElementNS('http://www.w3.org/2000/svg','line');
 var dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.sqrt(dx*dx+dy*dy)),shrink=31;
 line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2-dx/len*shrink);line.setAttribute('y2',y2-dy/len*shrink);
 line.setAttribute('stroke',color);line.setAttribute('stroke-width','12');line.setAttribute('stroke-opacity','.9');line.setAttribute('marker-end','url(#fp-head)');
 svg.appendChild(line);$('board').appendChild(svg);
}
function boardRender(){
 var b=$('board'),matrix=game.board(),targetSquares=choices.map(function(m){return m.to;});
 b.replaceChildren();
 for(var i=0;i<64;i++){(function(i){
  var row=i>>3,f=i%8,pos=squareName(i),piece=matrix[row][f],sq=document.createElement('button');
  sq.type='button';sq.className='sq '+((row+f)%2?'d':'l');
  sq.dataset.sq=pos;sq.setAttribute('aria-label','Casilla '+pos+(piece?' con '+(piece.color==='w'?'pieza blanca ':'pieza negra ')+piece.type:''));
  if(selected===pos)sq.classList.add('selected');
  if(targetSquares.includes(pos))sq.classList.add('target');
  if(demoDone&&((pos===lesson.best.slice(0,2))||(pos===lesson.best.slice(2,4))))sq.classList.add(pos===lesson.best.slice(0,2)?'last-source':'last-target');
  if(piece){var span=document.createElement('span');span.className='pc';span.innerHTML=A.pieces[piece.color+piece.type.toUpperCase()];sq.appendChild(span);}
  if(f===0){var r=document.createElement('span');r.className='coord r';r.textContent=8-row;sq.appendChild(r);}
  if(row===7){var c=document.createElement('span');c.className='coord f';c.textContent='abcdefgh'[f];sq.appendChild(c);}
  sq.onclick=function(){boardClick(pos);};b.appendChild(sq);
 })(i);}
 if(stage===2||stage===1&&demoDone||hint&&(stage===3||stage===4))addMarker(lesson.best.slice(0,2),lesson.best.slice(2,4),stage===2?'#1b9a72':'#d3a02f');
}
function animateBest(){
 if(stage!==1||demoDone)return;
 var before=$('board'),start=lesson.best.slice(0,2),end=lesson.best.slice(2,4);
 var a=before.querySelector('[data-sq="'+start+'"]'),z=before.querySelector('[data-sq="'+end+'"]');
 var source=a&&a.querySelector('.pc');
 if(!source||!a||!z){playedMove();demoDone=true;boardRender();return;}
 if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches){playedMove();demoDone=true;boardRender();return;}
 var w=before.clientWidth/8,af=sqindex(start),bf=sqindex(end),dx=((bf%8)-(af%8))*w,dy=(Math.floor(bf/8)-Math.floor(af/8))*w;
 var clone=document.createElement('span');clone.className='fp-ghost';
 clone.style.left=(af%8*12.5)+'%';clone.style.top=(Math.floor(af/8)*12.5)+'%';clone.innerHTML=source.innerHTML;
 animation=clone;source.style.visibility='hidden';before.appendChild(clone);
 /* transición con un fotograma inicial garantizado */
 requestAnimationFrame(function(){requestAnimationFrame(function(){if(animation===clone)clone.style.transform='translate('+dx+'px,'+dy+'px)';});});
 var myGen=renderGeneration;
 transitionTimeout=setTimeout(function(){if(myGen!==renderGeneration||stage!==1)return;animation=null;playedMove();demoDone=true;boardRender();},Math.round(900/speed));
}
function stageCopy(){
 var name=G[lesson.g][0],base=lesson.goal,answer=lesson.explain,principle=G[lesson.g][2];
 if(stage===0)return{head:'Descubre',main:base,detail:'Observa la posición y localiza los peones que pueden cambiar la estructura. Todavía no muevas: primero compara las amenazas de los dos bandos.',rule:'Antes de avanzar, identifica el peón pasado, la base de la cadena, la oposición o el tiempo disponible.'};
 if(stage===1)return{head:'Observa',main:'Fíjate en el peón que se mueve. La jugada se reproduce sobre el tablero para que veas de dónde sale y qué casilla ocupa.',detail:answer,rule:'Observa el antes y el después: el peón no podrá regresar.'};
 if(stage===2)return{head:'Comprende',main:answer,detail:'La jugada temática es '+lesson.best.slice(0,2)+' → '+lesson.best.slice(2,4)+'. Razona qué pasaría si dedicaras ese tiempo a otro peón.',rule:principle};
 if(stage===3)return{head:'Practica',main:'Ahora hazlo tú. Desde la posición inicial, mueve sobre el tablero el peón que cumple el objetivo.',detail:base+' Toca una pieza y luego una casilla marcada como destino legal. Si fallas, puedes volver a intentarlo.',rule:principle};
 return{head:'Comprueba',main:'Repaso sin soluciones: vuelve a ejecutar la jugada clave sin ayuda.',detail:'Los peones no retroceden. Piensa en las casillas que controlas, en las que dejas de proteger y en la respuesta que puede jugar el rival.',rule:principle};
}
function updateNav(){
 $('counter').textContent='Caso '+(index+1)+' de '+list().length+' · '+G[lesson.g][0];
 var solved=L.filter(function(l){return progress[l.id];}).length;
 $('complete').textContent=solved+' / '+L.length+' dominados';$('meter-fill').style.width=solved/L.length*100+'%';
 $('group').textContent=G[lesson.g][0];$('case-title').textContent=lesson.title;
 $('number').textContent='Caso '+lesson.id+' / '+L.length;
 $('fp-current-step').textContent='Paso '+(stage+1)+' de 5 · '+LABELS[stage];
 $('prev').disabled=index===0;$('next').disabled=index===list().length-1;
 $('fp-back-step').disabled=stage===0;
 $('fp-next-step').textContent=stage===4?(completed[1]?'Continuar a otro caso':'Completa el repaso'):(stage===3&&!completed[0]?'Haz la jugada':'Siguiente paso');
 $('fp-next-step').disabled=(stage===3&&!completed[0])||(stage===4&&!completed[1]);
 $('fp-auto').textContent=auto?'⏸ Pausar':'▶ Reproducir';$('fp-auto').setAttribute('aria-pressed',String(auto));
 $('fp-speed').textContent=speed+'×';
 $('hint').hidden=stage!==3&&stage!==4;
 $('hint').textContent=hint?'Ocultar pista':'Pista';$('hint').setAttribute('aria-pressed',String(hint));
 var t=stageCopy();$('fp-stage-name').textContent=t.head;$('fp-stage-title').textContent=stage===0?lesson.title:t.head;
 $('fp-stage-summary').textContent=t.main;$('fp-stage-detail').textContent=t.detail;
 $('principle').textContent=t.rule;
 $('fp-step-note').textContent=stage===1?'Demostración animada.':stage===3||stage===4?'Mueve las piezas directamente sobre el tablero.':'Aprende observando la estructura.';
 var box=$('fp-status');box.textContent=message;box.className='fp-status'+(messageKind?' '+messageKind:'');
 $('fp-next-case').hidden=!(stage===4&&completed[1]);renderSteps();
 Array.from($('catalog').children).forEach(function(btn){var g=+btn.dataset.g;btn.classList.toggle('active',g===lesson.g);var count=btn.querySelector('.count');if(count)count.textContent=L.filter(function(x){return x.g===g&&progress[x.id];}).length+'/4';});
}
function scheduleAutoplay(){
 clearTimeout(autoTimeout);
 if(!auto||stage>=3)return;
 var active=renderGeneration,wait=stage===0?4800:stage===1?5100:5500;
 autoTimeout=setTimeout(function(){if(active===renderGeneration&&auto&&stage<3)goStage(stage+1);},wait/speed);
}
function render(){
 clearTimeout(demoTimeout);clearTimeout(autoTimeout);clearTimeout(transitionTimeout);
 if(animation){animation.remove();animation=null;}
 renderGeneration++;
 boardRender();updateNav();
 if(stage===1&&!demoDone){var generation=renderGeneration;demoTimeout=setTimeout(function(){if(generation===renderGeneration)animateBest();},Math.round(550/speed));}
 scheduleAutoplay();
}
function goStage(number){
 if(number<0||number>4)return;
 cancelTimers();stage=number;hint=false;message='';messageKind='';
 resetGame();
 if(stage===2) {playedMove();demoDone=true;}
 if(stage===3&&completed[0]){playedMove();demoDone=true;message='Ya resolviste la práctica. Puedes pasar al repaso.';messageKind='success';}
 if(stage===4&&completed[1]){playedMove();demoDone=true;message='Caso dominado. Puedes continuar con otro final.';messageKind='success';}
 render();
}
function lessonOpen(i){
 cancelTimers();index=Math.max(0,Math.min(i,list().length-1));lesson=currentLesson();
 if(!lesson)return;
 stage=0;completed=[false,false];hint=false;message='';messageKind='';
 store(LAST_KEY,String(lesson.id));resetGame();render();
}
function showHint(){hint=!hint;message=hint?'Observa la flecha: indica la dirección de la jugada que debes encontrar.':'Pista ocultada. Intenta resolverlo por tu cuenta.';messageKind='';render();}
function verifyMove(from,to,prom){
 var m=null;
 try{m=game.move({from:from,to:to,promotion:prom||'q'});}catch(e){m=null;}
 if(!m){message='Ese movimiento no es legal en esta posición.';messageKind='error';render();return;}
 var u=m.from+m.to+(m.promotion||'');
 if(u===lesson.best){demoDone=true;selected='';choices=[];
   if(stage===3){completed[0]=true;message='¡Bien! '+lesson.explain+' Pulsa «Siguiente paso» para comprobarlo sin ayuda.';}
   else{completed[0]=true;completed[1]=true;progress[lesson.id]=true;store(PROGRESS_KEY,JSON.stringify(progress));message='¡Comprobado! Ya reconoces el plan de esta estructura. Caso dominado.';}
   messageKind='success';auto=false;store(PAUSE_KEY,'1');render();return;
 }
 message='Este movimiento es legal, pero no resuelve el objetivo del ejercicio. '+(stage===4?'Compara los tiempos y vuelve a intentarlo.':'Busca el peón que cumple la idea señalada.');
 messageKind='error';selected='';choices=[];render();
 var generation=renderGeneration;
 wrongTimeout=setTimeout(function(){if(generation!==renderGeneration)return;resetGame();demoDone=false;render();},1300);
}
function boardClick(s){
 if(stage!==3&&stage!==4)return;
 if(stage===3&&completed[0]||stage===4&&completed[1])return;
 var p=game.get(s);
 if(selected){
  var possible=choices.find(function(m){return m.to===s;});
  if(possible){verifyMove(selected,s,possible.promotion);return;}
 }
 if(p&&p.color==='w'){
  selected=s;choices=game.moves({square:s,verbose:true});
  message=choices.length?'Elige ahora una casilla de destino.':'Esta pieza no tiene movimientos legales.';messageKind='';
 }else{selected='';choices=[];message='Toca primero una pieza blanca que pueda moverse.';messageKind='';}
 render();
}
function advanceStep(){
 if(stage===4&&completed[1]){
  if(index<list().length-1)lessonOpen(index+1);else if(group!=='all'){group='all';$('category').value='all';lessonOpen(Math.min(L.length-1,L.findIndex(function(x){return x.id===lesson.id;})+1));}
  return;
 }
 if(stage<4&&!(stage===3&&!completed[0]))goStage(stage+1);
}
function restartLesson(){lessonOpen(index);}
var sel=$('category'),all=document.createElement('option');all.value='all';all.textContent='Todas las estructuras · 32 casos';sel.appendChild(all);
G.forEach(function(g,i){
 var op=document.createElement('option');op.value=i;op.textContent=(i+1)+'. '+g[0];sel.appendChild(op);
 var btn=document.createElement('button');btn.type='button';btn.dataset.g=i;
 var no=document.createElement('span');no.className='index';no.textContent=i+1;
 var title=document.createElement('span');title.textContent=g[0];
 var count=document.createElement('span');count.className='count';
 btn.appendChild(no);btn.appendChild(title);btn.appendChild(count);
 btn.onclick=function(){group=String(i);sel.value=group;lessonOpen(0);};$('catalog').appendChild(btn);
});
sel.onchange=function(){group=this.value;lessonOpen(0);};
$('prev').onclick=function(){lessonOpen(index-1);};$('next').onclick=function(){lessonOpen(index+1);};
$('fp-back-step').onclick=function(){goStage(stage-1);};$('fp-next-step').onclick=advanceStep;
$('fp-auto').onclick=function(){auto=!auto;store(PAUSE_KEY,auto?'0':'1');render();};
$('fp-speed').onclick=function(){var a=[.5,.75,1,1.5,2];speed=a[(a.indexOf(speed)+1)%a.length];render();};
$('fp-replay').onclick=function(){auto=false;store(PAUSE_KEY,'1');goStage(1);};
$('hint').onclick=showHint;
$('reset-board').onclick=restartLesson;
$('reset-progress').onclick=function(){if(window.confirm('¿Borrar las 32 lecciones dominadas?')){progress={};store(PROGRESS_KEY,'{}');lessonOpen(index);}};
$('fp-next-case').onclick=function(){if(index<list().length-1)lessonOpen(index+1);else{group='all';sel.value='all';lessonOpen(0);}};
lessonOpen(index);
})();
