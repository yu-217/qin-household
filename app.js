/** 200 Qin household reconstruction examples, static/offline, random selection with repeats. */
(()=>{'use strict';
const app=document.querySelector('#app'),toastNode=document.querySelector('#toast');
const sections=[{id:'name',label:'户主姓名',subtitle:''}, {id:'rank',label:'爵位',subtitle:''}, {id:'place',label:'籍贯（里）',subtitle:''}, {id:'assets',label:'家庭资产',subtitle:''}, {id:'family',label:'家庭成员',subtitle:''}, {id:'clan',label:'宗族',subtitle:''}];
const eras=[{name:'秦朝',sub:'',symbol:'秦',enabled:true},{name:'汉朝',sub:'',symbol:'汉'},{name:'唐朝',sub:'',symbol:'唐'},{name:'宋朝',sub:'',symbol:'宋'},{name:'元朝',sub:'',symbol:'元'}];
let toastTimer;
const state={page:'home',selected:new Set(),slot:null,allCases:window.QIN_CASES||[],image:null};
const html=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const current=()=>state.slot?state.allCases[state.slot-1]:null;
const toast=s=>{toastNode.textContent=s;toastNode.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('show'),2600)};
const heading=()=>`<header class="site-head"><h1>历代户籍档案馆</h1></header>`;
function home(){
 return `<section class="screen home-screen">${heading()}<div class="dynasty-list" aria-label="选择朝代">${eras.map(e=>`<button class="dynasty ${e.enabled?'dynasty-qin':'dynasty-disabled'}" data-action="${e.enabled?'qin':'none'}" ${e.enabled?'':'disabled'}><strong>${e.name}</strong></button>`).join('')}</div></section>`;
}
function editor(){
 return `<section class="screen choose-screen"><div class="choose-notice"><button class="back-icon" data-action="home" aria-label="返回首页">‹</button><strong>至少选三项，便可成卷</strong></div><div class="field-list" role="group" aria-label="选择户籍栏目">${sections.map(s=>{const on=state.selected.has(s.id);return `<button class="field-choice ${on?'is-checked':''}" data-action="toggle" data-id="${s.id}" aria-pressed="${on}"><span class="square-check" aria-hidden="true">${on?'✓':''}</span><span class="field-name">${s.label}</span></button>`}).join('')}</div><button class="primary-action" data-action="generate" ${state.selected.size<3?'disabled':''}>生成户籍卡</button></section>`;
}
function result(){
 return `<section class="screen result-screen"><h2 class="result-heading">秦朝 · 户籍卡</h2><div class="card-preview"><img class="result-image" id="card-image" alt="秦朝教学复原户籍卡，显示所选栏目"></div><button class="primary-action save-action" data-action="save">保存户籍卡</button><button class="return-home" data-action="home">返回首页</button></section>`;
}
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
 app.addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(!btn||btn.disabled)return;const {action,id}=btn.dataset;switch(action){case 'qin':openQin();break;case 'home':state.page='home';render(true);break;case 'toggle':state.selected.has(id)?state.selected.delete(id):state.selected.add(id);render();break;case 'generate':generate();break;case 'save':save();break;}});
 function boot(){
  if(state.allCases.length!==200||new Set(state.allCases.map(c=>c.caseNo)).size!==200 || state.allCases.some(c=>!c.place.startsWith('洞庭郡·迁陵县·') || !['公士','上造','簪袅','不更','大夫'].includes(c.rank))){
   console.error('200份案卷数据校验失败');toast('数据加载失败，请重新打开网页');
  }
  render(true);
 }
 boot();
})();
