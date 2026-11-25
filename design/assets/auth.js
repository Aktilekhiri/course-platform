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
    if(t.dataset.act==='google'){
      sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:back}}).then(function(r){ if(r.error) say('Не удалось начать вход. Попробуйте ещё раз.','Could not start sign-in. Try again.',1) });
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
  var cbs=[], me=null; window.NG={sb:sb,onUser:function(f){me?f(me.u,me.role):cbs.push(f)}};
  function face(box,url,txt){ if(!box) return; box.textContent=''; if(url){var i=new Image(); i.alt=''; i.referrerPolicy='no-referrer'; i.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block'; i.onerror=function(){box.textContent=txt}; i.src=url; box.appendChild(i)} else box.textContent=txt }
  sb.auth.getSession().then(function(r){
    var ss=r.data.session, who=document.getElementById('who'), pn=document.getElementById('pn');
    if(!ss){ if(pn||document.querySelector('[data-auth]')) location.replace('login.html'); return }
    var u=ss.user, md=u.user_metadata||{}, nm=md.full_name||md.name||(u.email||'').split('@')[0], ini=nm.charAt(0).toUpperCase();
    if(who){who.href='profile.html';who.querySelector('.wn').textContent=nm.split(' ')[0]}
    sb.from('profiles').select('role,avatar_url').eq('id',u.id).maybeSingle().then(function(x){
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
