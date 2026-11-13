(() => {
 'use strict';
 const $ = (s, root=document) => root.querySelector(s);
 const $$ = (s, root=document) => [...root.querySelectorAll(s)];
 const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icons = {
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  left:'<path d="m14 6-6 6 6 6"/>',
  right:'<path d="m10 6 6 6-6 6"/>',
  up:'<path d="M6 18 18 6M6 6h12v12"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  phone:'<path d="m8 3 3 5-3 3a15 15 0 0 0 5 5l3-3 5 3-1 4c-1 3-8 0-12-4S1 5 4 4Z"/>',
  play:'<path d="m9 5 11 7-11 7Z"/>',
  telegram:'<path d="m21 3-4 18-6-6-4 3 1-6 10-6-12 5-4-2Z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'
 };
 const icon = (name,cls='') => `<svg class="icon ${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
 const variants = window.PUDEL_VARIANTS;
 if(false){
  $('#concepts').innerHTML=variants.map(v=>`<a class="concept" href="variant-${v.id}.html" style="--preview-bg:${v.color}"><div class="concept-preview"><img src="previews/variant-${v.id}.webp" alt="Первый экран варианта ${v.id}: ${esc(v.name)}" width="1440" height="1000" ${v.id>2?'loading="lazy"':''}></div><div class="concept-heading"><span class="concept-number">${String(v.id).padStart(2,'0')}</span><h2>${esc(v.name)}</h2><span class="concept-open"></span></div><p>${esc(v.description)}</p><span class="concept-detail">${esc(v.detail)}</span></a>`).join('');
  return;
 }
 const d = window.PUDEL_DATA;
 const id=Number(document.body.dataset.variant)||1;
 const v=variants.find(x=>x.id===id)||variants[0];
 document.body.classList.add(`theme-${v.theme}`);
 document.title="Щенки той и карликовых пуделей в Донецке, ДНР — от 49 999 ₽";
 const call=(cls='btn primary',text='Позвонить')=>`<a class="${cls}" href="tel:${esc(d.phone)}">${icon('phone')}<span>${text}</span></a>`;
 const telegram=(cls='btn secondary',text='Написать в Telegram')=>`<a class="${cls}" href="${esc(d.telegram)}" target="_blank" rel="noopener noreferrer">${icon('telegram')}<span>${text}</span></a>`;
 const brand=`<a class="brand" href="#top" aria-label="Пудель — в начало">пудель<span class="brand-dot"></span></a>`;
 const photo=(name,alt,cls='',priority=false)=>`<div class="photo ${cls}"><img src="assets/images/${name}.webp" alt="${esc(alt)}" width="960" height="1280" ${priority?'fetchpriority="high"':'loading="lazy"'}></div>`;
 const status='<span class="availability"><span aria-hidden="true"></span>Щенки в наличии</span>';
 const pricing=`<div class="hero-offer">${status}<span class="price">${esc(d.price)}</span></div>`;
 const actions=`<div class="btn-row">${call()}${telegram()}</div>`;
 const lead='<p class="hero-lead">Щенки той и карликовых пуделей.<br>Донецк, ДНР. Возможна перевозка в другие города — подробности по телефону.</p>';
 const down=`<a class="text-link" href="#puppies">Смотреть щенков </a>`;
 const heroes={
  1:`<div class="hero-inner wrap"><div class="hero-copy"><div id="rotating-headline"><h1>Выберите того,<br>с кем захочется<br><em>делить каждый день.</em></h1></div>${lead}${pricing}${actions}${down}</div><div class="hero-pair">${photo('portrait-light','Светлый щенок той и карликовых пуделей','portrait-main',true)}${photo('green-toy','Щенок рядом с зелёной игрушкой','portrait-small',true)}${photo('new-group','Щенки пуделей вместе','portrait-third',true)}</div></div>`,
  2:`<div class="hero-inner wrap"><div class="white-title"><h1>Щенки той и карликовых пуделей.<br><em>Давайте знакомиться.</em></h1><div class="white-offer">${pricing}${call()}</div></div><div class="white-photo-row">${photo('portrait-apricot','Абрикосовый той-пудель','',true)}${photo('family','Три щенка той и карликовых пуделей','',true)}${photo('portrait-light','Светлый той-пудель','',true)}</div><div class="white-bottom"><p>Фотографии, видео и немного о наших пуделях.</p>${down}${telegram('text-link','Написать нам')}</div></div>`,
  3:`<div class="hero-inner wrap"><div class="peach-portrait">${photo('pink-toy','Щенок той и карликовых пуделей с розовой игрушкой','',true)}<button class="video-bubble" data-open-video aria-label="Посмотреть видео щенков">${icon('play')}<span>Малыши на видео</span></button></div><div class="hero-copy"><h1>Ваш той-пудель<br><em>уже здесь.</em></h1>${lead}${pricing}${actions}${down}</div></div>`,
  4:`<div class="hero-inner wrap"><div class="sage-heading"><h1>Той-пудели<br><em>для вашей семьи.</em></h1><div class="sage-intro">${lead}${pricing}${actions}</div></div><div class="sage-photos">${photo('together','Два щенка той и карликовых пуделей на руках','',true)}${photo('three-friends','Три щенка той и карликовых пуделей сидят вместе','',true)}<a class="sage-gallery-link" href="#puppies">Знакомство в фотографиях </a></div></div>`,
  5:`<div class="hero-inner wrap"><div class="journal-heading"><h1>Знакомьтесь:<br><em>щенки той и карликовых пуделей.</em></h1><div class="journal-title-bottom"><span>Маленькие друзья, большие планы</span>${status}</div></div><div class="journal-layout"><div class="journal-copy"><p>Выберите того,<br>с кем захочется<br>делить каждый день.</p><span class="price">${esc(d.price)}</span>${actions}${down}</div>${photo('portrait-apricot','Щенок абрикосового окраса','journal-main',true)}<div class="journal-side">${photo('blue-toy','Щенки с голубой игрушкой','',true)}<button class="journal-video" data-open-video>${icon('play')}<span>Посмотреть<br>видео малышей</span></button></div></div></div>`,
  6:`<div class="hero-inner wrap"><div class="photo-heading"><h1>Щенки той и карликовых пуделей.<br><em>Ваше первое знакомство.</em></h1>${status}</div><div class="wide-photo">${photo('family','Три щенка той и карликовых пуделей вместе','',true)}<button class="wide-play" data-open-video aria-label="Посмотреть видео щенков">${icon('play')}</button></div><div class="photo-bottom"><p>Посмотрите на малышей.<br>Остальное расскажем при знакомстве.</p><span class="price">${esc(d.price)}</span>${actions}</div></div>`
 };
 document.body.innerHTML=`<a class="skip-link" href="#main">К содержимому</a>
 <header class="site-header"><div class="wrap nav-inner">${brand}<nav id="rubber-nav" class="desktop-nav" aria-label="Основная навигация"><a href="#puppies">Щенки</a><a href="#parents">Родители</a><a href="#breeding">Вязка</a><a href="#contact">Контакты</a></nav><a class="nav-phone" href="tel:${esc(d.phone)}">${icon('phone')}<span>${esc(d.phoneLabel)}</span></a><button class="menu-toggle icon-btn" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu">${icon('menu')}</button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Мобильная навигация" hidden><a href="#puppies">Щенки</a><a href="#parents">Родители</a><a href="#breeding">Вязка</a><a href="#contact">Контакты</a></nav></header>
 <main id="main"><section id="top" class="hero hero-${id}" data-enter>${heroes[id]}</section>
 <section id="puppies" class="puppies-section section"><div class="wrap"><div class="section-heading"><div><h2>Знакомство с малышами</h2><p>Листайте фотографии и знакомьтесь с нашими щенками.</p></div><div class="media-filters" role="group" aria-label="Тип материалов"><button class="filter active" data-filter="all" aria-pressed="true">Все</button><button class="filter" data-filter="image" aria-pressed="false">Фото</button><button class="filter" data-filter="video" aria-pressed="false">Видео</button></div></div><div id="puppy-gallery"></div><div class="gallery-after"><span>${status}<span class="gallery-price">${esc(d.price)}</span></span></div></div></section>
 <section id="parents" class="parents-section section"><div class="wrap"><div class="section-heading"><div><h2>Родители щенков</h2><p>Знакомьтесь с нашими пуделями: два отца и три мамы.</p></div></div>${[['toy','Той-пудели'],['karlik','Карликовые пудели']].map(([key,title])=>`<div class="parent-breed"><h3 class="breed-heading">${title}</h3><div class="parents-grid">${[['mom','Мамы'],['dad','Отцы']].map(([role,label])=>`<article class="parent-profile"><div class="parent-title"><h3>${role==='dad'?'Отец':key==='karlik'?'Мама':label}</h3></div><div id="${key}-${role}-gallery"></div></article>`).join('')}</div></div>`).join('')}</div></section>
 <section id="breeding" class="breeding-section section"><div class="wrap breeding-layout"><h2>Возможна вязка<br><em>с вашей собакой.</em></h2><div><p>Обсудим возможность сведения с вашей собакой и условия вязки лично.</p>${telegram('btn secondary','Обсудить вязку')}</div></div></section>
 </main><footer id="contact" class="contact-section"><div class="wrap"><div class="contact-main"><div><h2>Давайте<br><em>знакомиться.</em></h2><p>Щенки в Донецке, ДНР. Возможна перевозка в другие города. Все условия уточняйте по телефону.</p></div><div class="contact-details"><a class="contact-number" href="tel:${esc(d.phone)}">${esc(d.phoneLabel)}</a><span>Звонки и Telegram на один номер</span>${actions}</div></div><div class="footer-bottom">${brand}<span>Щенки той и карликовых пуделей в наличии</span></div></div></footer>
 <dialog id="lightbox" aria-labelledby="lightbox-title"><div class="lightbox-head"><h2 id="lightbox-title">Фото и видео щенков</h2><button class="icon-btn lightbox-close" aria-label="Закрыть просмотр">${icon('close')}</button></div><div class="lightbox-content"></div><div class="lightbox-bottom"><button class="icon-btn lightbox-prev" aria-label="Предыдущий материал">${icon('left')}</button><span class="lightbox-counter" aria-live="polite"></span><button class="icon-btn lightbox-next" aria-label="Следующий материал">${icon('right')}</button></div></dialog>`;

 const galleries=[];
 let activeGallery=null;
 const dialog=$('#lightbox');
 let lightboxVersion=0;
 const mediaMarkup=(item,full=false)=>item.type==='video'?`<video class="gallery-video" src="${esc(item.src)}" poster="${esc(item.poster||'assets/images/family.webp')}" controls playsinline preload="metadata" aria-label="${esc(item.alt)}"></video>`:`<img src="${esc(item.src)}" alt="${esc(item.alt)}" ${full?'':'loading="lazy"'} decoding="async" draggable="false">`;
 const warming=new Set();
 function warmImage(src){if(warming.has(src))return;warming.add(src);const img=new Image();img.decoding='async';img.onload=()=>{img.onload=null;img.onerror=null;};img.onerror=()=>warming.delete(src);img.src=src;}
 async function presentMedia(container,item,isCurrent){
  container.querySelector('.media-error')?.remove();
  const previous=[...container.children];container.setAttribute('aria-busy','true');
  if(!previous.length){const loading=document.createElement('span');loading.className='photo-loading';loading.setAttribute('role','status');loading.textContent='Загружаем фото…';container.append(loading);previous.push(loading);}
  let next;
  try{
   if(item.type==='image'){
    next=new Image();next.alt=item.alt;next.draggable=false;next.decoding='async';next.className='ready-photo';
    await new Promise((resolve,reject)=>{next.onload=resolve;next.onerror=reject;next.src=item.src;});
    await next.decode();
   }else{const temp=document.createElement('div');temp.innerHTML=mediaMarkup(item);next=temp.firstElementChild;}
   if(!isCurrent())return;
   previous.forEach(node=>{if(node.tagName==='VIDEO')node.pause();});
   container.append(next);
   const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
   await next.animate([{opacity:0},{opacity:1}],{duration:reduced?0:180,easing:'ease-out'}).finished;
   if(isCurrent())previous.forEach(node=>node.remove());
  }catch{
   if(!isCurrent())return;
   const error=document.createElement('button');error.className='media-error';error.textContent='Фото не загрузилось. Повторить';error.onclick=e=>{e.stopPropagation();presentMedia(container,item,isCurrent);};container.append(error);
  }finally{if(isCurrent())container.setAttribute('aria-busy','false');}
 }
 function attachSwipe(surface,moving,step,canSwipe,onDrag=()=>{}){
  let gesture=null,ignoreClickUntil=0;
  surface.addEventListener('dragstart',e=>e.preventDefault());
  surface.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,video')||!canSwipe())return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,live:false};surface.setPointerCapture(e.pointerId);});
  surface.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.live&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){gesture=null;return;}if(Math.abs(dx)>10){gesture.live=true;moving.style.transform=`translateX(${dx*.65}px)`;}});
  const finish=(e,cancelled=false)=>{if(!gesture)return;const g=gesture;gesture=null;const dx=e.clientX-g.x;if(g.live){ignoreClickUntil=performance.now()+450;onDrag();const start=moving.style.transform;moving.style.transform='';moving.animate([{transform:start},{transform:'translateX(0)'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:220,easing:'cubic-bezier(.22,1,.36,1)'});if(!cancelled&&Math.abs(dx)>45)step(dx<0?1:-1);}};
  surface.addEventListener('pointerup',e=>finish(e));surface.addEventListener('pointercancel',e=>finish(e,true));
  surface.addEventListener('click',e=>{if(performance.now()<ignoreClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 }
 class Gallery {
  constructor(root,items,label){
   this.root=root;this.all=items;this.items=items;this.label=label;this.index=0;
   galleries.push(this);
   if(!items.length){root.innerHTML=`<div class="parent-empty"><span class="parent-empty-mark" aria-hidden="true">${icon('expand')}</span><p>Фотографии по запросу</p><span>Напишите нам — покажем родителей<br>и расскажем о них подробнее.</span></div>`;return;}
   this.renderShell();this.show(0);
  }
  renderShell(){
   this.root.innerHTML=`<div class="gallery" role="region" aria-label="${esc(this.label)}" tabindex="0"><div class="gallery-stage"><div class="gallery-media"></div><button class="gallery-expand icon-btn" aria-label="Открыть на весь экран">${icon('expand')}</button><div class="gallery-nav"><button class="gallery-prev icon-btn" aria-label="Предыдущий материал">${icon('left')}</button><span class="gallery-counter" aria-live="polite"></span><button class="gallery-next icon-btn" aria-label="Следующий материал">${icon('right')}</button></div></div><div class="gallery-thumbs" aria-label="Выберите фотографию или видео"></div></div>`;
   $('.gallery-prev',this.root).onclick=()=>this.show(this.index-1);
   $('.gallery-next',this.root).onclick=()=>this.show(this.index+1);
   $('.gallery-expand',this.root).onclick=()=>this.open();
   $('.gallery',this.root).addEventListener('keydown',e=>{
    if(e.target.closest('video')||e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key==='ArrowRight'){e.preventDefault();this.show(this.index+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();this.show(this.index-1);}
   });
   attachSwipe($('.gallery-stage',this.root),$('.gallery-media',this.root),delta=>this.show(this.index+delta),()=>this.items.length>1,()=>{this.suppressClick=true;setTimeout(()=>this.suppressClick=false,400);});

  }
  filter(type){this.items=this.all.filter(x=>type==='all'||x.type===type);this.index=0;this.show(0);}
  show(n){
   if(!this.items.length)return;
   this.index=(n+this.items.length)%this.items.length;
   const restoreThumbFocus=document.activeElement?.classList.contains('gallery-thumb')&&this.root.contains(document.activeElement);
   const current=this.items[this.index];
   const container=$('.gallery-media',this.root);
   const version=this.version=(this.version||0)+1;
   presentMedia(container,current,()=>this.version===version);
   container.onclick=e=>{if(e.target.tagName==='IMG'&&!this.suppressClick)this.open();};
   this.preloadNeighbors();
   $('.gallery-counter',this.root).textContent=`${String(this.index+1).padStart(2,'0')} / ${String(this.items.length).padStart(2,'0')}`;
   $$('.gallery-prev,.gallery-next',this.root).forEach(b=>b.disabled=this.items.length<2);
   if(this.thumbsFor!==this.items){this.thumbsFor=this.items;$('.gallery-thumbs',this.root).innerHTML=this.items.map((item,i)=>`<button class="gallery-thumb ${i===this.index?'selected':''}" aria-label="${esc(item.type==='video'?'Видео: '+item.alt:item.alt)}" aria-pressed="${i===this.index}" data-index="${i}"><img src="${esc(item.thumb||item.poster||item.src)}" alt="" width="160" height="160" loading="eager" decoding="async">${item.type==='video'?`<span class="thumb-play">${icon('play')}</span>`:''}</button>`).join('');
   $$('.gallery-thumb',this.root).forEach(b=>b.onclick=()=>this.show(Number(b.dataset.index)));}
   $$('.gallery-thumb',this.root).forEach((b,i)=>{b.classList.toggle('selected',i===this.index);b.setAttribute('aria-pressed',String(i===this.index));});
   const selected=$('.gallery-thumb.selected',this.root);
   if(restoreThumbFocus&&selected)selected.focus({preventScroll:true});
   if(selected){const rail=selected.parentElement;rail.scrollTo({left:selected.offsetLeft-rail.offsetLeft-rail.clientWidth/2+selected.clientWidth/2,behavior:'instant'});}
  }
  preloadNeighbors(){
   const rect=this.root.getBoundingClientRect();if(rect.top>innerHeight+400||rect.bottom<0)return;
   for(const delta of [-1,1]){const item=this.items[(this.index+delta+this.items.length)%this.items.length];if(item?.type==='image')warmImage(item.src);}
  }
  open(){
   activeGallery=this;
   const vid=$('video',this.root);if(vid)vid.pause();
   dialog.showModal();paintLightbox();document.body.classList.add('modal-open');
  }
 }
 const puppyGallery=new Gallery($('#puppy-gallery'),d.puppies,'Фото и видео щенков');
 for(const breed of ['toy','karlik'])for(const role of ['mom','dad'])new Gallery($('#'+breed+'-'+role+'-gallery'),d.parents[breed][role],(breed==='toy'?'Той-пудели':'Карликовые пудели')+' — '+(role==='mom'?'мамы':'отцы'));
 const nearby=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)galleries.find(g=>g.root===e.target)?.preloadNeighbors();},{rootMargin:'350px'});galleries.forEach(g=>nearby.observe(g.root));
 function paintLightbox(){
  if(!activeGallery)return;
  const version=++lightboxVersion;
  presentMedia($('.lightbox-content'),activeGallery.items[activeGallery.index],()=>version===lightboxVersion&&dialog.open);
  activeGallery.preloadNeighbors();
  $('.lightbox-counter').textContent=`${activeGallery.index+1} / ${activeGallery.items.length}`;
  $$('.lightbox-prev,.lightbox-next').forEach(b=>b.disabled=activeGallery.items.length<2);
 }
 function stepLightbox(delta){activeGallery.show(activeGallery.index+delta);paintLightbox();}
 $('.lightbox-prev').onclick=()=>stepLightbox(-1);
 $('.lightbox-next').onclick=()=>stepLightbox(1);
 $('.lightbox-close').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{lightboxVersion++;const video=$('video',dialog);if(video)video.pause();$('.lightbox-content').innerHTML='';document.body.classList.remove('modal-open');});
 attachSwipe($('.lightbox-content'),$('.lightbox-content'),stepLightbox,()=>!!activeGallery&&activeGallery.items.length>1);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('keydown',e=>{if(e.target.closest('video'))return;if(e.key==='ArrowRight'){e.preventDefault();stepLightbox(1);}if(e.key==='ArrowLeft'){e.preventDefault();stepLightbox(-1);}});
 $$('.filter').forEach(b=>b.onclick=()=>{
  $$('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});puppyGallery.filter(b.dataset.filter);
 });
 $$('[data-open-video]').forEach(b=>b.onclick=()=>{
  const all=$('[data-filter="all"]');all.click();
  const index=puppyGallery.items.findIndex(x=>x.type==='video');
  if(index>=0){puppyGallery.show(index);puppyGallery.open();}
 });
 const menu=$('.menu-toggle');
 menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('#mobile-menu').hidden=!open;menu.innerHTML=icon(open?'close':'menu');};
 $$('#mobile-menu a').forEach(a=>a.onclick=()=>{if(menu.getAttribute('aria-expanded')==='true')menu.click();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});
})();
