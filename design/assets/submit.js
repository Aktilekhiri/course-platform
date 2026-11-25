// Practice submission block for the lesson page. Plain text only; images are resized in the browser and stored privately.
(function(){
  var NG=window.NG; if(!NG) return; var sb=NG.sb;
  var en=function(){return document.documentElement.lang==='en'}, tr=function(a,b){return en()?b:a};
  var el=function(t,c,x){var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e};
  var ST={pending:['Проверяется…','Being checked…','b-info'],ai_accepted:['Принято ИИ','Accepted by AI','b-good'],accepted:['Принято преподавателем','Accepted by a teacher','b-good'],
    needs_teacher:['Ждёт проверки преподавателя','Waiting for a teacher','b-info'],revise:['Нужна доработка','Needs changes','b-mute']};
  function shrink(file){return new Promise(function(ok,no){
    var img=new Image(), url=URL.createObjectURL(file);
    img.onload=function(){var k=Math.min(1,1280/Math.max(img.width,img.height)), c=document.createElement('canvas'); c.width=Math.round(img.width*k); c.height=Math.round(img.height*k);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url); c.toBlob(function(b){b?ok(b):no()},'image/jpeg',.82)};
    img.onerror=function(){URL.revokeObjectURL(url);no()}; img.src=url})}
  function field(label,node){var l=el('label'); l.style.cssText='display:grid;gap:6px'; l.appendChild(el('span',null,label)); l.appendChild(node); return l}
  NG.practice=function(m,user,done){
    var box=el('section','glass pad'); box.style.marginTop='16px'; box.appendChild(el('h3',null,tr('Сдать практику','Submit your practice')));
    if(!user){var a=el('a','btn',tr('Войти, чтобы сдать работу','Sign in to submit')); a.href='login.html'; box.appendChild(el('p','muted',tr('Практику принимает ИИ или преподаватель. Для этого нужен вход.','AI or a teacher reviews your practice. You need to sign in.'))); box.appendChild(a); return box}
    var info=el('div'), form=el('form'); form.style.cssText='display:grid;gap:12px'; box.appendChild(info); box.appendChild(form);
    var ta=el('textarea'); ta.rows=5; ta.maxLength=6000; ta.style.cssText='width:100%;font:inherit';
    var lk=el('input'); lk.type='url'; lk.maxLength=500; lk.placeholder='https://';
    var fi=el('input'); fi.type='file'; fi.accept='image/jpeg,image/png,image/webp'; fi.multiple=true;
    var go=el('button','btn',tr('Отправить на проверку','Send for review')); go.type='submit'; var msg=el('p','muted'); msg.setAttribute('role','status');
    form.appendChild(field(tr('Ваш ответ или промпт','Your answer or prompt'),ta)); form.appendChild(field(tr('Ссылка на работу (необязательно)','Link to your work (optional)'),lk));
    form.appendChild(field(tr('Скриншоты, до 3 (необязательно)','Screenshots, up to 3 (optional)'),fi)); form.appendChild(el('small','muted',tr('Не отправляйте пароли и ключи.','Never send passwords or keys.'))); form.appendChild(go); form.appendChild(msg);
    function show(s){info.textContent=''; if(!s)return; var t=ST[s.status]||ST.pending, b=el('span','badge '+t[2],tr(t[0],t[1])); info.appendChild(b);
      var fb=s.teacher_feedback||(en()?s.ai_feedback_en||s.ai_feedback_ru:s.ai_feedback_ru||s.ai_feedback_en); if(fb){var p=el('p',null,fb); p.style.whiteSpace='pre-line'; info.appendChild(p)}
      if(s.status==='pending'){var r=el('button','btn ghost',tr('Проверить ещё раз','Check again')); r.type='button'; r.onclick=function(){r.disabled=true; run(s.id)}; info.appendChild(r)}
      form.hidden=(s.status==='accepted'||s.status==='ai_accepted'||s.status==='pending'); if(s.status==='accepted'||s.status==='ai_accepted') done(true)}
    function load(){sb.from('submissions').select('id,status,ai_feedback_ru,ai_feedback_en,teacher_feedback').eq('module_id',m.id).eq('user_id',user.id).order('created_at',{ascending:false}).limit(5).then(function(r){
      var rows=r.data||[], ok=rows.filter(function(x){return x.status==='accepted'||x.status==='ai_accepted'})[0]; show(ok||rows[0])})}
    function run(id){return sb.functions.invoke('check-submission',{body:{submission_id:id}}).then(function(){load()},function(){load()})}
    form.addEventListener('submit',function(e){e.preventDefault(); var files=[].slice.call(fi.files).slice(0,3), body=ta.value.trim(), link=lk.value.trim();
      if(!body&&!link&&!files.length){msg.textContent=tr('Добавьте текст, ссылку или скриншот.','Add text, a link or a screenshot.');return}
      if(link&&!/^https:\/\//i.test(link)){msg.textContent=tr('Ссылка должна начинаться с https://','The link must start with https://');return}
      go.disabled=true; msg.textContent=tr('Отправляем…','Sending…'); var id=crypto.randomUUID(), paths=[];
      Promise.all(files.map(function(f,n){return shrink(f).then(function(b){var p=user.id+'/'+id+'/'+n+'.jpg'; paths.push(p); return sb.storage.from('submissions').upload(p,b,{contentType:'image/jpeg'}).then(function(x){if(x.error)throw x.error})})}))
      .then(function(){return sb.from('submissions').insert({id:id,user_id:user.id,module_id:m.id,body:body||null,link:link||null,image_paths:paths})})
      .then(function(x){if(x.error)throw x.error; msg.textContent=tr('Проверяем работу…','Checking your work…'); ta.value=''; lk.value=''; fi.value=''; return run(id)})
      .then(function(){msg.textContent=''; go.disabled=false},function(){msg.textContent=tr('Не удалось отправить. Попробуйте ещё раз.','Could not send. Try again.'); go.disabled=false})});
    load(); return box};
})();
