/* ==================================================================
   Chess de L · comportamiento propio del contenedor
   - Volteo de casillas al cambiar de sección
   - Avance de cada sección en el menú
   - Píldora del interruptor de apariencia
   - Mi ID: QR y enlace para abrir el avance en otro dispositivo (?id=)
   - Confirmación antes de recargar la página
   No toca la lógica original: solo la acompaña.
   ================================================================== */
(function(){
  'use strict';
  var WEB='https://la86926.github.io/chess17/';
  var backdrop=document.getElementById('drawer-backdrop');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function json(k){try{return JSON.parse(ls(k)||'null');}catch(e){return null;}}

  /* ---------- volteo de casillas ---------- */
  var COLOR={'3':['#B6EDD3','#96DDBC'],'1':['#BCD9FF','#9CC5FB'],'2':['#C9BCFF','#B3A2FB'],'id':['#FFEB9E','#F9DC6E']};
  var pasando=false;
  function volteo(destino,hecho){
    if(reduce){hecho();return;}
    var W=window.innerWidth,H=window.innerHeight;
    var cols=W<600?6:10,lado=W/cols,filas=Math.ceil(H/lado);
    var v=document.createElement('div');v.className='c-volteo';v.setAttribute('aria-hidden','true');
    var c=COLOR[destino]||COLOR['1'];
    v.style.setProperty('--cols',cols);v.style.setProperty('--v1',c[0]);v.style.setProperty('--v2',c[1]);
    v.style.gridAutoRows=lado+'px';
    var h='';
    for(var f=0;f<filas;f++)for(var k=0;k<cols;k++)h+='<i'+((f+k)%2?' class="o"':'')+' style="--k:'+(f+k)+'"></i>';
    v.innerHTML=h;document.body.appendChild(v);
    var max=(filas+cols)*22+340;
    v.getBoundingClientRect();
    requestAnimationFrame(function(){
      v.classList.add('cubre');
      setTimeout(function(){
        hecho();
        setTimeout(function(){
          v.classList.remove('cubre');v.classList.add('sale');
          setTimeout(function(){v.remove();},max+40);
        },140);
      },max);
    });
  }
  /* Solo cuando la persona elige en el menú; los cambios automáticos (la nube, enlaces) siguen al instante. */
  window.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('.app-choice');
    if(!b||pasando||!backdrop.classList.contains('open'))return;
    if(b.classList.contains('active'))return;
    e.preventDefault();e.stopImmediatePropagation();
    pasando=true;
    volteo(b.getAttribute('data-app'),function(){pasando=true;b.click();pasando=false;});
  },true);

  /* ---------- avance en el menú ---------- */
  function contarLista(k){var v=json(k);if(Array.isArray(v))return v.length;if(v&&typeof v==='object')return Object.keys(v).length;return 0;}
  function contarAprende(){
    var p=json('aa_progreso_v1'),l=p&&p.lecciones,n=0;
    if(l)for(var k in l){if(l[k]&&l[k].estado==='completada')n++;}
    return n;
  }
  function pintarAvance(){
    var datos={'3':[contarAprende(),218],'1':[contarLista('wp_solved'),1128],'2':[contarLista('wp2_solved'),1000]};
    for(var app in datos){
      var el=document.querySelector('.app-choice[data-app="'+app+'"]');if(!el)continue;
      var hecho=Math.min(datos[app][0],datos[app][1]),total=datos[app][1];
      var cas=el.querySelectorAll('.ac-casillas i'),llenas=hecho/total*cas.length;
      for(var i=0;i<cas.length;i++){cas[i].style.setProperty('--k',i);cas[i].style.setProperty('--f',Math.max(0,Math.min(1,llenas-i)).toFixed(3));}
      var cifra=el.querySelector('.ac-cifra');
      if(cifra)cifra.textContent=hecho.toLocaleString('es')+' de '+total.toLocaleString('es');
      el.setAttribute('aria-label',el.querySelector('.ac-nombre').textContent+'. '+hecho+' de '+total+' completados');
    }
  }
  function vaciarAvance(){var c=document.querySelectorAll('.ac-casillas i');for(var i=0;i<c.length;i++)c[i].style.setProperty('--f',0);}
  new MutationObserver(function(){
    if(backdrop.classList.contains('open'))requestAnimationFrame(function(){requestAnimationFrame(pintarAvance);});
    else setTimeout(vaciarAvance,300);
  }).observe(backdrop,{attributes:true,attributeFilter:['class']});

  /* ---------- píldora del interruptor de apariencia ---------- */
  var tema=document.getElementById('tema');
  function pildora(){var b=tema.querySelectorAll('button');for(var i=0;i<b.length;i++)if(b[i].getAttribute('aria-pressed')==='true')tema.setAttribute('data-i',i);}
  new MutationObserver(pildora).observe(tema,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
  pildora();

  /* ---------- Mi ID: QR y enlace ---------- */
  var cuenta=document.getElementById('mi-id-cuenta');
  var ultimoId=null;
  function enlaceDe(id){return WEB+'?id='+encodeURIComponent(id);}
  function qrSvg(texto){
    try{
      var q=qrcode(0,'M');q.addData(texto);q.make();
      var n=q.getModuleCount(),d='';
      for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))d+='M'+c+' '+r+'h1v1h-1z';
      return '<svg viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges" role="img" aria-label="Código QR de tu ID"><path fill="#1B1730" d="'+d+'"/></svg>';
    }catch(e){return '';}
  }
  function completarMiId(){
    var id=window.PCSync&&window.PCSync.id;
    var qr=document.getElementById('c-qr'),pasos=document.getElementById('c-pasos');
    if(id){
      if(pasos)pasos.remove();
      if(qr&&ultimoId===id)return;
      if(qr)qr.remove();
      ultimoId=id;
      var svg=qrSvg(enlaceDe(id));if(!svg)return;
      var box=document.createElement('section');box.className='c-qr';box.id='c-qr';
      box.innerHTML='<div class="c-qr-img">'+svg+'</div><div><h2>Sigue en otro dispositivo</h2><p>Escanéalo con la cámara del iPhone o del iPad: tu ID llega escrito y solo tocas «Entrar».</p><button type="button" id="c-qr-copiar">Copiar enlace</button></div>';
      cuenta.appendChild(box);
      document.getElementById('c-qr-copiar').onclick=function(){
        var b=this,url=enlaceDe(id);
        function listo(){b.textContent='Enlace copiado';setTimeout(function(){b.textContent='Copiar enlace';},1800);}
        try{navigator.clipboard.writeText(url).then(listo,function(){prompt('Copia este enlace:',url);});}catch(e){prompt('Copia este enlace:',url);}
      };
    }else{
      ultimoId=null;
      if(qr)qr.remove();
      if(!pasos&&cuenta.querySelector('.mi-id-form')){
        pasos=document.createElement('ol');pasos.className='c-pasos';pasos.id='c-pasos';
        pasos.innerHTML='<li>Crea un ID que solo tú conozcas, de 8 caracteres o más.</li><li>Tu avance de las tres secciones se guarda en la nube.</li><li>En otro dispositivo, entra con el mismo ID y sigues donde te quedaste.</li>';
        cuenta.appendChild(pasos);
      }
    }
  }
  if(cuenta){
    new MutationObserver(function(m){
      for(var i=0;i<m.length;i++){for(var j=0;j<m[i].addedNodes.length;j++){var n=m[i].addedNodes[j];if(n.id==='c-qr'||n.id==='c-pasos')return;}}
      completarMiId();
    }).observe(cuenta,{childList:true});
  }

  /* Enlace con ?id=: abre Mi ID con el ID ya escrito, listo para «Entrar». */
  (function(){
    var q;try{q=new URLSearchParams(location.search);}catch(e){return;}
    var id=String(q.get('id')||'').trim().toLowerCase();
    if(!/^[a-z0-9]{4,32}$/.test(id))return;
    try{q.delete('id');var r=q.toString();history.replaceState(history.state,'',location.pathname+(r?'?'+r:'')+location.hash);}catch(e){}
    var t0=Date.now();
    (function esperar(){
      if(!window.PCSync){if(Date.now()-t0<15000)setTimeout(esperar,150);return;}
      if(window.PCSync.id===id)return;
      var b=document.querySelector('.app-choice[data-app="id"]');if(b&&!b.classList.contains('active'))b.click();
      setTimeout(function(){
        var inp=document.getElementById('mi-id-input');
        if(inp){inp.value=id;try{inp.focus({preventScroll:true});}catch(e){}}
      },120);
    })();
  })();

  /* ---------- antes de recargar: avisar ---------- */
  window.addEventListener('beforeunload',function(e){
    if(window.__c17SinAviso||location.hostname==='appassets.androidplatform.net')return;
    e.preventDefault();e.returnValue='';return '';
  });
})();
