/* Dynamic Nav — germanvelasquez.co */
(function(){
  function toggleMobile(){var m=document.getElementById('mobileMenu');if(m)m.classList.toggle('open')}
  window.toggleMobile=toggleMobile;

  // Scroll behavior
  window.addEventListener('scroll',function(){
    var n=document.getElementById('nav');if(!n)return;
    var cls=n.dataset.initClass||(n.classList.contains('nav-dark')?'nav-dark':'nav-light');
    if(window.scrollY>80){
      n.classList.remove('nav-dark');n.classList.remove('nav-light');n.classList.add('nav-scrolled');
    }else{
      n.classList.remove('nav-scrolled');n.classList.add(cls);
    }
  });

  // Populate links from content.json
  fetch('/content.json').then(function(r){return r.json()}).then(function(c){
    var logo=document.getElementById('nav-logo');if(logo)logo.textContent=c.site.logo;
    var navEl=document.getElementById('nav-links');
    var mobEl=document.getElementById('mobile-nav-links');
    if(!navEl)return;
    var ctas=['conversemos'];
    (c.nav&&c.nav.items||[]).forEach(function(item){
      var label=item.label||item;var href=item.url||'#';
      var url=href.startsWith('#')?'/'+href:href.startsWith('http')||href.startsWith('mailto:')?href:'/'+href;
      var isCta=ctas.indexOf(label.toLowerCase())>=0;
      var d=isCta?'<a href="'+url+'" class="nav-cta">'+label+'</a>':'<a href="'+url+'">'+label+'</a>';
      var m=isCta?'<a href="'+url+'" class="nav-cta" style="display:inline-block;margin-top:12px" onclick="toggleMobile()">'+label+'</a>':'<a href="'+url+'" onclick="toggleMobile()">'+label+'</a>';
      navEl.innerHTML+=d;mobEl.innerHTML+=m;
    });
  }).catch(function(){});
})();
