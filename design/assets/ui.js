// Тема и язык: хранятся в localStorage, без библиотек.
(function(){
  var r=document.documentElement, g=function(k,d){try{return localStorage.getItem(k)||d}catch(e){return d}}, s=function(k,v){try{localStorage.setItem(k,v)}catch(e){}};
  var theme=g('ng-theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'), lang=g('ng-lang','ru');
  function apply(){
    r.dataset.theme=theme; r.lang=lang;
    document.querySelectorAll('[data-ru]').forEach(function(e){e.textContent=e.dataset[lang]||e.dataset.ru});
    document.querySelectorAll('[data-ph-ru]').forEach(function(e){e.placeholder=e.dataset[lang==='en'?'phEn':'phRu']});
    var b=document.getElementById('lang'); if(b) b.textContent=lang==='ru'?'EN':'RU';
  }
  apply();
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-act]'); if(!t) return;
    if(t.dataset.act==='theme'){theme=theme==='dark'?'light':'dark';s('ng-theme',theme);apply()}
    if(t.dataset.act==='lang'){lang=lang==='ru'?'en':'ru';s('ng-lang',lang);apply()}
    if(t.dataset.act==='menu'){var m=document.getElementById('mm');m.classList.toggle('open');t.setAttribute('aria-expanded',m.classList.contains('open'))}
    if(t.dataset.act==='sub'){document.querySelectorAll('.subm').forEach(function(x){x.classList.remove('on')});t.classList.add('on')}
  });
})();
