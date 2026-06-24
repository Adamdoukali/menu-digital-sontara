const menuEl=document.getElementById('menu');
const chipsEl=document.getElementById('chips');
const emptyEl=document.getElementById('empty');
const q=document.getElementById('q');
const langbar=document.getElementById('langbar');

// build language buttons
LANGS.forEach(L=>{
  const b=document.createElement('button');
  b.className='lang'+(L.code===lang?' active':'');
  b.dataset.code=L.code;
  b.innerHTML=`<span class="fl">${L.fl}</span><span>${L.name}</span>`;
  b.onclick=()=>setLang(L.code);
  langbar.appendChild(b);
});

function priceHTML(p){return `<span class="price">${p}<span class="u">DH</span></span>`}

function render(){
  menuEl.innerHTML=''; chipsEl.innerHTML='';
  MENU.forEach(cat=>{
    const sec=document.createElement('section');
    sec.className='section'; sec.id=cat.id;
    let h=`<div class="cat-head"><img src="${IMG[cat.img]}" alt="" loading="lazy">
      <div class="label"><small>Santora</small>${cat.label[lang]}</div></div>`;
    cat.groups.forEach(g=>{
      h+=`<h3 class="group-title">${g.t[lang]}</h3>`;
      g.items.forEach(it=>{
        const nm=it.n[lang];
        const desc=it.d?`<div class="desc">${it.d[lang]}</div>`:'';
        const hay=(Object.values(it.n).join(' ')+' '+(it.d?Object.values(it.d).join(' '):'')).toLowerCase();
        h+=`<div class="item" data-name="${hay}">
          <div class="item-row"><span class="item-name">${nm}</span><span class="dots"></span>${priceHTML(it.p)}</div>${desc}</div>`;
      });
    });
    sec.innerHTML=h; menuEl.appendChild(sec);

    const chip=document.createElement('button');
    chip.className='chip'; chip.textContent=cat.label[lang]; chip.dataset.target=cat.id;
    chip.onclick=()=>document.getElementById(cat.id).scrollIntoView({behavior:'smooth',block:'start'});
    chipsEl.appendChild(chip);
  });
  observeSections();
  if(q.value)applyFilter();
}

function setLang(code){
  lang=code;
  const rtl=(code==='ar');
  document.body.dir=rtl?'rtl':'ltr';
  document.documentElement.lang=code;
  document.documentElement.dir=rtl?'rtl':'ltr';
  document.querySelectorAll('.lang').forEach(b=>b.classList.toggle('active',b.dataset.code===code));
  document.getElementById('eyebrow').textContent=UI.eyebrow[code];
  document.getElementById('tagline').textContent=UI.tagline[code];
  document.getElementById('footmeta').textContent=UI.footmeta[code];
  emptyEl.textContent=UI.empty[code];
  q.placeholder=UI.search[code];
  render();
}

function applyFilter(){
  const t=q.value.trim().toLowerCase();
  let any=false;
  document.querySelectorAll('.section').forEach(sec=>{
    let secVisible=false;
    sec.querySelectorAll('.item').forEach(it=>{
      const match=!t||it.dataset.name.includes(t);
      it.style.display=match?'':'none';
      if(match)secVisible=true;
    });
    sec.querySelectorAll('.group-title').forEach(gt=>{
      let n=gt.nextElementSibling,vis=false;
      while(n&&n.classList.contains('item')){if(n.style.display!=='none')vis=true;n=n.nextElementSibling;}
      gt.style.display=vis?'':'none';
    });
    sec.style.display=secVisible?'':'none';
    if(secVisible)any=true;
  });
  emptyEl.style.display=any?'none':'block';
}
q.addEventListener('input',applyFilter);

let io;
function observeSections(){
  if(io)io.disconnect();
  const chipBtns=[...document.querySelectorAll('.chip')];
  io=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        const id=e.target.id;
        chipBtns.forEach(c=>c.classList.toggle('active',c.dataset.target===id));
        const ac=chipBtns.find(c=>c.dataset.target===id);
        if(ac)ac.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
      }
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('.section').forEach(s=>io.observe(s));
}

const up=document.getElementById('up');
addEventListener('scroll',()=>up.classList.toggle('show',scrollY>600));
up.onclick=()=>scrollTo({top:0,behavior:'smooth'});

setLang('fr');
