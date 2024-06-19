from sqlalchemy import Column, Integer, String, BigInteger, SmallInteger, Boolean, Double, TIMESTAMP, text, Date
from sqlalchemy.ext.declarative import declarative_base

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
