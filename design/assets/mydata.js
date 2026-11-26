// "My data" block on the profile page: view/edit name, download data, withdraw consent, deletion request, question.
(function(){
  var NG=window.NG; if(!NG||!document.getElementById('md')) return; var sb=NG.sb;
  var en=function(){return document.documentElement.lang==='en'}, tr=function(a,b){return en()?b:a};
  var $=function(id){return document.getElementById(id)};
  function say(t,bad){var s=$('mdst'); s.textContent=t; s.style.color=bad?'var(--bad,#ff8a8a)':'inherit'}
  NG.onUser(function(u){
    sb.from('profiles').select('full_name').eq('id',u.id).maybeSingle().then(function(x){$('mdname').value=(x.data&&x.data.full_name)||''});
    $('mdmail').textContent=u.email||'';
    sb.from('consent_log').select('status,consent_version,given_at,withdrawn_at').eq('user_id',u.id).order('given_at',{ascending:false}).limit(1).then(function(r){
      var l=r.data&&r.data[0]; $('mdcons').textContent=!l?tr('Согласие не найдено','No consent on record'):
        (l.status==='given'?tr('Дано ','Given ')+new Date(l.given_at).toLocaleString():tr('Отозвано ','Withdrawn ')+new Date(l.withdrawn_at).toLocaleString())+' · '+l.consent_version});
    $('mdsave').onclick=function(){var v=$('mdname').value.trim().slice(0,30);
      if(!v||/@/.test(v)){say(tr('Ник не должен быть пустым или содержать @.','The nickname must not be empty or contain @.'),1);return}
      sb.from('profiles').update({full_name:v||null}).eq('id',u.id).then(function(x){ if(x.error) say(tr('Не удалось сохранить.','Could not save.'),1); else {say(tr('Сохранено.','Saved.')); if($('pn')&&v) $('pn').textContent=v}})};
    $('mddl').onclick=function(){
      var q=function(t,col){return sb.from(t).select('*').eq(col,u.id).then(function(r){return r.data||[]})};
      Promise.all([q('profiles','id'),q('consent_log','user_id'),q('data_requests','user_id'),q('enrollments','user_id'),q('submissions','user_id'),q('certificates','user_id')]).then(function(a){
        var o={exported_at:new Date().toISOString(),profile:a[0],consents:a[1],data_requests:a[2],enrollments:a[3],submissions:a[4],certificates:a[5]};
        var l=document.createElement('a'); l.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:'application/json'})); l.download='nextgen-my-data.json'; l.click(); say(tr('Файл скачан.','File downloaded.'));
      });
    };
    $('mdwd').onclick=function(){
      if(!confirm(tr('Отозвать согласие? Вы будете разлогинены и не сможете пользоваться платформой, пока не дадите согласие снова.','Withdraw consent? You will be signed out and cannot use the platform until you consent again.'))) return;
      sb.rpc('withdraw_consent').then(function(x){ if(x.error){say(tr('Не удалось отозвать согласие.','Could not withdraw consent.'),1);return}
        try{localStorage.removeItem('ng-consent-pending')}catch(e){} sb.auth.signOut().then(function(){location.href='index.html'})});
    };
    function req(kind,msg){return sb.from('data_requests').insert({user_id:u.id,kind:kind,message:msg||null})}
    $('mddel').onclick=function(){
      if(!confirm(tr('Отправить запрос на удаление аккаунта? Администратор рассмотрит его. Данные, которые нужно хранить по закону, могут быть сохранены.','Send an account deletion request? The admin will review it. Data that must be kept by law may be retained.'))) return;
      req('deletion').then(function(x){say(x.error?tr('Не удалось отправить запрос.','Could not send the request.'):tr('Запрос отправлен.','Request sent.'),!!x.error)});
    };
    $('mdsend').onclick=function(){var m=$('mdq').value.trim(); if(!m){say(tr('Напишите вопрос.','Write your question.'),1);return}
      req('question',m.slice(0,2000)).then(function(x){ if(x.error) say(tr('Не удалось отправить.','Could not send.'),1); else {$('mdq').value=''; say(tr('Вопрос отправлен.','Question sent.'))}})};
  });
})();
