
(function(){
"use strict";
var A=window.C17FinalesAssets,root=document.documentElement;
if(!A||!Array.isArray(A.themes)||!A.pieces)return;
var $=function(id){return document.getElementById(id);};
var tabKey='pc_tablero_3',colorModeKey='pc_modo',currentTab='cielo',modal=null,modalWasFocus=null,limit=48;
function storageGet(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}}
function storageSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function chosenTheme(id){return A.themes.find(function(t){return t.k===id;});}
function setMode(mode,write){
 if(['claro','oscuro','sistema'].indexOf(mode)<0)mode='sistema';
 if(write){storageSet(colorModeKey,mode);try{document.cookie='pc_modo='+mode+';path=/;max-age=63072000;SameSite=Lax';}catch(e){}}
 var dark=mode==='oscuro'||mode==='sistema'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;
 root.setAttribute('data-modo',dark?'oscuro':'claro');
 document.querySelectorAll('.appearance-modes [data-mode]').forEach(function(btn){btn.setAttribute('aria-pressed',String(btn.dataset.mode===mode));});
}
function setTab(id,write){
 var t=chosenTheme(id);
 if(!t){id='cielo';t=chosenTheme('cielo');}
 currentTab=id;
 root.setAttribute('data-tablero',id);
 if(t&&t.t)root.setAttribute('data-trama',t.t);else root.removeAttribute('data-trama');
 root.style.removeProperty('--light');root.style.removeProperty('--dark');
 root.style.removeProperty('--coord-l');root.style.removeProperty('--coord-d');
 root.style.removeProperty('--hl');root.style.removeProperty('--dibujo');
 if(write)storageSet(tabKey,id);
 var label=$('active-theme');
 if(label)label.textContent=t?t.n:'Cielo';
 if(modal&&modal==='tableros')renderItems();
}
function setFondo(id){if(window.C17Fondos&&window.C17Fondos.guardar)window.C17Fondos.guardar(id);updateFondo();}
function updateFondo(){var label=$('active-fondo'),f=window.C17Fondos,selected=f&&f.leer?f.leer():'ninguno',item=f&&f.datos?f.datos(selected):null;if(label)label.textContent=item?item.n:'Sin fondo';if(modal==='fondos')renderItems();}
function open(kind){modal=kind;modalWasFocus=document.activeElement;limit=48;
 $('appearance-layer').hidden=false;
 $('appearance-layer').setAttribute('aria-hidden','false');
 $('appearance-title').textContent=kind==='tableros'?'Tema del tablero':'Fondo de pantalla';
 $('appearance-sub').textContent=kind==='tableros'?'216 tableros originales de Aprende Ajedrez':'12 fondos desenfocados de Chess de L';
 $('appearance-filter').hidden=kind!=='tableros';
 $('appearance-search').value='';
 $('appearance-help').textContent=kind==='tableros'?'El tablero elegido se comparte con Aprende Ajedrez.':'El fondo seleccionado se comparte con todas las secciones.';
 renderItems();
 $('appearance-x').focus();
}
function close(){modal=null;$('appearance-layer').hidden=true;$('appearance-layer').setAttribute('aria-hidden','true');if(modalWasFocus&&modalWasFocus.focus)modalWasFocus.focus();}
function createCard(obj,kind){var b=document.createElement('button');b.type='button';b.className='appearance-theme'+(kind==='tableros'?' pc-tema':'');var current=kind==='tableros'?currentTab:(window.C17Fondos&&window.C17Fondos.leer?window.C17Fondos.leer():'ninguno');
 b.setAttribute('aria-pressed',String(obj.k===current));b.setAttribute('aria-label',obj.n);
 if(kind==='tableros'){
   b.dataset.trama=obj.t||'';if(!obj.t)b.removeAttribute('data-trama');
   b.style.setProperty('--l',obj.l);b.style.setProperty('--d',obj.d);
   var prev=document.createElement('i');prev.className='mini-board';
   var w=document.createElement('span');w.className='mini-piece';w.innerHTML=A.pieces.wK;
   var p=document.createElement('span');p.className='mini-piece';p.innerHTML=A.pieces.bP;
   prev.appendChild(w);prev.appendChild(p);b.appendChild(prev);
   b.onclick=function(){setTab(obj.k,true);close();};
 }else{
   var preview=document.createElement('div');preview.className='appearance-fondo';
   if(obj.k!=='ninguno')preview.style.backgroundImage='url("c17/fondos/'+obj.k+'.webp")';
   b.appendChild(preview);b.onclick=function(){setFondo(obj.k);close();};
 }
 var caption=document.createElement('span');caption.className='caption';caption.textContent=obj.n;b.appendChild(caption);return b;
}
function renderItems(){
 var grid=$('appearance-items'),search=$('appearance-search').value.toLocaleLowerCase('es').trim(),all,kind=modal;
 if(kind==='tableros')all=A.themes.filter(function(t){return !search||t.n.toLocaleLowerCase('es').includes(search);});
 else{var f=window.C17Fondos;all=[{k:'ninguno',n:'Sin fondo'}].concat(f&&f.lista?f.lista.map(function(o){return{k:o.id,n:o.n};}):[]);}
 grid.replaceChildren();
 all.slice(0,kind==='tableros'?limit:all.length).forEach(function(t){grid.appendChild(createCard(t,kind));});
 var more=kind==='tableros'&&all.length>limit;$('appearance-more-btn').hidden=!more;
 $('appearance-count').textContent=Math.min(all.length,kind==='tableros'?limit:all.length)+' de '+all.length+' diseños';
 $('appearance-more-btn').onclick=function(){limit+=48;renderItems();};
}
$('theme-button').onclick=function(){open('tableros');};
$('background-button').onclick=function(){open('fondos');};
$('appearance-x').onclick=close;
$('appearance-layer').onclick=function(e){if(e.target===this)close();};
$('appearance-search').oninput=function(){limit=48;renderItems();};
document.addEventListener('keydown',function(e){if(!modal)return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){var focusable=Array.from($('appearance-layer').querySelectorAll('button:not([hidden]),input:not([hidden])')).filter(function(a){return a.offsetParent!==null;});if(!focusable.length)return;var first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.querySelectorAll('.appearance-modes [data-mode]').forEach(function(b){b.onclick=function(){setMode(b.dataset.mode,true);};});
window.addEventListener('storage',function(e){if(e.key===tabKey)setTab(storageGet(tabKey)||'cielo',false);if(e.key===colorModeKey)setMode(storageGet(colorModeKey)||'sistema',false);if(e.key==='c17_fondo')updateFondo();});
try{window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){setMode(storageGet(colorModeKey)||'sistema',false);});}catch(e){}
setMode(storageGet(colorModeKey)||'sistema',false);setTab(storageGet(tabKey)||'cielo',false);updateFondo();
window.C17FinalesAppearance={open:open,setTab:setTab,close:close};
})();
