// Sign-in and partner request. Uses only the public key from config.js.
(function(){
  var C=window.NEXTGEN; if(!C||!window.supabase) return;
  var sb=window.supabase.createClient(C.supabaseUrl,C.supabaseKey);
  var en=function(){return document.documentElement.lang==='en'};
  var say=function(ru,e,bad){var s=document.getElementById('st'); if(!s) return; s.textContent=en()?e:ru; s.style.color=bad?'var(--bad,#ff8a8a)':'inherit'};
  var back=location.href.replace(/[^\/]*$/,'')+'dashboard.html';
  sb.auth.getSession().then(function(r){ if(r.data.session && /login\.html$/.test(location.pathname)) location.replace(back) });
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-act]'); if(!t) return;
    if(t.dataset.act==='google'||t.dataset.act==='telegram'||t.dataset.act==='magic'){
      var cb=document.getElementById('cons');
      if(cb&&!cb.checked){say('Отметьте согласие на обработку данных.','Tick the consent box first.',1);return}
      try{localStorage.setItem('ng-consent-pending',CV)}catch(e){}
    }
    if(t.dataset.act==='google'){
      sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:back}}).then(function(r){ if(r.error) say('Не удалось начать вход. Попробуйте ещё раз.','Could not start sign-in. Try again.',1) });
    }
    if(t.dataset.act==='telegram'){
      sb.auth.signInWithOAuth({provider:'custom:telegram',options:{redirectTo:back}}).then(function(r){ if(r.error) say('Вход через Telegram пока не доступен. Попробуйте Google.','Telegram sign-in is not available yet. Try Google.',1) });
    }
    if(t.dataset.act==='magic'){
      var em=document.getElementById('em'); if(!em||!em.value||!em.checkValidity()){say('Введите e-mail.','Enter your email.',1);return}
      sb.auth.signInWithOtp({email:em.value,options:{emailRedirectTo:back}}).then(function(r){
        if(r.error) say('Не удалось отправить письмо. Проверьте адрес и попробуйте позже.','Could not send the email. Check the address and try later.',1);
        else say('Ссылка отправлена. Откройте письмо.','Link sent. Check your inbox.');
      });
    }
  });

  var ROLE={student:['Студент','Student'],instructor:['Преподаватель','Instructor'],admin:['Администратор','Admin']};

  var CV=C.consentVersion||'v1';
  function pending(){try{return localStorage.getItem('ng-consent-pending')===CV}catch(e){return false}}
  function clearPending(){try{localStorage.removeItem('ng-consent-pending')}catch(e){}}
  function record(u,done){sb.from('consent_log').insert({user_id:u.id,consent_version:CV,policy_version:CV,status:'given'}).then(function(){clearPending();if(done) done()})}
  function overlay(u){
    var o=document.createElement('div'); o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true'); o.style.cssText='position:fixed;inset:0;z-index:99;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.6)';
    var c=document.createElement('div'); c.className='glass pad'; c.style.cssText='max-width:480px;display:grid;gap:14px;background:var(--bg,#0b1220)';
    var h=document.createElement('h2'); h.textContent=en()?'Consent to data processing':'Согласие на обработку данных'; h.style.margin='0';
    var l=document.createElement('label'); l.style.cssText='display:flex;gap:10px;align-items:flex-start';
    var k=document.createElement('input'); k.type='checkbox'; k.style.cssText='width:20px;min-height:20px;flex:none'; l.appendChild(k);
    var sp=document.createElement('span'); sp.appendChild(document.createTextNode(en()?'I agree to the processing of my personal data in accordance with the NextGen ':'Я согласен на обработку моих персональных данных в соответствии с '));
    var a=document.createElement('a'); a.href='privacy.html'; a.target='_blank'; a.rel='noopener'; a.textContent=en()?'Privacy Policy':'Политикой конфиденциальности NextGen'; a.style.textDecoration='underline'; sp.appendChild(a); l.appendChild(sp);
    var m=document.createElement('p'); m.className='muted'; m.style.margin='0'; m.setAttribute('role','status');
    var r=document.createElement('div'); r.className='btns';
    var ok=document.createElement('button'); ok.className='btn'; ok.textContent=en()?'Accept and continue':'Принять и продолжить';
    var no=document.createElement('button'); no.className='btn ghost'; no.textContent=en()?'Sign out':'Выйти';
    ok.onclick=function(){ if(!k.checked){m.textContent=en()?'Tick the box to continue.':'Отметьте согласие, чтобы продолжить.';return} ok.disabled=true; record(u,function(){o.remove()}) };
    no.onclick=function(){sb.auth.signOut().then(function(){location.href='index.html'})};
    r.appendChild(ok); r.appendChild(no); [h,l,m,r].forEach(function(x){c.appendChild(x)}); o.appendChild(c); document.body.appendChild(o); k.focus();
  }
  function consentGate(u){
    sb.from('consent_log').select('status,consent_version').eq('user_id',u.id).order('given_at',{ascending:false}).limit(1).then(function(r){
      if(r.error) return;
      var l=r.data&&r.data[0];
      if(l&&l.status==='given'&&l.consent_version===CV) return;
      if(pending()) record(u); else overlay(u);
    });
  }
  var cbs=[], me=null; window.NG={sb:sb,onUser:function(f){me?f(me.u,me.role):cbs.push(f)}};
  function face(box,url,txt){ if(!box) return; box.textContent=''; if(url){var i=new Image(); i.alt=''; i.referrerPolicy='no-referrer'; i.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block'; i.onerror=function(){box.textContent=txt}; i.src=url; box.appendChild(i)} else box.textContent=txt }
  sb.auth.getSession().then(function(r){
    var ss=r.data.session, who=document.getElementById('who'), pn=document.getElementById('pn');
    if(!ss){ if(pn||document.querySelector('[data-auth]')) location.replace('login.html'); return }
    consentGate(ss.user);
    var u=ss.user, md=u.user_metadata||{}, nm='user', ini='U';
    if(who){who.href='profile.html'}
    sb.from('profiles').select('role,avatar_url,full_name').eq('id',u.id).maybeSingle().then(function(x){
      nm=(x.data&&x.data.full_name)||'user'; ini=nm.charAt(0).toUpperCase(); if(who) who.querySelector('.wn').textContent=nm.split(' ')[0];
      var role=(x.data&&x.data.role)||'student', av=(x.data&&x.data.avatar_url)||md.avatar_url||md.picture||null, t=ROLE[role];
      document.querySelectorAll('.adm').forEach(function(a){a.hidden=role!=='admin'}); document.querySelectorAll('.ins').forEach(function(a){a.hidden=!(role==='admin'||role==='instructor')});
      if(who&&av){var ic=who.querySelector('svg'); if(ic){var s=document.createElement('span'); s.style.cssText='width:22px;height:22px;border-radius:50%;overflow:hidden;display:inline-block;flex:none'; ic.replaceWith(s); face(s,av,'')}}
      if(pn){
        pn.textContent=nm; document.getElementById('pe').textContent=u.email||''; face(document.getElementById('pa'),av,ini);
        var b=document.getElementById('pr'); if(b&&t) b.textContent=t[en()?1:0];
      }
      me={u:u,role:role}; cbs.splice(0).forEach(function(f){f(u,role)});
    });
    var pf=document.getElementById('photo');
    if(pf) pf.addEventListener('change',function(){
      var f=pf.files[0]; if(!f) return;
      if(!/^image\/(jpeg|png|webp)$/.test(f.type)){say('Нужна картинка JPG, PNG или WebP.','Use a JPG, PNG or WebP image.',1);return}
      var im=new Image(); im.onload=function(){
        var n=256, c=document.createElement('canvas'); c.width=c.height=n; var s=Math.min(im.width,im.height);
        c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,n,n);
        c.toBlob(function(bl){
          var path=u.id+'/avatar.jpg';
          sb.storage.from('avatars').upload(path,bl,{upsert:true,contentType:'image/jpeg'}).then(function(x){
            if(x.error){say('Не удалось загрузить фото.','Could not upload the photo.',1);return}
            var url=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
            sb.from('profiles').update({avatar_url:url}).eq('id',u.id).then(function(y){
              if(y.error){say('Фото загружено, но не сохранено в профиле.','Photo uploaded but not saved to your profile.',1);return}
              face(document.getElementById('pa'),url,ini); say('Фото обновлено.','Photo updated.');
            });
          });
        },'image/jpeg',.85);
      };
      im.onerror=function(){say('Не удалось прочитать картинку.','Could not read the image.',1)};
      im.src=URL.createObjectURL(f);
    });
  });
  document.addEventListener('click',function(e){ if(e.target.closest('[data-act=out]')) sb.auth.signOut().then(function(){location.href='index.html'}) });
  var f=document.getElementById('pf');
  if(f) f.addEventListener('submit',function(e){
    e.preventDefault();
    var g=function(n){return f.elements[n].value.trim()};
    if(!f.elements.consent.checked){say('Нужно согласие с политикой и условиями.','Please accept the privacy policy and terms.',1);return}
    var b=f.querySelector('button'); b.disabled=true;
    sb.from('partner_applications').insert({name:g('name'),email:g('email'),telegram:g('telegram')||null,topic:g('topic'),description:g('description')||null,consent:true}).then(function(r){
      b.disabled=false;
      if(r.error) say('Не удалось отправить ('+(r.error.code||r.error.message)+'). Напишите нам на почту или в Telegram.','Could not send ('+(r.error.code||r.error.message)+'). Contact us by email or Telegram.',1);
      else {f.reset(); say('Заявка отправлена. Мы свяжемся с вами.','Request sent. We will contact you.');}
    });
  });
})();
