# zp
0) cd LAVART/site
1) pip install -r requirements.txt
2) Запустить из файла new_SQL.txt в pgAdmin код после комментария --this is new, чтобы создать таблицу, если не была запущен код по созданию профиля человека запустить ВЕСЬ файл.
3) cd frontend
4) npm install
5) npm start
6) Необходимо в database.py и env.py поменять DATABASE URL dsn на актуальный.
7) alembic upgrade head
8) python main.py
