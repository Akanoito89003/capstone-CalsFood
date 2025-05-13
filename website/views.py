from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for
from flask_login import login_required, current_user
from .models import User, Category, Ingredient, MenuAuto, MyMenu, Daily, Daily_MyMenu
from . import db
import json
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename
from PIL import Image
import io
from .food_predictor import ThaiFoodPredictor
from datetime import datetime
from sqlalchemy import text


views = Blueprint('views', __name__)
# สร้าง instance ของ ThaiFoodPredictor ที่ระดับ module (global scope)
# instance นี้จะถูกใช้ร่วมกันในทุก request ที่เรียกใช้ predictor
predictor = ThaiFoodPredictor()

# กำหนดโฟลเดอร์เก็บรูปและไฟล์ที่อนุญาต
UPLOAD_FOLDER = 'website/static/profile_pics'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# สร้างโฟลเดอร์ถ้ายังไม่มี
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@views.route('/', methods=['GET', 'POST'])
def home():
    """
    แสดงหน้าหลักของเว็บไซต์
    - ถ้าล็อกอิน: แสดงหน้า home.html พร้อมฟีเจอร์เต็มรูปแบบ
    - ถ้าไม่ล็อกอิน: แสดงหน้า home_guest.html
    """
    if current_user.is_authenticated:  # เช็คว่าผู้ใช้ล็อกอินหรือไม่
        # ดึงข้อมูลเมนูล่าสุด 3 รายการ
        latest_menus = MyMenu.query.filter_by(user_id=current_user.user_id)\
            .order_by(MyMenu.mymenu_createdate.desc())\
            .limit(3)\
            .all()
        
        return render_template("Home_Login.html", user=current_user, latest_menus=latest_menus)
    
    return render_template("Home_Logout.html", user=None)


# เพิ่มเมนู
@views.route('/design', methods=['GET', 'POST'])
def add_menu():
    if not current_user.is_authenticated:
        # Get all categories and ingredients from database
        categories = Category.query.all()
        ingredients = Ingredient.query.all()
        
        # Group ingredients by category
        ingredients_by_category = {}
        for category in categories:
            ingredients_by_category[category.category_name] = [
                ingredient for ingredient in ingredients 
                if ingredient.category_id == category.category_id
            ]
        
        return render_template(
            "Design_Logout.html", 
            user=None,
            categories=categories,
            ingredients_by_category=ingredients_by_category
        )
    
    if request.method == 'POST':
        menu_name = request.form.get('menu_name')
        ingredient_ids = request.form.getlist('ingredients')
        
        if not menu_name:
            flash('Menu name is required!', category='error')
        else:
            # สร้างเมนูใหม่
            new_menu = MenuAuto(menuauto_name=menu_name)
            
            # เพิ่มวัตถุดิบที่เลือกเข้าไปในเมนู
            for ingredient_id in ingredient_ids:
                ingredient = Ingredient.query.get(ingredient_id)
                if ingredient:
                    new_menu.ingredients.append(ingredient)
            
            db.session.add(new_menu)
            db.session.commit()
            flash('Menu added!', category='success')
            return redirect(url_for('views.add_menu'))

    # ดึงข้อมูลสำหรับแสดงในหน้า
    menus = MenuAuto.query.all()
    ingredients = Ingredient.query.all()
    categories = Category.query.all()
    
    # Group ingredients by category
    ingredients_by_category = {}
    for category in categories:
        ingredients_by_category[category.category_name] = [
            ingredient for ingredient in ingredients 
            if ingredient.category_id == category.category_id
        ]
    
    return render_template(
        "Design_Login.html", 
        user=current_user, 
        menus=menus, 
        ingredients=ingredients,
        categories=categories,
        ingredients_by_category=ingredients_by_category
    )

@views.route('/menus')
@login_required
def menus():
    """แสดงหน้ารายการเมนูและฟอร์มเพิ่มเมนู"""
    menus = MenuAuto.query.all()
    ingredients = Ingredient.query.all()  # สำหรับ checkbox เลือกวัตถุดิบ
    return render_template(
        "add_menu.html", 
        user=current_user,
        menus=menus,
        ingredients=ingredients
    )

@views.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """แสดงและแก้ไขข้อมูลผู้ใช้"""
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'update_profile':
            try:
                # จัดการอัพโหลดรูป
                if 'profile_image' in request.files:
                    file = request.files['profile_image']
                    if file and file.filename != '' and allowed_file(file.filename):
                        filename = secure_filename(f"user_{current_user.user_id}_{file.filename}")
                        file.save(os.path.join(UPLOAD_FOLDER, filename))
                        current_user.profile_image = filename
                # ********* จุดที่แก้ปัญหา: จัดการกรณีลบรูป *********
                # ถ้า profile_image เป็น 'default.png' แสดงว่าผู้ใช้ต้องการลบรูป
                elif request.form.get('profile_image') == 'default.png':
                    # ลบรูปเก่าออกจากโฟลเดอร์ถ้ามี
                    if current_user.profile_image:
                        old_filepath = os.path.join(UPLOAD_FOLDER, current_user.profile_image)
                        if os.path.exists(old_filepath):
                            os.remove(old_filepath)
                    # เซ็ตค่า profile_image เป็น None ในฐานข้อมูล
                    current_user.profile_image = None

                # อัพเดตข้อมูลที่สามารถแก้ไขได้
                if 'user_height' in request.form:
                    current_user.user_height = request.form.get('user_height')
                if 'user_weight' in request.form:
                    current_user.user_weight = request.form.get('user_weight')
                if 'user_gender' in request.form:
                    current_user.user_gender = request.form.get('user_gender')
                if 'username' in request.form:
                    current_user.Username = request.form.get('username')
                
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'updated_data': {
                        'username': current_user.Username,
                        'user_height': current_user.user_height,
                        'user_weight': current_user.user_weight,
                        'user_gender': current_user.user_gender,
                        'profile_image': current_user.profile_image
                    }
                })
            except Exception as e:
                db.session.rollback()
                return jsonify({'success': False, 'error': str(e)})
                
        elif action == 'change_password':
            # เปลี่ยนรหัสผ่าน
            current_password = request.form.get('current_password')
            new_password = request.form.get('new_password')
            confirm_password = request.form.get('confirm_password')
            
            # เช็ครหัสปัจจุบันว่าใส่ตรงกันไหม
            if not check_password_hash(current_user.password, current_password):
                return jsonify({'success': False, 'error': 'รหัสผ่านปัจจุบันไม่ถูกต้อง'})
            elif len(new_password) < 7:
                return jsonify({'success': False, 'error': 'รหัสผ่านใหม่ต้องมีอย่างน้อย 7 ตัวอักษร'})
            elif new_password != confirm_password:
                return jsonify({'success': False, 'error': 'รหัสผ่านใหม่ไม่ตรงกัน'})
            else:
                current_user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
                try:
                    db.session.commit()
                    return jsonify({'success': True})
                except Exception as e:
                    db.session.rollback()
                    return jsonify({'success': False, 'error': str(e)})

    return render_template("Profile_Login.html", user=current_user)

@views.route('/delete-profile-image', methods=['DELETE'])
@login_required  # ต้อง login ก่อนถึงจะลบรูปได้
def delete_profile_image():
    try:
        if current_user.profile_image:  # เช็คว่ามีรูปอยู่ไหม
            # สร้าง path เต็มของไฟล์รูป
            filepath = os.path.join(UPLOAD_FOLDER, current_user.profile_image)
            
            # เช็คว่าไฟล์มีอยู่จริงไหม ถ้ามีให้ลบ
            if os.path.exists(filepath):
                os.remove(filepath)
            
            # ลบ path ในฐานข้อมูล โดยเซ็ตเป็น None
            current_user.profile_image = None
            db.session.commit()
            
            return jsonify({'success': True})
    except Exception as e:
        # ถ้าเกิด error ให้ print และส่ง False กลับ
        print(f"Error deleting profile image: {str(e)}")
        return jsonify({'success': False})

    return jsonify({'success': False})

@views.route('/upload-profile-image', methods=['POST'])
@login_required
def upload_profile_image():
    """อัพโหลดรูปโปรไฟล์"""
    try:
        if 'profile_image' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})
        
        file = request.files['profile_image']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})
        
        if file and allowed_file(file.filename):
            # ลบรูปเก่าถ้ามี
            if current_user.profile_image:
                old_filepath = os.path.join(UPLOAD_FOLDER, current_user.profile_image)
                if os.path.exists(old_filepath):
                    os.remove(old_filepath)
            
            # สร้างชื่อไฟล์ใหม่ตามรูปแบบที่ต้องการ
            filename = secure_filename(f"user_{current_user.user_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # บันทึกไฟล์
            file.save(filepath)
            
            # อัพเดตข้อมูลในฐานข้อมูล
            current_user.profile_image = filename
            db.session.commit()
            
            return jsonify({
                'success': True,
                'user_id': current_user.user_id
            })
        else:
            return jsonify({'success': False, 'error': 'Invalid file type'})
            
    except Exception as e:
        print(f"Error uploading profile image: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# ENDPOINTS สำหรับ AI PREDICTION:

#เป็น endpoint ที่ใช้สำหรับรับรูปภาพจาก client และส่งผลการทำนายกลับไป โดยทำงานร่วมกับหน้า AI test
@views.route('/predict', methods=['POST'])
def predict():
    # รับรูปภาพจาก request
    image_file = request.files['image']
    image = Image.open(io.BytesIO(image_file.read())).convert('RGB')
    
    # เรียกใช้ method predict ของ predictor
    food_name = predictor.predict(image)  # ใช้ predictor ทำนายชื่ออาหาร
    
    # ถ้าทำนายได้ "ไม่สามารถระบุได้" ให้ส่งกลับเป็น JSON
    if food_name == "ไม่สามารถระบุได้ (อาจไม่ใช่รูปอาหาร)":
        return jsonify({
            'success': False,
            'message': food_name
        })
    
    # ถ้าทำนายได้ ให้ redirect ไปที่หน้า ai-process พร้อมส่งชื่ออาหาร
    return redirect(url_for('views.ai_process', food=food_name))

#เป็น endpoint ที่ใช้สำหรับแสดงหน้าทดสอบ AI
@views.route('/ai-test')
def ai_test():
    """แสดงหน้าทดสอบ AI"""
    if current_user.is_authenticated:
        return render_template("AI_Login.html", user=current_user)
    return render_template("AI_Logout.html", user=None)

@views.route('/ai-process')
def ai_process():
    """แสดงหน้าผลการวิเคราะห์อาหาร"""
    food_name = request.args.get('food')
    if not food_name:
        return redirect(url_for('views.ai_test'))
        
    # Get menu details from database using MenuAuto
    menu = MenuAuto.query.filter_by(menuauto_name=food_name).first()
    if not menu:
        return redirect(url_for('views.ai_test'))
        
    # Get ingredients and calculate total calories
    ingredients_data = []
    total_calories = 0
    
    for ingredient in menu.ingredients:
        calories = float(ingredient.ingredient_calories.split()[0])
        total_calories += calories
        ingredients_data.append({
            'name': ingredient.ingredient_name,
            'calories': calories,
            'value': ingredient.ingredient_value,
            'category': ingredient.category.category_name
        })
    
    # Choose template based on authentication status
    if current_user.is_authenticated:
        return render_template(
            "AI-Process_Login.html",
            user=current_user,
            menu_name=food_name,
            ingredients=ingredients_data,
            total_calories=total_calories
        )
    else:
        return render_template(
            "AI-Process_Logout.html",
            user=None,
            menu_name=food_name,
            ingredients=ingredients_data,
            total_calories=total_calories
        )

def format_birthday(birthday_str):
    # ลองแปลงจากรูปแบบที่พบบ่อย
    if not birthday_str:
        return ''
    for fmt in ('%d/%m/%Y', '%Y-%m-%d', '%Y/%m/%d'):
        try:
            d = datetime.strptime(birthday_str, fmt)
            return d.strftime('%Y-%m-%d')
        except Exception:
            continue
    return ''  # ถ้าแปลงไม่ได้

@views.route('/inventory')
def inventory():
    """แสดงหน้าคลังเมนูอาหารของผู้ใช้"""
    if not current_user.is_authenticated:
        # ถ้าไม่ได้ login ให้ redirect ไปหน้า login
        return redirect(url_for('auth.login'))
    
    # คำนวณ BMI
    bmi = None
    bmi_status = None
    if current_user.user_weight and current_user.user_height:
        try:
            weight = float(current_user.user_weight)
            height = float(current_user.user_height) / 100  # แปลงจาก cm เป็น m
            bmi = round(weight / (height * height), 1)
            
            # กำหนดสถานะ BMI
            if bmi < 18.5:
                bmi_status = "underweight"
            elif bmi < 23:
                bmi_status = "normal"
            elif bmi < 25:
                bmi_status = "overweight"
            else:
                bmi_status = "obese"
        except (ValueError, ZeroDivisionError):
            bmi = None
            bmi_status = None
    
    # --- เพิ่มส่วนนี้ ---
    user_birthday = ''
    if current_user.user_birthday:
        user_birthday = format_birthday(current_user.user_birthday)
    # -------------------
    
    # ถ้า login แล้ว ให้แสดงหน้า Inventory_Login.html
    mymenus = current_user.mymenus  # ใช้ mymenus แทน saved_menus
    return render_template('Inventory_Login.html', 
                         user=current_user, 
                         mymenus=mymenus,
                         bmi=bmi,
                         bmi_status=bmi_status,
                         user_birthday=user_birthday)

@views.route('/remove-from-inventory/<int:menu_id>', methods=['POST'])
@login_required
def remove_from_inventory(menu_id):
    """ลบเมนูออกจากคลัง"""
    try:
        menu = MyMenu.query.get(menu_id)
        if menu and menu.user_id == current_user.user_id:
            db.session.delete(menu)
            db.session.commit()
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'Menu not found'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@views.route('/menu/<int:menu_id>')
@login_required
def menu_details(menu_id):
    """แสดงรายละเอียดของเมนู"""
    menu = MenuAuto.query.get_or_404(menu_id)
    return render_template('menu_details.html', menu=menu)

@views.route('/select', methods=['GET', 'POST'])
@login_required
def select_menu():
    """แสดงหน้าเลือกเมนูและบันทึกเมนูที่เลือก"""
    if request.method == 'POST':
        menu_name = request.form.get('menu_name')
        ingredient_ids = request.form.getlist('ingredients')
        
        # สร้าง UserMenu ใหม่
        new_user_menu = MyMenu(
            mymenu_name=menu_name,
            user_id=current_user.user_id
        )
        db.session.add(new_user_menu)
        
        # เพิ่มวัตถุดิบที่เลือก
        if ingredient_ids:
            ingredients = Ingredient.query.filter(Ingredient.ingredient_id.in_(ingredient_ids)).all()
            new_user_menu.ingredients.extend(ingredients)
        
        try:
            db.session.commit()
            flash('เมนูถูกบันทึกเรียบร้อยแล้ว!', category='success')
            return redirect(url_for('views.inventory'))
        except Exception as e:
            db.session.rollback()
            flash('เกิดข้อผิดพลาดในการบันทึกเมนู', category='error')
            print(e)  # สำหรับ debug
    
    # GET request: แสดงหน้าฟอร์มพร้อมรายการเมนูและวัตถุดิบ
    menus = MenuAuto.query.all()
    ingredients = Ingredient.query.all()
    return render_template(
        "select_menu.html",  # ต้องสร้างไฟล์ template ใหม่
        user=current_user,
        menus=menus,
        ingredients=ingredients
    )

@views.route('/check-current-password', methods=['POST'])
@login_required
def check_current_password():
    """ตรวจสอบรหัสผ่านปัจจุบัน"""
    data = request.get_json()
    current_password = data.get('current_password')
    
    if not current_password:
        return jsonify({'is_correct': False})
    
    is_correct = check_password_hash(current_user.password, current_password)
    return jsonify({'is_correct': is_correct})

@views.route('/save-menu', methods=['POST'])
@login_required
def save_menu():
    """บันทึกเมนูอาหารลงในฐานข้อมูล"""
    try:
        data = request.get_json()
        menu_name = data.get('menu_name')
        datetime_str = data.get('datetime')
        total_calories = data.get('total_calories')
        ingredients = data.get('ingredients', [])  # List of dicts: {name, calories}

        if not menu_name:
            return jsonify({'success': False, 'error': 'กรุณากรอกชื่ออาหาร'})
        if not datetime_str:
            return jsonify({'success': False, 'error': 'กรุณาระบุวันที่และเวลา'})
        if not ingredients:
            return jsonify({'success': False, 'error': 'กรุณาเลือกวัตถุดิบอย่างน้อย 1 รายการ'})

        try:
            # Create new menu
            new_menu = MyMenu(
                mymenu_name=menu_name,
                mymenu_createdate=datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M'),
                mymenu_calorie=float(total_calories),
                user_id=current_user.user_id
            )
            db.session.add(new_menu)
            db.session.flush()  # เพื่อให้ new_menu.mymenu_id ถูกสร้าง

            # Add ingredients to menu (by name)
            for ingredient_data in ingredients:
                name = ingredient_data.get('name')
                ingredient = Ingredient.query.filter_by(ingredient_name=name).first()
                if ingredient:
                    new_menu.ingredients.append(ingredient)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'บันทึกเมนูสำเร็จ',
                'menu_id': new_menu.mymenu_id,
                'menu_name': new_menu.mymenu_name,
                'created_date': new_menu.mymenu_createdate.strftime('%Y-%m-%d %H:%M'),
                'total_calories': new_menu.mymenu_calorie
            })
        except ValueError as e:
            return jsonify({'success': False, 'error': 'รูปแบบวันที่ไม่ถูกต้อง'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': f'เกิดข้อผิดพลาดในการบันทึกข้อมูล: {str(e)}'})
    except Exception as e:
        return jsonify({'success': False, 'error': f'เกิดข้อผิดพลาดในการประมวลผล: {str(e)}'})

@views.route('/delete-menu/<int:menu_id>', methods=['DELETE'])
@login_required
def delete_menu(menu_id):
    # Debug log
    print('menu_id:', menu_id)
    print('current_user:', current_user.user_id)
    menu = MyMenu.query.get(menu_id)
    print('menu:', menu)
    try:
        if menu and menu.user_id == current_user.user_id:
            db.session.delete(menu)
            db.session.commit()
            return jsonify({'success': True, 'message': 'ลบเมนูสำเร็จ'})
        else:
            return jsonify({'success': False, 'error': 'ไม่พบเมนูหรือไม่มีสิทธิ์ในการลบ'})
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print('Error while deleting menu:', error_msg)
        # ถ้า error เกิดจาก expected to delete 1 row(s); Only 0 were matched. ให้ถือว่าลบสำเร็จ
        if 'expected to delete 1 row' in error_msg and 'Only 0 were matched' in error_msg:
            return jsonify({'success': True, 'message': 'ลบเมนูสำเร็จ'})
        return jsonify({'success': False, 'error': 'เกิดข้อผิดพลาดขณะลบเมนู กรุณาลองใหม่อีกครั้ง หรือแจ้งผู้ดูแลระบบ'})

@views.route('/get-menu-ingredients/<int:menu_id>')
@login_required
def get_menu_ingredients(menu_id):
    try:
        menu = MyMenu.query.get_or_404(menu_id)
        print('DEBUG: menu.ingredients =', menu.ingredients)
        for ing in menu.ingredients:
            print('DEBUG: ingredient:', ing.ingredient_id, ing.ingredient_name, ing.ingredient_calories)
        ingredients = [{
            'name': ing.ingredient_name,
            'calories': ing.ingredient_calories
        } for ing in menu.ingredients]
        print('DEBUG: ingredients =', ingredients)
        return jsonify({
            'success': True,
            'ingredients': ingredients
        })
    except Exception as e:
        print('DEBUG: error in get_menu_ingredients:', e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@views.route('/daily-meals', methods=['GET'])
@login_required
def get_daily_meals():
    check_and_fix_auto_increment()  # เพิ่มการเรียกใช้ที่นี่
    dailies = Daily.query.filter_by(user_id=current_user.user_id).order_by(Daily.daily_createdate.desc()).all()
    result = []
    for daily in dailies:
        meals = {'breakfast': [], 'lunch': [], 'dinner': []}
        for link in daily.mymenus:
            if link.mymenu:
                meals[link.menu_type].append({
                    'mymenu_id': link.mymenu_id,
                    'name': link.mymenu.mymenu_name,
                    'calories': link.mymenu.mymenu_calorie,
                    'icon_url': link.icon_url
                })
            else:
                meals[link.menu_type].append({
                    'mymenu_id': link.mymenu_id,
                    'name': '(เมนูถูกลบหรือข้อมูลไม่สมบูรณ์)',
                    'calories': 0,
                    'icon_url': link.icon_url
                })
        result.append({
            'daily_id': daily.daily_id,
            'date': daily.daily_createdate.strftime('%Y-%m-%d'),
            'meals': meals
        })
    return jsonify({'success': True, 'dailies': result})

@views.route('/daily-meals', methods=['POST'])
@login_required
def create_daily_meal():
    data = request.get_json()
    date_str = data.get('date')
    meals = data.get('meals', {})
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        daily = Daily(daily_createdate=date_obj, user_id=current_user.user_id)
        db.session.add(daily)
        db.session.flush()  # เพื่อให้ daily_id ถูกสร้าง
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            for menu in meals.get(meal_type, []):
                # Use default empty meal icon if no icon_url provided
                icon_url = menu.get('icon_url') or "https://cdn-icons-png.flaticon.com/512/1410/1410532.png"
                link = Daily_MyMenu(
                    daily_id=daily.daily_id,
                    mymenu_id=menu['mymenu_id'],
                    menu_type=meal_type,
                    icon_url=icon_url
                )
                db.session.add(link)
        db.session.commit()
        return jsonify({'success': True, 'daily_id': daily.daily_id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@views.route('/daily-meals/<int:daily_id>', methods=['PUT'])
@login_required
def update_daily_meal(daily_id):
    data = request.get_json()
    meals = data.get('meals', {})
    try:
        daily = Daily.query.get_or_404(daily_id)
        # date จาก frontend
        date_str = data.get('date')
        if date_str:
            daily.daily_createdate = datetime.strptime(date_str, '%Y-%m-%d')
        # ลบ Daily_MyMenu เดิม
        Daily_MyMenu.query.filter_by(daily_id=daily_id).delete()
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            for menu in meals.get(meal_type, []):
                # Use default empty meal icon if no icon_url provided
                icon_url = menu.get('icon_url') or "https://cdn-icons-png.flaticon.com/512/1410/1410532.png"
                link = Daily_MyMenu(
                    daily_id=daily_id,
                    mymenu_id=menu['mymenu_id'],
                    menu_type=meal_type,
                    icon_url=icon_url
                )
                db.session.add(link)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@views.route('/daily-meals/<int:daily_id>', methods=['DELETE'])
@login_required
def delete_daily_meal(daily_id):
    try:
        daily = Daily.query.get_or_404(daily_id)
        db.session.delete(daily)
        db.session.commit()
        
        # ตรวจสอบว่าถ้าไม่มีข้อมูล daily แล้ว ให้รีเซ็ต auto-increment
        if Daily.query.count() == 0:
            # รีเซ็ต auto-increment counter สำหรับตาราง daily และ daily_mymenu
            from sqlalchemy import text
            try:
                # ใช้ TRUNCATE TABLE เพื่อลบข้อมูลและรีเซ็ต auto-increment
                db.session.execute(text('TRUNCATE TABLE daily'))
                db.session.execute(text('TRUNCATE TABLE daily_mymenu'))
                db.session.commit()
            except Exception as e:
                print(f"Error resetting auto-increment: {str(e)}")
                # ถ้า TRUNCATE ไม่สำเร็จ ให้ใช้วิธีอื่น
                try:
                    # ใช้ ALTER TABLE แบบ MySQL
                    db.session.execute(text('ALTER TABLE daily AUTO_INCREMENT = 1'))
                    db.session.execute(text('ALTER TABLE daily_mymenu AUTO_INCREMENT = 1'))
                    db.session.commit()
                except Exception as e:
                    print(f"Error with ALTER TABLE: {str(e)}")
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

# เพิ่มฟังก์ชันใหม่สำหรับตรวจสอบและแก้ไข auto-increment
def check_and_fix_auto_increment():
    try:
        # ตรวจสอบว่ามี daily_id ที่หายไปหรือไม่
        dailies = Daily.query.order_by(Daily.daily_id).all()
        if dailies:
            expected_id = 1
            for daily in dailies:
                if daily.daily_id != expected_id:
                    # ถ้า daily_id ไม่ต่อเนื่อง ให้แก้ไข
                    daily.daily_id = expected_id
                expected_id += 1
            db.session.commit()
    except Exception as e:
        print(f"Error fixing auto-increment: {str(e)}")
        db.session.rollback()

@views.route('/auto-menus', methods=['GET'])
def get_auto_menus():
    menus = MenuAuto.query.all()
    result = []
    for menu in menus:
        result.append({
            'id': menu.menuauto_id,
            'name': menu.menuauto_name,
            'image': menu.menuauto_image
        })
    return jsonify({'success': True, 'menus': result})

@views.route('/get-menuauto-ingredients/<int:menuauto_id>')
def get_menuauto_ingredients(menuauto_id):
    menu = MenuAuto.query.get_or_404(menuauto_id)
    ingredients = [
        {
            'id': ing.ingredient_id,
            'name': ing.ingredient_name,
            'calories': ing.ingredient_calories,
            'photo': ing.ingredient_photo,
            'category': ing.category.category_name if ing.category else ''
        }
        for ing in menu.ingredients
    ]
    return jsonify({'success': True, 'ingredients': ingredients})
