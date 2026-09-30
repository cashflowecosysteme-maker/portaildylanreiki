(function(){
'use strict';
var state={products:[],settings:{}};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(p){if(p.priceLabel)return p.priceLabel;if(p.price==null||p.price==='')return'';var n=Number(p.price);if(!isFinite(n)||n<=0)return'';try{return n.toLocaleString('fr-CA',{style:'currency',currency:p.currency||'CAD'})}catch(_){return n.toFixed(2)+' $'}}
function portalName(id){var p=(state.settings.portals||[]).find(function(x){return x.id===id});return p&&p.name?p.name:(id||'NyXia')}
function media(p){return p.imageMain?'<img src="'+esc(p.imageMain)+'" alt="'+esc(p.title||'')+'" loading="lazy">':'<span class="fallback">✦</span>'}
function render(list){
 var h=document.getElementById('cards');
 if(!list.length){h.innerHTML='<div class="empty">Aucune proposition publiée ne correspond à cette recherche.</div>';return}
 h.innerHTML=list.map(function(p,i){
   var d=String(p.shortDescription||p.description||'').slice(0,155);
   return '<article class="card">'
    +(p.featured?'<span class="badge">★ À découvrir</span>':'')
    +'<div class="media">'+media(p)+'</div>'
    +'<div class="body"><div class="meta"><span>'+esc(p.type||'Parcours')+'</span><span>'+esc(portalName(p.portal))+'</span></div>'
    +'<h3>'+esc(p.title||'Expérience NyXia')+'</h3>'
    +'<div class="desc">'+esc(d)+(d.length>=155?'…':'')+'</div>'
    +(money(p)?'<div class="price">'+esc(money(p))+'</div>':'')
    +'<div class="actions"><button class="btn primary" data-open="'+i+'">Découvrir dans NyXia</button></div></div></article>'
 }).join('');
 document.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(){openDetail(list[Number(b.dataset.open)])}})
}
function actionFor(p){
 var url=String(p.ctaUrl||p.systemeCheckoutUrl||'').trim();
 if(!url)return null;
 var label='Continuer';
 var t=String(p.ctaType||'').toLowerCase();
 if(t==='gratuit')label='Rejoindre gratuitement';
 else if(t==='rendez-vous'||t==='reservation-consultation'||t==='appel')label='Prendre rendez-vous';
 else if(Number(p.price)>0)label='Rejoindre / acheter';
 return{url:url,label:label};
}
function openDetail(p){
 document.getElementById('detail-meta').textContent=(p.type||'Parcours')+' · '+portalName(p.portal);
 document.getElementById('detail-title').textContent=p.title||'Expérience NyXia';
 var img=document.getElementById('detail-image');if(p.imageMain){img.src=p.imageMain;img.hidden=false}else{img.hidden=true;img.removeAttribute('src')}
 document.getElementById('detail-text').textContent=p.description||p.shortDescription||'';
 var act=actionFor(p),box=document.getElementById('detail-actions');
 box.innerHTML=act?'<a class="btn primary" href="'+esc(act.url)+'" target="_blank" rel="noopener">'+esc(act.label)+'</a>':'<span class="btn">Disponible dans la Boutique NyXia</span>';
 document.getElementById('detail').classList.add('open');
}
function close(){document.getElementById('detail').classList.remove('open')}
document.getElementById('detail-close').onclick=close;
document.getElementById('detail').onclick=function(e){if(e.target===this)close()};
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
document.getElementById('search').oninput=function(){var q=this.value.trim().toLowerCase();render(state.products.filter(function(p){return !q||[p.title,p.shortDescription,p.description,p.category,p.type,portalName(p.portal)].join(' ').toLowerCase().includes(q)}))};
fetch('/api/nyxia-universe/boutique').then(function(r){return r.json().then(function(d){return{ok:r.ok,data:d}})}).then(function(res){
 if(!res.ok)throw Error(res.data.error||'Boutique indisponible.');
 state.products=(res.data.products||[]).filter(function(p){return p.active!==false});
 state.settings=res.data.settings||{};
 render(state.products);
}).catch(function(e){document.getElementById('cards').innerHTML='<div class="error">'+esc(e.message)+'</div>'});
})();