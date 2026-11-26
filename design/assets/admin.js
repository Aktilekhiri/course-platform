// Admin panel: partner requests and user roles. Access is enforced by Row Level Security, not by this page.
(function(){
  var sb=window.NG&&window.NG.sb; if(!sb) return;
  var en=function(){return document.documentElement.lang==='en'}, tr=function(a,b){return en()?b:a};
  var $=function(id){return document.getElementById(id)};
  var el=function(t,c,x){var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e};
  var ST={new:['Новая','New'],contacted:['Написали','Contacted'],approved:['Одобрена','Approved'],rejected:['Отклонена','Rejected']};
  var RL={student:['Студент','Student'],instructor:['Преподаватель','Instructor'],admin:['Администратор','Admin']};
  function sel(map,val,fn){var s=el('select'); Object.keys(map).forEach(function(k){var o=el('option',null,map[k][en()?1:0]); o.value=k; if(k===val) o.selected=true; s.appendChild(o)}); s.addEventListener('change',function(){fn(s)}); return s}
  function note(t,bad){var n=$('adst'); n.textContent=t; n.style.color=bad?'var(--bad,#ff8a8a)':'inherit'}
  function apps(){
    var box=$('apps'); box.textContent='';
    sb.from('partner_applications').select('*').order('created_at',{ascending:false}).then(function(r){
      if(r.error){note(tr('Не удалось загрузить заявки.','Could not load requests.'),1);return}
      if(!r.data.length){box.appendChild(el('p','muted',tr('Заявок пока нет.','No requests yet.')));return}
      r.data.forEach(function(a){
        var c=el('div','glass pad'); c.style.cssText='display:grid;gap:8px';
        c.appendChild(el('b',null,a.name+' · '+a.topic));
        var m=el('a',null,a.email); m.href='mailto:'+encodeURIComponent(a.email).replace('%40','@'); c.appendChild(m);
        if(a.telegram){var h=a.telegram.replace(/^@/,''); if(/^[A-Za-z0-9_]{3,32}$/.test(h)){var t=el('a',null,'@'+h); t.href='https://t.me/'+h; t.rel='noopener'; c.appendChild(t)} else c.appendChild(el('span','muted',a.telegram))}
        if(a.description) c.appendChild(el('p','muted',a.description));
        c.appendChild(el('small',null,new Date(a.created_at).toLocaleString()));
        c.appendChild(sel(ST,a.status,function(s){sb.from('partner_applications').update({status:s.value}).eq('id',a.id).then(function(x){note(x.error?tr('Не удалось сохранить.','Could not save.'):tr('Сохранено.','Saved.'),!!x.error)})}));
        box.appendChild(c);
      });
    });
  }
  function courses(){
    var box=$('crs'); box.textContent='';
    sb.from('courses').select('id,title_ru,title_en,status,owner:profiles(full_name,email)').order('created_at',{ascending:false}).then(function(r){
      if(r.error){note(tr('Не удалось загрузить курсы.','Could not load courses.'),1);return}
      if(!r.data.length){box.appendChild(el('p','muted',tr('Курсов пока нет.','No courses yet.')));return}
      var CS={draft:['Черновик','Draft'],pending:['На проверке','In review'],published:['Опубликован','Published']};
      r.data.forEach(function(c){
        var row=el('div','row'), g=el('div','grow'), o=c.owner||{};
        var a=el('a',null,(en()?c.title_en||c.title_ru:c.title_ru||c.title_en)||'—'); a.href='edit.html?id='+c.id; g.appendChild(el('b')).appendChild(a); g.appendChild(el('small',null,o.full_name||o.email||'')); row.appendChild(g);
        row.appendChild(sel(CS,c.status,function(s){sb.from('courses').update({status:s.value}).eq('id',c.id).then(function(x){note(x.error?tr('Не удалось сохранить.','Could not save.'):tr('Сохранено.','Saved.'),!!x.error)})}));
        box.appendChild(row);
      });
    });
  }
  function requests(){
    var box=$('reqs'); box.textContent='';
    sb.from('data_requests').select('id,kind,message,status,created_at,user:profiles(email,full_name)').order('created_at',{ascending:false}).then(function(r){
      if(r.error){note(tr('Не удалось загрузить запросы.','Could not load requests.'),1);return}
      if(!r.data.length){box.appendChild(el('p','muted',tr('Запросов нет.','No requests.')));return}
      var RS={new:['Новый','New'],in_progress:['В работе','In progress'],done:['Готово','Done'],rejected:['Отклонён','Rejected']};
      r.data.forEach(function(q){
        var row=el('div','row'), g=el('div','grow'), u=q.user||{};
        g.appendChild(el('b',null,(q.kind==='deletion'?tr('Удаление аккаунта','Account deletion'):tr('Вопрос','Question'))+' · '+(u.email||'—')));
        if(q.message) g.appendChild(el('small',null,q.message)); g.appendChild(el('small',null,new Date(q.created_at).toLocaleString())); row.appendChild(g);
        row.appendChild(sel(RS,q.status,function(s){sb.from('data_requests').update({status:s.value}).eq('id',q.id).then(function(x){note(x.error?tr('Не удалось сохранить.','Could not save.'):tr('Сохранено.','Saved.'),!!x.error)})}));
        box.appendChild(row);
      });
    });
  }
  function consents(){
    var box=$('cons'); box.textContent='';
    sb.from('consent_log').select('status,consent_version,policy_version,given_at,withdrawn_at,user:profiles(email)').order('given_at',{ascending:false}).limit(50).then(function(r){
      if(r.error){note(tr('Не удалось загрузить журнал.','Could not load the log.'),1);return}
      if(!r.data.length){box.appendChild(el('p','muted',tr('Записей нет.','No records.')));return}
      r.data.forEach(function(c){
        var row=el('div','row'), g=el('div','grow');
        g.appendChild(el('b',null,(c.user&&c.user.email)||'—'));
        g.appendChild(el('small',null,(c.status==='given'?tr('Дано ','Given '):tr('Отозвано ','Withdrawn '))+new Date(c.status==='given'?c.given_at:c.withdrawn_at).toLocaleString()+' · '+c.consent_version+' / '+c.policy_version));
        row.appendChild(g); box.appendChild(row);
      });
    });
  }
  function users(me){
    var box=$('users'); box.textContent='';
    sb.from('profiles').select('id,email,full_name,role,tg_username').order('created_at',{ascending:false}).then(function(r){
      if(r.error){note(tr('Не удалось загрузить пользователей.','Could not load users.'),1);return}
      r.data.forEach(function(u){
        var c=el('div','row'); var g=el('div','grow'); g.appendChild(el('b',null,u.full_name||u.email||'—')); g.appendChild(el('small',null,u.email||(u.tg_username?'Telegram @'+u.tg_username:''))); c.appendChild(g);
        if(u.id===me) c.appendChild(el('span','badge b-info',RL[u.role][en()?1:0]));
        else c.appendChild(sel(RL,u.role,function(s){sb.rpc('set_role',{p_user:u.id,p_role:s.value}).then(function(x){note(x.error?tr('Не удалось сменить роль.','Could not change the role.'):tr('Роль изменена.','Role changed.'),!!x.error)})}));
        box.appendChild(c);
      });
    });
  }
  window.NG.onUser(function(u,role){
    if(role!=='admin'){location.replace('profile.html');return}
    $('adm').hidden=false; apps(); courses(); requests(); consents(); users(u.id);
  });
})();
