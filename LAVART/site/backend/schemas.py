from pydantic import BaseModel, validator
from datetime import date, datetime
from typing import Optional

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

class EmployeeItem(BaseModel):
    id: Optional[int] = None
    employment_date: Optional[datetime] = None
    fired_date: Optional[datetime] = None
    birthday_date: Optional[datetime] = None
    fio: str
    job_title: Optional[str] = None
    rank_title: Optional[int] = None
    tabel_number: Optional[str] = None
    tabel_filename: Optional[str] = None
    tariff_rate: Optional[int] = None
    division: Optional[str] = None
    status: Optional[str] = None
    schedule: Optional[str] = None
    shift_hours: Optional[int] = None
    skud_access: Optional[int] = None
    day_start: Optional[int] = None
    boss: Optional[str] = None
    KTR_category: Optional[str] = None
    KTR: Optional[float] = None
    has_NAX: Optional[bool] = None
    KNAX: Optional[float] = None
    KVL: Optional[float] = None
    KVL_last_month: Optional[float] = None
    division_1C: Optional[str] = None
    schedule_1C: Optional[str] = None
    fio_responsible: Optional[str] = None
    INN_employee: Optional[str] = None
    INN_responsible: Optional[str] = None
    INN_company: Optional[str] = None

    @validator('employment_date', 'fired_date', 'birthday_date', pre=True)
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value
