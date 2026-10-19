/* Chess de L · ajustes mínimos de la piel dentro de cada sección */
(function(){
  'use strict';
  var MANO='<svg viewBox="0 0 64 64"><path d="M25 6.5c2.6 0 4.5 2 4.5 4.6V29l1.2-.4V24c0-2.4 1.9-4.2 4.2-4.2s4.2 1.8 4.2 4.2v4.3l.9-.2v-1.6c0-2.3 1.9-4.1 4.2-4.1s4.1 1.8 4.1 4.1v3.2l.6-.1c2.2-.2 4.1 1.6 4.1 3.8v10.4c0 9.2-7 15.7-16.4 15.7h-2.7c-6.2 0-10.6-2.8-13.9-7.7L12.8 38c-1.3-2-.8-4.6 1.2-5.9 1.9-1.3 4.4-.9 5.8.9l1.1 1.4V11.1c0-2.6 1.6-4.6 4.1-4.6z" fill="#FFFFFF" stroke="#1C1B22" stroke-width="2" stroke-linejoin="round"/><path d="M30.7 29v8M39.1 28.3v8.4M47.4 30.7v6.9" stroke="#1C1B22" stroke-width="1.8" stroke-linecap="round"/></svg>';
  function sello(){
    var c=document.querySelectorAll('.home-icon .crest, img.crest');
    for(var i=0;i<c.length;i++){if(c[i].getAttribute('src')!=='c17/logo.svg'){c[i].setAttribute('src','c17/logo.svg');c[i].setAttribute('alt','Chess de L');}}
  }
  function manos(){
    var m=document.querySelectorAll('.aa-tour-mano');
    for(var i=0;i<m.length;i++)if(!m[i].querySelector('svg'))m[i].innerHTML=MANO;
  }
  function iniciar(){
    sello();manos();
    new MutationObserver(function(r){for(var i=0;i<r.length;i++)if(r[i].addedNodes.length){manos();return;}}).observe(document.body,{childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
