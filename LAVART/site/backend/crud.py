from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import WebsiteTableData, Employee
from schemas import TableDataItem
from sqlalchemy import insert, update, delete
from datetime import datetime
from fastapi import HTTPException
from datetime import date
async def get_fio_data(db: AsyncSession):
    result = await db.execute(select(Employee.fio))
    fio_data = result.scalars().all()
    return fio_data

async def save_table_data(data: list[TableDataItem], db: AsyncSession):
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

async def delete_table_data(id: int, db: AsyncSession):
    try:
        stmt = (
            delete(WebsiteTableData)
            .where(WebsiteTableData.id == id)
        )
        await db.execute(stmt)
        await db.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_table_data(db: AsyncSession):
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
