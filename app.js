/** 200 Qin household reconstruction examples, static/offline, random selection with repeats. */
(()=>{'use strict';
const app=document.querySelector('#app'),toastNode=document.querySelector('#toast');
const sections=[{id:'name',number:'壹',label:'户主姓名',subtitle:'户主登记'}, {id:'rank',number:'贰',label:'爵位',subtitle:'秦制爵级'}, {id:'place',number:'叁',label:'籍贯（里）',subtitle:'郡县乡里'}, {id:'assets',number:'肆',label:'家庭资产',subtitle:'田宅记录'}, {id:'family',number:'伍',label:'家庭成员',subtitle:'家口关系'}, {id:'clan',number:'陆',label:'宗族',subtitle:'姓氏宗族'}];
const eras=[{name:'秦朝',sub:'郡县成籍 · 正在开放',symbol:'秦',enabled:true},{name:'汉朝',sub:'编户齐民',symbol:'汉'},{name:'唐朝',sub:'州县造籍',symbol:'唐'},{name:'宋朝',sub:'田产户等',symbol:'宋'},{name:'元朝',sub:'诸色户计',symbol:'元'}];
let toastTimer;
const state={page:'home',selected:new Set(),slot:null,allCases:window.QIN_CASES||[],image:null};
const html=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const current=()=>state.slot?state.allCases[state.slot-1]:null;
const toast=s=>{toastNode.textContent=s;toastNode.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('show'),2600)};
const heading=()=>`<header class="banner"><div class="banner-main"><div class="overline">秦 · 史馆簿籍</div><div class="title-line"><h1>历代户籍档案馆</h1><span class="seal" aria-hidden="true">籍</span></div><p>拾简成卷 · 一窥秦人家户</p></div></header>`;
const footer=()=>`<footer class="footer"><span class="foot-emblem">籍</span> 读史知制 · 以简为鉴</footer>`;
function home(){return `${heading()}<div class="content"><div class="section-head"><div><span class="overline dark">史馆藏卷</span><h2>择一朝，启一卷</h2></div><span class="vertical-rule">择朝</span></div><div class="eras">${eras.map(e=>`<button class="era ${e.enabled?'available':'locked'}" data-action="${e.enabled?'qin':'none'}" ${e.enabled?'':'disabled'}><span class="era-icon">${e.symbol}</span><span class="era-info"><strong>${e.name}</strong><small>${e.sub}</small></span><span class="era-state">${e.enabled?'进入案卷 →':'尚未开启'}</span></button>`).join('')}</div><div class="archive-ribbon"><span class="ornament">◇</span> 郡县有籍 · 家户有章 <span class="ornament">◇</span></div></div>${footer()}`}
function editor(){return `${heading()}<div class="content"><button class="back" data-action="home">← 返回史馆</button><div class="section-head compact"><div><span class="overline dark">秦 · 郡县户籍</span><h2>择项成籍</h2></div><span class="dynasty-tag">秦 · 始皇时期</span></div><div class="archive-steps"><span class="done">① 开卷</span><span class="active">② 择项</span><span>③ 成籍</span></div><p class="section-caption">勾选你想收入户籍卡的内容。</p><div class="options-grid">${sections.map(s=>{let on=state.selected.has(s.id);return `<button class="choice ${on?'on':''}" data-action="toggle" data-id="${s.id}" aria-pressed="${on}"><span class="choice-num">${s.number}</span><span class="choice-main"><strong>${s.label}</strong><small>${s.subtitle}</small></span><span class="choice-check">${on?'✓':'+'}</span></button>`}).join('')}</div><div class="toolbar"><button class="subbutton" data-action="all">全选</button><button class="subbutton" data-action="clear">清空</button><span class="toolbar-status">已选 ${state.selected.size} / 6 项</span></div><div class="selected-preview"><span class="small-seal">录</span><span>${state.selected.size>=3?'所选条目已备齐，可正式成籍':'至少选三项，便可成卷'}</span><span class="selected-progress">${'●'.repeat(state.selected.size)}${'○'.repeat(6-state.selected.size)}</span></div><button class="mainbutton" data-action="generate" ${state.selected.size<3?'disabled':''}>生成户籍卡　→</button></div>${footer()}`}
function result(){const ex=current();const facts=[state.selected.has('name')?`<span>户主　<strong>${html(ex?.name||'')}</strong></span>`:'',state.selected.has('family')?`<span>家口　<strong>${ex?.members?.length?ex.members.length+1:1} 人</strong></span>`:''].filter(Boolean).join('');return `${heading()}<div class="content result-content"><div class="section-head compact"><div><span class="overline dark">一卷成籍</span><h2>秦朝 · 户籍卡</h2></div><span class="result-stamp" aria-hidden="true">籍成</span></div>${facts?`<div class="result-summary">${facts}</div>`:''}<div class="image-frame"><img class="result-image" id="card-image" alt="秦朝教学复原户籍卡，含所选栏目"></div><div class="result-buttons"><button class="mainbutton" data-action="save">保存户籍卡　↓</button><div class="result-tools"><button class="subbutton" data-action="edit">修改栏目</button><button class="subbutton" data-action="reroll">再取一卷</button><button class="subbutton" data-action="home">返回首页</button></div></div></div>${footer()}`}
function render(scroll=false){app.innerHTML=state.page==='home'?home():state.page==='edit'?editor():result();if(state.page==='result'&&state.image)document.querySelector('#card-image').src=state.image;if(scroll)scrollTo({top:0,behavior:'instant'});}
function randomSlot(){
 const n=state.allCases.length;
 if(!n)throw new Error('案卷数据尚未加载');
 if(window.crypto&&typeof window.crypto.getRandomValues==='function'){
  const b=new Uint32Array(1);window.crypto.getRandomValues(b);return (b[0]%n)+1;
 }
 return Math.floor(Math.random()*n)+1;
}
function openQin(){if(state.allCases.length!==200){toast('案卷数据加载失败');return;}state.slot=randomSlot();state.image=null;state.page='edit';render(true);}
function reroll(){if(state.allCases.length!==200)return;const previous=state.slot;let next=previous;for(let i=0;i<8&&next===previous;i++)next=randomSlot();if(next===previous)next=previous%200+1;state.slot=next;state.image=makeImage();state.page='result';render(true);toast('已换一份户籍卷');}
const put=(ctx,s,x,y,size=27,bold=false,align='left',color='#253f50')=>{ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${bold?'bold ':''}${size}px "Noto Serif CJK SC","Songti SC","SimSun",serif`;ctx.fillText(String(s),x,y)};
function makeImage(){const ex=current();if(!ex)throw Error('暂无分配的案卷');const sel=state.selected;
 const W=1100,pad=38,w=W-2*pad,labelW=240,titleH=110,rowH=86,famHeader=98,memberH=82,famRows=6,familyH=famHeader+famRows*memberH,clanH=84,footH=100,marginBottom=38;
 const H=2*pad+titleH+4*rowH+familyH+clanH+footH+marginBottom;const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');if(!ctx)throw Error('浏览器不支持 Canvas');
 ctx.fillStyle='#eef5f8';ctx.fillRect(0,0,W,H);ctx.fillStyle='#e1edf3';ctx.fillRect(pad,pad,w,H-2*pad-marginBottom);
 const x=pad,r=W-pad;let y=pad;
 const rule=(a,b,aa,bb,line=2)=>{ctx.strokeStyle='#425969';ctx.lineWidth=line;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(aa,bb);ctx.stroke()};
 ctx.fillStyle='#305269';ctx.fillRect(x,y,w,7);ctx.fillStyle='#94adbd';ctx.fillRect(x+12,y+14,w-24,2);ctx.strokeStyle='#425969';ctx.lineWidth=3;ctx.strokeRect(x,y,w,H-2*pad-marginBottom);
 put(ctx,'秦朝 · 户籍卡',W/2,y+titleH/2+4,52,true,'center');let cur=y+titleH;rule(x,cur,r,cur);
 const fieldRows=[['name','户主姓名',ex.name],['rank','爵位',ex.rank],['place','籍贯（里）',ex.place],['assets','家庭资产',ex.assets]];
 fieldRows.forEach(([id,label,value])=>{rule(x+labelW,cur,x+labelW,cur+rowH);put(ctx,label,x+18,cur+rowH/2,29,true);if(sel.has(id))fit(ctx,value,x+labelW+16,cur+rowH/2,w-labelW-35);cur+=rowH;rule(x,cur,r,cur)});
 const fy=cur,partW=220,workW=200,officialW=180,rankW=w-labelW-partW-workW-officialW;
 const xx=[x,x+labelW,x+labelW+partW,x+labelW+partW+workW,x+labelW+partW+workW+officialW,r];
 for(const vx of xx.slice(1,-1))rule(vx,fy,vx,fy+familyH);
 rule(xx[1],fy+famHeader,r,fy+famHeader);
 for(let i=1;i<=famRows;i++)rule(xx[1],fy+famHeader+memberH*i,r,fy+famHeader+memberH*i);
 put(ctx,'家庭成员',x+labelW/2,fy+familyH/2,30,true,'center');
 put(ctx,'关系／姓名',xx[1]+partW/2,fy+famHeader/2,25,true,'center');
 put(ctx,'课役身份',xx[2]+workW/2,fy+famHeader/2,25,true,'center');
 put(ctx,'基层职务',xx[3]+officialW/2,fy+famHeader/2,24,true,'center');
 put(ctx,'爵位',xx[4]+rankW/2,fy+famHeader/2,26,true,'center');
 const members=sel.has('family')?ex.members:[];
 members.slice(0,6).forEach((m,i)=>{const cy=fy+famHeader+memberH*(i+.5);
   put(ctx,m.relation+' · '+m.name,xx[1]+partW/2,cy,24,false,'center');
   if(m.service)put(ctx,m.service,xx[2]+workW/2,cy,24,false,'center');
   if(m.office)put(ctx,m.office,xx[3]+officialW/2,cy,23,false,'center');
   if(m.rank)put(ctx,m.rank,xx[4]+rankW/2,cy,24,false,'center');
 });cur=fy+familyH;rule(x,cur,r,cur);rule(x+labelW,cur,x+labelW,cur+clanH);
 put(ctx,'宗族',x+18,cur+clanH/2,29,true);if(sel.has('clan'))fit(ctx,ex.clan,x+labelW+16,cur+clanH/2,w-labelW-35);
 cur+=clanH;rule(x,cur,r,cur);ctx.fillStyle='#305269';ctx.fillRect(x+1,cur+1,w-2,footH-2);
 put(ctx,'史馆簿籍　·　秦代户籍',x+15,cur+30,23,false,'left','#e7f1f5');
 put(ctx,'史料参照：里耶秦简　｜　教学复原，非出土原件',x+15,cur+67,20,false,'left','#d2e5ee');
 return c.toDataURL('image/png');}
 function fit(ctx,v,x,y,max){let size=28;ctx.font=`${size}px "Songti SC",serif`;while(ctx.measureText(v).width>max && size>17){size-=1;ctx.font=`${size}px "Songti SC",serif`;}put(ctx,v,x,y,size);}
 function generate(){if(state.selected.size<3){toast('至少选择三项');return;}if(!current()){toast('请先领取案卷');return;}try{state.image=makeImage();state.page='result';render(true)}catch(e){console.error(e);toast('生成失败，请再试一次');}}
 function save(){if(!state.image)return;const a=document.createElement('a');a.href=state.image;a.download=`秦朝户籍卡_${current().name}.png`;a.style.display='none';document.body.appendChild(a);a.click();a.remove();toast('若微信内未下载，请长按图片保存');}
 app.addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(!btn||btn.disabled)return;const {action,id}=btn.dataset;switch(action){case 'qin':openQin();break;case 'home':state.page='home';render(true);break;case 'reroll':reroll();break;case 'toggle':state.selected.has(id)?state.selected.delete(id):state.selected.add(id);render();break;case 'all':state.selected=new Set(sections.map(x=>x.id));render();break;case 'clear':state.selected.clear();render();break;case 'generate':generate();break;case 'edit':state.page='edit';render(true);break;case 'save':save();break;}});
 function boot(){
  if(state.allCases.length!==200||new Set(state.allCases.map(c=>c.caseNo)).size!==200 || state.allCases.some(c=>!c.place.startsWith('洞庭郡·迁陵县·') || !['公士','上造','簪袅','不更','大夫'].includes(c.rank))){
   console.error('200份案卷数据校验失败');toast('数据加载失败，请重新打开网页');
  }
  render(true);
 }
 boot();
})();
