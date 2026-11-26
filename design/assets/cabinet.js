// Instructor cabinet and course editor. Rights are enforced by Row Level Security.
(function(){
  var NG=window.NG; if(!NG) return; var sb=NG.sb, q=new URLSearchParams(location.search);
  var en=function(){return document.documentElement.lang==='en'}, tr=function(a,b){return en()?b:a};
  var $=function(id){return document.getElementById(id)};
  var el=function(t,c,x){var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e};
  var ST={draft:['Черновик','Draft','b-mute'],pending:['На проверке','In review','b-warn'],published:['Опубликован','Published','b-good']};
  var CATS=[['IT','ИТ','IT'],['Math','Математика','Math'],['Exams','Экзамены','Exams'],['Language','Языки','Languages'],['Other','Другое','Other']];
  var LANGS=[['ru','Русский','Russian'],['en','English','English'],['ky','Кыргызча','Kyrgyz'],['other','Другой','Other']];
  function note(t,bad){var n=$('cst'); if(!n) return; n.textContent=t; n.style.color=bad?'var(--bad,#ff8a8a)':'inherit'}
  function field(label,name,val,kind,max){
    var l=el('label'); l.appendChild(document.createTextNode(label));
    var i=el(kind==='area'?'textarea':'input'); i.name=name; i.maxLength=max||200; i.value=val||''; if(kind==='area') i.rows=6; l.appendChild(i); return l}
  function choice(label,name,opts,val){
    var l=el('label'); l.appendChild(document.createTextNode(label)); var s=el('select'); s.name=name;
    opts.forEach(function(o){var x=el('option',null,en()?o[2]:o[1]); x.value=o[0]; if(o[0]===val) x.selected=true; s.appendChild(x)}); l.appendChild(s); return l}
  function vals(f){var o={}; Array.prototype.forEach.call(f.elements,function(e){if(e.name) o[e.name]=e.value.trim()}); return o}
  function slug(t){return (t||'course').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)||'course'}
  function yt(u){var m=/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/.exec(u||''); return m&&m[1]}

  NG.onUser(function(u,role){
    if(role!=='instructor'&&role!=='admin'){location.replace('profile.html');return}
    if($('cab')){ $('cab').hidden=false; cabinet(u) }
    if($('ed')){ $('ed').hidden=false; editor(u,role) }
  });

  function cabinet(u){
    var nf=$('nf'); nf.appendChild(field(tr('Название (RU)','Title (RU)'),'title_ru','','text',120));
    nf.appendChild(field(tr('Название (EN)','Title (EN)'),'title_en','','text',120));
    nf.appendChild(choice(tr('Категория','Category'),'category',CATS,'IT')); nf.appendChild(choice(tr('Язык курса','Course language'),'language',LANGS,'ru'));
    var b=el('button','btn',tr('Создать курс','Create course')); b.type='submit'; nf.appendChild(b);
    $('newc').addEventListener('click',function(){nf.hidden=!nf.hidden});
    nf.addEventListener('submit',function(e){e.preventDefault(); var v=vals(nf);
      if(!v.title_ru&&!v.title_en){note(tr('Введите название.','Enter a title.'),1);return}
      b.disabled=true;
      sb.from('courses').insert({slug:slug(v.title_en||'course')+'-'+Math.random().toString(36).slice(2,7),owner_id:u.id,title_ru:v.title_ru||null,title_en:v.title_en||null,category:v.category,language:v.language,status:'draft'}).select('id').single().then(function(r){
        b.disabled=false; if(r.error){note(tr('Не удалось создать курс.','Could not create the course.'),1);return} location.href='edit.html?id='+r.data.id});
    });
    sb.from('courses').select('id,title_ru,title_en,status').eq('owner_id',u.id).order('created_at',{ascending:false}).then(function(r){
      var box=$('mine'); box.textContent='';
      if(r.error){note(tr('Не удалось загрузить курсы.','Could not load courses.'),1);return}
      if(!r.data.length) box.appendChild(el('p','muted',tr('У вас пока нет курсов. Нажмите «Создать курс».','You have no courses yet. Press “Create course”.')));
      r.data.forEach(function(c){var a=el('a','row'); a.href='edit.html?id='+c.id; a.style.textDecoration='none'; var g=el('div','grow'); g.appendChild(el('b',null,(en()?c.title_en||c.title_ru:c.title_ru||c.title_en)||'—')); a.appendChild(g);
        var s=ST[c.status]; a.appendChild(el('span','badge '+s[2],s[en()?1:0])); box.appendChild(a)});
    });
  }

  function editor(u,role){
    var id=q.get('id'), admin=role==='admin';
    Promise.all([sb.from('courses').select('*').eq('id',id).maybeSingle(),sb.from('modules').select('*').eq('course_id',id).order('position')]).then(function(r){
      var c=r[0].data; if(!c){note(tr('Курс не найден.','Course not found.'),1);return}
      var ms=r[1].data||[], locked=c.status==='published'&&!admin;
      var cf=$('cf'); cf.textContent='';
      [['title_ru',tr('Название (RU)','Title (RU)'),120],['title_en',tr('Название (EN)','Title (EN)'),120]].forEach(function(k){cf.appendChild(field(k[1],k[0],c[k[0]],'text',k[2]))});
      [['description_ru',tr('Описание (RU)','Description (RU)')],['description_en',tr('Описание (EN)','Description (EN)')]].forEach(function(k){cf.appendChild(field(k[1],k[0],c[k[0]],'area',2000))});
      if('syllabus_ru' in c){[['syllabus_ru',tr('Syllabus (RU)','Syllabus (RU)')],['syllabus_en','Syllabus (EN)']].forEach(function(k){cf.appendChild(field(k[1],k[0],c[k[0]],'area',20000))});
        cf.appendChild(el('small','muted',tr('Формат: «## Заголовок», «### Подзаголовок», «- пункт», «1. пункт», таблица строками «| а | б |» (вторая строка «|---|---|»). Остальное обычный текст.','Format: "## Heading", "### Subheading", "- item", "1. item", a table as "| a | b |" rows (second row "|---|---|"). The rest is plain text.')))}
      cf.appendChild(choice(tr('Категория','Category'),'category',CATS,c.category)); cf.appendChild(choice(tr('Язык курса','Course language'),'language',LANGS,c.language));
      var sv=el('button','btn',tr('Сохранить курс','Save course')); sv.type='submit'; cf.appendChild(sv);
      Array.prototype.forEach.call(cf.elements,function(e){e.disabled=locked});
      cf.onsubmit=function(e){e.preventDefault(); var v=vals(cf);
        sb.from('courses').update(Object.assign({title_ru:v.title_ru||null,title_en:v.title_en||null,description_ru:v.description_ru||null,description_en:v.description_en||null,category:v.category,language:v.language},('syllabus_ru' in c)?{syllabus_ru:v.syllabus_ru||null,syllabus_en:v.syllabus_en||null}:{})).eq('id',id).then(function(x){note(x.error?tr('Не удалось сохранить.','Could not save.'):tr('Сохранено.','Saved.'),!!x.error)})};
      // status actions
      var sa=$('sa'); sa.textContent=''; var s=ST[c.status]; sa.appendChild(el('span','badge '+s[2],s[en()?1:0]));
      function act(label,to,primary){var b=el('button','btn sm'+(primary?'':' ghost'),label); b.addEventListener('click',function(){sb.from('courses').update({status:to}).eq('id',id).then(function(x){if(x.error) note(tr('Не удалось сменить статус.','Could not change the status.'),1); else location.reload()})}); sa.appendChild(b)}
      if(c.status==='draft') act(tr('Отправить на проверку','Send for review'),'pending',1);
      if(c.status==='pending') act(tr('Вернуть в черновик','Back to draft'),'draft');
      if(c.status==='published'&&!admin) act(tr('Снять с публикации для правки','Unpublish to edit'),'draft');
      if(admin&&c.status!=='published') act(tr('Опубликовать','Publish'),'published',1);
      if(admin&&c.status==='published') act(tr('Снять с публикации','Unpublish'),'draft');
      if(c.status==='published'){var pv=el('a','btn sm ghost',tr('Открыть на сайте','View on site')); pv.href='c.html?c='+encodeURIComponent(c.slug); sa.appendChild(pv)}
      // modules
      var box=$('mods'); box.textContent='';
      var MF=[['title_ru','Название (RU)','Title (RU)','text',120],['title_en','Название (EN)','Title (EN)','text',120],['video_url','Ссылка на YouTube (unlisted)','YouTube link (unlisted)','text',200],
        ['theory_ru','Теория (RU)','Theory (RU)','area',20000],['theory_en','Теория (EN)','Theory (EN)','area',20000],['practice_ru','Практика (RU)','Practice (RU)','area',5000],['practice_en','Практика (EN)','Practice (EN)','area',5000],
        ['homework_ru','Домашнее задание (RU)','Homework (RU)','area',5000],['homework_en','Домашнее задание (EN)','Homework (EN)','area',5000]];
      ms.forEach(function(m,i){
        var d=el('details','glass pad'); d.appendChild(el('summary',null,(i+1)+'. '+((en()?m.title_en||m.title_ru:m.title_ru||m.title_en)||'—')));
        var f=el('form'); f.style.cssText='display:grid;gap:10px;margin-top:12px';
        MF.forEach(function(k){f.appendChild(field(tr(k[1],k[2]),k[0],m[k[0]],k[3],k[4]))});
        var row=el('div','btns'), b=el('button','btn sm',tr('Сохранить модуль','Save module')); b.type='submit'; var x=el('button','btn sm ghost',tr('Удалить','Delete')); x.type='button'; row.appendChild(b); row.appendChild(x); f.appendChild(row);
        Array.prototype.forEach.call(f.elements,function(e){e.disabled=locked});
        f.onsubmit=function(e){e.preventDefault(); var v=vals(f);
          if(v.video_url&&!yt(v.video_url)){note(tr('Нужна ссылка на YouTube.','A YouTube link is required.'),1);return}
          var o={}; MF.forEach(function(k){o[k[0]]=v[k[0]]||null}); if(v.video_url) o.video_url='https://youtu.be/'+yt(v.video_url);
          sb.from('modules').update(o).eq('id',m.id).then(function(r2){note(r2.error?tr('Не удалось сохранить модуль.','Could not save the module.'):tr('Модуль сохранён.','Module saved.'),!!r2.error)})};
        x.addEventListener('click',function(){ if(!confirm(tr('Удалить модуль «','Delete module “')+(m.title_ru||m.title_en||'')+tr('»? Это нельзя отменить.','”? This cannot be undone.'))) return;
          sb.from('modules').delete().eq('id',m.id).then(function(r2){if(r2.error) note(tr('Не удалось удалить.','Could not delete.'),1); else location.reload()})});
        d.appendChild(f); box.appendChild(d);
      });
      var add=$('addm'); add.disabled=locked;
      add.onclick=function(){add.disabled=true; var pos=ms.length?Math.max.apply(null,ms.map(function(m){return m.position}))+1:1;
        sb.from('modules').insert({course_id:id,position:pos,title_ru:tr('Новый модуль','New module')}).then(function(r2){if(r2.error){add.disabled=false;note(tr('Не удалось добавить модуль.','Could not add the module.'),1)} else location.reload()})};
      if(locked) note(tr('Курс опубликован. Чтобы править, снимите его с публикации.','The course is published. Unpublish it to edit.'));
    });
  }
})();
