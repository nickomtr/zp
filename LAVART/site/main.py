from sqlalchemy import create_engine, Column, Integer, String, BigInteger, SmallInteger, Boolean, Double, TIMESTAMP, text, Date, insert, update
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from typing import List, Optional
from fastapi import HTTPException
from pydantic import BaseModel, validator
from datetime import date

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/postgres"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class Employee(Base):
    __tablename__ = "employee_test"
    id = Column(BigInteger, primary_key=True, index=True, server_default=text("nextval('employee_test_id_seq'::regclass)"))
    employment_date = Column(TIMESTAMP)
    fired_date = Column(TIMESTAMP)
    birthday_date = Column(TIMESTAMP)
    fio = Column(String, nullable=False)
    job_title = Column(String(255))
    rank_title = Column(SmallInteger)
    tabel_number = Column(String(30))
    tabel_filename = Column(String(255))
    tariff_rate = Column(Integer)
    division = Column(String(255))
    status = Column(String(255))
    schedule = Column(String(255))
    shift_hours = Column(SmallInteger)
    skud_access = Column(SmallInteger)
    day_start = Column(SmallInteger)
    boss = Column(String(255))
    KTR_category = Column(String(50))
    KTR = Column(Double)
    has_NAX = Column(Boolean)
    KNAX = Column(Double)
    KVL = Column(Double)
    KVL_last_month = Column(Double)
    division_1C = Column(String(255))
    schedule_1C = Column(String(255))
    fio_responsible = Column(String)
    INN_employee = Column(String(50))
    INN_responsible = Column(String(50))
    INN_company = Column(String(50))

class WebsiteTableData(Base):
    __tablename__ = "website_table_data"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    apparatName = Column(String(255), nullable=True)
    fio1 = Column(String(255), nullable=True)
    fio2 = Column(String(255), nullable=True)
    fio3 = Column(String(255), nullable=True)
    fio4 = Column(String(255), nullable=True)
    fio5 = Column(String(255), nullable=True)
    tseh = Column(String(255), nullable=True)
    night = Column(Boolean)

class TableDataItem(BaseModel):
    id: Optional[int] = None
    date: date
    apparatName: Optional[str] = None
    fio1: Optional[str] = None
    fio2: Optional[str] = None
    fio3: Optional[str] = None
    fio4: Optional[str] = None
    fio5: Optional[str] = None
    tseh: Optional[str] = None
    night: bool

    @validator('date', pre=True)
    def parse_date(cls, value):
        if isinstance(value, date):
            return value.isoformat()
        return value

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    async with SessionLocal() as session:
        yield session

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()

@app.get("/items")
async def read_items():
    return [{"id": 1, "name": "Рабочее место 'Дуга'"}]

@app.get("/fio_data", response_model=List[str])
async def get_fio_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee.fio))
    fio_data = result.scalars().all()
    return fio_data

@app.post("/save_table_data")
async def save_table_data(data: List[TableDataItem], db: AsyncSession = Depends(get_db)):
    try:
        for item in data:
            if item.id:
                stmt = (
                    update(WebsiteTableData)
                    .where(WebsiteTableData.id == item.id)
                    .values(
                        date=item.date if isinstance(item.date, date) else datetime.strptime(item.date, "%Y-%m-%d"),
                        apparatName=item.apparatName,
                        fio1=item.fio1,
                        fio2=item.fio2,
                        fio3=item.fio3,
                        fio4=item.fio4,
                        fio5=item.fio5,
                        tseh=item.tseh,
                        night=item.night
                    )
                )
                await db.execute(stmt)
            else:
                stmt = insert(WebsiteTableData).values(
                    date=item.date if isinstance(item.date, date) else datetime.strptime(item.date, "%Y-%m-%d"),
                    apparatName=item.apparatName,
                    fio1=item.fio1,
                    fio2=item.fio2,
                    fio3=item.fio3,
                    fio4=item.fio4,
                    fio5=item.fio5,
                    tseh=item.tseh,
                    night=item.night
                ).returning(WebsiteTableData.id)
                result = await db.execute(stmt)
                item.id = result.scalar_one()
        
        await db.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_table_data", response_model=List[TableDataItem])
async def get_table_data(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(WebsiteTableData))
        table_data = result.scalars().all()
        return [TableDataItem(
            id=row.id,
            date=row.date,
            apparatName=row.apparatName,
            fio1=row.fio1,
            fio2=row.fio2,
            fio3=row.fio3,
            fio4=row.fio4,
            fio5=row.fio5,
            tseh=row.tseh,
            night=row.night
        ) for row in table_data]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching table data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
