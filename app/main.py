from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel
from datetime import datetime
import os
from typing import Optional

DATABASE_URL = os.getenv("DATABASE_URL","sqlite:///./ccios_v9_core.db")
# Fix postgres URL for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread":False} if "sqlite" in DATABASE_URL else {})
SessionLocal=sessionmaker(bind=engine)
Base=declarative_base()
def get_db():
    db=SessionLocal()
    try: yield db
    finally: db.close()

class Brand(Base):
    __tablename__="brands"
    id=Column(Integer, primary_key=True)
    brand_name=Column(String)
    marketplace=Column(String, default="Shopee")
    shopee_url=Column(String)
    country=Column(String, default="MY")
    status=Column(String, default="active")
    created_at=Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__="products"
    id=Column(Integer, primary_key=True)
    brand_id=Column(Integer, ForeignKey("brands.id"))
    name=Column(String)
    sku=Column(String)
    price=Column(Float, default=0)
    stock=Column(Integer, default=0)
    title_score=Column(Float, default=82)
    image_score=Column(Float, default=78)
    seo_score=Column(Float, default=85)
    health=Column(Float, default=86)

class Order(Base):
    __tablename__="orders"
    id=Column(Integer, primary_key=True)
    brand_id=Column(Integer, ForeignKey("brands.id"))
    order_number=Column(String)
    customer=Column(String)
    marketplace=Column(String)
    total=Column(Float, default=0)
    status=Column(String, default="completed")

class Review(Base):
    __tablename__="reviews"
    id=Column(Integer, primary_key=True)
    brand_id=Column(Integer, ForeignKey("brands.id"))
    product=Column(String)
    rating=Column(Integer)
    comment=Column(Text)
    ai_reply=Column(Text)
    status=Column(String, default="pending")

class Health(Base):
    __tablename__="health"
    id=Column(Integer, primary_key=True)
    brand_id=Column(Integer, ForeignKey("brands.id"))
    overall=Column(Float, default=94)
    design=Column(Float, default=95)
    seo=Column(Float, default=88)
    conv=Column(Float, default=84)

class Issue(Base):
    __tablename__="issues"
    id=Column(Integer, primary_key=True)
    brand_id=Column(Integer, ForeignKey("brands.id"))
    priority=Column(String)
    category=Column(String)
    title=Column(String)
    desc=Column(Text)
    impact=Column(String)

Base.metadata.create_all(bind=engine)

class BrandIn(BaseModel):
    brand_name: str
    marketplace: str="Shopee"
    shopee_url: Optional[str]=None

app=FastAPI(title="CCIOS V9 FINAL CORE - LOVED VERSION", version="9.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

@app.get("/")
def root(): 
    return {"system":"CCIOS V9 FINAL CORE - LOVED","today":"32 orders, 8 OOS, 15 reviews waiting","visual_commerce":"NO COMPETITOR LIVE","docs":"/docs", "status":"LIVE ✅"}

@app.get("/brands")
def gb(db: Session=Depends(get_db)): return db.query(Brand).all()

@app.post("/brands")
def cb(d: BrandIn, db: Session=Depends(get_db)):
    b=Brand(**d.model_dump()); db.add(b); db.commit(); db.refresh(b); return b

@app.get("/products")
def gp(db: Session=Depends(get_db)): return db.query(Product).all()

@app.get("/orders")
def go(db: Session=Depends(get_db)): return db.query(Order).all()

@app.get("/reviews")
def gr(db: Session=Depends(get_db)): return db.query(Review).all()

# FIXED BUG 1: brand_id param mismatch
@app.get("/today/{brand_id}")
def today(brand_id: int): 
    return {"brand_id": brand_id, "orders_new":32,"oos":8,"reviews_pending":15,"campaigns_ending":5,"publish_failed":3,"yesterday_rm":12540,"growth":"+18%","nova":"Restock RAV Bifold Wallet MB-001 Sales +42% 3 days left"}

# FIXED BUG 2: brand_id param mismatch
@app.get("/visual/{brand_id}")
def visual(brand_id: int): 
    return {"brand_id": brand_id, "homepage_score":89,"before_ctr":"1.2%","after_ctr":"3.8%","before_res":"800x400 low res","after_res":"1920x600 high-res lifestyle","category_recommend":"kasut kulit 22k -> beg 18k -> dompet 12k","layout_rules":"Premium minimal white space editorial photography luxury typography no cheap yellow"}

@app.post("/intelligence/analyze/{brand_id}")
def analyze(brand_id: int, db: Session=Depends(get_db)):
    db.query(Health).filter(Health.brand_id==brand_id).delete()
    h=Health(brand_id=brand_id, overall=94, design=95, seo=88, conv=84)
    db.add(h)
    db.query(Issue).filter(Issue.brand_id==brand_id).delete()
    for p,c,t,d,i in [("HIGH","visual","Homepage hero low res","Need 1920x600 CTR 1.2->3.8%","RM 4,200"),("HIGH","seo","Title duplicate","Fix SEO","RM 1,800"),("HIGH","campaign","Payday ends 4h","Join ROI 3.2x","RM 4,200"),("MEDIUM","inventory","RAV001 low 3 pcs","Reorder 100","Stockout"),("LOW","category","Category order","Reorder by vol 22k","CTR+18%")]:
        db.add(Issue(brand_id=brand_id, priority=p, category=c, title=t, desc=d, impact=i))
    db.commit()
    return {"health":h}

@app.get("/intelligence/health/{brand_id}")
def gh(brand_id: int, db: Session=Depends(get_db)): return db.query(Health).filter(Health.brand_id==brand_id).all()

@app.get("/intelligence/action-centre/{brand_id}")
def ac(brand_id: int, db: Session=Depends(get_db)):
    all_i=db.query(Issue).filter(Issue.brand_id==brand_id).all()
    return {"high":[i for i in all_i if i.priority=="HIGH"],"medium":[i for i in all_i if i.priority=="MEDIUM"],"low":[i for i in all_i if i.priority=="LOW"],"total":len(all_i)}

@app.post("/intelligence/consultant")
def consultant(q: dict):
    return {"answer":"Overall 94/100 healthy. Today: 32 orders new, 8 OOS, 15 reviews pending. Top action: Fix hero banner CTR 1.2->3.8% + Restock RAV001. Can AI do? Yes 1-click. Impact RM8,200/mo."}

@app.post("/seed")
def seed(db: Session=Depends(get_db)):
    if db.query(Brand).count()>0: return {"already":True}
    b1=Brand(brand_name="RAV DESIGN", marketplace="Shopee", shopee_url="https://shopee.com.my/ravdesign", country="MY")
    b2=Brand(brand_name="Nicole Collection", marketplace="Shopee", shopee_url="https://shopee.com.my/nicolecollection", country="MY")
    db.add_all([b1,b2]); db.commit(); db.refresh(b1)
    for i in range(1,11):
        db.add(Product(brand_id=b1.id, name=f"RAV Product {i} Leather Wallet", sku=f"RAV00{i}", price=99+i*10, stock=5+i, title_score=78+i, image_score=72+i))
    for i in range(1,16):
        db.add(Review(brand_id=b1.id if i%2==0 else b2.id, product=f"Wallet {i}", rating=5 if i%3!=0 else 4, comment="Kasut kulit sangat cantik kualiti premium" if i%2==0 else "Very nice design, fast delivery!", status="pending"))
    db.commit()
    return {"seeded":True}

@app.get("/analytics")
def analytics(db: Session=Depends(get_db)): return {"brands":db.query(Brand).count(),"products":db.query(Product).count(),"reviews":db.query(Review).count(),"today":{"orders":32,"oos":8,"reviews_pending":15}}
