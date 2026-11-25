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
  var f=document.getElementById('pf');
  if(f) f.addEventListener('submit',function(e){
    e.preventDefault();
    var g=function(n){return f.elements[n].value.trim()};
    if(!f.elements.consent.checked){say('Нужно согласие с политикой и условиями.','Please accept the privacy policy and terms.',1);return}
    var b=f.querySelector('button'); b.disabled=true;
    sb.from('partner_applications').insert({name:g('name'),email:g('email'),telegram:g('telegram')||null,topic:g('topic'),description:g('description')||null,consent:true}).then(function(r){
      b.disabled=false;
      if(r.error) say('Не удалось отправить. Напишите нам на почту или в Telegram.','Could not send. Contact us by email or Telegram.',1);
      else {f.reset(); say('Заявка отправлена. Мы свяжемся с вами.','Request sent. We will contact you.');}
    });
  });
})();
