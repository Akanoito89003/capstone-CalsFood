from .extensions import db
from flask_login import UserMixin
from sqlalchemy.sql import func
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
    
# --- Association Tables ---
class MenuAuto_Ingredient(db.Model):
    __tablename__ = 'menuauto_ingredient'
    menuauto_id = db.Column(db.Integer, db.ForeignKey('menuauto.menuauto_id', ondelete='CASCADE'), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.ingredient_id', ondelete='CASCADE'), primary_key=True)

class MyMenu_Ingredient(db.Model):
    __tablename__ = 'mymenu_ingredient'
    mymenu_id = db.Column(
        db.Integer,
        db.ForeignKey('mymenu.mymenu_id', ondelete='CASCADE'),
        primary_key=True
    )
    ingredient_id = db.Column(
        db.Integer,
        db.ForeignKey('ingredient.ingredient_id', ondelete='CASCADE'),
        primary_key=True
    )

class Daily_MyMenu(db.Model):
    __tablename__ = 'daily_mymenu'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # เพิ่ม id
    daily_id = db.Column(db.Integer, db.ForeignKey('daily.daily_id', ondelete='CASCADE'))
    mymenu_id = db.Column(db.Integer, db.ForeignKey('mymenu.mymenu_id', ondelete='CASCADE'))
    menu_type = db.Column(db.String(50))  # เช่น breakfast/lunch/dinner
    icon_url = db.Column(db.String(255))  # เพิ่ม field นี้
    mymenu = db.relationship('MyMenu', back_populates='dailies')

# --- Main Tables ---
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Username = db.Column(db.String(150))
    user_weight = db.Column(db.String(50))
    user_height = db.Column(db.String(50))
    user_birthday = db.Column(db.String(50))
    user_gender = db.Column(db.String(50))
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    profile_image = db.Column(db.String(255))  # เก็บ path ของรูปภาพ
    
    mymenus = db.relationship('MyMenu', back_populates='user')
    dailies = db.relationship('Daily', back_populates='user')
    
    def get_id(self):
        """
        Method ที่จำเป็นสำหรับ Flask-Login
        - ใช้ระบุตัวตนของผู้ใช้ในระบบ
        - ถูกเรียกใช้อัตโนมัติเมื่อมีการ login/logout
        - ต้องคืนค่าเป็น string เพื่อใช้เก็บใน session
        """
        return str(self.user_id)

class Category(db.Model):
    __tablename__ = 'category'
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(100))
    category_description = db.Column(db.String(400))

    ingredients = db.relationship('Ingredient', back_populates='category')

class Ingredient(db.Model):
    __tablename__ = 'ingredient'
    ingredient_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ingredient_name = db.Column(db.String(100))
    ingredient_calories = db.Column(db.String(200))
    ingredient_value = db.Column(db.String(200))
    ingredient_photo = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id', ondelete='CASCADE'))

    category = db.relationship('Category', back_populates='ingredients')

class MenuAuto(db.Model):
    __tablename__ = 'menuauto'
    menuauto_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    menuauto_name = db.Column(db.String(100))
    menuauto_image = db.Column(db.String(255))

    ingredients = db.relationship('Ingredient', secondary='menuauto_ingredient', backref='menuautos')

class MyMenu(db.Model):
    __tablename__ = 'mymenu'
    mymenu_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mymenu_name = db.Column(db.String(100))
    mymenu_createdate = db.Column(db.DateTime, default=func.now())
    mymenu_calorie = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'))

    user = db.relationship('User', back_populates='mymenus')
    ingredients = db.relationship(
        'Ingredient',
        secondary='mymenu_ingredient',
        backref=db.backref('mymenus', lazy='dynamic'),
        cascade="all, delete",
        passive_deletes=True
    )
    dailies = db.relationship('Daily_MyMenu', back_populates='mymenu')

class Daily(db.Model):
    __tablename__ = 'daily'
    daily_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    daily_createdate = db.Column(db.DateTime, default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'))

    user = db.relationship('User', back_populates='dailies')
    mymenus = db.relationship('Daily_MyMenu', backref='daily', cascade="all, delete", passive_deletes=True)
