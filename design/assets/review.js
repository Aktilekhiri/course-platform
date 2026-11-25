// Teacher/admin review queue. Access is enforced by Row Level Security (owns_module / is_admin), not by this page.
(function(){
  var NG=window.NG; if(!NG) return; var sb=NG.sb, box=document.getElementById('subs'); if(!box) return;
  var en=function(){return document.documentElement.lang==='en'}, tr=function(a,b){return en()?b:a};
  var el=function(t,c,x){var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e};
  var SN={pending:['Проверяется','Checking'],ai_accepted:['Принято ИИ','AI accepted'],accepted:['Принято','Accepted'],needs_teacher:['Ждёт преподавателя','Needs a teacher'],revise:['На доработке','Needs changes']};
  var me=null, filter='needs_teacher', list=el('div'); list.style.cssText='display:grid;gap:12px';
  var fs=el('select'); [['needs_teacher',tr('Ждут проверки','Waiting')],['all',tr('Все последние','All recent')]].forEach(function(o){var op=el('option',null,o[1]); op.value=o[0]; fs.appendChild(op)});
  fs.addEventListener('change',function(){filter=fs.value; load()});
  var lab=el('label'); lab.style.cssText='display:grid;gap:6px;max-width:260px;margin-bottom:12px'; lab.appendChild(el('span',null,tr('Показать','Show'))); lab.appendChild(fs);
  box.appendChild(lab); box.appendChild(list);
  function decide(s,status,txt,note,btns){btns.forEach(function(b){b.disabled=true});
    sb.from('submissions').update({status:status,teacher_feedback:txt.value.trim()||null,reviewed_by:me.id,checked_at:new Date().toISOString()}).eq('id',s.id).then(function(x){
      note.textContent=x.error?tr('Не удалось сохранить.','Could not save.'):tr('Сохранено.','Saved.'); btns.forEach(function(b){b.disabled=false}); if(!x.error) setTimeout(load,600)})}
  function card(s){
    var c=el('div','glass pad'); c.style.cssText='display:grid;gap:8px';
    var u=s.user||{}, mo=s.module||{}, co=mo.courses||{};
    c.appendChild(el('b',null,(u.full_name||u.email||tr('Студент','Student')+' '+String(s.user_id).slice(0,6))+' · '+(en()?mo.title_en||mo.title_ru:mo.title_ru||mo.title_en)));
    c.appendChild(el('small','muted',(en()?co.title_en||co.title_ru:co.title_ru||co.title_en)+' · '+new Date(s.created_at).toLocaleString()+' · '+(SN[s.status]||[s.status,s.status])[en()?1:0]+(s.ai_score?' · AI '+s.ai_score+'/5':'')));
    if(s.body){var p=el('p',null,s.body); p.style.whiteSpace='pre-wrap'; c.appendChild(p)}
    if(s.link&&/^https:\/\//i.test(s.link)){var a=el('a',null,s.link); a.href=s.link; a.rel='noopener noreferrer'; a.target='_blank'; c.appendChild(a)}
    if(s.image_paths&&s.image_paths.length) sb.storage.from('submissions').createSignedUrls(s.image_paths,600).then(function(r){(r.data||[]).forEach(function(x){if(!x.signedUrl)return; var i=el('img'); i.src=x.signedUrl; i.alt=''; i.loading='lazy'; i.style.cssText='max-width:100%;max-height:320px;border-radius:12px'; c.appendChild(i)})});
    var fb=en()?s.ai_feedback_en||s.ai_feedback_ru:s.ai_feedback_ru||s.ai_feedback_en; if(fb) c.appendChild(el('small','muted','AI: '+fb));
    var tx=el('textarea'); tx.rows=2; tx.maxLength=2000; tx.value=s.teacher_feedback||''; tx.style.cssText='width:100%;font:inherit';
    var l=el('label'); l.style.cssText='display:grid;gap:6px'; l.appendChild(el('span',null,tr('Комментарий студенту','Comment for the student'))); l.appendChild(tx); c.appendChild(l);
    var row=el('div','btns'), ok=el('button','btn',tr('Принять','Accept')), no=el('button','btn ghost',tr('На доработку','Needs changes')), note=el('small','muted'); ok.type=no.type='button';
    ok.onclick=function(){decide(s,'accepted',tx,note,[ok,no])}; no.onclick=function(){decide(s,'revise',tx,note,[ok,no])}; row.appendChild(ok); row.appendChild(no); c.appendChild(row); c.appendChild(note); return c}
  function load(){list.textContent='';
    var q=sb.from('submissions').select('*,user:profiles(email,full_name),module:modules(title_ru,title_en,courses(title_ru,title_en))').order('created_at',{ascending:false}).limit(30);
    if(filter==='needs_teacher') q=q.eq('status','needs_teacher');
    q.then(function(r){if(r.error){list.appendChild(el('p','muted',tr('Не удалось загрузить работы.','Could not load submissions.')));return}
      if(!r.data.length){list.appendChild(el('p','muted',tr('Работ нет.','Nothing here.')));return} r.data.forEach(function(s){list.appendChild(card(s))})})}
  NG.onUser(function(u){me=u; load()});
})();
