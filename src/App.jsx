import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase, signOut, getMeals, addMeal, deleteMeal, clearMeals,
  getMealsHistory, getGoals, upsertGoals, getProfile, upsertProfile,
  getWeightLog, addWeight, savePlan, getLatestPlan } from './lib/supabase'
import Auth from './components/Auth'

// ─── FOOD DATABASE ────────────────────────────────────────────────────────────
const FOOD_DB = {
  "pollo a la plancha":    { cal:165, prot:31,  carbs:0,    fat:3.6,  fiber:0   },
  "pechuga de pollo":      { cal:165, prot:31,  carbs:0,    fat:3.6,  fiber:0   },
  "muslo de pollo":        { cal:209, prot:26,  carbs:0,    fat:11,   fiber:0   },
  "atún en agua":          { cal:116, prot:26,  carbs:0,    fat:1,    fiber:0   },
  "salmón":                { cal:208, prot:20,  carbs:0,    fat:13,   fiber:0   },
  "tilapia":               { cal:96,  prot:20,  carbs:0,    fat:2,    fiber:0   },
  "sardinas en agua":      { cal:135, prot:20,  carbs:0,    fat:5,    fiber:0   },
  "camarones":             { cal:99,  prot:24,  carbs:0.2,  fat:0.3,  fiber:0   },
  "huevo entero":          { cal:155, prot:13,  carbs:1.1,  fat:11,   fiber:0   },
  "clara de huevo":        { cal:52,  prot:11,  carbs:0.7,  fat:0.2,  fiber:0   },
  "carne molida 90%":      { cal:176, prot:20,  carbs:0,    fat:10,   fiber:0   },
  "bistec de res":         { cal:187, prot:26,  carbs:0,    fat:9,    fiber:0   },
  "res magra":             { cal:158, prot:26,  carbs:0,    fat:5.4,  fiber:0   },
  "cerdo lomo":            { cal:143, prot:26,  carbs:0,    fat:4,    fiber:0   },
  "pavo molido":           { cal:149, prot:21,  carbs:0,    fat:7,    fiber:0   },
  "proteína whey":         { cal:120, prot:24,  carbs:3,    fat:1.5,  fiber:0   },
  "yogur griego 0%":       { cal:59,  prot:10,  carbs:3.6,  fat:0.4,  fiber:0   },
  "yogur griego":          { cal:100, prot:9,   carbs:3.6,  fat:5,    fiber:0   },
  "requesón":              { cal:98,  prot:11,  carbs:3.4,  fat:4.3,  fiber:0   },
  "leche descremada":      { cal:34,  prot:3.4, carbs:4.9,  fat:0.1,  fiber:0   },
  "queso mozzarella":      { cal:280, prot:28,  carbs:2.2,  fat:17,   fiber:0   },
  "tofu":                  { cal:76,  prot:8,   carbs:1.9,  fat:4.8,  fiber:0.3 },
  "arroz blanco cocido":   { cal:130, prot:2.7, carbs:28,   fat:0.3,  fiber:0.4 },
  "arroz integral cocido": { cal:111, prot:2.6, carbs:23,   fat:0.9,  fiber:1.8 },
  "avena":                 { cal:389, prot:17,  carbs:66,   fat:7,    fiber:10  },
  "papa cocida":           { cal:86,  prot:1.9, carbs:20,   fat:0.1,  fiber:1.8 },
  "batata cocida":         { cal:86,  prot:1.6, carbs:20,   fat:0.1,  fiber:3   },
  "pasta cocida":          { cal:158, prot:5.8, carbs:31,   fat:0.9,  fiber:1.8 },
  "pan integral":          { cal:247, prot:13,  carbs:41,   fat:4.2,  fiber:7   },
  "quinoa cocida":         { cal:120, prot:4.4, carbs:21,   fat:1.9,  fiber:2.8 },
  "arepa maíz":            { cal:209, prot:3.5, carbs:42,   fat:2.5,  fiber:1.8 },
  "plátano maduro":        { cal:89,  prot:1.1, carbs:23,   fat:0.3,  fiber:2.6 },
  "plátano verde cocido":  { cal:116, prot:1.5, carbs:31,   fat:0.2,  fiber:2.3 },
  "manzana":               { cal:52,  prot:0.3, carbs:14,   fat:0.2,  fiber:2.4 },
  "banano":                { cal:89,  prot:1.1, carbs:23,   fat:0.3,  fiber:2.6 },
  "mango":                 { cal:60,  prot:0.8, carbs:15,   fat:0.4,  fiber:1.6 },
  "lentejas cocidas":      { cal:116, prot:9,   carbs:20,   fat:0.4,  fiber:7.9 },
  "frijoles negros":       { cal:132, prot:8.9, carbs:24,   fat:0.5,  fiber:8.7 },
  "garbanzos cocidos":     { cal:164, prot:8.9, carbs:27,   fat:2.6,  fiber:7.6 },
  "aguacate":              { cal:160, prot:2,   carbs:9,    fat:15,   fiber:6.7 },
  "aceite de oliva":       { cal:884, prot:0,   carbs:0,    fat:100,  fiber:0   },
  "almendras":             { cal:579, prot:21,  carbs:22,   fat:50,   fiber:12.5},
  "nueces":                { cal:654, prot:15,  carbs:14,   fat:65,   fiber:6.7 },
  "maní":                  { cal:567, prot:26,  carbs:16,   fat:49,   fiber:8.5 },
  "semillas de chía":      { cal:486, prot:17,  carbs:42,   fat:31,   fiber:34  },
  "brócoli":               { cal:34,  prot:2.8, carbs:7,    fat:0.4,  fiber:2.6 },
  "espinaca":              { cal:23,  prot:2.9, carbs:3.6,  fat:0.4,  fiber:2.2 },
  "tomate":                { cal:18,  prot:0.9, carbs:3.9,  fat:0.2,  fiber:1.2 },
  "zanahoria":             { cal:41,  prot:0.9, carbs:10,   fat:0.2,  fiber:2.8 },
  "pepino":                { cal:16,  prot:0.7, carbs:3.6,  fat:0.1,  fiber:0.5 },
  "pimentón rojo":         { cal:31,  prot:1,   carbs:6,    fat:0.3,  fiber:2.1 },
  "kale":                  { cal:49,  prot:4.3, carbs:9,    fat:0.9,  fiber:3.6 },
}

const GOAL_PRESETS = {
  "Pérdida de Grasa":  { protGkg:2.2, carbGkg:3.0, fatGkg:0.8, calFixed:-300, protRange:"2.0–2.4 g/kg", carbRange:"2–4 g/kg", fatRange:"0.6–1 g/kg", dist:"Prot ~35% · Carbs ~30% · Grasas ~20%", note:"Déficit de 300 kcal. Alta proteína preserva la masa muscular." },
  "Mantenimiento":     { protGkg:1.8, carbGkg:4.0, fatGkg:1.0, calFixed:0,    protRange:"1.6–2.0 g/kg", carbRange:"3–5 g/kg", fatRange:"0.8–1.2 g/kg", dist:"Prot ~25% · Carbs ~45% · Grasas ~25%", note:"Calorías de mantenimiento. Ideal para recomposición corporal." },
  "Ganancia Muscular": { protGkg:1.9, carbGkg:5.5, fatGkg:1.0, calFixed:300,  protRange:"1.6–2.2 g/kg", carbRange:"4–7 g/kg", fatRange:"0.8–1.2 g/kg", dist:"Prot ~22% · Carbs ~50% · Grasas ~20%", note:"Superávit de 300 kcal. Favorece la hipertrofia muscular." },
  "Rendimiento":       { protGkg:2.0, carbGkg:5.0, fatGkg:0.9, calFixed:300,  protRange:"1.8–2.2 g/kg", carbRange:"4–6 g/kg", fatRange:"0.8–1 g/kg", dist:"Prot ~22% · Carbs ~52% · Grasas ~18%", note:"Superávit de 300 kcal. Prioriza glucógeno para rendimiento." },
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#FAFAF8", surface:"#FFFFFF", border:"#EBEBE6", borderHi:"#D4D4CC",
  text:"#0D0D0D", sub:"#6B6B6B", muted:"#B0B0A8",
  prot:"#2E6B4F", protBg:"#EEF5F1",
  carbs:"#7A5C1E", carbsBg:"#F7F1E6",
  fat:"#7A3030",  fatBg:"#F5EDED",
  blue:"#1D4ED8", blueBg:"#EFF6FF",
  ok:"#2E6B4F", okBg:"#EEF5F1",
  warn:"#7A5C1E", warnBg:"#F7F1E6",
  err:"#9B2C2C", errBg:"#FDF0F0",
  sh:"0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)",
  shSm:"0 1px 2px rgba(0,0,0,0.06)",
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:20, boxShadow:T.shSm, ...style }}>{children}</div>
)
const SLabel = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>{children}</div>
)
const Inp = ({ style={}, ...p }) => (
  <input style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:10, color:T.text, padding:"11px 14px", fontSize:14, outline:"none", width:"100%", transition:"border-color 0.15s", ...style }} {...p}/>
)
const BtnPrimary = ({ children, style={}, ...p }) => (
  <button style={{ background:T.text, border:"none", borderRadius:12, color:"#fff", fontWeight:700, padding:"13px 20px", cursor:"pointer", fontSize:14, width:"100%", transition:"opacity 0.15s", ...style }} {...p}>{children}</button>
)
const BtnGhost = ({ children, style={}, ...p }) => (
  <button style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:12, color:T.sub, fontWeight:600, padding:"11px 16px", cursor:"pointer", fontSize:13, transition:"all 0.15s", ...style }} {...p}>{children}</button>
)

const MacroRow = ({ label, value, max, color }) => {
  const pct = max ? Math.min((value/max)*100,100) : 0
  const over = max && value > max
  const near = max && value >= max*0.9
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:600, color:T.sub }}>{label}</span>
        <div style={{ display:"flex", gap:4, alignItems:"baseline" }}>
          <span style={{ fontSize:13, fontWeight:700, color:over?T.err:T.text }}>{Math.round(value)}</span>
          {max && <span style={{ fontSize:10, color:T.muted }}>/ {max}g</span>}
        </div>
      </div>
      <div style={{ height:3, background:T.border, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:over?T.err:color, borderRadius:99, transition:"width 0.8s" }}/>
      </div>
      {max && <div style={{ marginTop:3, fontSize:9, color:over?T.err:near?T.ok:T.muted, fontWeight:500 }}>
        {over?`${Math.round(value-max)}g sobre el objetivo`:near?"✓ Objetivo alcanzado":`${Math.round(max-value)}g restantes`}
      </div>}
    </div>
  )
}

// DayCard collapsible
const DayCard = ({ dia }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, marginBottom:8, overflow:"hidden" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", padding:"14px 16px", border:"none", background:"transparent", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:T.protBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:T.prot, fontFamily:"'Syne',sans-serif" }}>
            {(dia.dia||"").slice(0,2).toUpperCase()}
          </div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{dia.dia}</div>
            <div style={{ fontSize:11, color:T.muted }}>{dia.tipo}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{dia.total_kcal} kcal</div>
            <div style={{ fontSize:10, color:T.muted }}>{dia.total_prot}p · {dia.total_carbs}c · {dia.total_fat}g</div>
          </div>
          <div style={{ color:T.muted, fontSize:16, transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>⌄</div>
        </div>
      </button>
      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:"12px 16px" }}>
          {(dia.comidas||[]).map((c,ci)=>(
            <div key={ci} style={{ marginBottom:12, paddingBottom:12, borderBottom:ci<dia.comidas.length-1?`1px solid ${T.border}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:T.prot }}>{c.nombre} <span style={{ color:T.muted, fontWeight:400 }}>{c.hora}</span></span>
                <span style={{ fontSize:11, background:T.protBg, color:T.prot, padding:"2px 8px", borderRadius:4, fontWeight:600 }}>{c.total_kcal} kcal</span>
              </div>
              {(c.alimentos||[]).map((a,ai)=>(
                <div key={ai} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:ai<c.alimentos.length-1?`1px dashed ${T.border}`:"none" }}>
                  <span style={{ fontSize:12, color:T.text }}>{a.item} <span style={{ color:T.muted }}>{a.cantidad}</span></span>
                  <div style={{ display:"flex", gap:6, fontSize:11, fontWeight:700 }}>
                    <span style={{ color:T.text }}>{a.kcal}k</span>
                    <span style={{ color:T.prot }}>{a.prot}p</span>
                    <span style={{ color:T.carbs }}>{a.carbs}c</span>
                    <span style={{ color:T.fat }}>{a.fat}g</span>
                  </div>
                </div>
              ))}
              {c.notas && <div style={{ marginTop:5, fontSize:11, color:T.muted, fontStyle:"italic" }}>💡 {c.notas}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:12, animation:"pulse 1.5s infinite" }}>⚡</div>
        <div style={{ fontSize:13, color:T.muted }}>Cargando MACRO FIRE…</div>
      </div>
    </div>
  )

  if (!session) return <Auth/>
  return <MacroFireApp session={session}/>
}

// ─── MAIN TRACKER APP ─────────────────────────────────────────────────────────
function MacroFireApp({ session }) {
  const userId = session.user.id
  const today  = new Date().toISOString().split('T')[0]

  const [tab, setTab]             = useState('tracker')
  const [meals, setMeals]         = useState([])
  const [goals, setGoals]         = useState(null)
  const [profile, setProfile]     = useState({ startWeight:'', targetWeight:'', startDate:'', name:'', height:'', age:'', sex:'male', activity:'moderado', goal:'Mantenimiento' })
  const [weightLog, setWeightLog] = useState([])
  const [historyData, setHistoryData] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Tracker
  const [foodInput, setFoodInput] = useState('')
  const [grams, setGrams]         = useState('')
  const [sugg, setSugg]           = useState([])
  const [mealType, setMealType]   = useState('Desayuno')

  // Calculator
  const [calc, setCalc]     = useState({ weight:'', height:'', age:'', sex:'male', activity:'1.55', goal:'Mantenimiento' })
  const [calcRes, setCalcRes] = useState(null)

  // Photo
  const [photoMode, setPhotoMode] = useState('ai')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPrev, setPhotoPrev] = useState(null)
  const [aiRes, setAiRes]         = useState(null)
  const [aiLoad, setAiLoad]       = useState(false)
  const [aiErr, setAiErr]         = useState(null)
  const [aiProg, setAiProg]       = useState(0)
  const [tags, setTags]           = useState([])
  const [tagInput, setTagInput]   = useState('')
  const [manualItems, setManualItems] = useState([{ name:'', grams:'' }])
  const [manualResult, setManualResult] = useState(null)
  const [manualLoad, setManualLoad]     = useState(false)

  // Plan
  const [plan, setPlan]         = useState(null)
  const [planLoad, setPlanLoad] = useState(false)
  const [planErr, setPlanErr]   = useState(null)
  const [context, setContext]   = useState({ name:'', age:'', weight:'', height:'', sex:'male', goal:'Pérdida de Grasa', activity:'moderado', restrictions:'', conditions:'', meals:'4' })

  // Progress
  const [weightInput, setWeightInput] = useState('')
  const [weightNote, setWeightNote]   = useState('')

  const fileRef = useRef()

  // ── Load data from Supabase ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [m, g, p, w, pl] = await Promise.all([
          getMeals(userId, today),
          getGoals(userId),
          getProfile(userId),
          getWeightLog(userId),
          getLatestPlan(userId),
        ])
        if (m) setMeals(m)
        if (g) setGoals(g)
        if (p) setProfile(prev => ({ ...prev, ...p }))
        if (w) setWeightLog(w)
        if (pl) setPlan(pl.plan_data)
      } catch (e) { console.error('Load error:', e) }
      setDataLoading(false)
    }
    load()
  }, [userId, today])

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totals = meals.reduce((a,m)=>({
    cal:a.cal+(m.cal||0), prot:a.prot+(m.prot||0),
    carbs:a.carbs+(m.carbs||0), fat:a.fat+(m.fat||0), fiber:a.fiber+(m.fiber||0)
  }), {cal:0,prot:0,carbs:0,fat:0,fiber:0})

  const calLeft = goals ? goals.target_cal - totals.cal : null
  const calPct  = goals ? Math.min((totals.cal/goals.target_cal)*100,100) : 0

  // ── Food ───────────────────────────────────────────────────────────────────
  const onFoodChange = v => {
    setFoodInput(v)
    setSugg(v.length>1 ? Object.keys(FOOD_DB).filter(f=>f.toLowerCase().includes(v.toLowerCase())).slice(0,7) : [])
  }

  const handleAddFood = async (name=foodInput) => {
    const food = FOOD_DB[name.toLowerCase().trim()]; if(!food) return
    const g = parseFloat(grams)||100, r=g/100
    const meal = { name, grams:g, cal:Math.round(food.cal*r*10)/10, prot:Math.round(food.prot*r*10)/10, carbs:Math.round(food.carbs*r*10)/10, fat:Math.round(food.fat*r*10)/10, fiber:Math.round((food.fiber||0)*r*10)/10, meal_type:mealType }
    try {
      const saved = await addMeal(userId, meal, today)
      setMeals(p=>[...p, saved])
    } catch(e){ console.error(e) }
    setFoodInput(''); setGrams(''); setSugg([])
  }

  const handleRemoveFood = async (id) => {
    try { await deleteMeal(id); setMeals(p=>p.filter(m=>m.id!==id)) } catch(e){ console.error(e) }
  }

  const handleClearMeals = async () => {
    try { await clearMeals(userId, today); setMeals([]) } catch(e){ console.error(e) }
  }

  const loadHistory = async () => {
    const days = []
    const now = new Date()
    for(let i=1;i<=6;i++){
      const d = new Date(now); d.setDate(d.getDate()-i)
      const dateStr = d.toISOString().split('T')[0]
      try {
        const ms = await getMeals(userId, dateStr)
        if(ms?.length>0){
          const tot = ms.reduce((a,m)=>({cal:a.cal+(m.cal||0),prot:a.prot+(m.prot||0),carbs:a.carbs+(m.carbs||0),fat:a.fat+(m.fat||0)}),{cal:0,prot:0,carbs:0,fat:0})
          days.push({ date:d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'}), ...tot, count:ms.length })
        }
      } catch{}
    }
    setHistoryData(days); setShowHistory(true)
  }

  // ── Calculator ─────────────────────────────────────────────────────────────
  const runCalc = async () => {
    const { weight, height, age, sex, activity, goal } = calc
    if(!weight||!height||!age) return
    const w=+weight, h=+height, a=+age
    const bmr = sex==='male' ? 10*w+6.25*h-5*a+5 : 10*w+6.25*h-5*a-161
    const tdee = Math.round(bmr * +activity)
    const p = GOAL_PRESETS[goal]
    const prot=Math.round(w*p.protGkg), carbs=Math.round(w*p.carbGkg), fat=Math.round(w*p.fatGkg)
    const res = { target_cal:tdee+p.calFixed, prot, carbs, fat, cal_fixed:p.calFixed, tdee, bmr:Math.round(bmr), water:Math.round(w*35), dist:p.dist, note:p.note, prot_range:p.protRange, carb_range:p.carbRange, fat_range:p.fatRange }
    setCalcRes(res)
    try { await upsertGoals(userId, res); setGoals(res) } catch(e){ console.error(e) }
  }

  // ── API helper — calls our Vercel Edge Function ────────────────────────────
  const callClaude = async (messages, maxTok=2000) => {
    const resp = await fetch('/api/claude', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ messages, max_tokens:maxTok }),
    })
    const txt = await resp.text()
    if(!resp.ok){ let msg=`HTTP ${resp.status}`; try{const j=JSON.parse(txt);msg=j?.error?.message||msg}catch{}; throw new Error(msg) }
    let d; try{d=JSON.parse(txt)}catch{throw new Error('Respuesta inválida del servidor')}
    if(d.error) throw new Error(`${d.error.type}: ${d.error.message}`)
    return d.content.map(c=>c.text||'').join('')
  }

  const robustParse = str => {
    const s = str.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim()
    try{return JSON.parse(s)}catch{}
    let depth=0,st=-1
    for(let i=0;i<s.length;i++){if(s[i]==='{'){if(depth===0)st=i;depth++}else if(s[i]==='}'){depth--;if(depth===0&&st!==-1){try{return JSON.parse(s.slice(st,i+1))}catch{}}}}
    try{return JSON.parse(s.replace(/,(\s*[}\]])/g,'$1'))}catch{}
    return null
  }

  // ── Prepare image ──────────────────────────────────────────────────────────
  const prepareImage = file => new Promise((resolve,reject)=>{
    const reader=new FileReader()
    reader.onerror=()=>reject(new Error('No se pudo leer la imagen'))
    reader.onload=ev=>{
      const img=new Image()
      img.onerror=()=>resolve({b64:ev.target.result.split(',')[1],mt:'image/jpeg'})
      img.onload=()=>{
        const MAX=1600; let w=img.naturalWidth,h=img.naturalHeight
        if(w>MAX||h>MAX){const sc=MAX/Math.max(w,h);w=Math.round(w*sc);h=Math.round(h*sc)}
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h
        canvas.getContext('2d').drawImage(img,0,0,w,h)
        resolve({b64:canvas.toDataURL('image/jpeg',0.90).split(',')[1],mt:'image/jpeg'})
      }
      img.src=ev.target.result
    }
    reader.readAsDataURL(file)
  })

  const onPhoto = e => {
    const f=e.target.files[0]; if(!f) return
    setPhotoFile(f); setAiRes(null); setAiErr(null)
    const rd=new FileReader(); rd.onload=ev=>setPhotoPrev(ev.target.result); rd.readAsDataURL(f)
  }

  const analyze = async () => {
    if(!photoFile) return
    setAiLoad(true); setAiErr(null); setAiRes(null); setAiProg(0)
    try {
      setAiProg(1)
      const {b64,mt} = await prepareImage(photoFile)
      if(!b64||b64.length<100) throw new Error('Imagen no procesable')
      setAiProg(2)
      const hasIng = tags.length>0
      const prompt = `Eres nutricionista deportivo experto en análisis visual. Analiza esta imagen de comida con máxima precisión.
${hasIng?`\nINGREDIENTES CONFIRMADOS: ${tags.join(', ')}. Solo estima pesos.\n`:''}
PASO 1 — Identifica alimentos, método de cocción, textura.
PASO 2 — Usa referencias de escala (plato≈26cm, tenedor≈19cm).
PASO 3 — Convierte a gramos (pollo cocido 0.95g/ml, arroz cocido 0.85g/ml, verdura 0.62g/ml, huevo=55g c/u, aceite cdita=4g).
PASO 4 — Macros por alimento usando valores USDA.
PASO 5 — Suma y verifica: cal=prot×4+carbs×4+fat×9.
PASO 6 — Autocrítica: ¿pesos plausibles? ¿falta aceite? ¿kcal 300-900 kcal?

Escribe el JSON entre estos markers:
===JSON_INICIO===
{"description":"nombre","portionEstimate":"gramos","calories":0,"protein":0.0,"carbs":0.0,"fat":0.0,"fiber":0.0,"confidence":"alta|media|baja","items":[{"name":"","grams":0,"cal":0,"prot":0.0,"carbs":0.0,"fat":0.0}],"notes":""}
===JSON_FIN===`
      const full = await callClaude([{role:'user',content:[{type:'image',source:{type:'base64',media_type:mt,data:b64}},{type:'text',text:prompt}]}], 3000)
      setAiProg(3)
      const m = full.match(/===JSON_INICIO===\s*([\s\S]*?)\s*===JSON_FIN===/)
      const parsed = robustParse(m?m[1]:full)
      if(!parsed) throw new Error('No se pudieron extraer datos. Intenta de nuevo.')
      const n=(v,fb=0)=>{const x=parseFloat(v);return isNaN(x)?fb:Math.round(x*10)/10}
      const prot=n(parsed.protein,20),carbs=n(parsed.carbs,30),fat=n(parsed.fat,10)
      const calFM=Math.round(prot*4+carbs*4+fat*9), calR=Math.round(n(parsed.calories,calFM))
      setAiRes({ description:String(parsed.description||'Plato'), portionEstimate:String(Math.round(parseFloat(parsed.portionEstimate)||200)), calories:Math.abs(calFM-calR)/Math.max(calR,1)<0.10?Math.round((calFM+calR)/2):calFM, protein:prot, carbs, fat, fiber:n(parsed.fiber,0), confidence:['alta','media','baja'].includes(parsed.confidence)?parsed.confidence:'media', items:Array.isArray(parsed.items)?parsed.items:[], notes:String(parsed.notes||'') })
    } catch(e){ setAiErr(e.message) }
    setAiLoad(false); setAiProg(0)
  }

  const calcManual = async () => {
    const filled = manualItems.filter(i=>i.name.trim()&&i.grams)
    if(!filled.length) return
    setManualLoad(true); setManualResult(null)
    try {
      const list = filled.map(i=>`- ${i.name.trim()}: ${i.grams}g`).join('\n')
      const raw = await callClaude([{role:'user',content:`Calcula macros exactos para estos alimentos usando valores USDA. SOLO JSON entre ===J=== markers:\n${list}\n\n===J===\n{"items":[{"name":"","grams":0,"cal":0,"prot":0.0,"carbs":0.0,"fat":0.0,"fiber":0.0}],"total_cal":0,"total_prot":0.0,"total_carbs":0.0,"total_fat":0.0,"total_fiber":0.0}\n===J===`}], 1000)
      const m=raw.match(/===J===\s*([\s\S]*?)\s*===J===/)
      const parsed=robustParse(m?m[1]:raw)
      if(!parsed) throw new Error('Error calculando macros')
      setManualResult(parsed)
    } catch(e){ setManualResult({error:e.message}) }
    setManualLoad(false)
  }

  const addAiMeal = async (src) => {
    if(!src) return
    const meal = { name:src.description||'Comida', grams:parseFloat(src.portionEstimate)||200, cal:src.calories||src.total_cal||0, prot:src.protein||src.total_prot||0, carbs:src.carbs||src.total_carbs||0, fat:src.fat||src.total_fat||0, fiber:src.fiber||src.total_fiber||0, meal_type:mealType }
    try {
      const saved = await addMeal(userId, meal, today)
      setMeals(p=>[...p,saved])
    } catch(e){ console.error(e) }
    setTab('tracker'); setPhotoFile(null); setPhotoPrev(null); setAiRes(null); setManualResult(null); setManualItems([{name:'',grams:''}])
  }

  // ── Generate plan ──────────────────────────────────────────────────────────
  const generatePlan = async () => {
    if(!context.weight||!context.height||!context.age){setPlanErr('Completa peso, altura y edad.');return}
    setPlanLoad(true); setPlanErr(null); setPlan(null)
    try {
      const w=+context.weight,h=+context.height,a=+context.age
      const isMale=context.sex==='male'
      const bmr=isMale?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161
      const actMap={sedentario:1.2,ligero:1.375,moderado:1.55,activo:1.725,'muy activo':1.9}
      const tdee=Math.round(bmr*(actMap[context.activity]||1.55))
      const preset=GOAL_PRESETS[context.goal]||GOAL_PRESETS['Mantenimiento']
      const targetKcal=tdee+preset.calFixed
      const protG=Math.round(w*preset.protGkg),carbsG=Math.round(w*preset.carbGkg),fatG=Math.round(w*preset.fatGkg)
      const nMeals=parseInt(context.meals)||4
      const imc=(w/(h/100)**2).toFixed(1)
      const perc=`PERFIL: ${context.name||'Cliente'}, ${isMale?'H':'M'}, ${a}a, ${w}kg, ${h}cm, IMC ${imc}\nOBJETIVO: ${context.goal} | Actividad: ${context.activity} | ${nMeals} comidas\nRESTRICCIONES: ${context.restrictions||'Ninguna'} | SALUD: ${context.conditions||'Ninguna'}\nMACROS: ${targetKcal}kcal | P${protG}g | C${carbsG}g | G${fatG}g`

      const [r1,r2] = await Promise.all([
        callClaude([{role:'user',content:`Nutricionista deportivo. Primera mitad del plan.\n${perc}\nReglas: ${Math.round(w*0.3)}-${Math.round(w*0.4)}g prot/comida, alimentos latinos accesibles, sin ${context.restrictions||'ninguna restricción'}, cada día suma ${targetKcal}kcal±15.\nResponde SOLO JSON entre ===JSON1=== markers:\n===JSON1===\n{"resumen":{"objetivo":"","estrategia":"","calorias_diarias":${targetKcal},"proteina_g":${protG},"carbos_g":${carbsG},"grasa_g":${fatG},"comidas_dia":${nMeals},"tdee":${tdee}},"valoracion":"4-5 frases análisis IMC ${imc}, estrategia ${context.goal}, expectativas realistas","progreso_esperado":"semanas 1-2: X, semanas 3-4: Y","dias":[{"dia":"Lunes","tipo":"Entrenamiento","total_kcal":${targetKcal},"total_prot":${protG},"total_carbs":${carbsG},"total_fat":${fatG},"comidas":[{"nombre":"Desayuno","hora":"07:30","alimentos":[{"item":"","cantidad":"Xg","kcal":0,"prot":0,"carbs":0,"fat":0}],"total_kcal":0,"total_prot":0,"total_carbs":0,"total_fat":0,"notas":""}]}]}\n===JSON1===\nIncluye Lunes(entreno), Martes(descanso), Miércoles(entreno), Jueves(descanso). ${nMeals} comidas/día.`}], 4000),
        callClaude([{role:'user',content:`Nutricionista deportivo. Segunda mitad del plan.\n${perc}\nViernes(entreno), Sábado(descanso), Domingo(recuperación). ${nMeals} comidas/día, ${targetKcal}kcal±15, alimentos latinos, sin ${context.restrictions||'ninguna restricción'}.\nResponde SOLO JSON entre ===JSON2=== markers:\n===JSON2===\n{"dias_resto":[{"dia":"Viernes","tipo":"Entrenamiento","total_kcal":${targetKcal},"total_prot":${protG},"total_carbs":${carbsG},"total_fat":${fatG},"comidas":[{"nombre":"Desayuno","hora":"07:30","alimentos":[{"item":"","cantidad":"Xg","kcal":0,"prot":0,"carbs":0,"fat":0}],"total_kcal":0,"total_prot":0,"total_carbs":0,"total_fat":0,"notas":""}]}],"lista_mercado":{"proteinas":[""],"carbohidratos":[""],"grasas_saludables":[""],"verduras_frutas":[""],"lacteos_otros":[""]},"hidratacion":"","suplementos":"","consejos":["","","","",""]}\n===JSON2===`}], 4000),
      ])

      const ex=(txt,tag)=>{const re=new RegExp(`===${tag}===\\s*([\\s\\S]*?)\\s*===${tag}===`);const m=txt.match(re);return m?m[1].trim():txt.trim()}
      const p1=robustParse(ex(r1,'JSON1')), p2=robustParse(ex(r2,'JSON2'))
      if(!p1) throw new Error('Error en primera parte. Intenta de nuevo.')
      if(!p2) throw new Error('Error en segunda parte. Intenta de nuevo.')

      const combined={...p1, plan_semanal:[...(p1.dias||[]),...(p2.dias_resto||[])], lista_mercado:p2.lista_mercado, hidratacion:p2.hidratacion, suplementos:p2.suplementos, consejos:p2.consejos, _context:{...context,targetKcal,protG,carbsG,fatG,tdee}}
      setPlan(combined)
      try { await savePlan(userId, combined, context) } catch(e){ console.error('Save plan error:',e) }
    } catch(e){ setPlanErr(e.message) }
    setPlanLoad(false)
  }

  // ── Weight log ─────────────────────────────────────────────────────────────
  const logWeight = async () => {
    if(!weightInput) return
    try {
      const entry = await addWeight(userId, parseFloat(weightInput), weightNote)
      setWeightLog(p=>[entry,...p])
      setWeightInput(''); setWeightNote('')
    } catch(e){ console.error(e) }
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
  const downloadPdf = () => {
    if(!plan) return
    const G='#2E6B4F',GB='#EEF5F1',AM='#7A5C1E',AMB='#F7F1E6',BU='#7A3030'
    const ctx2=plan._context||{}
    const dayHtml=dia=>`<div style="margin-bottom:20px;page-break-inside:avoid"><div style="background:${G};color:#fff;padding:10px 16px;border-radius:10px 10px 0 0;display:flex;justify-content:space-between"><span style="font-weight:800">${dia.dia} — ${dia.tipo||''}</span><span>${dia.total_kcal||0}kcal</span></div><div style="border:1px solid #E0E0E0;border-top:none;border-radius:0 0 10px 10px;padding:0">${(dia.comidas||[]).map((c,ci)=>`<div style="padding:12px 16px;${ci<(dia.comidas.length-1)?'border-bottom:1px solid #F0F0EC':''}"><div style="font-weight:700;color:${G};margin-bottom:8px">${c.nombre} <span style="font-weight:400;color:#999;font-size:11px">${c.hora||''}</span> <span style="float:right;font-size:11px;background:${GB};color:${G};padding:2px 8px;border-radius:4px">${c.total_kcal||0} kcal</span></div><table style="width:100%;border-collapse:collapse;font-size:11px"><tr style="background:#FAFAF8"><th style="padding:4px 8px;text-align:left;border:1px solid #EBEBEB">Alimento</th><th style="padding:4px 8px;border:1px solid #EBEBEB">Cant.</th><th style="padding:4px 8px;border:1px solid #EBEBEB">kcal</th><th style="padding:4px 8px;border:1px solid #EBEBEB;color:${G}">P</th><th style="padding:4px 8px;border:1px solid #EBEBEB;color:${AM}">C</th><th style="padding:4px 8px;border:1px solid #EBEBEB;color:${BU}">G</th></tr>${(c.alimentos||[]).map((a,ai)=>`<tr style="background:${ai%2===0?'#fff':'#FAFAF8'}"><td style="padding:4px 8px;border:1px solid #EBEBEB">${a.item||''}</td><td style="padding:4px 8px;border:1px solid #EBEBEB;text-align:center">${a.cantidad||''}</td><td style="padding:4px 8px;border:1px solid #EBEBEB;text-align:center">${a.kcal||0}</td><td style="padding:4px 8px;border:1px solid #EBEBEB;text-align:center;color:${G};font-weight:600">${a.prot||0}</td><td style="padding:4px 8px;border:1px solid #EBEBEB;text-align:center;color:${AM};font-weight:600">${a.carbs||0}</td><td style="padding:4px 8px;border:1px solid #EBEBEB;text-align:center;color:${BU};font-weight:600">${a.fat||0}</td></tr>`).join('')}</table></div>`).join('')}</div></div>`
    const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Plan Nutricional MACRO FIRE</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Helvetica,sans-serif;color:#1A1A1A;font-size:13px}.page{max-width:820px;margin:0 auto;padding:40px}h2{font-size:13px;font-weight:700;color:${G};text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;padding-bottom:6px;border-bottom:2px solid ${GB}}.print-btn{position:fixed;bottom:20px;right:20px;background:${G};color:#fff;border:none;padding:12px 22px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px}@media print{.print-btn{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><button class="print-btn" onclick="window.print()">Guardar PDF</button><div class="page"><div style="text-align:center;padding:40px 0 32px;border-bottom:3px solid ${G};margin-bottom:28px"><div style="font-size:9px;letter-spacing:5px;color:${G};font-weight:700;margin-bottom:10px">MACRO FIRE · NUTRICIÓN CIENTÍFICA</div><h1 style="font-size:26px;font-weight:800;color:#0D0D0D;margin-bottom:6px">Plan Nutricional Personalizado</h1><div style="font-size:13px;color:#555;margin-top:8px">${context.name||'Cliente'} · ${new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</div><div style="display:inline-grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#E0E0E0;border-radius:12px;overflow:hidden;margin-top:18px;border:1px solid #E0E0E0">${[['kcal/día',ctx2.targetKcal,'#0D0D0D'],['Proteína',ctx2.protG+'g',G],['Carbos',ctx2.carbsG+'g',AM],['Grasas',ctx2.fatG+'g',BU]].map(([l,v,c])=>`<div style="background:#fff;padding:14px 18px;text-align:center"><div style="font-size:20px;font-weight:800;color:${c}">${v}</div><div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-top:2px">${l}</div></div>`).join('')}</div></div><div style="margin-bottom:24px"><h2>Valoración Nutricional</h2><div style="background:${GB};border-left:4px solid ${G};border-radius:0 10px 10px 0;padding:14px 18px;font-size:13px;line-height:1.9;color:#333">${plan.valoracion||''}</div></div><div><h2>Plan Semanal</h2>${(plan.plan_semanal||[]).map(d=>dayHtml(d)).join('')}</div><div style="margin-top:24px"><h2>Lista de Mercado</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${[['🥩','Proteínas','proteinas',GB,G],['🌾','Carbohidratos','carbohidratos',AMB,AM],['🥑','Grasas saludables','grasas_saludables','#F5EDED',BU],['🥦','Verduras y frutas','verduras_frutas','#F0F4E8','#4A6E20'],['🥛','Lácteos y otros','lacteos_otros','#F0F0FF','#444']].map(([ic,tit,k,bg,c])=>`<div style="background:${bg};border-radius:10px;padding:14px"><div style="font-weight:700;color:${c};font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">${ic} ${tit}</div><ul style="margin:0;padding-left:16px">${(plan.lista_mercado?.[k]||[]).map(i=>`<li style="font-size:12px;color:#333;margin-bottom:3px">${i}</li>`).join('')}</ul></div>`).join('')}</div></div><div style="margin-top:40px;padding-top:14px;border-top:1px solid #E8E8E4;text-align:center"><div style="font-size:9px;color:#CCC;letter-spacing:3px">MACRO FIRE · ${new Date().getFullYear()} · Mifflin-St Jeor + ISSN 2017</div></div></div></body></html>`
    const blob=new Blob([html],{type:'text/html;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a'); a.href=url; a.download=`plan_${(context.name||'cliente').replace(/\s+/g,'_')}.html`; a.click(); URL.revokeObjectURL(url)
  }

  if(dataLoading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:T.bg}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:12,animation:'pulse 1.5s infinite'}}>⚡</div>
        <div style={{fontSize:13,color:T.muted}}>Cargando tus datos…</div>
      </div>
    </div>
  )

  const MEAL_TYPES = ['Desayuno','Almuerzo','Cena','Snack','Pre-entreno','Post-entreno']
  const GOAL_META  = {'Pérdida de Grasa':{icon:'↓',sub:'–300 kcal'},'Mantenimiento':{icon:'⟷',sub:'Neutro'},'Ganancia Muscular':{icon:'↑',sub:'+300 kcal'},'Rendimiento':{icon:'⚡',sub:'+300 kcal'}}
  const inp = {background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:10,color:T.text,padding:'11px 14px',fontSize:14,outline:'none',width:'100%',transition:'border-color 0.15s'}

  return (
    <div style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      {/* HEADER */}
      <header style={{background:T.surface,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:540,margin:'0 auto',padding:'0 16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:52}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:30,height:30,borderRadius:8,background:T.text,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>⚡</div>
              <div>
                <div style={{fontSize:15,fontFamily:"'Syne',sans-serif",fontWeight:800,letterSpacing:'0.02em',lineHeight:1}}>MACRO FIRE</div>
                <div style={{fontSize:8,color:T.muted,letterSpacing:'0.16em',marginTop:1}}>TRACK · CALCULATE · ANALYZE</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {goals && <div style={{background:T.protBg,borderRadius:8,padding:'4px 10px',textAlign:'right'}}>
                <div style={{fontSize:11,color:T.prot,fontWeight:700}}>{goals.target_cal} kcal</div>
                <div style={{fontSize:8,color:T.prot,opacity:.6}}>{goals.cal_fixed<0?'–300 déficit':goals.cal_fixed>0?'+300 superávit':'Mantenimiento'}</div>
              </div>}
              <button onClick={()=>signOut()} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:'pointer',fontSize:11,padding:'5px 10px',fontFamily:'inherit',fontWeight:600}}>
                Salir
              </button>
            </div>
          </div>
          <div style={{display:'flex',borderTop:`1px solid ${T.border}`}}>
            {[{id:'tracker',label:'Registro'},{id:'calculator',label:'Calculadora'},{id:'photo',label:'IA Foto'},{id:'plan',label:'Mi Plan'},{id:'progress',label:'Progreso'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 2px 11px',border:'none',background:'transparent',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:tab===t.id?700:500,color:tab===t.id?T.text:T.muted,borderBottom:`2px solid ${tab===t.id?T.text:'transparent'}`,transition:'all .15s'}}>{t.label}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={{maxWidth:540,margin:'0 auto',padding:'20px 16px 80px'}}>

        {/* ══ TRACKER ══ */}
        {tab==='tracker' && (
          <div className="fade-up">
            <Card style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div>
                  <SLabel>Hoy · {new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'})}</SLabel>
                  <div style={{display:'flex',alignItems:'baseline',gap:6}}>
                    <span style={{fontSize:52,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:'-2px',lineHeight:1}}>{Math.round(totals.cal)}</span>
                    <span style={{fontSize:14,color:T.muted}}>kcal</span>
                  </div>
                  {calLeft!==null&&<div style={{marginTop:5,fontSize:12,fontWeight:600,color:calLeft<0?T.err:T.ok}}>{calLeft<0?`${Math.abs(Math.round(calLeft))} kcal sobre el objetivo`:`${Math.round(calLeft)} kcal restantes`}</div>}
                </div>
                {goals&&<div style={{position:'relative',width:60,height:60}}>
                  <svg width="60" height="60" style={{transform:'rotate(-90deg)',display:'block'}}>
                    <circle cx="30" cy="30" r="25" fill="none" stroke={T.border} strokeWidth="5"/>
                    <circle cx="30" cy="30" r="25" fill="none" stroke={calPct>=100?T.err:T.prot} strokeWidth="5" strokeDasharray={2*Math.PI*25} strokeDashoffset={2*Math.PI*25*(1-calPct/100)} strokeLinecap="round" style={{transition:'stroke-dashoffset .8s'}}/>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>{Math.round(calPct)}%</div>
                </div>}
              </div>
              <div style={{display:'flex',gap:8,marginBottom:goals?16:0}}>
                {[{l:'Prot',v:totals.prot,g:goals?.prot,c:T.prot,bg:T.protBg},{l:'Carbs',v:totals.carbs,g:goals?.carbs,c:T.carbs,bg:T.carbsBg},{l:'Grasas',v:totals.fat,g:goals?.fat,c:T.fat,bg:T.fatBg},{l:'Fibra',v:totals.fiber,g:null,c:T.blue,bg:T.blueBg}].map(m=>(
                  <div key={m.l} style={{flex:1,background:m.bg,borderRadius:10,padding:'10px 6px',textAlign:'center'}}>
                    <div style={{fontSize:17,fontWeight:800,color:m.c,fontFamily:"'Syne',sans-serif"}}>{Math.round(m.v)}</div>
                    <div style={{fontSize:8,color:m.c,opacity:.7,textTransform:'uppercase',letterSpacing:'0.07em',marginTop:1,fontWeight:700}}>{m.l}</div>
                    {m.g&&<div style={{fontSize:8,color:m.c,opacity:.5,marginTop:2}}>{Math.round((m.v/m.g)*100)}%</div>}
                  </div>
                ))}
              </div>
              {goals&&<div style={{paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                <MacroRow label="Proteína" value={totals.prot} max={goals.prot} color={T.prot}/>
                <MacroRow label="Carbohidratos" value={totals.carbs} max={goals.carbs} color={T.carbs}/>
                <MacroRow label="Grasas" value={totals.fat} max={goals.fat} color={T.fat}/>
              </div>}
            </Card>

            <Card style={{marginBottom:12}}>
              <SLabel>Agregar alimento</SLabel>
              <div style={{display:'flex',gap:5,marginBottom:10,overflowX:'auto',paddingBottom:2}}>
                {MEAL_TYPES.map(mt=>(
                  <button key={mt} onClick={()=>setMealType(mt)} style={{flexShrink:0,padding:'5px 10px',border:`1.5px solid ${mealType===mt?T.prot:T.border}`,borderRadius:20,background:mealType===mt?T.protBg:T.surface,color:mealType===mt?T.prot:T.sub,cursor:'pointer',fontSize:11,fontWeight:600,transition:'all .15s',whiteSpace:'nowrap'}}>{mt}</button>
                ))}
              </div>
              <div style={{position:'relative',marginBottom:10}}>
                <Inp value={foodInput} onChange={e=>onFoodChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAddFood()} placeholder="Busca un alimento…"/>
                {sugg.length>0&&<div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,zIndex:100,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.1)'}}>
                  {sugg.map(s=>(
                    <div key={s} onClick={()=>{setFoodInput(s);setSugg([]);}} style={{padding:'10px 16px',cursor:'pointer',fontSize:13,color:T.sub,borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between'}}>
                      <span style={{fontWeight:500}}>{s}</span>
                      <span style={{fontSize:11,color:T.muted}}>{FOOD_DB[s]?.cal} kcal/100g</span>
                    </div>
                  ))}
                </div>}
              </div>
              <div style={{display:'flex',gap:8}}>
                <Inp value={grams} onChange={e=>setGrams(e.target.value)} placeholder="Gramos (default 100)" type="number" style={{flex:1}}/>
                <BtnPrimary onClick={()=>handleAddFood()} style={{width:'auto',padding:'11px 20px'}}>+ Agregar</BtnPrimary>
              </div>
            </Card>

            {meals.length>0?(
              <Card>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <SLabel>Registro · {meals.length} alimento{meals.length!==1?'s':''}</SLabel>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={loadHistory} style={{background:'none',border:'none',color:T.blue,cursor:'pointer',fontSize:11,fontWeight:600}}>Historial</button>
                    <button onClick={handleClearMeals} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:7,color:T.muted,cursor:'pointer',fontSize:11,fontWeight:600,padding:'3px 10px'}}>Limpiar</button>
                  </div>
                </div>
                {MEAL_TYPES.filter(mt=>meals.some(m=>(m.meal_type||m.mealType)===mt)).map(mt=>(
                  <div key={mt} style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.prot,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${T.protBg}`}}>{mt}</div>
                    {meals.filter(m=>(m.meal_type||m.mealType)===mt).map(m=>(
                      <div key={m.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 6px',borderRadius:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.name}</div>
                          <div style={{fontSize:11,color:T.muted}}>{m.grams}g · {Math.round(m.cal||0)} kcal</div>
                        </div>
                        <div style={{display:'flex',gap:5,flexShrink:0}}>
                          <span style={{fontSize:10,fontWeight:700,color:T.prot,background:T.protBg,padding:'2px 5px',borderRadius:4}}>{Math.round(m.prot||0)}p</span>
                          <span style={{fontSize:10,fontWeight:700,color:T.carbs,background:T.carbsBg,padding:'2px 5px',borderRadius:4}}>{Math.round(m.carbs||0)}c</span>
                          <span style={{fontSize:10,fontWeight:700,color:T.fat,background:T.fatBg,padding:'2px 5px',borderRadius:4}}>{Math.round(m.fat||0)}g</span>
                        </div>
                        <button onClick={()=>handleRemoveFood(m.id)} style={{background:'none',border:'none',color:T.err,cursor:'pointer',fontSize:18,opacity:.4,transition:'opacity .15s'}}>×</button>
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            ):(
              <div style={{textAlign:'center',padding:'40px 0'}}>
                <div style={{fontSize:32,opacity:.15,marginBottom:10}}>◎</div>
                <div style={{fontSize:13,color:T.muted}}>Sin registros hoy</div>
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>Agrega tu primera comida del día</div>
              </div>
            )}

            {showHistory&&historyData.length>0&&(
              <Card style={{marginTop:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <SLabel>Historial · últimos días</SLabel>
                  <button onClick={()=>setShowHistory(false)} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:16}}>×</button>
                </div>
                {historyData.map((d,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<historyData.length-1?`1px solid ${T.border}`:'none'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600}}>{d.date}</div>
                      <div style={{fontSize:10,color:T.muted}}>{d.count} alimentos</div>
                    </div>
                    <div style={{display:'flex',gap:8,fontSize:11,fontWeight:700}}>
                      <span>{Math.round(d.cal)}k</span>
                      <span style={{color:T.prot}}>{Math.round(d.prot)}p</span>
                      <span style={{color:T.carbs}}>{Math.round(d.carbs)}c</span>
                      <span style={{color:T.fat}}>{Math.round(d.fat)}g</span>
                    </div>
                    {goals&&<div style={{fontSize:10,fontWeight:700,color:Math.abs(d.cal-goals.target_cal)<100?T.ok:T.warn}}>{Math.round(d.cal-goals.target_cal)>0?'+':''}{Math.round(d.cal-goals.target_cal)}k</div>}
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ══ CALCULATOR ══ */}
        {tab==='calculator'&&(
          <div className="fade-up">
            <div style={{marginBottom:20}}>
              <div style={{fontSize:26,fontFamily:"'Syne',sans-serif",fontWeight:800,letterSpacing:'-0.5px'}}>Calculadora</div>
              <div style={{fontSize:13,color:T.muted,marginTop:4}}>Mifflin-St Jeor · ISSN 2017</div>
            </div>
            <Card style={{marginBottom:12}}>
              <SLabel>Datos personales</SLabel>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                {[{l:'Peso (kg)',k:'weight',p:'70'},{l:'Altura (cm)',k:'height',p:'175'}].map(f=>(
                  <div key={f.k}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>{f.l}</div><Inp type="number" value={calc[f.k]} onChange={e=>setCalc(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>
                ))}
              </div>
              <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>Edad</div><Inp type="number" value={calc.age} onChange={e=>setCalc(p=>({...p,age:e.target.value}))} placeholder="28"/></div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:7}}>Sexo biológico</div>
                <div style={{display:'flex',gap:8}}>
                  {['male','female'].map(s=>(
                    <button key={s} onClick={()=>setCalc(p=>({...p,sex:s}))} style={{flex:1,padding:'11px',border:`1.5px solid ${calc.sex===s?T.text:T.border}`,borderRadius:10,background:calc.sex===s?T.text:T.surface,color:calc.sex===s?'#fff':T.sub,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .15s'}}>{s==='male'?'Hombre':'Mujer'}</button>
                  ))}
                </div>
              </div>
              <div><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>Nivel de actividad</div><select value={calc.activity} onChange={e=>setCalc(p=>({...p,activity:e.target.value}))} style={{...inp,background:T.bg}}><option value="1.2">Sedentario</option><option value="1.375">Ligero (1–3 días/sem)</option><option value="1.55">Moderado (3–5 días/sem)</option><option value="1.725">Activo (6–7 días/sem)</option><option value="1.9">Muy activo</option></select></div>
            </Card>
            <Card style={{marginBottom:14}}>
              <SLabel>Objetivo</SLabel>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {Object.entries(GOAL_META).map(([g,m])=>(
                  <button key={g} onClick={()=>setCalc(p=>({...p,goal:g}))} style={{padding:'14px 12px',border:`1.5px solid ${calc.goal===g?T.text:T.border}`,borderRadius:12,background:calc.goal===g?T.text:T.surface,cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                    <div style={{fontSize:18,marginBottom:5}}>{m.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:calc.goal===g?'#fff':T.text}}>{g}</div>
                    <div style={{fontSize:10,color:calc.goal===g?'rgba(255,255,255,.5)':T.muted,marginTop:2}}>{m.sub}</div>
                  </button>
                ))}
              </div>
            </Card>
            <BtnPrimary onClick={runCalc}>Calcular mi plan</BtnPrimary>
            {calcRes&&(
              <div style={{marginTop:16}} className="fade-up">
                <Card style={{marginBottom:12}}>
                  <SLabel>Tu plan diario</SLabel>
                  <div style={{display:'flex',gap:8,marginBottom:16}}>
                    {[{l:'TMB',v:calcRes.bmr,c:T.muted},{l:'TDEE',v:calcRes.tdee,c:T.sub},{l:'Objetivo',v:calcRes.target_cal,c:T.prot}].map(s=>(
                      <div key={s.l} style={{flex:1,background:T.bg,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
                        <div style={{fontSize:8,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:4}}>{s.l}</div>
                        <div style={{fontSize:20,fontWeight:800,color:s.c,fontFamily:"'Syne',sans-serif"}}>{s.v}</div>
                        <div style={{fontSize:8,color:T.muted}}>kcal</div>
                      </div>
                    ))}
                  </div>
                  <div style={{textAlign:'center',marginBottom:14}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:6,background:calcRes.cal_fixed<0?T.fatBg:calcRes.cal_fixed>0?T.protBg:T.bg,border:`1px solid ${calcRes.cal_fixed<0?T.fat+'44':calcRes.cal_fixed>0?T.prot+'44':T.border}`,borderRadius:99,padding:'5px 14px',fontSize:12,fontWeight:700,color:calcRes.cal_fixed<0?T.fat:calcRes.cal_fixed>0?T.prot:T.sub}}>
                      {calcRes.cal_fixed<0?`↓ Déficit 300 kcal · TDEE ${calcRes.tdee}`:calcRes.cal_fixed>0?`↑ Superávit 300 kcal · TDEE ${calcRes.tdee}`:`Mantenimiento · TDEE ${calcRes.tdee}`}
                    </span>
                  </div>
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    {[{l:'Proteína',v:calcRes.prot,c:T.prot,bg:T.protBg},{l:'Carbos',v:calcRes.carbs,c:T.carbs,bg:T.carbsBg},{l:'Grasas',v:calcRes.fat,c:T.fat,bg:T.fatBg}].map(m=>(
                      <div key={m.l} style={{flex:1,background:m.bg,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
                        <div style={{fontSize:20,fontWeight:800,color:m.c,fontFamily:"'Syne',sans-serif"}}>{m.v}</div>
                        <div style={{fontSize:9,color:m.c,opacity:.7,textTransform:'uppercase',letterSpacing:'0.07em',marginTop:2,fontWeight:700}}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:T.blueBg,border:`1px solid ${T.blue}22`,borderRadius:10,padding:'10px 14px'}}>
                    <div style={{fontSize:9,fontWeight:700,color:T.blue,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>💧 Hidratación diaria</div>
                    <div style={{fontSize:13,fontWeight:700,color:T.blue}}>{calcRes.water} ml · {(calcRes.water/1000).toFixed(1)} L</div>
                  </div>
                </Card>
                <BtnPrimary onClick={()=>{setGoals(calcRes);setTab('tracker');}}>Usar este plan en mi registro →</BtnPrimary>
              </div>
            )}
          </div>
        )}

        {/* ══ IA FOTO ══ */}
        {tab==='photo'&&(
          <div className="fade-up">
            <div style={{marginBottom:20}}>
              <div style={{fontSize:26,fontFamily:"'Syne',sans-serif",fontWeight:800,letterSpacing:'-0.5px'}}>IA Foto</div>
              <div style={{fontSize:13,color:T.muted,marginTop:4}}>Análisis visual o ingreso manual de pesos</div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14,background:T.bg,borderRadius:12,padding:4}}>
              {[{id:'ai',label:'📸 Análisis por foto',sub:'~70-80% precisión'},{id:'manual',label:'⚖️ Ingreso manual',sub:'~98% precisión'}].map(m=>(
                <button key={m.id} onClick={()=>setPhotoMode(m.id)} style={{flex:1,padding:'10px 8px',border:'none',borderRadius:9,background:photoMode===m.id?T.surface:T.bg,cursor:'pointer',textAlign:'center',boxShadow:photoMode===m.id?T.shSm:'none',transition:'all .2s'}}>
                  <div style={{fontSize:12,fontWeight:700,color:photoMode===m.id?T.text:T.sub}}>{m.label}</div>
                  <div style={{fontSize:9,color:photoMode===m.id?T.prot:T.muted,marginTop:2,fontWeight:600}}>{m.sub}</div>
                </button>
              ))}
            </div>

            {photoMode==='ai'&&(
              <>
                <div onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${T.borderHi}`,borderRadius:16,padding:photoPrev?8:'36px 20px',textAlign:'center',cursor:'pointer',background:photoPrev?T.surface:T.bg,marginBottom:12,overflow:'hidden',transition:'all .2s',boxShadow:photoPrev?T.sh:'none'}}>
                  {photoPrev?<img src={photoPrev} alt="food" style={{maxWidth:'100%',maxHeight:260,borderRadius:10,objectFit:'cover',display:'block'}}/>:<>
                    <div style={{width:48,height:48,borderRadius:12,background:T.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'0 auto 12px'}}>📷</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.sub}}>Toca para subir foto</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:3}}>JPG · PNG · HEIC · WEBP</div>
                  </>}
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:'none'}}/>
                </div>
                <Card style={{marginBottom:12,background:'#FEFCF5',borderColor:'#EDE5C8'}}>
                  <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
                    <div style={{width:32,height:32,borderRadius:8,background:T.carbsBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🎯</div>
                    <div><div style={{fontSize:13,fontWeight:700}}>Ingredientes confirmados</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>Opcional · Mejora precisión hasta 40%</div></div>
                  </div>
                  {tags.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>{tags.map((t,i)=><span key={i} style={{display:'inline-flex',alignItems:'center',gap:4,background:T.surface,border:`1px solid ${T.border}`,borderRadius:6,padding:'4px 10px 4px 12px',fontSize:12,fontWeight:600}}>{t}<button onClick={()=>setTags(p=>p.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:14}}>×</button></span>)}</div>}
                  <div style={{display:'flex',gap:8}}>
                    <Inp value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&tagInput.trim()){setTags(p=>[...p,tagInput.trim()]);setTagInput('');}}} placeholder="Escribe y presiona Enter…" style={{background:T.surface}}/>
                    <BtnGhost onClick={()=>{if(tagInput.trim()){setTags(p=>[...p,tagInput.trim()]);setTagInput('');}}} style={{flexShrink:0,padding:'11px 14px'}}>Add</BtnGhost>
                  </div>
                  {tags.length>0&&<div style={{display:'flex',justifyContent:'space-between',marginTop:7}}><span style={{fontSize:10,color:T.carbs,fontWeight:600}}>{tags.length} confirmado{tags.length!==1?'s':''}</span><button onClick={()=>setTags([])} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:11}}>limpiar</button></div>}
                </Card>
                {photoPrev&&!aiRes&&<BtnPrimary onClick={analyze} disabled={aiLoad} style={{opacity:aiLoad?.6:1,cursor:aiLoad?'not-allowed':'pointer',marginBottom:12}}>{aiLoad?'Analizando…':tags.length>0?`Analizar (${tags.length} ingredientes)`:'Analizar con IA'}</BtnPrimary>}
                {aiLoad&&<Card style={{marginBottom:12,textAlign:'center',padding:'28px 20px'}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.sub,marginBottom:18}}>{['Iniciando…','Procesando imagen…','Analizando con IA…','Verificando macros…'][aiProg]||'Procesando…'}</div>
                  <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:14}}>
                    {['Preparar','Analizar','Extraer'].map((s,i)=>{const n=i+1,done=aiProg>n,act=aiProg===n;return<div key={i} style={{textAlign:'center'}}><div style={{width:38,height:38,borderRadius:'50%',background:done?T.protBg:act?T.protBg:T.bg,border:`1.5px solid ${done||act?T.prot:T.border}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 5px',fontSize:13,fontWeight:700,color:done||act?T.prot:T.muted,transition:'all .3s',animation:act?'pulse 1.5s infinite':'none'}}>{done?'✓':n}</div><div style={{fontSize:9,fontWeight:700,color:done||act?T.prot:T.muted,textTransform:'uppercase'}}>{s}</div></div>;})}
                  </div>
                  <div style={{height:2,background:T.border,borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${(aiProg/3)*100}%`,background:T.prot,borderRadius:99,transition:'width .6s ease'}}/></div>
                </Card>}
                {aiErr&&<div style={{background:T.errBg,border:`1px solid ${T.err}22`,borderRadius:12,padding:'12px 16px',color:T.err,fontSize:13,fontWeight:600,marginBottom:12}}>{aiErr}</div>}
                {aiRes&&<div className="fade-up">
                  <Card style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',paddingBottom:14,marginBottom:14,borderBottom:`1px solid ${T.border}`}}>
                      <div style={{flex:1,paddingRight:12}}>
                        <div style={{fontSize:15,fontWeight:700,marginBottom:7}}>{aiRes.description}</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                          <span style={{display:'inline-flex',alignItems:'center',background:aiRes.confidence==='alta'?T.okBg:aiRes.confidence==='media'?T.warnBg:T.errBg,color:aiRes.confidence==='alta'?T.ok:aiRes.confidence==='media'?T.warn:T.err,fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4}}>{aiRes.confidence==='alta'?'✓ Alta':'~ Media'}</span>
                          <span style={{display:'inline-flex',alignItems:'center',background:'#F0F0EC',color:T.sub,fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4}}>~{aiRes.portionEstimate}g</span>
                          {tags.length>0&&<span style={{display:'inline-flex',alignItems:'center',background:T.protBg,color:T.prot,fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4}}>🎯 {tags.length} confirmados</span>}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:36,fontWeight:800,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{aiRes.calories}</div>
                        <div style={{fontSize:11,color:T.muted}}>kcal</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,marginBottom:12}}>
                      {[{l:'Proteína',v:aiRes.protein,c:T.prot,bg:T.protBg},{l:'Carbos',v:aiRes.carbs,c:T.carbs,bg:T.carbsBg},{l:'Grasas',v:aiRes.fat,c:T.fat,bg:T.fatBg},{l:'Fibra',v:aiRes.fiber,c:T.blue,bg:T.blueBg}].map(m=>(
                        <div key={m.l} style={{flex:1,background:m.bg,borderRadius:10,padding:'10px 6px',textAlign:'center'}}>
                          <div style={{fontSize:17,fontWeight:800,color:m.c,fontFamily:"'Syne',sans-serif"}}>{m.v}</div>
                          <div style={{fontSize:8,color:m.c,opacity:.7,textTransform:'uppercase',marginTop:2,fontWeight:700}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                    {aiRes.items?.length>0&&<div style={{marginBottom:10}}>{aiRes.items.map((it,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<aiRes.items.length-1?`1px dashed ${T.border}`:'none'}}><span style={{fontSize:12,color:T.sub}}>{it.name} <span style={{color:T.muted}}>{it.grams?Math.round(it.grams)+'g':''}</span></span><div style={{display:'flex',gap:6,fontSize:11,fontWeight:700}}><span style={{color:T.prot}}>{it.prot}p</span><span style={{color:T.carbs}}>{it.carbs}c</span><span style={{color:T.fat}}>{it.fat}g</span></div></div>)}</div>}
                    {aiRes.notes&&<div style={{fontSize:11,color:T.muted,paddingTop:10,borderTop:`1px solid ${T.border}`,lineHeight:1.7}}>{aiRes.notes}</div>}
                  </Card>
                  <div style={{display:'flex',gap:8}}>
                    <BtnPrimary onClick={()=>addAiMeal(aiRes)} style={{flex:1}}>+ Agregar al registro</BtnPrimary>
                    <BtnGhost onClick={()=>{setPhotoFile(null);setPhotoPrev(null);setAiRes(null);}}>Nueva</BtnGhost>
                  </div>
                </div>}
              </>
            )}

            {photoMode==='manual'&&(
              <div>
                <Card style={{marginBottom:12}}>
                  <SLabel>Ingredientes con peso exacto</SLabel>
                  <div style={{fontSize:11,color:T.muted,marginBottom:12,lineHeight:1.6}}>Pesa cada ingrediente con báscula. La IA calcula los macros exactos con base de datos USDA.</div>
                  {manualItems.map((item,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                      <Inp value={item.name} onChange={e=>setManualItems(p=>{const u=[...p];u[i]={...u[i],name:e.target.value};return u;})} placeholder={`Alimento ${i+1}`} style={{flex:2}}/>
                      <Inp value={item.grams} onChange={e=>setManualItems(p=>{const u=[...p];u[i]={...u[i],grams:e.target.value};return u;})} placeholder="Gramos" type="number" style={{flex:1}}/>
                      {manualItems.length>1&&<button onClick={()=>setManualItems(p=>p.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:T.err,cursor:'pointer',fontSize:18,flexShrink:0}}>×</button>}
                    </div>
                  ))}
                  <button onClick={()=>setManualItems(p=>[...p,{name:'',grams:''}])} style={{background:T.bg,border:`1.5px dashed ${T.border}`,borderRadius:10,color:T.sub,cursor:'pointer',fontSize:13,fontWeight:600,padding:'10px',width:'100%',marginTop:4}}>+ Agregar ingrediente</button>
                </Card>
                <BtnPrimary onClick={calcManual} disabled={manualLoad} style={{marginBottom:12,opacity:manualLoad?.6:1}}>{manualLoad?'Calculando…':'Calcular macros exactos'}</BtnPrimary>
                {manualResult&&!manualResult.error&&<div className="fade-up">
                  <Card style={{marginBottom:12}}>
                    <SLabel>Resultado exacto · USDA</SLabel>
                    <div style={{display:'flex',gap:8,marginBottom:12}}>
                      {[{l:'kcal',v:manualResult.total_cal,c:T.text,bg:T.bg},{l:'Prot',v:manualResult.total_prot,c:T.prot,bg:T.protBg},{l:'Carbs',v:manualResult.total_carbs,c:T.carbs,bg:T.carbsBg},{l:'Grasa',v:manualResult.total_fat,c:T.fat,bg:T.fatBg}].map(m=>(
                        <div key={m.l} style={{flex:1,background:m.bg,borderRadius:10,padding:'10px 6px',textAlign:'center'}}>
                          <div style={{fontSize:17,fontWeight:800,color:m.c,fontFamily:"'Syne',sans-serif"}}>{Math.round(m.v)}</div>
                          <div style={{fontSize:8,color:m.c,opacity:.7,textTransform:'uppercase',marginTop:2,fontWeight:700}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                    {(manualResult.items||[]).map((it,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<manualResult.items.length-1?`1px dashed ${T.border}`:'none'}}><span style={{fontSize:12,color:T.sub}}>{it.name} <span style={{color:T.muted}}>{it.grams}g</span></span><div style={{display:'flex',gap:6,fontSize:11,fontWeight:700}}><span style={{color:T.text}}>{it.cal}k</span><span style={{color:T.prot}}>{it.prot}p</span><span style={{color:T.carbs}}>{it.carbs}c</span><span style={{color:T.fat}}>{it.fat}g</span></div></div>)}
                  </Card>
                  <div style={{display:'flex',gap:8}}>
                    <BtnPrimary onClick={()=>addAiMeal({description:manualItems.filter(i=>i.name).map(i=>i.name).join(', '),portionEstimate:String(manualItems.reduce((s,i)=>s+(parseFloat(i.grams)||0),0)),calories:manualResult.total_cal,protein:manualResult.total_prot,carbs:manualResult.total_carbs,fat:manualResult.total_fat,fiber:manualResult.total_fiber||0})} style={{flex:1}}>+ Agregar al registro</BtnPrimary>
                    <BtnGhost onClick={()=>{setManualItems([{name:'',grams:''}]);setManualResult(null);}}>Nuevo</BtnGhost>
                  </div>
                </div>}
                {manualResult?.error&&<div style={{background:T.errBg,borderRadius:10,padding:'12px 16px',color:T.err,fontSize:13,fontWeight:600}}>{manualResult.error}</div>}
              </div>
            )}
          </div>
        )}

        {/* ══ MI PLAN ══ */}
        {tab==='plan'&&(
          <div className="fade-up">
            <div style={{marginBottom:20}}>
              <div style={{fontSize:26,fontFamily:"'Syne',sans-serif",fontWeight:800,letterSpacing:'-0.5px'}}>Mi Plan</div>
              <div style={{fontSize:13,color:T.muted,marginTop:4}}>Plan semanal personalizado con base científica</div>
            </div>
            {!plan&&(<>
              <Card style={{marginBottom:12}}>
                <SLabel>Datos personales</SLabel>
                <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>Nombre</div><Inp value={context.name} onChange={e=>setContext(p=>({...p,name:e.target.value}))} placeholder="Tu nombre"/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                  {[{l:'Peso (kg)',k:'weight',p:'70'},{l:'Altura (cm)',k:'height',p:'175'},{l:'Edad',k:'age',p:'28'}].map(f=>(
                    <div key={f.k}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>{f.l}</div><Inp type="number" value={context[f.k]} onChange={e=>setContext(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/></div>
                  ))}
                </div>
                <div><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:7}}>Sexo biológico</div><div style={{display:'flex',gap:8}}>{['male','female'].map(s=><button key={s} onClick={()=>setContext(p=>({...p,sex:s}))} style={{flex:1,padding:'10px',border:`1.5px solid ${context.sex===s?T.text:T.border}`,borderRadius:10,background:context.sex===s?T.text:T.surface,color:context.sex===s?'#fff':T.sub,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .15s'}}>{s==='male'?'Hombre':'Mujer'}</button>)}</div></div>
              </Card>
              <Card style={{marginBottom:12}}>
                <SLabel>Objetivo y actividad</SLabel>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                  {Object.keys(GOAL_PRESETS).map(g=>(
                    <button key={g} onClick={()=>setContext(p=>({...p,goal:g}))} style={{padding:'13px 12px',border:`1.5px solid ${context.goal===g?T.text:T.border}`,borderRadius:12,background:context.goal===g?T.text:T.surface,cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                      <div style={{fontSize:12,fontWeight:700,color:context.goal===g?'#fff':T.text}}>{g}</div>
                      <div style={{fontSize:9,color:context.goal===g?'rgba(255,255,255,.5)':T.muted,marginTop:2}}>{GOAL_PRESETS[g].note.slice(0,44)}…</div>
                    </button>
                  ))}
                </div>
                <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>Nivel de actividad</div><select value={context.activity} onChange={e=>setContext(p=>({...p,activity:e.target.value}))} style={{...inp,background:T.bg}}><option value="sedentario">Sedentario</option><option value="ligero">Ligero (1–3 días/sem)</option><option value="moderado">Moderado (3–5 días/sem)</option><option value="activo">Activo (6–7 días/sem)</option><option value="muy activo">Muy activo</option></select></div>
                <div><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:7}}>Comidas por día</div><div style={{display:'flex',gap:8}}>{['3','4','5','6'].map(n=><button key={n} onClick={()=>setContext(p=>({...p,meals:n}))} style={{flex:1,padding:'10px',border:`1.5px solid ${context.meals===n?T.prot:T.border}`,borderRadius:10,background:context.meals===n?T.protBg:T.surface,color:context.meals===n?T.prot:T.sub,cursor:'pointer',fontSize:14,fontWeight:700,transition:'all .15s'}}>{n}</button>)}</div></div>
              </Card>
              <Card style={{marginBottom:14}}>
                <SLabel>Contexto de salud</SLabel>
                <div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>Restricciones o alergias</div><Inp value={context.restrictions} onChange={e=>setContext(p=>({...p,restrictions:e.target.value}))} placeholder="ej: sin gluten, vegetariano…"/></div>
                <div><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>Condiciones de salud</div><Inp value={context.conditions} onChange={e=>setContext(p=>({...p,conditions:e.target.value}))} placeholder="ej: hipotiroidismo, diabetes…"/></div>
              </Card>
              {planErr&&<div style={{background:T.errBg,border:`1px solid ${T.err}22`,borderRadius:10,padding:'12px 16px',color:T.err,fontSize:13,fontWeight:600,marginBottom:12}}>{planErr}</div>}
              <BtnPrimary onClick={generatePlan} disabled={planLoad} style={{opacity:planLoad?.6:1,cursor:planLoad?'not-allowed':'pointer'}}>{planLoad?'Generando plan…':'Generar mi plan nutricional'}</BtnPrimary>
              {planLoad&&<Card style={{marginTop:14,textAlign:'center',padding:'28px 20px'}}>
                <div style={{fontSize:32,marginBottom:14,animation:'pulse 1.5s ease-in-out infinite'}}>🧬</div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Generando plan personalizado</div>
                <div style={{fontSize:11,color:T.muted,lineHeight:1.8,maxWidth:280,margin:'0 auto 14px'}}>Mifflin-St Jeor · g/kg ISSN · 7 días · Macros verificados</div>
                <div style={{fontSize:10,color:T.muted}}>Puede tomar 20–30 segundos</div>
              </Card>}
            </>)}
            {plan&&!planLoad&&<div className="fade-up">
              <div style={{background:T.text,borderRadius:16,padding:'20px',marginBottom:12,color:'#fff'}}>
                <div style={{fontSize:10,opacity:.5,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:7}}>Plan generado para</div>
                <div style={{fontSize:19,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:'-0.3px',marginBottom:14}}>{context.name||'Tu plan'} — {context.goal}</div>
                <div style={{display:'flex',gap:8}}>
                  {[{l:'kcal',v:plan.resumen?.calorias_diarias||plan._context?.targetKcal,c:'#fff'},{l:'prot',v:(plan.resumen?.proteina_g||plan._context?.protG)+'g',c:'#A8D5BE'},{l:'carbs',v:(plan.resumen?.carbos_g||plan._context?.carbsG)+'g',c:'#F0D080'},{l:'grasa',v:(plan.resumen?.grasa_g||plan._context?.fatG)+'g',c:'#F0A0A0'}].map(m=>(
                    <div key={m.l} style={{flex:1,background:'rgba(255,255,255,.1)',borderRadius:10,padding:'10px 6px',textAlign:'center'}}>
                      <div style={{fontSize:17,fontWeight:800,color:m.c,fontFamily:"'Syne',sans-serif"}}>{m.v}</div>
                      <div style={{fontSize:8,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'0.07em',marginTop:2}}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {plan.valoracion&&<Card style={{marginBottom:12,background:T.protBg,borderColor:T.prot+'22'}}><SLabel>Valoración nutricional</SLabel><div style={{fontSize:13,color:'#2A2A2A',lineHeight:1.8}}>{plan.valoracion}</div></Card>}
              {plan.progreso_esperado&&<Card style={{marginBottom:12,background:'#F7F1E6',borderColor:'#E8D5A0'}}><SLabel>Progreso esperado</SLabel><div style={{fontSize:13,color:'#333',lineHeight:1.7}}>{plan.progreso_esperado}</div></Card>}
              <div style={{marginBottom:12}}><SLabel>Plan semanal</SLabel>{(plan.plan_semanal||[]).map((dia,i)=><DayCard key={i} dia={dia}/>)}</div>
              <Card style={{marginBottom:12}}>
                <SLabel>Lista de mercado · 7 días</SLabel>
                {[{k:'proteinas',l:'Proteínas',c:T.prot,bg:T.protBg,i:'🥩'},{k:'carbohidratos',l:'Carbohidratos',c:T.carbs,bg:T.carbsBg,i:'🌾'},{k:'grasas_saludables',l:'Grasas saludables',c:T.fat,bg:T.fatBg,i:'🥑'},{k:'verduras_frutas',l:'Verduras y frutas',c:'#4A6E20',bg:'#F0F4E8',i:'🥦'},{k:'lacteos_otros',l:'Lácteos y otros',c:T.sub,bg:T.bg,i:'🥛'}].map(cat=>(
                  <div key={cat.k} style={{marginBottom:10}}>
                    <div style={{fontSize:10,fontWeight:700,color:cat.c,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>{cat.i} {cat.l}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{(plan.lista_mercado?.[cat.k]||[]).map((item,idx)=><span key={idx} style={{background:cat.bg,color:cat.c,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:6}}>{item}</span>)}</div>
                  </div>
                ))}
              </Card>
              <div style={{display:'flex',gap:8}}>
                <BtnPrimary onClick={downloadPdf} style={{flex:1,background:T.prot}}>Descargar PDF</BtnPrimary>
                <BtnGhost onClick={()=>setPlan(null)}>Nuevo plan</BtnGhost>
              </div>
            </div>}
          </div>
        )}

        {/* ══ PROGRESO ══ */}
        {tab==='progress'&&(
          <div className="fade-up">
            <div style={{marginBottom:20}}>
              <div style={{fontSize:26,fontFamily:"'Syne',sans-serif",fontWeight:800,letterSpacing:'-0.5px'}}>Progreso</div>
              <div style={{fontSize:13,color:T.muted,marginTop:4}}>Seguimiento de peso y métricas</div>
            </div>
            <Card style={{marginBottom:12}}>
              <SLabel>Perfil de seguimiento</SLabel>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[{l:'Peso inicial (kg)',k:'startWeight',p:'80'},{l:'Peso objetivo (kg)',k:'targetWeight',p:'70'},{l:'Fecha inicio',k:'startDate',p:'',type:'date'}].map(f=>(
                  <div key={f.k}><div style={{fontSize:11,fontWeight:600,color:T.sub,marginBottom:5}}>{f.l}</div><Inp type={f.type||'number'} value={profile[f.k]||''} onChange={e=>{const u={...profile,[f.k]:e.target.value};setProfile(u);upsertProfile(userId,u).catch(()=>{});}}/></div>
                ))}
              </div>
              {profile.startWeight&&profile.targetWeight&&(<div style={{marginTop:12,padding:'12px 14px',background:T.protBg,borderRadius:10}}>
                <div style={{fontSize:11,color:T.prot,fontWeight:600}}>
                  Meta: {Math.abs(parseFloat(profile.targetWeight)-parseFloat(profile.startWeight)).toFixed(1)} kg {parseFloat(profile.targetWeight)<parseFloat(profile.startWeight)?'a perder':'a ganar'}
                  {weightLog.length>0&&` · Actual: ${weightLog[0].weight} kg · Cambio: ${(weightLog[0].weight-parseFloat(profile.startWeight)).toFixed(1)} kg`}
                </div>
                {weightLog.length>0&&<div style={{marginTop:6,height:4,background:'rgba(46,107,79,.2)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(Math.abs(weightLog[0].weight-parseFloat(profile.startWeight))/Math.abs(parseFloat(profile.targetWeight)-parseFloat(profile.startWeight))*100,100)}%`,background:T.prot,borderRadius:99,transition:'width .8s ease'}}/></div>}
              </div>)}
            </Card>
            <Card style={{marginBottom:12}}>
              <SLabel>Registrar peso hoy</SLabel>
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                <Inp value={weightInput} onChange={e=>setWeightInput(e.target.value)} placeholder="Peso en kg (ej: 74.5)" type="number" style={{flex:2}}/>
                <BtnPrimary onClick={logWeight} style={{flex:1,padding:'11px 14px',fontSize:13}}>Guardar</BtnPrimary>
              </div>
              <Inp value={weightNote} onChange={e=>setWeightNote(e.target.value)} placeholder="Nota opcional (ej: en ayunas)"/>
            </Card>
            {weightLog.length>0&&<Card style={{marginBottom:12}}>
              <SLabel>Historial de peso</SLabel>
              {weightLog.length>=3&&(()=>{
                const vals=weightLog.slice(0,14).reverse().map(w=>w.weight)
                const mn=Math.min(...vals)-.5, mx=Math.max(...vals)+.5, rng=mx-mn
                const W=300, H=70
                const pts=vals.map((v,i)=>({x:i/(vals.length-1)*W,y:H-(v-mn)/rng*H}))
                const path=pts.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')
                return <div style={{marginBottom:14,background:T.bg,borderRadius:10,padding:'12px 8px'}}>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:70}}>
                    <path d={path} fill="none" stroke={T.prot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill={T.prot}/>)}
                  </svg>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:T.muted,marginTop:4}}><span>{weightLog[Math.min(13,weightLog.length-1)]?.date}</span><span>Hoy</span></div>
                </div>
              })()}
              {weightLog.slice(0,10).map((e,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<Math.min(9,weightLog.length-1)?`1px solid ${T.border}`:'none'}}>
                  <div><div style={{fontSize:13,fontWeight:600}}>{e.weight} kg</div>{e.note&&<div style={{fontSize:10,color:T.muted}}>{e.note}</div>}</div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,color:T.muted}}>{e.date}</div>
                    {i>0&&<div style={{fontSize:10,fontWeight:700,color:e.weight<weightLog[i-1]?.weight?T.ok:e.weight>weightLog[i-1]?.weight?T.err:T.muted}}>{e.weight<weightLog[i-1]?.weight?'↓':'↑'}{Math.abs(e.weight-(weightLog[i-1]?.weight||e.weight)).toFixed(1)} kg</div>}
                  </div>
                </div>
              ))}
            </Card>}
          </div>
        )}

      </main>
    </div>
  )
}
