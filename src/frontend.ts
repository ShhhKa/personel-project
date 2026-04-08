export const FRONTEND_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>记忆库</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0f0f14;--bg2:#1a1a24;--bg3:#24243a;--bd:#2e2e48;--tx:#e0dfe6;--tx2:#9594a8;--ac:#8b7cf6;--ac2:#6c5dd3;--gn:#4ade80;--bl:#60a5fa;--am:#fbbf24;--pk:#f472b6;--rd:#f87171;--tl:#2dd4bf}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--tx);min-height:100vh}
.app{max-width:720px;margin:0 auto;padding:16px 16px 90px}
h1{font-size:22px;font-weight:600;display:flex;align-items:center;gap:8px}
h1 .dot{width:14px;height:14px;border-radius:50%;background:var(--ac)}
.stats{font-size:13px;color:var(--tx2);margin:4px 0 14px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.tab{padding:5px 12px;border-radius:20px;border:1px solid var(--bd);background:transparent;color:var(--tx2);cursor:pointer;font-size:13px}
.tab:hover{border-color:var(--ac);color:var(--tx)}
.tab.on{background:var(--ac);color:#fff;border-color:var(--ac)}
.search{width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx);font-size:14px;margin-bottom:12px;outline:none}
.search:focus{border-color:var(--ac)}
.search::placeholder{color:var(--tx2)}
.vt{display:flex;gap:6px;margin-bottom:14px}
.vb{padding:5px 10px;border-radius:8px;border:1px solid var(--bd);background:transparent;color:var(--tx2);cursor:pointer;font-size:12px}
.vb.on{background:var(--bg3);color:var(--tx);border-color:var(--ac)}
.card{background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:10px}
.card:hover{border-color:var(--ac)}
.card.done{opacity:.55}
.card.done .ct{text-decoration:line-through;color:var(--tx2)}
.ch{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.badge{font-size:11px;padding:2px 8px;border-radius:10px;font-weight:500}
.b-core{background:#3b2e7e;color:#c4b5fd}.b-daily{background:#3b3520;color:var(--am)}.b-diary{background:#2e3b2e;color:var(--gn)}
.b-work{background:#1e3040;color:var(--bl)}.b-life{background:#2e3b2e;color:var(--gn)}.b-study{background:#3b2e7e;color:#c4b5fd}
.ct{font-size:15px;font-weight:500;margin-bottom:4px}
.cc{font-size:13px;color:var(--tx2);line-height:1.6;white-space:pre-wrap}
.cm{font-size:12px;color:var(--tx2);margin-top:6px}
.tg{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
.tg span{font-size:11px;padding:2px 8px;border-radius:8px;background:var(--bg3);color:var(--tx2)}
.ca{display:flex;gap:8px;margin-top:8px;justify-content:flex-end}
.bs{padding:3px 10px;border-radius:6px;border:1px solid var(--bd);background:transparent;color:var(--tx2);cursor:pointer;font-size:12px}
.bs:hover{border-color:var(--ac);color:var(--tx)}
.bs.del:hover{border-color:var(--rd);color:var(--rd)}
.cal{background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}
.cn{display:flex;align-items:center;gap:10px;margin-bottom:10px;justify-content:center}
.cb{background:transparent;border:1px solid var(--bd);color:var(--tx);padding:4px 10px;border-radius:6px;cursor:pointer}
.cb:hover{border-color:var(--ac)}
.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}
.cdh{font-size:11px;color:var(--tx2);padding:4px}
.cd{padding:6px 2px;border-radius:8px;cursor:pointer;min-height:40px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:13px}
.cd:hover{background:var(--bg3)}
.cd.today{background:var(--bg3);border:1px solid var(--ac)}
.cd.empty{cursor:default}.cd.empty:hover{background:transparent}
.dots{display:flex;gap:2px;margin-top:1px}
.dot-s{width:5px;height:5px;border-radius:50%}
.hp{background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:14px}
.hp h3{font-size:14px;font-weight:500;margin-bottom:10px}
.hr{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:13px}
.hr .hn{flex:1}
.hg{display:flex;gap:3px}
.hc{width:20px;height:20px;border-radius:4px;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.hc.full{background:#166534;color:#4ade80}.hc.part{background:#854d0e;color:#fbbf24}.hc.miss{background:#1e1e2e;color:#4b4b5e}.hc.future{background:var(--bg);border:1px solid var(--bd);color:var(--tx2)}
.fab{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:var(--ac);color:#fff;border:none;font-size:28px;cursor:pointer;box-shadow:0 4px 16px rgba(139,124,246,.4);display:flex;align-items:center;justify-content:center;z-index:10}
.fab:hover{background:var(--ac2)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100;display:none;align-items:center;justify-content:center;padding:16px}
.mo.show{display:flex}
.md{background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto}
.md h2{font-size:18px;margin-bottom:14px}
.fr{margin-bottom:10px}
.fr label{display:block;font-size:13px;color:var(--tx2);margin-bottom:3px}
.fr input,.fr select,.fr textarea{width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx);font-size:14px;outline:none;font-family:inherit}
.fr textarea{min-height:70px;resize:vertical}
.fr input:focus,.fr select:focus,.fr textarea:focus{border-color:var(--ac)}
.fa{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
.btn{padding:8px 18px;border-radius:8px;border:none;cursor:pointer;font-size:14px}
.bp{background:var(--ac);color:#fff}.bp:hover{background:var(--ac2)}
.bc{background:transparent;border:1px solid var(--bd);color:var(--tx2)}
.cond{display:none}.cond.show{display:block}
.empty{text-align:center;padding:40px;color:var(--tx2);font-size:14px}
.legend{display:flex;gap:10px;margin-top:10px;font-size:11px;color:var(--tx2)}
.legend span{display:flex;align-items:center;gap:3px}
</style>
</head>
<body>
<div class="app" id="app">
  <h1><span class="dot"></span>记忆库</h1>
  <div class="stats" id="stats">加载中...</div>
  <div class="tabs" id="tabs">
    <button class="tab on" data-v="all">全部</button>
    <button class="tab" data-v="core">🏔 深层</button>
    <button class="tab" data-v="daily">🌤 日常</button>
    <button class="tab" data-v="diary">📖 日记</button>
    <button class="tab" data-v="todo">📋 待办</button>
    <button class="tab" data-v="habit">⚡ 习惯</button>
  </div>
  <input class="search" id="search" placeholder="🔍 搜索..." />
  <div class="vt">
    <button class="vb on" data-w="list">列表</button>
    <button class="vb" data-w="calendar">日历</button>
  </div>
  <div id="habit-panel"></div>
  <div id="cal-view" style="display:none"></div>
  <div id="list-view"></div>
</div>
<button class="fab" id="fab">+</button>
<div class="mo" id="modal">
  <div class="md">
    <h2 id="mt">添加</h2>
    <input type="hidden" id="eid"/>
    <div class="fr"><label>类型</label>
      <select id="f-type"><option value="memory">记忆</option><option value="todo">待办</option><option value="rule">循环规则</option><option value="habit">习惯</option></select>
    </div>
    <div class="cond show" id="mem-f">
      <div class="fr"><label>分层</label><select id="f-layer"><option value="core">🏔 深层</option><option value="daily" selected>🌤 日常</option><option value="diary">📖 日记</option></select></div>
    </div>
    <div class="fr"><label>标题</label><input id="f-title" placeholder="标题"/></div>
    <div class="cond show" id="content-f">
      <div class="fr"><label>内容</label><textarea id="f-content" placeholder="内容..."></textarea></div>
    </div>
    <div class="cond show" id="tags-f">
      <div class="fr"><label>标签</label><input id="f-tags" placeholder="逗号分隔"/></div>
    </div>
    <div class="cond" id="mood-f">
      <div class="fr"><label>心情</label><select id="f-mood"><option value="">不设置</option><option value="happy">😊 开心</option><option value="calm">😌 平静</option><option value="excited">🤩 激动</option><option value="sad">😢 难过</option><option value="anxious">😰 焦虑</option></select></div>
    </div>
    <div class="cond" id="todo-f">
      <div class="fr"><label>开始时间</label><input id="f-start" type="datetime-local"/></div>
      <div class="fr"><label>结束时间</label><input id="f-end" type="datetime-local"/></div>
      <div class="fr"><label>截止日期</label><input id="f-due" type="date"/></div>
      <div class="fr"><label>地点</label><input id="f-loc" placeholder="地点"/></div>
      <div class="fr"><label>分类</label><select id="f-cat"><option value="工作">工作</option><option value="生活" selected>生活</option><option value="学习">学习</option></select></div>
      <div class="fr"><label>优先级</label><select id="f-pri"><option value="low">低</option><option value="medium" selected>中</option><option value="high">高</option></select></div>
    </div>
    <div class="cond" id="rule-f">
      <div class="fr"><label>频率</label><select id="f-freq"><option value="daily">每天</option><option value="weekly" selected>每周</option><option value="monthly">每月</option><option value="yearly">每年</option></select></div>
      <div class="fr"><label>周几(如mon,wed,fri)</label><input id="f-byday" placeholder="mon,wed,fri"/></div>
      <div class="fr"><label>每月几号</label><input id="f-bymd" type="number" placeholder="15"/></div>
      <div class="fr"><label>时间</label><input id="f-rtime" type="time"/></div>
      <div class="fr"><label>结束时间</label><input id="f-rend" type="time"/></div>
      <div class="fr"><label>地点</label><input id="f-rloc" placeholder="地点"/></div>
      <div class="fr"><label>分类</label><select id="f-rcat"><option value="工作">工作</option><option value="生活" selected>生活</option><option value="学习">学习</option></select></div>
      <div class="fr"><label>开始日期</label><input id="f-rsd" type="date"/></div>
      <div class="fr"><label>结束日期(空=永久)</label><input id="f-red" type="date"/></div>
    </div>
    <div class="cond" id="habit-f">
      <div class="fr"><label>频率</label><select id="f-hfreq"><option value="daily">每天</option><option value="workdays">工作日</option></select></div>
      <div class="fr"><label>每天次数</label><input id="f-htpd" type="number" value="1" min="1"/></div>
    </div>
    <div class="fa">
      <button class="btn bc" id="btn-c">取消</button>
      <button class="btn bp" id="btn-s">保存</button>
    </div>
  </div>
</div>
<script>
const A=window.location.origin+'/api';
let tab='all',view='list',calM=new Date().toISOString().slice(0,7);
const L={core:'🏔 深层',daily:'🌤 日常',diary:'📖 日记'};
const BC={core:'b-core',daily:'b-daily',diary:'b-diary'};
const TC={'工作':'b-work','生活':'b-life','学习':'b-study'};
const MC={happy:'😊',sad:'😢',calm:'😌',excited:'🤩',anxious:'😰'};
const MCLR={happy:'#4ade80',sad:'#60a5fa',calm:'#94a3b8',excited:'#fbbf24',anxious:'#f472b6'};
const TCLR={'工作':'#60a5fa','生活':'#4ade80','学习':'#c4b5fd'};

function moodColor(m){
  if(!m)return null;
  if(MCLR[m])return MCLR[m];
  const s=m.toLowerCase();
  if(/anxious|焦虑|不安|紧张/.test(s))return MCLR.anxious;
  if(/sad|难过|心疼|沉重|grief|悲|哀|失落|wistful|exhaust|frustrat|protect/.test(s))return MCLR.sad;
  if(/excit|激动|兴奋|期待|好奇|充实|温暖/.test(s))return MCLR.excited;
  if(/happy|开心|快乐|愉悦|满足|欣慰|gentle|honest/.test(s))return MCLR.happy;
  if(/calm|平静|稳|清醒|focused|pragmatic/.test(s))return MCLR.calm;
  return MCLR.calm;
}

init();
async function init(){loadStats();loadAll();}

// Tabs
$('tabs').onclick=e=>{const b=e.target.closest('.tab');if(!b)return;$$('.tab').forEach(t=>t.classList.remove('on'));b.classList.add('on');tab=b.dataset.v;loadAll();};

// Search
let st;$('search').oninput=()=>{clearTimeout(st);st=setTimeout(loadAll,300);};

// View toggle
$$('.vb').forEach(b=>b.onclick=()=>{$$('.vb').forEach(x=>x.classList.remove('on'));b.classList.add('on');view=b.dataset.w;$('list-view').style.display=view==='list'?'':'none';$('cal-view').style.display=view==='calendar'?'':'none';if(view==='calendar')loadCal();});

// Modal
$('fab').onclick=()=>openModal();
$('btn-c').onclick=closeModal;
$('modal').onclick=e=>{if(e.target===$('modal'))closeModal();};
$('f-type').onchange=toggleFields;
$('f-layer').onchange=()=>{$('mood-f').classList.toggle('show',$('f-layer').value==='diary');};

function toggleFields(){
  const t=$('f-type').value;
  $('mem-f').classList.toggle('show',t==='memory');
  $('content-f').classList.toggle('show',t==='memory'||t==='todo');
  $('tags-f').classList.toggle('show',t==='memory');
  $('mood-f').classList.toggle('show',t==='memory'&&$('f-layer').value==='diary');
  $('todo-f').classList.toggle('show',t==='todo');
  $('rule-f').classList.toggle('show',t==='rule');
  $('habit-f').classList.toggle('show',t==='habit');
}

function openModal(type,data){
  $('modal').classList.add('show');$('mt').textContent=data?'编辑':'添加';
  $('eid').value=data?data.id:'';
  $('f-type').value=type||'memory';$('f-type').disabled=!!data;
  $('f-layer').value=data?.layer||'daily';
  $('f-title').value=data?.title||'';
  $('f-content').value=data?.content||data?.notes||'';
  $('f-tags').value=data?.tags||'';
  $('f-mood').value=data?.mood||'';
  $('f-start').value=data?.start_time?data.start_time.slice(0,16):'';
  $('f-end').value=data?.end_time?data.end_time.slice(0,16):'';
  $('f-due').value=data?.due_date||'';
  $('f-loc').value=data?.location||'';
  $('f-cat').value=data?.category||'生活';
  $('f-pri').value=data?.priority||'medium';
  $('f-freq').value=data?.freq||'weekly';
  $('f-byday').value=data?.by_day||'';
  $('f-bymd').value=data?.by_monthday||'';
  $('f-rtime').value=data?.time||'';
  $('f-rend').value=data?.end_time_r||data?.end_time||'';
  $('f-rloc').value=data?.location||'';
  $('f-rcat').value=data?.category||'生活';
  $('f-rsd').value=data?.start_date||'';
  $('f-red').value=data?.end_date||'';
  $('f-hfreq').value=data?.freq||'daily';
  $('f-htpd').value=data?.times_per_day||1;
  toggleFields();
}
function closeModal(){$('modal').classList.remove('show');$('f-type').disabled=false;}

// Save
$('btn-s').onclick=async()=>{
  const t=$('f-type').value,id=$('eid').value;
  let url,body;
  if(t==='memory'){
    url=id?A+'/memories/'+id:A+'/memories';
    body={layer:$('f-layer').value,title:$('f-title').value,content:$('f-content').value||null,tags:$('f-tags').value||null,mood:$('f-mood').value||null};
  }else if(t==='todo'){
    url=id?A+'/todos/'+id:A+'/todos';
    body={title:$('f-title').value,notes:$('f-content').value||null,start_time:$('f-start').value||null,end_time:$('f-end').value||null,due_date:$('f-due').value||null,location:$('f-loc').value||null,category:$('f-cat').value,priority:$('f-pri').value};
  }else if(t==='rule'){
    url=id?A+'/rules/'+id:A+'/rules';
    body={title:$('f-title').value,freq:$('f-freq').value,by_day:$('f-byday').value||null,by_monthday:$('f-bymd').value?parseInt($('f-bymd').value):null,time:$('f-rtime').value||null,end_time:$('f-rend').value||null,location:$('f-rloc').value||null,category:$('f-rcat').value,start_date:$('f-rsd').value||null,end_date:$('f-red').value||null};
  }else{
    url=id?A+'/habits/'+id:A+'/habits';
    body={title:$('f-title').value,freq:$('f-hfreq').value,times_per_day:parseInt($('f-htpd').value)||1};
  }
  if(!body.title&&!$('f-title').value)return alert('请输入标题');
  body.title=body.title||$('f-title').value;
  await fetch(url,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  closeModal();loadAll();loadStats();
};

// Load all data based on current tab
async function loadAll(){
  const kw=$('search').value;
  if(tab==='all'){
    const[m,t]=await Promise.all([
      fetch(A+'/memories?limit=30'+(kw?'&keyword='+encodeURIComponent(kw):'')).then(r=>r.json()),
      fetch(A+'/todos?limit=30'+(kw?'&keyword='+encodeURIComponent(kw):'')).then(r=>r.json())
    ]);
    renderList([...m.map(x=>({...x,_t:'memory'})),...t.map(x=>({...x,_t:'todo'}))]);
    loadHabits();
  }else if(['core','daily','diary'].includes(tab)){
    const m=await fetch(A+'/memories?layer='+tab+(kw?'&keyword='+encodeURIComponent(kw):'')).then(r=>r.json());
    renderList(m.map(x=>({...x,_t:'memory'})));
    $('habit-panel').innerHTML='';
  }else if(tab==='todo'){
    const t=await fetch(A+'/todos?limit=50'+(kw?'&keyword='+encodeURIComponent(kw):'')).then(r=>r.json());
    renderList(t.map(x=>({...x,_t:'todo'})));
    $('habit-panel').innerHTML='';
  }else if(tab==='habit'){
    renderList([]);loadHabits();
  }
  if(view==='calendar')loadCal();
}

function renderList(items){
  const el=$('list-view');
  if(!items.length){el.innerHTML='<div class="empty">暂无数据</div>';return;}
items.sort((a,b)=>{
    const ad=(a._t==='todo'&&(a.status==='done'||a.status==='cancelled'))?1:0;
    const bd=(b._t==='todo'&&(b.status==='done'||b.status==='cancelled'))?1:0;
    return ad-bd;
  });
  el.innerHTML=items.map(m=>{
    if(m._t==='memory'){
      const d=m.created_at||'';
      const ds=d?fmtDate(d):'';
      const mood=m.mood?MC[m.mood]||'':'';
      const tags=m.tags?m.tags.split(',').map(t=>'<span>'+esc(t.trim())+'</span>').join(''):'';
      return '<div class="card"><div class="ch"><span class="badge '+(BC[m.layer]||'')+'">'+L[m.layer]+'</span><span style="font-size:12px;color:var(--tx2)">'+ds+'</span></div>'
        +'<div class="ct">'+esc(m.title)+(mood?' '+mood:'')+'</div>'
        +(m.content?'<div class="cc">'+esc(m.content).slice(0,300)+'</div>':'')
        +(tags?'<div class="tg">'+tags+'</div>':'')
        +'<div class="ca"><button class="bs" onclick="editMem('+m.id+')">编辑</button><button class="bs del" onclick="delMem('+m.id+')">删除</button></div></div>';
    }else{
      const d=m.start_time||m.due_date||m.created_at||'';
      const ds=d?fmtDate(d):'';
      const st=m.status;
      const si=st==='done'?'✅':st==='postponed'?'⏩':st==='cancelled'?'❌':'⏳';
      const pi=m.priority==='high'?'🔴':m.priority==='low'?'🟢':'🟡';
return '<div class="card'+(st==='done'||st==='cancelled'?' done':'')+'"><div class="ch"><span class="badge '+(TC[m.category]||'b-life')+'">'+esc(m.category||'生活')+'</span><span style="font-size:12px;color:var(--tx2)">'+ds+'</span></div>'      

        +'<div class="ct">'+si+' '+esc(m.title)+'</div>'
        +(m.notes?'<div class="cc">'+esc(m.notes).slice(0,200)+'</div>':'')
        +'<div class="cm">'+pi+' '+(m.location?'📍'+esc(m.location):'')+(m.rule_id?' 🔁':'')+'</div>'
        +'<div class="ca">'
        +(st==='pending'?'<button class="bs" onclick="doneTodo('+m.id+')">完成</button><button class="bs" onclick="postponeTodo('+m.id+')">推迟</button>':'')
        +'<button class="bs" onclick="editTodo('+m.id+')">编辑</button><button class="bs del" onclick="delTodo('+m.id+')">删除</button></div></div>';
    }
  }).join('');
}

// Habits panel
let habitsData=[];
async function loadHabits(){
  habitsData=await fetch(A+'/habits').then(r=>r.json());
  if(!habitsData.length){$('habit-panel').innerHTML='';return;}
  const td=new Date();
  let html='<div class="hp"><h3>⚡ 习惯追踪</h3>';
  habitsData.forEach(h=>{
    if(!h.active)return;
    const logMap={};
    if(h.log)(h.log).split(',').filter(Boolean).forEach(e=>{const[d,c]=e.split(':');logMap[d]=parseInt(c);});
    html+='<div class="hr"><span class="hn">'+esc(h.title)+'</span><div class="hg">';
    for(let i=6;i>=0;i--){
      const d=new Date(td);d.setDate(d.getDate()-i);
      const ds=d.toISOString().slice(0,10);
      const cnt=logMap[ds]||0;
      const target=h.times_per_day||1;
      let cls='miss';
      if(i===0&&cnt===0)cls='future';
      else if(cnt>=target)cls='full';
      else if(cnt>0)cls='part';
      const label=['日','一','二','三','四','五','六'][d.getDay()];
      html+='<div class="hc '+cls+'" title="'+ds+': '+cnt+'/'+target+'" onclick="checkinHabit('+h.id+')">'+label+'</div>';
    }
    html+='</div></div>';
  });
  html+='<div class="legend"><span><span class="dot-s" style="background:#166534"></span> 完成</span><span><span class="dot-s" style="background:#854d0e"></span> 部分</span><span><span class="dot-s" style="background:#1e1e2e;border:1px solid var(--bd)"></span> 未做</span></div>';
  html+='</div>';
  $('habit-panel').innerHTML=html;
}

// Calendar
async function loadCal(){
  const data=await fetch(A+'/calendar?month='+calM).then(r=>r.json());
  renderCal(data);
}
function renderCal(data){
  const[y,m]=calM.split('-').map(Number);
  const fd=new Date(y,m-1,1).getDay();
  const dim=new Date(y,m,0).getDate();
  const todayS=new Date().toISOString().slice(0,10);
  const dayMap={};
  data.forEach(it=>{if(!it.day)return;if(!dayMap[it.day])dayMap[it.day]=[];dayMap[it.day].push(it);});
  let h='<div class="cal"><div class="cn"><button class="cb" onclick="chgM(-1)">&lt;</button><span style="font-size:15px;font-weight:500;min-width:110px;text-align:center">'+y+'年'+m+'月</span><button class="cb" onclick="chgM(1)">&gt;</button></div><div class="cg">';
  ['日','一','二','三','四','五','六'].forEach(d=>h+='<div class="cdh">'+d+'</div>');
  for(let i=0;i<fd;i++)h+='<div class="cd empty"></div>';
  for(let d=1;d<=dim;d++){
    const ds=calM+'-'+String(d).padStart(2,'0');
    const isT=ds===todayS;
    const items=dayMap[ds]||[];
    let dots='';
    if(items.length){dots='<div class="dots">';items.slice(0,4).forEach(it=>{
let clr=it.mood?(moodColor(it.mood)||'#94a3b8'):TCLR[it.category]||'#4ade80';
      dots+='<div class="dot-s" style="background:'+clr+'"></div>';
    });dots+='</div>';}
    h+='<div class="cd'+(isT?' today':'')+'" onclick="selDay(\\''+ds+'\\')">'+d+dots+'</div>';
  }
  h+='</div><div class="legend"><span><span class="dot-s" style="background:#4ade80"></span> happy/生活</span><span><span class="dot-s" style="background:#60a5fa"></span> sad/工作</span><span><span class="dot-s" style="background:#c4b5fd"></span> 学习</span><span><span class="dot-s" style="background:#94a3b8"></span> calm</span><span><span class="dot-s" style="background:#fbbf24"></span> excited</span></div></div><div id="day-detail"></div>';
  $('cal-view').innerHTML=h;
}
window.chgM=function(delta){const[y,m]=calM.split('-').map(Number);const d=new Date(y,m-1+delta,1);calM=d.toISOString().slice(0,7);loadCal();};
window.selDay=async function(day){
  const[m,t]=await Promise.all([
    fetch(A+'/memories?limit=20').then(r=>r.json()).then(arr=>arr.filter(x=>x.created_at&&x.created_at.startsWith(day))),
    fetch(A+'/todos?date='+day).then(r=>r.json())
  ]);
  const el=$('day-detail');
  const items=[...m,...t];
  if(!items.length){el.innerHTML='<div class="empty">这天没有记录</div>';return;}
  el.innerHTML=items.map(x=>{
    const badge=x.layer?'<span class="badge '+(BC[x.layer]||'')+'">'+L[x.layer]+'</span>':'<span class="badge '+(TC[x.category]||'b-life')+'">'+esc(x.category||'待办')+'</span>';
    return '<div class="card"><div class="ch">'+badge+'</div><div class="ct">'+esc(x.title)+'</div>'+(x.content||x.notes?'<div class="cc">'+esc(x.content||x.notes).slice(0,300)+'</div>':'')+'</div>';
  }).join('');
};

// Actions
window.editMem=async id=>{const m=await fetch(A+'/memories?limit=100').then(r=>r.json());const x=m.find(i=>i.id===id);if(x)openModal('memory',x);};
window.delMem=async id=>{if(!confirm('确定删除？'))return;await fetch(A+'/memories/'+id,{method:'DELETE'});loadAll();loadStats();};
window.editTodo=async id=>{const t=await fetch(A+'/todos?limit=100').then(r=>r.json());const x=t.find(i=>i.id===id);if(x)openModal('todo',x);};
window.delTodo=async id=>{if(!confirm('确定删除？'))return;await fetch(A+'/todos/'+id,{method:'DELETE'});loadAll();loadStats();};
window.doneTodo=async id=>{await fetch(A+'/todos/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'done'})});loadAll();};
window.postponeTodo=async id=>{
  const d=prompt('推迟到哪天？(YYYY-MM-DD)');if(!d)return;
  await fetch(A+'/todos/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'postponed',postponed_to:d})});
  loadAll();
};
window.checkinHabit=async id=>{await fetch(A+'/habits/'+id+'/checkin',{method:'POST'});loadHabits();};

async function loadStats(){
  const s=await fetch(A+'/stats').then(r=>r.json());
  const tk=Math.round((s.chars||0)/2);
  $('stats').textContent=(s.total_memories||0)+' 条记忆 · '+(s.chars||0)+' 字 · ≈'+tk+' tokens';
}

// Helpers
function $(id){return document.getElementById(id);}
function $$(sel){return document.querySelectorAll(sel);}
function esc(s){if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function fmtDate(s){try{const d=new Date(s.includes('T')?s:s+'T00:00:00');return d.toLocaleDateString('zh-CN',{month:'short',day:'numeric'})+(s.includes('T')&&s.includes(':')?' '+d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}):'');}catch(e){return s;}}
</script>
</body>
</html>`;
