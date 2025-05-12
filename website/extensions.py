"""
ไฟล์นี้ใช้สำหรับเก็บส่วนขยาย (extensions) ของ Flask ที่ใช้ร่วมกันในแอปพลิเคชัน
ช่วยป้องกันปัญหา Circular Import โดยรวมการสร้าง instance ของส่วนขยายไว้ที่เดียว

จุดประสงค์หลักคือการสร้าง instance ของ SQLAlchemy (db) ที่จะใช้ในแอปพลิเคชัน
ไฟล์นี้จะถูกนำเข้าโดยโมดูลอื่นๆ ที่ต้องการใช้งานฐานข้อมูล

วิธีการใช้งาน:
    - นำเข้า db จากไฟล์นี้ในโมดูลอื่นๆ: `from .extensions import db`
    - ช่วยป้องกันการนำเข้าแบบวนซ้ำระหว่าง models.py และ __init__.py
"""

from flask_sqlalchemy import SQLAlchemy

# สร้าง instance ของ SQLAlchemy ที่จะใช้ในแอปพลิเคชัน
# instance นี้จะถูกนำเข้าและใช้งานใน models.py และ __init__.py
db = SQLAlchemy() 