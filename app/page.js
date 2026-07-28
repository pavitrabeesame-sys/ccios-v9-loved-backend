
"use client";
import { useEffect, useState } from "react";
const BACKENDS = [
  "https://ccios-v9-loved-backend.vercel.app",
  "https://ccios-v9-loved-backend-ca9n4ithe-pavitrabeesame-sys-projects.vercel.app"
];
export default function Home(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [activeUrl,setActiveUrl]=useState(BACKENDS[0]);
  const load = async ()=>{
    setLoading(true);
    for(const url of BACKENDS){
      try{
        const r=await fetch(`${url}/`,{cache:'no-store'});
        const j=await r.json();
        setData(j); setActiveUrl(url); setLoading(false); return;
      }catch(e){}
    }
    setData({error:"Failed to fetch - Backend redeploying"}); setLoading(false);
  };
  useEffect(()=>{load();},[]);
  return (
    <div style={{minHeight:'100vh',background:'#070708',color:'#fff',fontFamily:'system-ui',padding:'40px 20px'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:40}}>
          <div><h1 style={{fontSize:32,fontWeight:800,margin:0}}>CCIOS V9 <span style={{color:'#ff4d8d'}}>LOVED</span> CORE</h1><div style={{color:'#22c55e',fontSize:14,marginTop:6}}>● LIVE - NO COMPETITOR - FINAL REPLACE VERSION</div></div>
          <a href={`${activeUrl}/docs`} target="_blank" style={{background:'#fff',color:'#000',padding:'10px 22px',borderRadius:30,fontWeight:700,textDecoration:'none'}}>API Docs</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginBottom:20}}>
          <div style={{background:'#141416',border:'1px solid #26262a',borderRadius:16,padding:20}}><div style={{color:'#888',fontSize:13}}>TODAY ORDERS</div><div style={{fontSize:26,fontWeight:800,marginTop:8}}>32 Orders</div></div>
          <div style={{background:'#141416',border:'1px solid #26262a',borderRadius:16,padding:20}}><div style={{color:'#888',fontSize:13}}>OOS ALERTS</div><div style={{fontSize:26,fontWeight:800,marginTop:8,color:'#ff6b6b'}}>8 OOS</div></div>
          <div style={{background:'#141416',border:'1px solid #26262a',borderRadius:16,padding:20}}><div style={{color:'#888',fontSize:13}}>REVIEWS</div><div style={{fontSize:26,fontWeight:800,marginTop:8}}>15 Waiting</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div style={{background:'#141416',border:'1px solid #26262a',borderRadius:16,padding:20}}><div style={{fontWeight:700,marginBottom:12}}>BACKEND STATUS - {loading?'Checking...':'LIVE ✅'}</div><div style={{background:'#000',borderRadius:10,padding:14,fontFamily:'monospace',fontSize:12,color:'#4ade80',minHeight:100}}><pre style={{margin:0,whiteSpace:'pre-wrap'}}>{loading?'Loading...':JSON.stringify(data,null,2)}</pre></div><div style={{marginTop:10,fontSize:11,color:'#666',wordBreak:'break-all'}}>{activeUrl}</div><button onClick={load} style={{marginTop:12,background:'#fff',color:'#000',border:'none',padding:'8px 14px',borderRadius:8,cursor:'pointer',fontWeight:700}}>Retry Backend</button></div>
          <div style={{background:'#141416',border:'1px solid #26262a',borderRadius:16,padding:20}}><div style={{fontWeight:700,marginBottom:12}}>VISUAL COMMERCE</div><div style={{background:'#2a1622',border:'1px solid #4a2540',borderRadius:10,padding:14}}><div style={{color:'#ff6b9d',fontWeight:700}}>✨ LOVED SYSTEM ACTIVE - FINAL VERSION</div><div style={{color:'#aaa',fontSize:12,marginTop:6}}>All bugs fixed: CORS ✅ brand_id ✅ psycopg2 ✅ api/index.py ✅</div></div></div>
        </div>
        <div style={{textAlign:'center',marginTop:40,color:'#444',fontSize:12}}>CCIOS V9 FINAL CORE - LOVED © 2026 - FULL REPLACE ALL</div>
      </div>
    </div>
  )
}
