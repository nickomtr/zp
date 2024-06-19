from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import TableDataItem
from crud import get_fio_data, save_table_data, delete_table_data, get_table_data
from typing import List

router = APIRouter()

@router.get("/items")
async def read_items():
    return [{"id": 1, "name": "Рабочее место 'Дуга'"}, {"id": 2, "name": "Рабочее место 'Заг.участок'"}]

@router.get("/fio_data", response_model=List[str])
async def read_fio_data(db: AsyncSession = Depends(get_db)):
    return await get_fio_data(db)

@router.post("/save_table_data")
async def save_data(data: List[TableDataItem], db: AsyncSession = Depends(get_db)):
    return await save_table_data(data, db)

@router.delete("/delete_table_data/{id}")
async def remove_table_data(id: int, db: AsyncSession = Depends(get_db)):
    return await delete_table_data(id, db)

@router.get("/get_table_data", response_model=List[TableDataItem])
async def fetch_table_data(db: AsyncSession = Depends(get_db)):
    return await get_table_data(db)
