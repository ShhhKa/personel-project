import { FRONTEND_HTML } from "./frontend";

type Env = { DB: D1Database; AUTH_TOKEN: string };

function strip(obj: any) {
  const r: any = {};
  for (const [k, v] of Object.entries(obj)) if (v !== null && v !== undefined && v !== "") r[k] = v;
  return r;
}
function today() { return new Date().toISOString().slice(0, 10); }
function now() { return new Date().toISOString(); }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

const TOOLS = [
  {
    name: "read",
    description: "读记忆库。type: memory(记忆,layer:core永久/daily5天过期/diary日记) | todo(待办,含日程和任务) | rule(循环规则) | habit(习惯)。可选筛选: keyword, date_from/date_to(YYYY-MM-DD), layer, category(工作/生活/学习), status(pending/done/postponed/cancelled)。",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["memory","todo","rule","habit"], description: "数据类型" },
        layer: { type: "string", description: "memory专用:core/daily/diary" },
        keyword: { type: "string", description: "搜索标题和内容" },
        date_from: { type: "string", description: "起始YYYY-MM-DD" },
        date_to: { type: "string", description: "截止YYYY-MM-DD" },
        category: { type: "string", description: "todo分类:工作/生活/学习" },
        status: { type: "string", description: "todo状态:pending/done/postponed/cancelled" },
        limit: { type: "number", description: "数量上限,默认20" },
      },
      required: ["type"],
    },
  },
  {
    name: "write",
    description: "写记忆库。type: memory|todo|rule|habit。传id更新,不传创建。memory三层规范——core(永久):仅存用户身份、偏好、重要规则、核心目标,不存具体事件或会过时的信息,极少写入; daily(5天过期):近期事件、对话摘要、临时上下文,不存长期信息→core、带感情日记→diary、待办→todo; diary(永久):每天≤1篇带感情的个人记录,需传mood,不存流水账→daily。todo推迟: status=postponed+postponed_to时自动创建新pending。habit打卡: 传checkin=true追加今日记录到log。",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["memory","todo","rule","habit"], description: "数据类型" },
        id: { type: "number", description: "传入则更新" },
        layer: { type: "string", enum: ["core","daily","diary"] },
        title: { type: "string" }, content: { type: "string" }, tags: { type: "string" },
        mood: { type: "string" }, meta: { type: "string" }, notes: { type: "string" },
        start_time: { type: "string" }, end_time: { type: "string" }, due_date: { type: "string" },
        location: { type: "string" }, category: { type: "string" },
        priority: { type: "string", enum: ["high","medium","low"] },
        status: { type: "string", enum: ["pending","done","postponed","cancelled"] },
        postponed_to: { type: "string" },
        freq: { type: "string", enum: ["daily","weekly","monthly","yearly"] },
        interval_val: { type: "number" }, by_day: { type: "string" }, by_monthday: { type: "number" },
        time: { type: "string" }, start_date: { type: "string" }, end_date: { type: "string" },
        active: { type: "number" }, times_per_day: { type: "number" },
        checkin: { type: "boolean", description: "习惯打卡" },
      },
      required: ["type"],
    },
  },
  {
    name: "delete",
    description: "删除记忆库记录。传id+type删单条。或type=memory+layer=daily+days=5批量清理过期。",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["memory","todo","rule","habit"], description: "数据类型" },
        id: { type: "number", description: "记录ID" },
        layer: { type: "string", description: "批量清理的层" },
        days: { type: "number", description: "清理N天前的记录" },
      },
      required: ["type"],
    },
  },
];

async function handleRead(db: D1Database, args: any): Promise<string> {
  const { type, layer, keyword, date_from, date_to, category, status, limit } = args;
  let sql = ""; const p: any[] = [];
  if (type === "memory") {
    sql = "SELECT id,layer,title,content,tags,mood,meta,created_at FROM memories WHERE 1=1";
    if (layer) { sql += " AND layer=?"; p.push(layer); }
    if (keyword) { sql += " AND (title LIKE ? OR content LIKE ?)"; p.push("%"+keyword+"%", "%"+keyword+"%"); }
    if (date_from) { sql += " AND created_at>=?"; p.push(date_from); }
    if (date_to) { sql += " AND created_at<=?"; p.push(date_to + "T23:59:59"); }
    sql += " ORDER BY CASE layer WHEN 'core' THEN 0 WHEN 'diary' THEN 1 ELSE 2 END, created_at DESC LIMIT ?";
  } else if (type === "todo") {
    sql = "SELECT id,title,notes,start_time,end_time,due_date,location,category,priority,status,postponed_to,rule_id,created_at FROM todos WHERE 1=1";
    if (keyword) { sql += " AND (title LIKE ? OR notes LIKE ?)"; p.push("%"+keyword+"%", "%"+keyword+"%"); }
    if (category) { sql += " AND category=?"; p.push(category); }
    if (status) { sql += " AND status=?"; p.push(status); }
    if (date_from) { sql += " AND (start_time>=? OR due_date>=?)"; p.push(date_from, date_from); }
    if (date_to) { sql += " AND (start_time<=? OR due_date<=?)"; p.push(date_to+"T23:59:59", date_to); }
    sql += " ORDER BY COALESCE(start_time,due_date,created_at) ASC LIMIT ?";
  } else if (type === "rule") {
    sql = "SELECT * FROM recurrence_rules WHERE active=1 ORDER BY created_at DESC LIMIT ?";
  } else {
    sql = "SELECT * FROM habits WHERE active=1 ORDER BY created_at DESC LIMIT ?";
  }
  p.push(limit || 20);
  const r = await db.prepare(sql).bind(...p).all();
  const rows = (r.results || []).map(strip);
  return rows.length ? JSON.stringify(rows) : "无匹配结果";
}

async function handleWrite(db: D1Database, d: any): Promise<string> {
  const n = now(); let id = d.id;
  if (d.type === "memory") {
    if (id) {
      await db.prepare("UPDATE memories SET layer=COALESCE(?,layer),title=COALESCE(?,title),content=COALESCE(?,content),tags=COALESCE(?,tags),mood=COALESCE(?,mood),meta=COALESCE(?,meta),updated_at=? WHERE id=?")
        .bind(d.layer||null, d.title||null, d.content||null, d.tags||null, d.mood||null, d.meta||null, n, id).run();
    } else {
      const r = await db.prepare("INSERT INTO memories(layer,title,content,tags,mood,meta,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)")
        .bind(d.layer||"daily", d.title||"", d.content||null, d.tags||null, d.mood||null, d.meta||null, n, n).run();
      id = r.meta?.last_row_id;
    }
  } else if (d.type === "todo") {
    if (id) {
      if (d.status === "postponed" && d.postponed_to) {
        const old = await db.prepare("SELECT * FROM todos WHERE id=?").bind(id).first();
        await db.prepare("UPDATE todos SET status='postponed',postponed_to=?,updated_at=? WHERE id=?").bind(d.postponed_to, n, id).run();
        const r = await db.prepare("INSERT INTO todos(title,notes,start_time,end_time,due_date,location,category,priority,status,rule_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'pending',?,?,?)")
          .bind(old?.title||d.title, old?.notes||d.notes||null, old?.start_time ? d.postponed_to + (old.start_time as string).slice(10) : null, old?.end_time ? d.postponed_to + (old.end_time as string).slice(10) : null, d.postponed_to, old?.location||d.location||null, old?.category||d.category||"生活", old?.priority||d.priority||"medium", old?.rule_id||null, n, n).run();
        return JSON.stringify({ ok: true, postponed: id, new_id: r.meta?.last_row_id });
      }
      await db.prepare("UPDATE todos SET title=COALESCE(?,title),notes=COALESCE(?,notes),start_time=COALESCE(?,start_time),end_time=COALESCE(?,end_time),due_date=COALESCE(?,due_date),location=COALESCE(?,location),category=COALESCE(?,category),priority=COALESCE(?,priority),status=COALESCE(?,status),updated_at=? WHERE id=?")
        .bind(d.title||null, d.notes||null, d.start_time||null, d.end_time||null, d.due_date||null, d.location||null, d.category||null, d.priority||null, d.status||null, n, id).run();
    } else {
      const r = await db.prepare("INSERT INTO todos(title,notes,start_time,end_time,due_date,location,category,priority,status,rule_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'pending',?,?,?)")
        .bind(d.title||"", d.notes||null, d.start_time||null, d.end_time||null, d.due_date||null, d.location||null, d.category||"生活", d.priority||"medium", null, n, n).run();
      id = r.meta?.last_row_id;
    }
  } else if (d.type === "rule") {
    if (id) {
      await db.prepare("UPDATE recurrence_rules SET title=COALESCE(?,title),freq=COALESCE(?,freq),interval_val=COALESCE(?,interval_val),by_day=COALESCE(?,by_day),by_monthday=COALESCE(?,by_monthday),time=COALESCE(?,time),end_time=COALESCE(?,end_time),location=COALESCE(?,location),category=COALESCE(?,category),priority=COALESCE(?,priority),start_date=COALESCE(?,start_date),end_date=COALESCE(?,end_date),active=COALESCE(?,active) WHERE id=?")
        .bind(d.title||null, d.freq||null, d.interval_val||null, d.by_day||null, d.by_monthday||null, d.time||null, d.end_time||null, d.location||null, d.category||null, d.priority||null, d.start_date||null, d.end_date||null, d.active??null, id).run();
    } else {
      const r = await db.prepare("INSERT INTO recurrence_rules(title,freq,interval_val,by_day,by_monthday,time,end_time,location,category,priority,start_date,end_date,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,?)")
        .bind(d.title||"", d.freq||"weekly", d.interval_val||1, d.by_day||null, d.by_monthday||null, d.time||null, d.end_time||null, d.location||null, d.category||"生活", d.priority||"medium", d.start_date||today(), d.end_date||null, n).run();
      id = r.meta?.last_row_id;
    }
  } else {
    if (d.checkin && d.id) {
      const h = await db.prepare("SELECT log,times_per_day FROM habits WHERE id=?").bind(d.id).first();
      if (!h) return JSON.stringify({ error: "习惯不存在" });
      const td = today(); let log = (h.log as string) || "";
      const entries = log ? log.split(",") : [];
      const idx = entries.findIndex(e => e.startsWith(td + ":"));
      if (idx >= 0) { entries[idx] = td+":"+(parseInt(entries[idx].split(":")[1])+1); }
      else { entries.push(td+":1"); }
      await db.prepare("UPDATE habits SET log=? WHERE id=?").bind(entries.join(","), d.id).run();
      id = d.id;
    } else if (id) {
      await db.prepare("UPDATE habits SET title=COALESCE(?,title),freq=COALESCE(?,freq),times_per_day=COALESCE(?,times_per_day),active=COALESCE(?,active) WHERE id=?")
        .bind(d.title||null, d.freq||null, d.times_per_day||null, d.active??null, id).run();
    } else {
      const r = await db.prepare("INSERT INTO habits(title,freq,times_per_day,log,active,created_at) VALUES(?,?,?,'',1,?)")
        .bind(d.title||"", d.freq||"daily", d.times_per_day||1, n).run();
      id = r.meta?.last_row_id;
    }
  }
  return JSON.stringify({ ok: true, id });
}

async function handleDelete(db: D1Database, args: any): Promise<string> {
  const { type, id, layer, days } = args;
  if (id) {
    const table: Record<string,string> = { memory:"memories", todo:"todos", rule:"recurrence_rules", habit:"habits" };
    await db.prepare("DELETE FROM "+(table[type]||"memories")+" WHERE id=?").bind(id).run();
    return JSON.stringify({ ok: true, deleted: id });
  } else if (type === "memory" && layer && days) {
const r = await db.prepare("DELETE FROM memories WHERE layer=? AND datetime(created_at)<datetime('now',?)").bind(layer, "-"+days+" days").run();
    return JSON.stringify({ ok: true, layer, cleaned: r.meta?.changes || 0 });
  }
  return JSON.stringify({ error: "需要id或layer+days" });
}

async function handleMCP(req: Request, env: Env): Promise<Response> {
  const H = { "Content-Type": "application/json", ...CORS };
  if (req.method === "GET") return new Response(JSON.stringify({ jsonrpc:"2.0", result:{ protocolVersion:"2024-11-05", serverInfo:{ name:"memory-hub", version:"3.0.0" }}}), { headers: H });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: H });
  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ jsonrpc:"2.0", error:{ code:-32700, message:"Parse error" }, id:null }), { status:400, headers:H }); }
  const { method, id, params } = body;
  try {
    if (method === "initialize") return new Response(JSON.stringify({ jsonrpc:"2.0", id, result:{ protocolVersion:"2024-11-05", capabilities:{ tools:{} }, serverInfo:{ name:"memory-hub", version:"3.0.0" }}}), { headers:H });
    if (method?.startsWith("notifications/")) return new Response(JSON.stringify({ jsonrpc:"2.0", id, result:{} }), { headers:H });
    if (method === "tools/list") return new Response(JSON.stringify({ jsonrpc:"2.0", id, result:{ tools: TOOLS }}), { headers:H });
    if (method === "tools/call") {
      const toolName = params?.name; const args = params?.arguments || {};
      let text: string;
      try {
        if (toolName === "read") text = await handleRead(env.DB, args);
        else if (toolName === "write") text = await handleWrite(env.DB, args);
        else if (toolName === "delete") text = await handleDelete(env.DB, args);
        else text = JSON.stringify({ error: "未知工具: "+toolName });
      } catch (e: any) { text = JSON.stringify({ error: e.message }); }
      return new Response(JSON.stringify({ jsonrpc:"2.0", id, result:{ content:[{ type:"text", text }]}}), { headers:H });
    }
    return new Response(JSON.stringify({ jsonrpc:"2.0", id, error:{ code:-32601, message:"Unknown method: "+method }}), { headers:H });
  } catch (e: any) {
    return new Response(JSON.stringify({ jsonrpc:"2.0", id, error:{ code:-32603, message:e.message }}), { status:500, headers:H });
  }
}

async function handleAPI(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url); const path = url.pathname; const method = req.method; const db = env.DB;
  if (method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    if (path === "/api/memories" && method === "GET") {
      const layer = url.searchParams.get("layer"); const keyword = url.searchParams.get("keyword"); const limit = parseInt(url.searchParams.get("limit")||"50");
      let sql = "SELECT * FROM memories WHERE 1=1"; const p: any[] = [];
      if (layer) { sql += " AND layer=?"; p.push(layer); }
      if (keyword) { sql += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)"; p.push("%"+keyword+"%","%"+keyword+"%","%"+keyword+"%"); }
      sql += " ORDER BY CASE layer WHEN 'core' THEN 0 WHEN 'diary' THEN 1 ELSE 2 END, created_at DESC LIMIT ?"; p.push(limit);
      return Response.json((await db.prepare(sql).bind(...p).all()).results||[], { headers: CORS });
    }
    if (path === "/api/memories" && method === "POST") {
      const d: any = await req.json(); const n = now();
      const r = await db.prepare("INSERT INTO memories(layer,title,content,tags,mood,meta,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").bind(d.layer||"daily",d.title,d.content||null,d.tags||null,d.mood||null,d.meta||null,n,n).run();
      return Response.json({ ok:true, id:r.meta?.last_row_id }, { headers: CORS });
    }
    if (path.match(/^\/api\/memories\/\d+$/) && method === "PUT") {
      const xid = parseInt(path.split("/").pop()!); const d: any = await req.json(); const n = now();
      await db.prepare("UPDATE memories SET layer=?,title=?,content=?,tags=?,mood=?,meta=?,updated_at=? WHERE id=?").bind(d.layer,d.title,d.content||null,d.tags||null,d.mood||null,d.meta||null,n,xid).run();
      return Response.json({ ok:true, id:xid }, { headers: CORS });
    }
    if (path.match(/^\/api\/memories\/\d+$/) && method === "DELETE") {
      await db.prepare("DELETE FROM memories WHERE id=?").bind(parseInt(path.split("/").pop()!)).run();
      return Response.json({ ok:true }, { headers: CORS });
    }
    if (path === "/api/todos" && method === "GET") {
      const cat=url.searchParams.get("category"); const st=url.searchParams.get("status"); const date=url.searchParams.get("date"); const month=url.searchParams.get("month"); const kw=url.searchParams.get("keyword"); const limit=parseInt(url.searchParams.get("limit")||"50");
      let sql = "SELECT * FROM todos WHERE 1=1"; const p: any[] = [];
      if (cat) { sql+=" AND category=?"; p.push(cat); } if (st) { sql+=" AND status=?"; p.push(st); }
      if (kw) { sql+=" AND (title LIKE ? OR notes LIKE ?)"; p.push("%"+kw+"%","%"+kw+"%"); }
      if (date) { sql+=" AND (date(start_time)=? OR due_date=?)"; p.push(date,date); }
      if (month) { sql+=" AND (strftime('%Y-%m',start_time)=? OR strftime('%Y-%m',due_date)=?)"; p.push(month,month); }
      sql+=" ORDER BY COALESCE(start_time,due_date,created_at) ASC LIMIT ?"; p.push(limit);
      return Response.json((await db.prepare(sql).bind(...p).all()).results||[], { headers: CORS });
    }
    if (path === "/api/todos" && method === "POST") {
      const d: any = await req.json(); const n = now();
      const r = await db.prepare("INSERT INTO todos(title,notes,start_time,end_time,due_date,location,category,priority,status,rule_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'pending',?,?,?)").bind(d.title,d.notes||null,d.start_time||null,d.end_time||null,d.due_date||null,d.location||null,d.category||"生活",d.priority||"medium",d.rule_id||null,n,n).run();
      return Response.json({ ok:true, id:r.meta?.last_row_id }, { headers: CORS });
    }
    if (path.match(/^\/api\/todos\/\d+$/) && method === "PUT") {
      const xid=parseInt(path.split("/").pop()!); const d: any = await req.json(); const n = now();
      if (d.status==="postponed"&&d.postponed_to) {
        const old = await db.prepare("SELECT * FROM todos WHERE id=?").bind(xid).first();
        await db.prepare("UPDATE todos SET status='postponed',postponed_to=?,updated_at=? WHERE id=?").bind(d.postponed_to,n,xid).run();
        const r = await db.prepare("INSERT INTO todos(title,notes,start_time,end_time,due_date,location,category,priority,status,rule_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'pending',?,?,?)").bind(old?.title,old?.notes||null,old?.start_time?d.postponed_to+(old.start_time as string).slice(10):null,old?.end_time?d.postponed_to+(old.end_time as string).slice(10):null,d.postponed_to,old?.location||null,old?.category||"生活",old?.priority||"medium",old?.rule_id||null,n,n).run();
        return Response.json({ ok:true, postponed:xid, new_id:r.meta?.last_row_id }, { headers: CORS });
      }
      await db.prepare("UPDATE todos SET title=COALESCE(?,title),notes=COALESCE(?,notes),start_time=COALESCE(?,start_time),end_time=COALESCE(?,end_time),due_date=COALESCE(?,due_date),location=COALESCE(?,location),category=COALESCE(?,category),priority=COALESCE(?,priority),status=COALESCE(?,status),updated_at=? WHERE id=?").bind(d.title||null,d.notes||null,d.start_time||null,d.end_time||null,d.due_date||null,d.location||null,d.category||null,d.priority||null,d.status||null,n,xid).run();
      return Response.json({ ok:true, id:xid }, { headers: CORS });
    }
    if (path.match(/^\/api\/todos\/\d+$/) && method === "DELETE") {
      await db.prepare("DELETE FROM todos WHERE id=?").bind(parseInt(path.split("/").pop()!)).run();
      return Response.json({ ok:true }, { headers: CORS });
    }
    if (path === "/api/rules" && method === "GET") { return Response.json((await db.prepare("SELECT * FROM recurrence_rules ORDER BY active DESC,created_at DESC").all()).results||[], { headers: CORS }); }
    if (path === "/api/rules" && method === "POST") {
      const d: any = await req.json(); const n = now();
      const r = await db.prepare("INSERT INTO recurrence_rules(title,freq,interval_val,by_day,by_monthday,time,end_time,location,category,priority,start_date,end_date,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,?)").bind(d.title,d.freq,d.interval_val||1,d.by_day||null,d.by_monthday||null,d.time||null,d.end_time||null,d.location||null,d.category||"生活",d.priority||"medium",d.start_date||today(),d.end_date||null,n).run();
      return Response.json({ ok:true, id:r.meta?.last_row_id }, { headers: CORS });
    }
    if (path.match(/^\/api\/rules\/\d+$/) && method === "PUT") {
      const xid=parseInt(path.split("/").pop()!); const d: any = await req.json();
      await db.prepare("UPDATE recurrence_rules SET title=?,freq=?,interval_val=?,by_day=?,by_monthday=?,time=?,end_time=?,location=?,category=?,priority=?,start_date=?,end_date=?,active=? WHERE id=?").bind(d.title,d.freq,d.interval_val||1,d.by_day||null,d.by_monthday||null,d.time||null,d.end_time||null,d.location||null,d.category||"生活",d.priority||"medium",d.start_date||null,d.end_date||null,d.active??1,xid).run();
      return Response.json({ ok:true, id:xid }, { headers: CORS });
    }
    if (path.match(/^\/api\/rules\/\d+$/) && method === "DELETE") { await db.prepare("DELETE FROM recurrence_rules WHERE id=?").bind(parseInt(path.split("/").pop()!)).run(); return Response.json({ ok:true }, { headers: CORS }); }
    if (path === "/api/habits" && method === "GET") { return Response.json((await db.prepare("SELECT * FROM habits ORDER BY active DESC,created_at DESC").all()).results||[], { headers: CORS }); }
    if (path === "/api/habits" && method === "POST") {
      const d: any = await req.json();
      const r = await db.prepare("INSERT INTO habits(title,freq,times_per_day,log,active,created_at) VALUES(?,?,?,'',1,?)").bind(d.title,d.freq||"daily",d.times_per_day||1,now()).run();
      return Response.json({ ok:true, id:r.meta?.last_row_id }, { headers: CORS });
    }
    if (path.match(/^\/api\/habits\/\d+\/checkin$/) && method === "POST") {
      const xid=parseInt(path.split("/")[3]);
      const h = await db.prepare("SELECT log,times_per_day FROM habits WHERE id=?").bind(xid).first();
      if (!h) return Response.json({ error:"not found" }, { status:404, headers: CORS });
      const td=today(); let log=(h.log as string)||""; const entries=log?log.split(","):[];
      const idx=entries.findIndex(e=>e.startsWith(td+":"));
      if (idx>=0) { entries[idx]=td+":"+(parseInt(entries[idx].split(":")[1])+1); } else { entries.push(td+":1"); }
      await db.prepare("UPDATE habits SET log=? WHERE id=?").bind(entries.join(","),xid).run();
      return Response.json({ ok:true, id:xid }, { headers: CORS });
    }
    if (path.match(/^\/api\/habits\/\d+$/) && method === "PUT") {
      const xid=parseInt(path.split("/").pop()!); const d: any = await req.json();
      await db.prepare("UPDATE habits SET title=?,freq=?,times_per_day=?,active=? WHERE id=?").bind(d.title,d.freq||"daily",d.times_per_day||1,d.active??1,xid).run();
      return Response.json({ ok:true, id:xid }, { headers: CORS });
    }
    if (path.match(/^\/api\/habits\/\d+$/) && method === "DELETE") { await db.prepare("DELETE FROM habits WHERE id=?").bind(parseInt(path.split("/").pop()!)).run(); return Response.json({ ok:true }, { headers: CORS }); }
    if (path === "/api/calendar" && method === "GET") {
      const month=url.searchParams.get("month")||now().slice(0,7);
      const diaries = await db.prepare("SELECT id,'diary' as type,title,mood,date(created_at) as day FROM memories WHERE layer='diary' AND strftime('%Y-%m',created_at)=? ORDER BY day").bind(month).all();
      const todos_r = await db.prepare("SELECT id,'todo' as type,title,category,status,date(COALESCE(start_time,due_date)) as day FROM todos WHERE (strftime('%Y-%m',start_time)=? OR strftime('%Y-%m',due_date)=?) ORDER BY day").bind(month,month).all();
      return Response.json([...(diaries.results||[]),...(todos_r.results||[])], { headers: CORS });
    }
    if (path === "/api/stats" && method === "GET") {
      const mem = await db.prepare("SELECT layer,COUNT(*) as count FROM memories GROUP BY layer").all();
      const todoStats = await db.prepare("SELECT status,COUNT(*) as count FROM todos GROUP BY status").all();
      const habitCount = await db.prepare("SELECT COUNT(*) as count FROM habits WHERE active=1").first();
      const ruleCount = await db.prepare("SELECT COUNT(*) as count FROM recurrence_rules WHERE active=1").first();
      const total = await db.prepare("SELECT COUNT(*) as total, SUM(LENGTH(title)+COALESCE(LENGTH(content),0)) as chars FROM memories").first();
      return Response.json({ memories:mem.results, todos:todoStats.results, habits:habitCount?.count||0, rules:ruleCount?.count||0, total_memories:total?.total||0, chars:total?.chars||0 }, { headers: CORS });
    }
    if (path === "/api/export" && method === "GET") {
      const from=url.searchParams.get("from"); const to=url.searchParams.get("to");
      let memSql="SELECT * FROM memories"; let todoSql="SELECT * FROM todos"; const memP: any[]=[]; const todoP: any[]=[];
      if (from) { memSql+=" WHERE created_at>=?"; todoSql+=" WHERE created_at>=?"; memP.push(from); todoP.push(from); }
      if (to) { memSql+=(from?" AND":" WHERE")+" created_at<=?"; todoSql+=(from?" AND":" WHERE")+" created_at<=?"; memP.push(to+"T23:59:59"); todoP.push(to+"T23:59:59"); }
      const memories=await db.prepare(memSql).bind(...memP).all(); const todos_e=await db.prepare(todoSql).bind(...todoP).all();
      const rules=await db.prepare("SELECT * FROM recurrence_rules").all(); const habits=await db.prepare("SELECT * FROM habits").all();
      return new Response(JSON.stringify({ exported_at:now(), memories:memories.results, todos:todos_e.results, recurrence_rules:rules.results, habits:habits.results },null,2), {
        headers: { ...CORS, "Content-Type":"application/json", "Content-Disposition":"attachment; filename=\"memory-export-"+today()+".json\"" }
      });
    }
    return Response.json({ error:"Not found" }, { status:404, headers: CORS });
  } catch (e: any) { return Response.json({ error:e.message }, { status:500, headers: CORS }); }
}

const DAY_MAP: Record<string,number> = { sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6 };

async function generateRecurrences(db: D1Database) {
  const rules = await db.prepare("SELECT * FROM recurrence_rules WHERE active=1").all();
  const td = new Date();
  for (const rule of (rules.results||[]) as any[]) {
    for (let offset=0; offset<7; offset++) {
      const d=new Date(td); d.setDate(d.getDate()+offset);
      const ds=d.toISOString().slice(0,10); const dow=d.getDay();
      if (rule.start_date && ds<rule.start_date) continue;
      if (rule.end_date && ds>rule.end_date) continue;
      let match=false;
      if (rule.freq==="daily") match=true;
      else if (rule.freq==="weekly"&&rule.by_day) { match=(rule.by_day as string).split(",").map(s=>DAY_MAP[s.trim().toLowerCase()]).includes(dow); }
      else if (rule.freq==="monthly"&&rule.by_monthday) match=d.getDate()===rule.by_monthday;
      else if (rule.freq==="yearly") { const sd=rule.start_date as string; match=sd?ds.slice(5)===sd.slice(5):false; }
      if (match&&rule.interval_val>1&&rule.start_date) {
        const diffDays=Math.floor((d.getTime()-new Date(rule.start_date).getTime())/86400000);
        if (rule.freq==="daily") match=diffDays%rule.interval_val===0;
        else if (rule.freq==="weekly") match=Math.floor(diffDays/7)%rule.interval_val===0;
      }
      if (!match) continue;
      if (await db.prepare("SELECT id FROM todos WHERE rule_id=? AND date(COALESCE(start_time,due_date))=?").bind(rule.id,ds).first()) continue;
      const st=rule.time?ds+"T"+rule.time+":00":null; const et=rule.end_time?ds+"T"+rule.end_time+":00":null; const n=now();
      await db.prepare("INSERT INTO todos(title,start_time,end_time,due_date,location,category,priority,status,rule_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'pending',?,?,?)")
        .bind(rule.title,st,et,st?null:ds,rule.location||null,rule.category||"生活",rule.priority||"medium",rule.id,n,n).run();
    }
  }
}

function checkAuth(req: Request, env: Env): boolean {
  if (!env.AUTH_TOKEN) return true;
  const url = new URL(req.url);
  const t=url.searchParams.get("token")||req.headers.get("Authorization")?.replace("Bearer ","");
  return t===env.AUTH_TOKEN;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(req.url);
    if (req.method==="OPTIONS") return new Response(null, { headers: CORS });
    if (url.pathname==="/"||url.pathname==="/index.html") return new Response(FRONTEND_HTML, { headers:{ "Content-Type":"text/html; charset=utf-8" }});
    if (url.pathname.startsWith("/api/")) { if (!checkAuth(req,env)) return new Response("Unauthorized",{status:401}); return handleAPI(req,env); }
    if (url.pathname==="/mcp"||url.pathname.startsWith("/mcp/")) { if (!checkAuth(req,env)) return new Response("Unauthorized",{status:401}); return handleMCP(req,env); }
    return new Response("Not found", { status:404 });
  },
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
await env.DB.prepare("DELETE FROM memories WHERE layer='daily' AND datetime(created_at)<datetime('now','-5 days')").run();
    await generateRecurrences(env.DB);
  },
};
