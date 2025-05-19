from flask import Blueprint, render_template, request, flash, redirect, url_for, session
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import login_user, login_required, logout_user, current_user
from datetime import datetime

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    """
    จัดการการล็อกอินของผู้ใช้
    - GET: แสดงหน้าฟอร์มล็อกอิน
    - POST: ตรวจสอบข้อมูลและทำการล็อกอิน
    """
    if request.method == 'POST':
        # รับข้อมูลจากฟอร์ม
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False
        
        # ค้นหาผู้ใช้จากอีเมล
        user = User.query.filter_by(email=email).first()
        
        if user:
            # ตรวจสอบรหัสผ่าน
            if check_password_hash(user.password, password):
                flash('ล็อกอินสำเร็จ!', category='success')
                session.permanent = True  # ตั้งค่า session ให้คงอยู่ถาวร
                login_user(user, remember=remember)  # ทำการล็อกอินผู้ใช้
                return redirect(url_for('views.home'))
            else:
                return redirect(url_for('auth.login', password_error='รหัสผ่านไม่ถูกต้อง'))
        else:
            return redirect(url_for('auth.login', email_error='อีเมลไม่ถูกต้อง'))
    
    # รับข้อความ error จากพารามิเตอร์ URL
    email_error = request.args.get('email_error', '')
    password_error = request.args.get('password_error', '')
    
    return render_template("Login.html", user=current_user, email_error=email_error, password_error=password_error)

@auth.route('/logout')
@login_required
def logout():
    # ลบข้อมูล session ทั้งหมด
    session.clear()
    # ลบ remember cookie
    logout_user()
    return redirect(url_for('views.home'))

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    errors = {}  # เก็บข้อผิดพลาดที่พบ
    if request.method == 'POST':
        # รับข้อมูลจากฟอร์ม
        email = request.form.get('email')
        Username = request.form.get('Username')
        user_birthday = request.form.get('user_birthday')
        user_gender = request.form.get('user_gender')
        user_weight = request.form.get('user_weight')
        user_height = request.form.get('user_height')
        password1 = request.form.get('password1')
        password2 = request.form.get('password2')

        # --- เริ่มการตรวจสอบข้อมูล --- 
        # ตรวจสอบรูปแบบอีเมล
        if not email or '@' not in email or '.' not in email:
            errors['email'] = 'กรุณากรอกอีเมลให้ถูกต้อง'
        else:
            # ตรวจสอบว่าอีเมลซ้ำหรือไม่
            user = User.query.filter_by(email=email).first()
            if user:
                errors['email'] = 'อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น'
            
        # ตรวจสอบชื่อผู้ใช้
        if not Username or len(Username.strip()) < 2:
            errors['username'] = 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 2 ตัวอักษร'
            
        # ตรวจสอบส่วนสูงและน้ำหนัก
        try:
            h = float(user_height)
            w = float(user_weight)
            if h <= 0:
                 errors['height'] = 'ส่วนสูงต้องเป็นจำนวนบวก'
            if w <= 0:
                 errors['weight'] = 'น้ำหนักต้องเป็นจำนวนบวก'
        except (ValueError, TypeError):
            if not user_height:
                errors['height'] = 'กรุณากรอกส่วนสูง'
            else:
                errors['height'] = 'กรุณากรอกส่วนสูงเป็นตัวเลข'
            if not user_weight:
                 errors['weight'] = 'กรุณากรอกน้ำหนัก'
            else:
                 errors['weight'] = 'กรุณากรอกน้ำหนักเป็นตัวเลข'
            
        # ตรวจสอบรหัสผ่าน
        if not password1 or len(password1) < 7:
            errors['password'] = 'รหัสผ่านต้องมีความยาวอย่างน้อย 7 ตัวอักษร'
        if password1 != password2:
            errors['confirm_password'] = 'รหัสผ่านไม่ตรงกัน'
            
        # ตรวจสอบเพศ
        if not user_gender or user_gender not in ['Male', 'Female']:
            errors['gender'] = 'กรุณาเลือกเพศ'
            
        # ตรวจสอบวันเกิด
        if not user_birthday:
            errors['birthday'] = 'กรุณากรอกวันเกิด'
        else:
            # ตรวจสอบว่าวันเกิดไม่ใช่ปีปัจจุบันหรืออนาคต
            current_year = datetime.now().year
            birthday_year = datetime.strptime(user_birthday, '%Y-%m-%d').year
            if birthday_year >= current_year:
                errors['birthday'] = 'วันเกิดไม่สามารถเป็นปีปัจจุบันหรืออนาคต'
        # --- จบการตรวจสอบข้อมูล --- 

        # ถ้าไม่มีข้อผิดพลาด ให้สร้างผู้ใช้ใหม่
        if not errors:
            try:
                # สร้างผู้ใช้ใหม่
                new_user = User(
                    email=email,
                    Username=Username,
                    user_gender=user_gender,
                    user_birthday=user_birthday,
                    user_weight=user_weight,
                    user_height=user_height,
                    password=generate_password_hash(password1, method='pbkdf2:sha256')
                )
                db.session.add(new_user)
                db.session.commit()
                login_user(new_user, remember=True)
                flash('สร้างบัญชีสำเร็จ! ยินดีต้อนรับสู่ CalsFood!', category='success')
                return redirect(url_for('views.home'))
            except Exception as e:
                db.session.rollback()  # ยกเลิกการเปลี่ยนแปลงถ้าเกิดข้อผิดพลาด
                flash('เกิดข้อผิดพลาดในการสร้างบัญชี กรุณาลองใหม่อีกครั้ง', category='error')
                print(f"Error creating user: {e}")  # บันทึกข้อผิดพลาดสำหรับการแก้ไข
                return render_template("Create_Account.html", user=current_user, errors={}, form_data=request.form)
        
        # ถ้ามีข้อผิดพลาด แสดงฟอร์มพร้อมข้อผิดพลาดและข้อมูลเดิม
        if errors:
             return render_template("Create_Account.html", user=current_user, errors=errors, form_data=request.form)
            
    # สำหรับการเรียก GET หรือกรณี POST ล้มเหลวก่อนการตรวจสอบ
    return render_template("Create_Account.html", user=current_user, errors={}, form_data={})
