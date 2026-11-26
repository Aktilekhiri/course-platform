// Public views: catalog, course page, lesson page. Text is rendered as plain text only.
(function(){
  var NG=window.NG; if(!NG) return; var sb=NG.sb, q=new URLSearchParams(location.search);
  var en=function(){return document.documentElement.lang==='en'}, tr=function(a,b){return en()?b:a};
  var $=function(id){return document.getElementById(id)};
  var el=function(t,c,x){var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e};
  var pick=function(r,k){var a=r[k+'_ru'],b=r[k+'_en']; return en()?(b||a||''):(a||b||'')};
  var yt=function(u){var m=/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(u||''); return m&&m[1]};
  function paras(box,text){box.textContent=''; (text||'').split(/\n{2,}/).forEach(function(p){if(p.trim()){var e=el('p',null,p.trim()); e.style.whiteSpace='pre-line'; box.appendChild(e)}})}
  // Syllabus text: "## title", "### subtitle", "- item" / "1. item" (indent for nested), "| a | b |" table rows. Plain text only.
  function syl(box,text){box.textContent=''; var tb=null;
    (text||'').split('\n').forEach(function(raw){var l=raw.replace(/\s+$/,''), m;
      if(!l.trim()){tb=null;return}
      if(m=/^###\s+(.*)/.exec(l)){tb=null; var b=el('p',null,m[1]); b.style.cssText='font-weight:700;margin:14px 0 4px'; box.appendChild(b);return}
      if(m=/^##\s+(.*)/.exec(l)){tb=null; var h=el('h3',null,m[1]); h.style.margin='24px 0 8px'; box.appendChild(h);return}
      if(l.charAt(0)==='|'){var cs=l.replace(/^\||\|$/g,'').split('|').map(function(x){return x.trim()}); if(cs.every(function(x){return /^:?-+:?$/.test(x)})) return;
        if(!tb){var w=el('div'); w.style.cssText='overflow-x:auto;margin:8px 0'; tb=el('table'); tb.style.cssText='border-collapse:collapse;width:100%;min-width:380px'; w.appendChild(tb); box.appendChild(w)}
        var tr_=el('tr'), th=!tb.rows.length; cs.forEach(function(x){var c=el(th?'th':'td',null,x); c.style.cssText='border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top'; tr_.appendChild(c)}); tb.appendChild(tr_); return}
      tb=null;
      if(m=/^(\s*)([-*]|\d+\.)\s+(.*)/.exec(l)){var r=el('div'); r.style.cssText='display:flex;gap:8px;margin:4px 0 4px '+(Math.floor(m[1].length/2)*20)+'px'; var mk=el('span',null,m[2].length>1?m[2]:'•'); mk.style.flex='none'; r.appendChild(mk); r.appendChild(el('span',null,m[3])); box.appendChild(r); return}
      box.appendChild(el('p',null,l.trim()))})}
  var again=[]; document.addEventListener('click',function(e){if(e.target.closest('[data-act=lang]')) setTimeout(function(){again.forEach(function(f){f()})},0)});
  function fail(box,ru,e){box.textContent=''; box.appendChild(el('p','muted',tr(ru,e)))}

  if($('dyn')) sb.from('courses').select('slug,title_ru,title_en,description_ru,description_en').eq('status','published').order('created_at',{ascending:false}).then(function(r){
    var d=r.data||[], box=$('dyn');
    function draw(){box.textContent=''; d.forEach(function(c){
      var a=el('a','glass pad hov'); a.href='c.html?c='+encodeURIComponent(c.slug); a.style.cssText='text-decoration:none;display:grid;gap:10px';
      a.appendChild(el('h3',null,pick(c,'title'))).style.margin='0'; a.appendChild(el('p','muted',pick(c,'description'))).style.margin='0'; box.appendChild(a)})}
    draw(); again.push(draw);
  });

  if($('cv')) (function(){var base='id,title_ru,title_en,description_ru,description_en,modules(id,position,title_ru,title_en)', get=function(cols){return sb.from('courses').select(cols).eq('slug',q.get('c')||'').eq('status','published').maybeSingle()};
    return get(base+',syllabus_ru,syllabus_en').then(function(r){return r.error?get(base):r})})().then(function(r){
    var c=r.data, box=$('cv'); if(!c){fail(box,'Курс не найден.','Course not found.');return}
    var ms=(c.modules||[]).sort(function(a,b){return a.position-b.position});
    function draw(){box.textContent='';
      box.appendChild(el('h1',null,pick(c,'title'))).style.cssText='font-size:clamp(24px,4vw,36px);margin:0';
      box.appendChild(el('p','muted',pick(c,'description')));
      var d=el('details','glass pad'); d.id='syllabus'; d.style.margin='16px 0'; var sm=el('summary',null,'Syllabus'); sm.style.cssText='cursor:pointer;font:700 18px "Unbounded","Onest",sans-serif'; d.appendChild(sm);
      var sb2=el('div'); d.appendChild(sb2); var sy=pick(c,'syllabus');
      if(sy) syl(sb2,sy); else sb2.appendChild(el('p','muted',tr('Преподаватель пока не добавил Syllabus.','The instructor has not added a Syllabus yet.')));
      box.appendChild(d); if(location.hash==='#syllabus'){d.open=true; setTimeout(function(){d.scrollIntoView()},0)}
      var l=el('div','list'); ms.forEach(function(m,i){var a=el('a','row'); a.href='l.html?m='+m.id; a.style.textDecoration='none'; var g=el('div','grow'); g.appendChild(el('b',null,(i+1)+'. '+pick(m,'title'))); a.appendChild(g); l.appendChild(a)});
      box.appendChild(l);
      if(ms.length){var b=el('a','btn',tr('Начать','Start')); b.href='l.html?m='+ms[0].id; b.style.marginTop='16px'; b.addEventListener('click',function(){
        NG.onUser(function(u){sb.from('enrollments').upsert({user_id:u.id,course_id:c.id},{ignoreDuplicates:true})}) }); box.appendChild(b)}
      else box.appendChild(el('p','muted',tr('Модули скоро появятся.','Modules are coming soon.')));
    }
    draw(); again.push(draw);
  });

  if($('lv')) sb.from('modules').select('*,courses(slug,title_ru,title_en,status,owner_id)').eq('id',q.get('m')||'').maybeSingle().then(function(r){
    var m=r.data, box=$('lv'); if(!m){fail(box,'Урок не найден.','Lesson not found.');return}
    sb.from('modules').select('id,position').eq('course_id',m.course_id).order('position').then(function(s){
      var ids=(s.data||[]).map(function(x){return x.id}), i=ids.indexOf(m.id);
      var st={u:null,role:null,acc:{}};
      function bypass(){return st.role==='admin'||(st.u&&m.courses.owner_id===st.u.id)}
      function draw(){box.textContent='';
        var back=el('a','muted','← '+pick(m.courses,'title')); back.href='c.html?c='+encodeURIComponent(m.courses.slug); box.appendChild(back);
        box.appendChild(el('h1',null,pick(m,'title'))).style.cssText='font-size:clamp(22px,3.6vw,32px);margin:8px 0 0';
        if(i>0&&!bypass()&&!st.acc[ids[i-1]]){var lk=el('section','glass pad'); lk.style.marginTop='16px'; lk.appendChild(el('p',null,tr('Этот модуль откроется после принятой практики предыдущего.','This module opens after your practice in the previous one is accepted.')));
          var pb=el('a','btn',tr('К предыдущему модулю','To the previous module')); pb.href='l.html?m='+ids[i-1]; lk.appendChild(pb); box.appendChild(lk); return}
        var id=yt(m.video_url);
        if(id){var w=el('div'); w.style.cssText='position:relative;aspect-ratio:16/9;margin:16px 0;border-radius:18px;overflow:hidden';
          var f=el('iframe'); f.src='https://www.youtube-nocookie.com/embed/'+id; f.title=pick(m,'title'); f.allow='accelerometer; encrypted-media; picture-in-picture'; f.allowFullscreen=true; f.referrerPolicy='strict-origin-when-cross-origin'; f.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0'; w.appendChild(f); box.appendChild(w)}
        [['theory','Теория','Theory'],['practice','Практика','Practice'],['homework','Домашнее задание','Homework']].forEach(function(k){
          var t=pick(m,k[0]); if(!t) return; var sec=el('section','glass pad'); sec.style.marginTop='16px'; sec.appendChild(el('h3',null,tr(k[1],k[2]))); var b=el('div'); paras(b,t); sec.appendChild(b); box.appendChild(sec)});
        box.appendChild(NG.practice?NG.practice(m,st.u,function(ok){if(ok&&!st.acc[m.id]){st.acc[m.id]=1; draw()}}):el('span'));
        var ok=bypass()||st.acc[m.id];
        var nav=el('div','btns'); nav.style.marginTop='16px';
        if(i>0){var p=el('a','btn ghost',tr('Назад','Back')); p.href='l.html?m='+ids[i-1]; nav.appendChild(p)}
        if(i>=0&&i<ids.length-1){var n=el('a','btn',tr('Дальше','Next')); if(ok){n.href='l.html?m='+ids[i+1]} else {n.setAttribute('aria-disabled','true'); n.style.opacity='.5'; n.style.pointerEvents='none'; n.title=tr('Сначала сдайте практику','Submit the practice first')} nav.appendChild(n)}
        box.appendChild(nav);
      }
      NG.onUser(function(u,role){st.u=u; st.role=role;
        sb.from('submissions').select('module_id').eq('user_id',u.id).in('status',['accepted','ai_accepted']).then(function(r){(r.data||[]).forEach(function(x){st.acc[x.module_id]=1}); draw()})});
      draw(); again.push(draw);
    });
  });
})();
