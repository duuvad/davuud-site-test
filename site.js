(function(){
  "use strict";
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var isHome=!!document.getElementById('specimen');
  var homeMain=isHome?document.querySelector('main').cloneNode(true):null;
  var current=isHome?'index.html':(location.pathname.split('/').pop()||'index.html');

  /* ---------- smooth scrolling ---------- */
  var lenis=null;
  if(fine&&!calm&&window.Lenis){
    try{lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
      (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
      document.documentElement.style.scrollBehavior='auto';}catch(e){lenis=null}
  }
  function goTo(target,instant){
    if(lenis){lenis.scrollTo(target,{offset:target===0?0:-80,immediate:!!instant});return}
    if(target===0){window.scrollTo({top:0,behavior:(calm||instant)?'auto':'smooth'})}else{target.scrollIntoView({behavior:(calm||instant)?'auto':'smooth'})}
  }

  /* ---------- chrome: progress, header, back to top ---------- */
  var topbar=document.querySelector('.top'), bar=document.getElementById('progress'), lastY=window.scrollY;
  var tt=document.getElementById('totop'), ring=tt?tt.querySelector('.ring'):null, C=2*Math.PI*24;
  if(ring){ring.style.strokeDasharray=C;ring.style.strokeDashoffset=C}
  function chrome(){
    var y=window.scrollY, h=document.documentElement.scrollHeight-window.innerHeight, p=h>0?Math.min(1,y/h):0;
    if(bar)bar.style.transform='scaleX('+p+')';
    if(topbar){if(y>lastY+6&&y>160){topbar.classList.add('hide')}else if(y<lastY-6||y<=160){topbar.classList.remove('hide')}}
    if(tt){tt.classList.toggle('show',y>700);ring.style.strokeDashoffset=(C*(1-p)).toFixed(1)}
    lastY=y;
  }
  if(tt)tt.addEventListener('click',function(){goTo(0)});


  /* ---------- mobile menu ---------- */
  var navEl=document.querySelector('.top .nav'), mbtn=null, mm=null;
  if(navEl){
    mbtn=document.createElement('button');mbtn.type='button';mbtn.className='menu-btn';mbtn.textContent='Menu';mbtn.setAttribute('aria-expanded','false');
    navEl.parentNode.appendChild(mbtn);
    mm=document.createElement('div');mm.className='mmenu';mm.setAttribute('aria-label','Menu');
    var close=document.createElement('button');close.type='button';close.className='menu-btn mmenu-close';close.textContent='Close';mm.appendChild(close);
    [].slice.call(navEl.querySelectorAll('a')).forEach(function(a){mm.appendChild(a.cloneNode(true))});
    document.body.appendChild(mm);
    function setMenu(open){document.body.classList.toggle('menu-open',open);mbtn.setAttribute('aria-expanded',open?'true':'false');if(lenis){open?lenis.stop():lenis.start()}document.body.style.overflow=open?'hidden':''}
    mbtn.addEventListener('click',function(){setMenu(true)});
    close.addEventListener('click',function(){setMenu(false)});
    mm.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('menu-open'))setMenu(false)});
  }

  /* ---------- toast and copy ---------- */
  var toast=document.getElementById('toast'), tTimer;
  function show(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('on');clearTimeout(tTimer);tTimer=setTimeout(function(){toast.classList.remove('on')},1800)}
  function selectText(el){try{var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}}
  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('.copy');if(!btn)return;
    var src=btn.getAttribute('data-copy'), el=src?document.getElementById(src):btn.parentNode.querySelector('a');
    var text=src?el.textContent.trim():btn.getAttribute('data-text');
    var lbl=btn._h||(btn._h=btn.innerHTML);
    function ok(){btn.classList.add('ok');btn.textContent='Copied';setTimeout(function(){btn.classList.remove('ok');btn.innerHTML=lbl},1600);show('Copied')}
    function fail(){if(el)selectText(el);show('Selected, ready to copy')}
    try{navigator.clipboard.writeText(text).then(ok,fail)}catch(err){fail()}
  });

  /* ---------- London clock ---------- */
  var tf=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hour12:false});
  function tick(){var clk=document.getElementById('clock');if(!clk)return;var p=tf.format(new Date()).split(':');clk.innerHTML=p[0]+'<span class="colon">:</span>'+p[1]}
  setInterval(tick,15000);

  /* ---------- name fitting on the home hero ---------- */
  function fit(){
    var h1=document.getElementById('name'), spec=document.getElementById('specimen');
    if(!h1||!spec)return;
    if(window.innerWidth<760){h1.style.fontSize='';return}
    h1.style.fontSize='200px';
    var w=spec.clientWidth, s=h1.scrollWidth;
    if(s>0)h1.style.fontSize=Math.min(420,Math.floor(200*w/s*0.995))+'px';
  }
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,80)});

  /* ---------- headline words ---------- */
  function splitWords(h){
    if(h.classList.contains('words'))return;
    var out=document.createDocumentFragment(), i=0;
    function add(text,grad){text.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t)){out.appendChild(document.createTextNode(' '));return}
      var w=document.createElement('span');w.className='w2';var s=document.createElement('span');s.className='wi'+(grad?' gw':'');s.style.setProperty('--i',i++);s.textContent=t;w.appendChild(s);out.appendChild(w)})}
    [].slice.call(h.childNodes).forEach(function(n){if(n.nodeType===3)add(n.textContent,false);else if(n.nodeType===1)add(n.textContent,n.tagName==='I')});
    h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
    h.innerHTML='';h.appendChild(out);h.classList.add('words');
  }

  /* ---------- count up ---------- */
  function fmt(v,el){var d=+(el.dataset.dec||0),t=v.toFixed(d);if(el.dataset.sep){t=Math.round(v).toLocaleString('en-GB')}return (el.dataset.pre||'')+t+(el.dataset.suf||'')}
  function count(el){if(el.dataset.done)return;el.dataset.done='1';var to=+el.dataset.count,t0=null,dur=1600;function step(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/dur),e=1-Math.pow(2,-10*k);el.textContent=fmt(k===1?to:to*e,el);if(k<1)requestAnimationFrame(step)}requestAnimationFrame(step)}

  /* ---------- reveals ---------- */
  var REVEAL='.msys,.mgh,.sysrow,.bcard,.rh,.layer .lh,.ba-r,.sysitem,.offer,.aipart,.ai-copy,.fact,.chapter .lab,.chapter .txt,.gal figure,.cquote,.result,.next,.card,.step,.pillar,.pressrow,.bio,.headshot,.head .label,.head h2:not(.vh),.idea-body,.gap,.stat,.record-foot,.row > figure,.index-head,.irow,.position,.guide,.talk,.formats,.panel,.quote,.names,.contact .eyebrow,.contact h2,.way,.tb';
  var ro=null, rels=[];
  function reveal(el){el.classList.remove('pre');if(ro)ro.unobserve(el);var b=el.querySelector&&el.querySelector('b[data-count]');if(b)count(b)}
  function setupReveals(root){
    if(calm||!('IntersectionObserver' in window))return;
    if(ro)ro.disconnect();
    ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)reveal(e.target)})},{rootMargin:'0px 0px -8% 0px',threshold:0.08});
    rels=[].slice.call(document.querySelectorAll(REVEAL));
    rels.forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<window.innerHeight*0.92)return;
      el.classList.add('rv');
      if(el.matches('.row > figure'))el.classList.add('imgrv');
      var sib=[].slice.call(el.parentNode.children).filter(function(c){return rels.indexOf(c)>-1});
      el.style.transitionDelay=(Math.min(sib.indexOf(el),6)*70)+'ms';
      el.classList.add('pre');ro.observe(el);
    });
  }
  function sweep(){var vh=window.innerHeight,end=window.scrollY+vh>=document.documentElement.scrollHeight-4;rels.forEach(function(el){if(el.classList.contains('pre')&&(end||el.getBoundingClientRect().top<vh-20))reveal(el)})}

  /* ---------- parallax ---------- */
  var par=[];
  function parallax(){if(calm)return;var vh=window.innerHeight;par.forEach(function(im){var r=im.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=(r.top+r.height/2-vh/2)/vh;im.style.translate='0 '+(p*-28).toFixed(1)+'px'})}

  /* one scroll loop for everything */
  var ticking=false, sweepT=null;
  window.addEventListener('scroll',function(){
    if(!ticking){ticking=true;requestAnimationFrame(function(){chrome();parallax();ticking=false})}
    if(!sweepT)sweepT=setTimeout(function(){sweepT=null;sweep()},120);
  },{passive:true});

  /* ---------- floating preview on index rows ---------- */
  var prev=document.getElementById('preview'), pimg=document.getElementById('preview-img');
  var px=0,py=0,cx=0,cy=0,praf=null;
  function ploop(){cx+=(px-cx)*(calm?1:.16);cy+=(py-cy)*(calm?1:.16);prev.style.transform='translate('+(cx+28)+'px,'+(cy-120)+'px)';praf=requestAnimationFrame(ploop)}
  function bindPreview(){
    if(!fine||!prev)return;
    document.querySelectorAll('.irow').forEach(function(r){
      r.addEventListener('mouseenter',function(e){pimg.src=r.getAttribute('data-img');px=cx=e.clientX;py=cy=e.clientY;prev.classList.add('on');if(!praf)ploop()});
      r.addEventListener('mouseleave',function(){prev.classList.remove('on');cancelAnimationFrame(praf);praf=null});
      r.addEventListener('mousemove',function(e){px=e.clientX;py=e.clientY});
    });
  }

  /* ---------- tilt and magnet ---------- */
  function bindHover(){
    if(!fine||calm)return;
    document.querySelectorAll('main .row figure > a').forEach(function(a){
      a.addEventListener('mousemove',function(e){var r=a.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;a.style.transform='perspective(1200px) rotateY('+(x*3).toFixed(2)+'deg) rotateX('+(-y*3).toFixed(2)+'deg)'});
      a.addEventListener('mouseleave',function(){a.style.transform=''});
    });
    document.querySelectorAll('main .btn').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
      b.addEventListener('mouseleave',function(){b.style.transform=''});
    });
  }

  /* ---------- work filter ---------- */
  function bindFilter(){
    var chips=[].slice.call(document.querySelectorAll('.chip'));
    chips.forEach(function(ch){ch.addEventListener('click',function(){
      var f=ch.getAttribute('data-f');
      chips.forEach(function(c){var on=c===ch;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on?'true':'false')});
      document.querySelectorAll('.card').forEach(function(card){var ok=f==='all'||(card.getAttribute('data-f')||'').split(' ').indexOf(f)>-1;card.classList.toggle('out',!ok);card.setAttribute('aria-hidden',ok?'false':'true');card.tabIndex=ok?0:-1});
    })});
  }

  /* ---------- lightbox ---------- */
  var lb=document.getElementById('lightbox'), li=0, zooms=[], lastFocus=null;
  function lbShow(i){li=(i+zooms.length)%zooms.length;var z=zooms[li];var im=document.getElementById('lb-img');im.src=z.getAttribute('data-full');im.alt=z.getAttribute('data-cap')||'';document.getElementById('lb-cap').textContent=(li+1)+' / '+zooms.length+(z.getAttribute('data-cap')?'  ·  '+z.getAttribute('data-cap'):'')}
  function lbOpen(i){lastFocus=document.activeElement;lbShow(i);lb.hidden=false;requestAnimationFrame(function(){lb.classList.add('on')});if(lenis)lenis.stop();document.body.style.overflow='hidden';lb.querySelector('.lb-close').focus()}
  function lbClose(){lb.classList.remove('on');setTimeout(function(){lb.hidden=true},300);if(lenis)lenis.start();document.body.style.overflow='';if(lastFocus)lastFocus.focus()}
  if(lb){
    document.addEventListener('click',function(e){var z=e.target.closest&&e.target.closest('.zoom');if(!z)return;zooms=[].slice.call(document.querySelectorAll('main .zoom'));lbOpen(zooms.indexOf(z))});
    lb.querySelector('.lb-close').addEventListener('click',lbClose);
    lb.querySelector('.lb-prev').addEventListener('click',function(){lbShow(li-1)});
    lb.querySelector('.lb-next').addEventListener('click',function(){lbShow(li+1)});
    lb.addEventListener('click',function(e){if(e.target===lb)lbClose()});
    document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')lbClose();if(e.key==='ArrowLeft')lbShow(li-1);if(e.key==='ArrowRight')lbShow(li+1)});
    var sx=null;lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)lbShow(li+(dx<0?1:-1));sx=null});
  }

  /* ---------- nav state ---------- */
  function navState(){
    var section=current==='index.html'?'':(/^case-/.test(current)?'work.html':current);
    document.querySelectorAll('.nav a,.mmenu a').forEach(function(a){var on=a.getAttribute('href')===section;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  }


  /* ---------- film: right file for the screen, plays only while in view ---------- */
  var filmIO=null;
  function bindFilm(){
    if(filmIO){filmIO.disconnect();filmIO=null}
    var vids=[].slice.call(document.querySelectorAll('video.filmv'));if(!vids.length)return;
    var tall=window.matchMedia&&matchMedia('(max-width:640px)').matches;
    vids.forEach(function(v){
      v.poster=tall?v.dataset.ptall:v.dataset.pwide;
      if(!v.getAttribute('src'))v.src=tall?v.dataset.tall:v.dataset.wide;
      var b=v.parentNode.querySelector('.filmbtn');v._user=calm?'paused':'';
      function label(){var p=v.paused;b.textContent=p?'Play':'Pause';b.setAttribute('aria-label',p?'Play the film':'Pause the film')}
      b.onclick=function(){if(v.paused){v._user='';v.play().catch(function(){})}else{v._user='paused';v.pause()}label()};
      v.addEventListener('play',label);v.addEventListener('pause',label);label();
    });
    if(!('IntersectionObserver' in window))return;
    filmIO=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
      if(e.isIntersecting&&e.intersectionRatio>.35){if(!v._user&&v.paused)v.play().catch(function(){})}else if(!v.paused)v.pause()})},{threshold:[0,.35,.6]});
    vids.forEach(function(v){filmIO.observe(v)});
  }
  /* ---------- per-page setup ---------- */
  function init(){
    tick();fit();
    if(calm)document.querySelectorAll('svg.dgm').forEach(function(s){if(s.pauseAnimations)s.pauseAnimations()});
    if(!calm){
      document.querySelectorAll('.head h2:not(.vh),.contact h2,.chapter h2,.result h2').forEach(splitWords);
      document.querySelectorAll('.pagehead h1').forEach(function(h){splitWords(h);h.classList.add('pre');requestAnimationFrame(function(){requestAnimationFrame(function(){h.classList.remove('pre')})})});
    }
    setupReveals();
    par=calm?[]:[].slice.call(document.querySelectorAll('.row img,.portrait .img img,.case-hero img'));
    parallax();bindModels();bindSwipes();bindForm();bindPreview();bindHover();bindFilter();bindFilm();navState();chrome();
  }


  /* ---------- line models: assemble left to right, then work flows through ---------- */
  var mio=null;
  function bindModels(){
    var svgs=[].slice.call(document.querySelectorAll('svg.mdl'));
    if(!svgs.length||calm||!('IntersectionObserver' in window))return;
    if(mio)mio.disconnect();
    mio=new IntersectionObserver(function(es){es.forEach(function(e){
      var s=e.target;
      if(!e.isIntersecting){if(s.__live&&s.pauseAnimations)s.pauseAnimations();return}
      if(!s.__on)playModel(s);else if(s.pauseAnimations)s.unpauseAnimations();
    })},{threshold:0.25});
    svgs.forEach(function(s){if(!s.__on){s.classList.add('mpre')}mio.observe(s)});
  }
  function playModel(s){
    s.__on=1;
    var NS='http://www.w3.org/2000/svg',kids=[].slice.call(s.children).filter(function(c){return c.tagName!=='defs'}),last=0;
    kids.forEach(function(c){
      var b;try{b=c.getBBox()}catch(e){b={x:0,width:0}}
      var d=Math.max(0,Math.round((b.x+b.width*0.2)*0.95));last=Math.max(last,d);
      c.style.setProperty('--d',d+'ms');
      if(c.matches('.ak:not(.ds),.lk')&&c.getTotalLength)c.style.setProperty('--L',c.getTotalLength().toFixed(1));
    });
    s.getBoundingClientRect();
    requestAnimationFrame(function(){s.classList.add('mon')});
    setTimeout(function(){
      var flows=[].slice.call(s.querySelectorAll('path.ak'));
      flows.forEach(function(p,i){
        if(!p.id)p.id='mf'+Math.random().toString(36).slice(2,8);
        var L=p.getTotalLength?p.getTotalLength():200,dur=Math.min(3.6,Math.max(1.6,L/110)).toFixed(2);
        var c=document.createElementNS(NS,'circle');c.setAttribute('r','3.6');c.setAttribute('class','mpulse');
        c.innerHTML='<animateMotion dur="'+dur+'s" begin="'+(i*0.45).toFixed(2)+'s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .35 1"><mpath href="#'+p.id+'"/></animateMotion><animate attributeName="opacity" dur="'+dur+'s" begin="'+(i*0.45).toFixed(2)+'s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.12;.82;1"/>';
        c.setAttribute('opacity','0');
        s.appendChild(c);
      });
      s.__live=1;
    },last+1100);
  }


  /* ---------- swipe rows: counter and dots on phones ---------- */
  function bindSwipes(){
    [].slice.call(document.querySelectorAll('.fit .swipe')).forEach(function(row){
      if(row.__sw)return;row.__sw=1;
      var all=[].slice.call(row.children).reduce(function(a,c){return a.concat(c.classList.contains('side')?[].slice.call(c.children):[c])},[]);
      if(all.length<2)return;
      var d=document.createElement('div');d.className='dots';d.setAttribute('aria-hidden','true');
      row.parentNode.insertBefore(d,row.nextSibling);
      var items=[],n=-1,t=null;
      function vis(){return all.filter(function(it){return it.offsetParent!==null&&getComputedStyle(it).display!=='none'})}
      function draw(){items=vis();if(items.length!==n){n=items.length;d.innerHTML=items.map(function(){return '<i></i>'}).join('')+'<span class="mono"></span>'}
        var x=row.scrollLeft,best=0,bd=1e9;items.forEach(function(it,i){var dd=Math.abs(it.offsetLeft-row.offsetLeft-16-x);if(dd<bd){bd=dd;best=i}});
        if(row.scrollLeft+row.clientWidth>=row.scrollWidth-4)best=items.length-1;
        [].slice.call(d.querySelectorAll('i')).forEach(function(o,i){o.classList.toggle('on',i===best)});
        d.querySelector('.mono').textContent=(best+1)+' / '+items.length+' · swipe';d.style.visibility=items.length>1?'':'hidden'}
      draw();
      row.addEventListener('scroll',function(){if(t)return;t=requestAnimationFrame(function(){t=null;draw()})},{passive:true});
      document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.chip'))setTimeout(function(){row.scrollLeft=0;draw()},60)});
      window.addEventListener('resize',draw);
    });
    [].slice.call(document.querySelectorAll('.fit .longbio')).forEach(function(p){
      if(p.__mb)return;p.__mb=1;var b=document.createElement('button');b.type='button';b.className='more-bio';b.textContent='Read the full bio';
      b.addEventListener('click',function(){var o=p.classList.toggle('open');b.textContent=o?'Show less':'Read the full bio'});
      var cp=p.querySelector('.copy');p.insertBefore(b,cp);
    });
  }

  /* ---------- enquiry form: sends in place, Netlify Forms ---------- */
  function bindForm(){
    [].slice.call(document.querySelectorAll('form.cform')).forEach(function(f){
      if(f.__b)return;f.__b=1;
      var msg=f.querySelector('.fmsg'),btn=f.querySelector('button[type=submit]');
      f.addEventListener('submit',function(e){
        e.preventDefault();
        if(!f.checkValidity()){f.reportValidity();return}
        btn.disabled=true;msg.className='fmsg';msg.textContent='Sending…';
        fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})
          .then(function(r){if(!r.ok)throw 0;f.classList.add('sent');msg.className='fmsg ok';msg.textContent='Thank you. Your message is in my inbox and I will reply from hello@davuud.com.';f.reset()})
          .catch(function(){msg.className='fmsg err';msg.innerHTML='That did not send. Please email <a href="mailto:hello@davuud.com">hello@davuud.com</a>.'})
          .then(function(){btn.disabled=false});
      });
    });
  }

  /* ---------- page switching (works inside the preview and on a real domain) ---------- */
  var cache={}, busy=false, quietHash=false;
  function fetchMain(name){
    if(name==='index.html'&&homeMain)return Promise.resolve({main:homeMain.cloneNode(true),title:'Davuud Ghani'});
    var p=cache[name]||(cache[name]=fetch(name).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}));
    return p.then(function(t){var d=new DOMParser().parseFromString(t,'text/html');var m=d.querySelector('main');if(!m)throw new Error('no main');return {main:document.importNode(m,true),title:d.title}});
  }
  function navigate(name,anchor,push){
    if(busy)return;
    if(name===current){if(anchor){var el=document.getElementById(anchor);if(el)goTo(el)}else goTo(0);return}
    busy=true;
    var old=document.querySelector('main');
    old.classList.add('leaving');
    if(prev)prev.classList.remove('on');
    Promise.all([fetchMain(name),new Promise(function(r){setTimeout(r,calm?0:240)})]).then(function(res){
      var n=res[0];
      n.main.classList.add('entering');
      old.replaceWith(n.main);
      document.title=n.title||document.title;
      current=name;
      goTo(0,true);window.scrollTo(0,0);lastY=0;
      if(topbar)topbar.classList.remove('hide');
      init();
      requestAnimationFrame(function(){requestAnimationFrame(function(){n.main.classList.remove('entering')})});
      if(anchor){setTimeout(function(){var el=document.getElementById(anchor);if(el)goTo(el)},300)}
      if(push){quietHash=true;location.hash=name==='index.html'?'home':name}
      busy=false;
    }).catch(function(){busy=false;old.classList.remove('leaving');location.href=name+(anchor?'#'+anchor:'')});
  }
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var href=a.getAttribute('href');
    if(/^(https?:|mailto:|tel:)/i.test(href)||a.target==='_blank')return;
    if(href.charAt(0)==='#'){var id=href.slice(1);var el=id==='top'?0:document.getElementById(id);if(el===null)return;e.preventDefault();goTo(el);return}
    var m=href.match(/^([\w.-]+\.html)(?:#([\w.-]+))?$/);if(!m)return;
    e.preventDefault();navigate(m[1],m[2]||null,true);
  });
  window.addEventListener('hashchange',function(){
    if(quietHash){quietHash=false;return}
    var h=location.hash.slice(1);
    if(/\.html$/.test(h))navigate(h,null,false);
    else if(h==='home')navigate('index.html',null,false);
  });

  init();
  var start=location.hash.slice(1);
  if(isHome&&/\.html$/.test(start))navigate(start,null,false);
})();
