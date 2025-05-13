from flask import Flask
from flask_login import LoginManager
import pymysql
from os import path
from datetime import timedelta
from .extensions import db
from .models import User, Category, Ingredient, MenuAuto, Ingredient, MenuAuto_Ingredient

DB_NAME = "capstone"

def create_database():
    """สร้างฐานข้อมูล capstone ถ้ายังไม่มี"""
    try:
        # เชื่อมต่อ MySQL โดยไม่ระบุฐานข้อมูล
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='css222',  # ใส่รหัสผ่าน MySQL ของคุณ (ถ้ามี)
        )
        
        with connection.cursor() as cursor:
            # สร้างฐานข้อมูล
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            print(f"✅ สร้างฐานข้อมูล {DB_NAME} สำเร็จ!")
            
        connection.close()
        
        # สร้างตาราง
        from .models import User, Category, Ingredient, MenuAuto
        db.create_all()
        print("✅ Created database tables!")
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการสร้างฐานข้อมูล: {str(e)}")

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'hjshjhdjah kjshkjdhjs'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://root:css222@localhost/{DB_NAME}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # กำหนด session lifetime เป็น 2 นาที
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=2)
    
    db.init_app(app)

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User, Category, Ingredient, MenuAuto
    
    with app.app_context():
        # สร้างฐานข้อมูลถ้ายังไม่มี
        create_database()
        
        # เพิ่มข้อมูลเริ่มต้น
        init_db_data()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    return app

def init_db_data():
    """เพิ่มข้อมูลเริ่มต้นในฐานข้อมูล"""
    from .models import Category, Ingredient, MenuAuto
    
    # เช็คว่ามีข้อมูลอยู่แล้วหรือไม่
    if Category.query.first() is None:
        try:
            # เพิ่มหมวดหมู่
            categories = [
                Category(category_name="คาร์โบไฮเดรต", category_description="จำพวกที่เป็นแป้งส่วนใหญ่เช่น ข้าวสวย, ข้าวกล้อง, ขนมปังขาว, เส้นพาสต้าเป็นต้น"),
                Category(category_name="โปรตีน", category_description="จำพวกที่เป็นเนื้อสัตว์ส่วนใหญ่เช่น เนื้อหมูไม่ติดมัน , เนื้อไก่ไม่ติดหนัง , เนื้อวัวไม่ติดมัน , ปลาแซลมอน , ไข่ไก่ , นมวัว เป็นต้น"),
                Category(category_name="ไขมัน", category_description="จำพวกที่เป็นน้ำมันส่วนใหญ่เช่น น้ำมันมะกอก ,น้ำมันรำข้าว,เนย,กะทิ เป็นต้น"),
                Category(category_name="วิตามินและเกลือเเร่", category_description="จำพวกผักและผลไม้ เช่น ผักบุ้ง, คะน้า, มะเขือเทศ, แตงกวา, แครอท, ฝรั่ง, ส้ม และกล้วย เป็นต้น"),
                Category(category_name="เครื่องปรุง", category_description="โดยทั่วไปให้พลังงานต่ำ แต่ถ้ามีส่วนผสมอื่นจะเพิ่มแคลอรี่เช่น เกลือแกง, น้ำปลา, ซีอิ๊วขาว, ซอสถั่วเหลือง, กะปิ, เป็นต้น")
            ]
            db.session.add_all(categories)
            db.session.commit()
            print("✅ Added categories!")

            # เพิ่มวัตถุดิบ
            ingredients = [
                # ประมาณ 160 อัน
                
                # 1 - คาร์โบไฮเดรต
                Ingredient(ingredient_name="ฟักทอง", ingredient_calories="10 kcal", ingredient_value="30 g", ingredient_photo="ฟักทอง.png", category_id=1),
                Ingredient(ingredient_name="ข้าวโพดอ่อน", ingredient_calories="6 kcal", ingredient_value="20 g", ingredient_photo="ข้าวโพดอ่อน.png", category_id=1),
                Ingredient(ingredient_name="มันฝรั่ง", ingredient_calories="42 kcal", ingredient_value="50 g", ingredient_photo="มันฝรั่ง.png", category_id=1),
                Ingredient(ingredient_name="เส้นจันท์", ingredient_calories="150 kcal", ingredient_value="100 g", ingredient_photo="เส้นจันท์.png", category_id=1),
                Ingredient(ingredient_name="วุ้นเส้น", ingredient_calories="140 kcal", ingredient_value="40 g", ingredient_photo="วุ้นเส้น.png", category_id=1),
                Ingredient(ingredient_name="เส้นข้าวซอย", ingredient_calories="180 kcal", ingredient_value="100 g", ingredient_photo="เส้นข้าวซอย.png", category_id=1),
                Ingredient(ingredient_name="ข้าวสวย", ingredient_calories="80 kcal", ingredient_value="60 g", ingredient_photo="ข้าวสวย.png", category_id=1),
                Ingredient(ingredient_name="ข้าวหมก", ingredient_calories="270 kcal", ingredient_value="180 g", ingredient_photo="ข้าวหมก.png", category_id=1),
                Ingredient(ingredient_name="ข้าวคั่ว", ingredient_calories="20 kcal", ingredient_value="5 g", ingredient_photo="ข้าวคั่ว.png", category_id=1),
                Ingredient(ingredient_name="เส้นใหญ่", ingredient_calories="210 kcal", ingredient_value="150 g", ingredient_photo="เส้นใหญ่.png", category_id=1),
                Ingredient(ingredient_name="เส้นหมี่", ingredient_calories="180 kcal", ingredient_value="60 g", ingredient_photo="เส้นหมี่.png", category_id=1),
                Ingredient(ingredient_name="แป้งข้าวเจ้า", ingredient_calories="131 kcal", ingredient_value="36 g", ingredient_photo="แป้งข้าวเจ้า.png", category_id=1),
                Ingredient(ingredient_name="แป้งมันสำปะหลัง", ingredient_calories="126 kcal", ingredient_value="35 g", ingredient_photo="แป้งมันสำปะหลัง.png", category_id=1),
                Ingredient(ingredient_name="แป้งสาลี", ingredient_calories="153 kcal", ingredient_value="45 g", ingredient_photo="แป้งสาลี.png", category_id=1),
                Ingredient(ingredient_name="ธัญพืชรวม", ingredient_calories="102 kcal", ingredient_value="30 g", ingredient_photo="ธัญพืชรวม.png", category_id=1),
                Ingredient(ingredient_name="ข้าวโพด", ingredient_calories="100 kcal", ingredient_value="80 g", ingredient_photo="ข้าวโพด.png", category_id=1),
                Ingredient(ingredient_name="ข้าวเหนียว", ingredient_calories="145 kcal", ingredient_value="100 g", ingredient_photo="ข้าวเหนียว.png", category_id=1),
                Ingredient(ingredient_name="ข้าวไรซ์เบอร์รี่", ingredient_calories="110 kcal", ingredient_value="100 g", ingredient_photo="ข้าวไรซ์เบอร์รี่.png", category_id=1),
                Ingredient(ingredient_name="ข้าวกล้อง", ingredient_calories="110 kcal", ingredient_value="100 g", ingredient_photo="ข้าวกล้อง.png", category_id=1),
                Ingredient(ingredient_name="เผือก", ingredient_calories="78 kcal", ingredient_value="70 g", ingredient_photo="เผือก.png", category_id=1),
                Ingredient(ingredient_name="ข้าวหอมมะลิ", ingredient_calories="112 kcal", ingredient_value="50 g", ingredient_photo="ข้าวหอมมะลิ.png", category_id=1),
                Ingredient(ingredient_name="บะหมี่เหลือง", ingredient_calories="165 kcal", ingredient_value="90 g", ingredient_photo="บะหมี่เหลือง.png", category_id=1),
                Ingredient(ingredient_name="มันเทศ", ingredient_calories="103 kcal", ingredient_value="120 g", ingredient_photo="มันเทศ.png", category_id=1),
                Ingredient(ingredient_name="ขนมปังขาว", ingredient_calories="66 kcal", ingredient_value="25 g", ingredient_photo="ขนมปังขาว.png", category_id=1),
                Ingredient(ingredient_name="ขนมปังโฮลวีต", ingredient_calories="70 kcal", ingredient_value="27 g", ingredient_photo="ขนมปังโฮลวีต.png", category_id=1),
                Ingredient(ingredient_name="เส้นมาม่า", ingredient_calories="190 kcal", ingredient_value="55 g", ingredient_photo="เส้นมาม่า.png", category_id=1),
                Ingredient(ingredient_name="เส้นเล็ก", ingredient_calories="144 kcal", ingredient_value="80 g", ingredient_photo="เส้นเล็ก.png", category_id=1),

                # 2 - โปรตีน
                Ingredient(ingredient_name="เนื้อไก่", ingredient_calories="120 kcal", ingredient_value="60 g", ingredient_photo="เนื้อไก่.png", category_id=2),
                Ingredient(ingredient_name="เนื้อหมู", ingredient_calories="96 kcal", ingredient_value="40 g", ingredient_photo="เนื้อหมู.png", category_id=2),
                Ingredient(ingredient_name="กุ้ง", ingredient_calories="30 kcal", ingredient_value="30 g", ingredient_photo="กุ้ง.png", category_id=2),
                Ingredient(ingredient_name="เต้าหู้ไข่", ingredient_calories="45 kcal", ingredient_value="50 g", ingredient_photo="เต้าหู้ไข่.png", category_id=2),
                Ingredient(ingredient_name="ถั่วลิสง", ingredient_calories="57 kcal", ingredient_value="10 g", ingredient_photo="ถั่วลิสง.png", category_id=2),
                Ingredient(ingredient_name="ปลา", ingredient_calories="60 kcal", ingredient_value="50 g", ingredient_photo="ปลา.png", category_id=2),
                Ingredient(ingredient_name="ไข่ไก่", ingredient_calories="80 kcal", ingredient_value="55 g", ingredient_photo="ไข่ไก่.png", category_id=2),
                Ingredient(ingredient_name="เนื้อหมูสามชั้น", ingredient_calories="117 kcal", ingredient_value="30 g", ingredient_photo="เนื้อหมูสามชั้น.png", category_id=2),
                Ingredient(ingredient_name="เต้าหู้เหลือง", ingredient_calories="30 kcal", ingredient_value="20 g", ingredient_photo="เต้าหู้เหลือง.png", category_id=2),
                Ingredient(ingredient_name="หอยลาย", ingredient_calories="60 kcal", ingredient_value="60 g", ingredient_photo="หอยลาย.png", category_id=2),
                Ingredient(ingredient_name="ขาหมู", ingredient_calories="255 kcal", ingredient_value="60 g", ingredient_photo="ขาหมู.png", category_id=2),             
                Ingredient(ingredient_name="เนื้อวัว", ingredient_calories="150 kcal", ingredient_value="60 g", ingredient_photo="เนื้อวัว.png", category_id=2),
                Ingredient(ingredient_name="ถั่วเหลือง", ingredient_calories="178 kcal", ingredient_value="40 g", ingredient_photo="ถั่วเหลือง.png", category_id=2),
                Ingredient(ingredient_name="ถั่วเขียว", ingredient_calories="139 kcal", ingredient_value="40 g", ingredient_photo="ถั่วเขียว.png", category_id=2),
                Ingredient(ingredient_name="โยเกิร์ต", ingredient_calories="54 kcal", ingredient_value="75 g", ingredient_photo="โยเกิร์ต.png", category_id=2),
                Ingredient(ingredient_name="นมวัว", ingredient_calories="50 kcal", ingredient_value="75 g", ingredient_photo="นมวัว.png", category_id=2),
                Ingredient(ingredient_name="เมล็ดแฟลกซ์", ingredient_calories="160 kcal", ingredient_value="30 g", ingredient_photo="เมล็ดแฟลกซ์.png", category_id=2),
                Ingredient(ingredient_name="ไข่เป็ด", ingredient_calories="93 kcal", ingredient_value="50 g", ingredient_photo="ไข่เป็ด.png", category_id=2),
                Ingredient(ingredient_name="ไข่นกกระทา", ingredient_calories="47 kcal", ingredient_value="30 g", ingredient_photo="ไข่นกกระทา.png", category_id=2),
                Ingredient(ingredient_name="ถั่วแดง", ingredient_calories="135 kcal", ingredient_value="40 g", ingredient_photo="ถั่วแดง.png", category_id=2),
                Ingredient(ingredient_name="อัลมอนด์", ingredient_calories="145 kcal", ingredient_value="25 g", ingredient_photo="อัลมอนด์.png", category_id=2),
                Ingredient(ingredient_name="เมล็ดทานตะวัน", ingredient_calories="146 kcal", ingredient_value="25 g", ingredient_photo="เมล็ดทานตะวัน.png", category_id=2),
                Ingredient(ingredient_name="ปลาหมึกกล้วย", ingredient_calories="69 kcal", ingredient_value="75 g", ingredient_photo="ปลาหมึกกล้วย.png", category_id=2),
                Ingredient(ingredient_name="เต้าหู้ขาว", ingredient_calories="57 kcal", ingredient_value="75 g", ingredient_photo="เต้าหู้ขาว.png", category_id=2),
                Ingredient(ingredient_name="ปลาหมึกกระดอง", ingredient_calories="46 kcal", ingredient_value="50 g", ingredient_photo="ปลาหมึกกระดอง.png", category_id=2),
                Ingredient(ingredient_name="หอยนางรม", ingredient_calories="52 kcal", ingredient_value="75 g", ingredient_photo="หอยนางรม.png", category_id=2),
                Ingredient(ingredient_name="ปูม้า", ingredient_calories="68 kcal", ingredient_value="70 g", ingredient_photo="ปูม้า.png", category_id=2),
                Ingredient(ingredient_name="หมูยอ", ingredient_calories="203 kcal", ingredient_value="70 g", ingredient_photo="หมูยอ.png", category_id=2),
                Ingredient(ingredient_name="หอยแครง", ingredient_calories="48 kcal", ingredient_value="70 g", ingredient_photo="หอยแครง.png", category_id=2),
                Ingredient(ingredient_name="เบคอน", ingredient_calories="216 kcal", ingredient_value="40 g", ingredient_photo="เบคอน.png", category_id=2),
                Ingredient(ingredient_name="กุ้งแห้ง", ingredient_calories="101 kcal", ingredient_value="40 g", ingredient_photo="กุ้งแห้ง.png", category_id=2),
                Ingredient(ingredient_name="นมข้นจืด", ingredient_calories="113 kcal", ingredient_value="35 g", ingredient_photo="นมข้นจืด.png", category_id=2),
                Ingredient(ingredient_name="ปลาแห้ง", ingredient_calories="145 kcal", ingredient_value="50 g", ingredient_photo="ปลาแห้ง.png", category_id=2),


                # 3 - ไขมัน
                Ingredient(ingredient_name="กะทิ", ingredient_calories="107 kcal", ingredient_value="55 g", ingredient_photo="กะทิ.png", category_id=3),
                Ingredient(ingredient_name="น้ำมันพืช", ingredient_calories="54 kcal", ingredient_value="6 g", ingredient_photo="น้ำมันพืช.png", category_id=3),
                Ingredient(ingredient_name="กระเทียมเจียว", ingredient_calories="9 kcal", ingredient_value="2 g", ingredient_photo="กระเทียมเจียว.png", category_id=3),
                Ingredient(ingredient_name="หอมเจียว", ingredient_calories="45 kcal", ingredient_value="5 g", ingredient_photo="หอมเจียว.png", category_id=3),
                Ingredient(ingredient_name="ไขมันหมู", ingredient_calories="451 kcal", ingredient_value="50 g", ingredient_photo="ไขมันหมู.png", category_id=3),
                Ingredient(ingredient_name="ครีมเทียม", ingredient_calories="125 kcal", ingredient_value="25 g", ingredient_photo="ครีมเทียม.png", category_id=3),
                Ingredient(ingredient_name="เนย", ingredient_calories="215 kcal", ingredient_value="30 g", ingredient_photo="เนย.png", category_id=3),
                Ingredient(ingredient_name="น้ำมันถั่วเหลือง", ingredient_calories="265 kcal", ingredient_value="30 g", ingredient_photo="น้ำมันถั่วเหลือง.png", category_id=3),
                Ingredient(ingredient_name="น้ำมันมะพร้าว", ingredient_calories="345 kcal", ingredient_value="40 g", ingredient_photo="น้ำมันมะพร้าว.png", category_id=3),
                Ingredient(ingredient_name="น้ำมันมะกอก", ingredient_calories="177 kcal", ingredient_value="20 g", ingredient_photo="น้ำมันมะกอก.png", category_id=3),
                Ingredient(ingredient_name="น้ำมันรำข้าว", ingredient_calories="310 kcal", ingredient_value="35 g", ingredient_photo="น้ำมันรำข้าว.png", category_id=3),
                Ingredient(ingredient_name="มาการีน", ingredient_calories="502 kcal", ingredient_value="70 g", ingredient_photo="มาการีน.png", category_id=3),
                Ingredient(ingredient_name="น้ำมันงา", ingredient_calories="221 kcal", ingredient_value="25 g", ingredient_photo="น้ำมันงา.png", category_id=3),

                # 4 - วิตามินและเกลือแร่
                Ingredient(ingredient_name="ผักบุ้ง", ingredient_calories="9 kcal", ingredient_value="50 g", ingredient_photo="ผักบุ้ง.png", category_id=4),
                Ingredient(ingredient_name="ใบมะกรูด", ingredient_calories="1 kcal", ingredient_value="1 g", ingredient_photo="ใบมะกรูด.png", category_id=4),
                Ingredient(ingredient_name="มะเขือเปราะ", ingredient_calories="8 kcal", ingredient_value="40 g", ingredient_photo="มะเขือเปราะ.png", category_id=4),
                Ingredient(ingredient_name="พริกชี้ฟ้า", ingredient_calories="2 kcal", ingredient_value="5 g", ingredient_photo="พริกชี้ฟ้า.png", category_id=4),
                Ingredient(ingredient_name="โหระพา", ingredient_calories="1 kcal", ingredient_value="5 g", ingredient_photo="โหระพา.png", category_id=4),
                Ingredient(ingredient_name="กระเทียม", ingredient_calories="8 kcal", ingredient_value="5 g", ingredient_photo="กระเทียม.png", category_id=4),
                Ingredient(ingredient_name="บวบ", ingredient_calories="6 kcal", ingredient_value="30 g", ingredient_photo="บวบ.png", category_id=4),
                Ingredient(ingredient_name="เห็ดฟาง", ingredient_calories="6 kcal", ingredient_value="20 g", ingredient_photo="เห็ดฟาง.png", category_id=4),
                Ingredient(ingredient_name="ใบแมงลัก", ingredient_calories="1 kcal", ingredient_value="5 g", ingredient_photo="ใบแมงลัก.png", category_id=4),
                Ingredient(ingredient_name="หอมแดง", ingredient_calories="2 kcal", ingredient_value="5 g", ingredient_photo="หอมแดง.png", category_id=4),
                Ingredient(ingredient_name="ผักกาดขาว", ingredient_calories="5 kcal", ingredient_value="30 g", ingredient_photo="ผักกาดขาว.png", category_id=4),
                Ingredient(ingredient_name="แครอท", ingredient_calories="7 kcal", ingredient_value="20 g", ingredient_photo="แครอท.png", category_id=4),
                Ingredient(ingredient_name="ต้นหอม", ingredient_calories="0.5 kcal", ingredient_value="2.5 g", ingredient_photo="ต้นหอม.png", category_id=4),
                Ingredient(ingredient_name="ผักชี", ingredient_calories="0.5 kcal", ingredient_value="2.5 g", ingredient_photo="ผักชี.png", category_id=4),
                Ingredient(ingredient_name="อบเชย", ingredient_calories="0.33 kcal", ingredient_value="0.33 g", ingredient_photo="อบเชย.png", category_id=4),
                Ingredient(ingredient_name="กานพลู", ingredient_calories="0.33 kcal", ingredient_value="0.33 g", ingredient_photo="กานพลู.png", category_id=4),
                Ingredient(ingredient_name="กะหล่ำปลี", ingredient_calories="7 kcal", ingredient_value="30 g", ingredient_photo="กะหล่ำปลี.png", category_id=4),
                Ingredient(ingredient_name="ถั่วฝักยาว", ingredient_calories="7 kcal", ingredient_value="20 g", ingredient_photo="ถั่วฝักยาว.png", category_id=4),
                Ingredient(ingredient_name="ถั่วงอก", ingredient_calories="5 kcal", ingredient_value="30 g", ingredient_photo="ถั่วงอก.png", category_id=4),
                Ingredient(ingredient_name="กุยช่าย", ingredient_calories="2 kcal", ingredient_value="10 g", ingredient_photo="กุยช่าย.png", category_id=4),
                Ingredient(ingredient_name="ขิง", ingredient_calories="2 kcal", ingredient_value="5 g", ingredient_photo="ขิง.png", category_id=4),
                Ingredient(ingredient_name="ขึ้นฉ่าย", ingredient_calories="2 kcal", ingredient_value="10 g", ingredient_photo="ขึ้นฉ่าย.png", category_id=4),
                Ingredient(ingredient_name="แตงกวา", ingredient_calories="3 kcal", ingredient_value="20 g", ingredient_photo="แตงกวา.png", category_id=4),
                Ingredient(ingredient_name="พริกขี้หนู", ingredient_calories="1 kcal", ingredient_value="2 g", ingredient_photo="พริกขี้หนู.png", category_id=4),
                Ingredient(ingredient_name="พริกทอด", ingredient_calories="10 kcal", ingredient_value="2 g", ingredient_photo="พริกทอด.png", category_id=4),
                Ingredient(ingredient_name="ผักกาดดอง", ingredient_calories="4 kcal", ingredient_value="20 g", ingredient_photo="ผักกาดดอง.png", category_id=4),
                Ingredient(ingredient_name="มะเขือเทศ", ingredient_calories="2 kcal", ingredient_value="10 g", ingredient_photo="มะเขือเทศ.png", category_id=4),
                Ingredient(ingredient_name="ข่า", ingredient_calories="1 kcal", ingredient_value="5 g", ingredient_photo="ข่า.png", category_id=4),
                Ingredient(ingredient_name="ตะไคร้", ingredient_calories="1 kcal", ingredient_value="5 g", ingredient_photo="ตะไคร้.png", category_id=4),
                Ingredient(ingredient_name="มะนาว", ingredient_calories="1 kcal", ingredient_value="5 g", ingredient_photo="มะนาว.png", category_id=4),
                Ingredient(ingredient_name="พริกแดง", ingredient_calories="1 kcal", ingredient_value="2 g", ingredient_photo="พริกแดง.png", category_id=4),
                Ingredient(ingredient_name="ใบกะเพรา", ingredient_calories="2 kcal", ingredient_value="10 g", ingredient_photo="ใบกะเพรา.png", category_id=4),
                Ingredient(ingredient_name="คะน้า", ingredient_calories="6 kcal", ingredient_value="30 g", ingredient_photo="คะน้า.png", category_id=4),
                Ingredient(ingredient_name="หอมหัวใหญ่", ingredient_calories="5 kcal", ingredient_value="15 g", ingredient_photo="หอมหัวใหญ่.png", category_id=4),
                Ingredient(ingredient_name="สะระแหน่", ingredient_calories="0.5 kcal", ingredient_value="2.5 g", ingredient_photo="สะระแหน่.png", category_id=4),
                Ingredient(ingredient_name="มะละกอ", ingredient_calories="32 kcal", ingredient_value="80 g", ingredient_photo="มะละกอ.png", category_id=4),
                Ingredient(ingredient_name="มะม่วงดิบ", ingredient_calories="7 kcal", ingredient_value="20 g", ingredient_photo="มะม่วงดิบ.png", category_id=4),
                Ingredient(ingredient_name="ส้ม", ingredient_calories="35 kcal", ingredient_value="75 g", ingredient_photo="ส้ม.png", category_id=4),
                Ingredient(ingredient_name="อะโวคาโด", ingredient_calories="112 kcal", ingredient_value="70 g", ingredient_photo="อะโวคาโด.png", category_id=4),
                Ingredient(ingredient_name="ดอกแค", ingredient_calories="24 kcal", ingredient_value="75 g", ingredient_photo="ดอกแค.png", category_id=4),
                Ingredient(ingredient_name="มะม่วงสุก", ingredient_calories="48 kcal", ingredient_value="80 g", ingredient_photo="มะม่วงสุก.png", category_id=4),
                Ingredient(ingredient_name="กล้วย", ingredient_calories="53 kcal", ingredient_value="60 g", ingredient_photo="กล้วย.png", category_id=4),
                Ingredient(ingredient_name="ฝรั่ง", ingredient_calories="41 kcal", ingredient_value="60 g", ingredient_photo="ฝรั่ง.png", category_id=4),
                Ingredient(ingredient_name="แอปเปิ้ล", ingredient_calories="39 kcal", ingredient_value="75 g", ingredient_photo="แอปเปิ้ล.png", category_id=4),
                Ingredient(ingredient_name="แตงโม", ingredient_calories="24 kcal", ingredient_value="80 g", ingredient_photo="แตงโม.png", category_id=4),
                Ingredient(ingredient_name="หัวไชเท้า", ingredient_calories="12 kcal", ingredient_value="75 g", ingredient_photo="หัวไชเท้า.png", category_id=4),
                Ingredient(ingredient_name="ชะอม", ingredient_calories="43 kcal", ingredient_value="75 g", ingredient_photo="ชะอม.png", category_id=4),
                Ingredient(ingredient_name="ผักชีฝรั่ง", ingredient_calories="12 kcal", ingredient_value="50 g", ingredient_photo="ผักชีฝรั่ง.png", category_id=4),
                Ingredient(ingredient_name="กระชาย", ingredient_calories="60 kcal", ingredient_value="75 g", ingredient_photo="กระชาย.png", category_id=4),
                Ingredient(ingredient_name="พริกหวาน", ingredient_calories="16 kcal", ingredient_value="80 g", ingredient_photo="พริกหวาน.png", category_id=4),
                Ingredient(ingredient_name="ขมิ้น", ingredient_calories="156 kcal", ingredient_value="50 g", ingredient_photo="ขมิ้น.png", category_id=4),
                Ingredient(ingredient_name="มะเขือพวง", ingredient_calories="18 kcal", ingredient_value="75 g", ingredient_photo="มะเขือพวง.png", category_id=4),
                Ingredient(ingredient_name="เห็ดเข็มทอง", ingredient_calories="23 kcal", ingredient_value="75 g", ingredient_photo="เห็ดเข็มทอง.png", category_id=4),
                Ingredient(ingredient_name="มะกรูด", ingredient_calories="22 kcal", ingredient_value="50 g", ingredient_photo="มะกรูด.png", category_id=4),

                # 5 - เครื่องปรุง
                Ingredient(ingredient_name="พริกเเกงเขียวหวาน", ingredient_calories="15 kcal", ingredient_value="10 g", ingredient_photo="พริกแกงเขียวหวาน.png", category_id=5),
                Ingredient(ingredient_name="น้ำปลา", ingredient_calories="2 kcal", ingredient_value="4 g", ingredient_photo="น้ำปลา.png", category_id=5),     
                Ingredient(ingredient_name="น้ำตาลปี๊บ", ingredient_calories="16 kcal", ingredient_value="4 g", ingredient_photo="น้ำตาลปี๊บ.png", category_id=5),       
                Ingredient(ingredient_name="น้ำตาลทราย", ingredient_calories="8 kcal", ingredient_value="2 g", ingredient_photo="น้ำตาลทราย.png", category_id=5),
                Ingredient(ingredient_name="พริกแกงมัสมั่น", ingredient_calories="18 kcal", ingredient_value="12 g", ingredient_photo="พริกแกงมัสมั่น.png", category_id=5),
                Ingredient(ingredient_name="พริกแกงส้ม", ingredient_calories="15 kcal", ingredient_value="10 g", ingredient_photo="พริกแกงส้ม.png", category_id=5),
                Ingredient(ingredient_name="กะปิ", ingredient_calories="5 kcal", ingredient_value="3 g", ingredient_photo="กะปิ.png", category_id=5),
                Ingredient(ingredient_name="ซีอิ๊วขาว", ingredient_calories="2 kcal", ingredient_value="4 g", ingredient_photo="ซีอิ๊วขาว.png", category_id=5),
                Ingredient(ingredient_name="ผงพะโล้", ingredient_calories="1 kcal", ingredient_value="1 g", ingredient_photo="ผงพะโล้.png", category_id=5),
                Ingredient(ingredient_name="หัวไชโป๊หวาน", ingredient_calories="8 kcal", ingredient_value="5 g", ingredient_photo="หัวไชโป๊หวาน.png", category_id=5),
                Ingredient(ingredient_name="น้ำมะขามเปียก", ingredient_calories="2 kcal", ingredient_value="5 g", ingredient_photo="น้ำมะขามเปียก.png", category_id=5),
                Ingredient(ingredient_name="พริกป่น", ingredient_calories="1 kcal", ingredient_value="1 g", ingredient_photo="พริกป่น.png", category_id=5),
                Ingredient(ingredient_name="ถั่วลิสงบด", ingredient_calories="29 kcal", ingredient_value="5 g", ingredient_photo="ถั่วลิสงบด.png", category_id=5),
                Ingredient(ingredient_name="ซีอิ๊วดำ", ingredient_calories="4 kcal", ingredient_value="4 g", ingredient_photo="ซีอิ๊วดำ.png", category_id=5),
                Ingredient(ingredient_name="น้ำส้มสายชู", ingredient_calories="0 kcal", ingredient_value="2 g", ingredient_photo="น้ำส้มสายชู.png", category_id=5),
                Ingredient(ingredient_name="พริกแกงข้าวซอย", ingredient_calories="15 kcal", ingredient_value="10 g", ingredient_photo="พริกแกงข้าวซอย.png", category_id=5),
                Ingredient(ingredient_name="น้ำจิ้ม", ingredient_calories="20 kcal", ingredient_value="15 g", ingredient_photo="น้ำจิ้ม.png", category_id=5),
                Ingredient(ingredient_name="น้ำซุป", ingredient_calories="10 kcal", ingredient_value="100 g", ingredient_photo="น้ำซุป.png", category_id=5),
                Ingredient(ingredient_name="เต้าเจี้ยว", ingredient_calories="5 kcal", ingredient_value="5 g", ingredient_photo="เต้าเจี้ยว.png", category_id=5),
                Ingredient(ingredient_name="น้ำพริกเผา", ingredient_calories="20 kcal", ingredient_value="10 g", ingredient_photo="น้ำพริกเผา.png", category_id=5),
                Ingredient(ingredient_name="พริกแกงพะแนง", ingredient_calories="15 kcal", ingredient_value="10 g", ingredient_photo="พริกแกงพะแนง.png", category_id=5),
                Ingredient(ingredient_name="พริกไทย", ingredient_calories="1 kcal", ingredient_value="1 g", ingredient_photo="พริกไทย.png", category_id=5),
                Ingredient(ingredient_name="ซอสหอยนางรม", ingredient_calories="15 kcal", ingredient_value="30 g", ingredient_photo="ซอสหอยนางรม.png", category_id=5),
                Ingredient(ingredient_name="เกลือ", ingredient_calories="1 kcal", ingredient_value="10 g", ingredient_photo="เกลือ.png", category_id=5),
                Ingredient(ingredient_name="น้ำมันหอย", ingredient_calories="15 kcal", ingredient_value="30 g", ingredient_photo="น้ำมันหอย.png", category_id=5),
                Ingredient(ingredient_name="ผงกะหรี่", ingredient_calories="33 kcal", ingredient_value="10 g", ingredient_photo="ผงกะหรี่.png", category_id=5),
                Ingredient(ingredient_name="ลูกผักชี", ingredient_calories="30 kcal", ingredient_value="10 g", ingredient_photo="ลูกผักชี.png", category_id=5),
                Ingredient(ingredient_name="เม็ดกระวาน", ingredient_calories="31 kcal", ingredient_value="10 g", ingredient_photo="เม็ดกระวาน.png", category_id=5),
                Ingredient(ingredient_name="ดอกจันทร์", ingredient_calories="0 kcal", ingredient_value="5 g", ingredient_photo="ดอกจันทร์.png", category_id=5),
                Ingredient(ingredient_name="ยี่หร่า", ingredient_calories="35 kcal", ingredient_value="10 g", ingredient_photo="ยี่หร่า.png", category_id=5),
                Ingredient(ingredient_name="ลูกจันทร์", ingredient_calories="0 kcal", ingredient_value="5 g", ingredient_photo="ลูกจันทร์.png", category_id=5)
            ]

            db.session.add_all(ingredients)
            db.session.commit()
            print("✅ Added ingredients!")

            # เพิ่มเมนู (MenuAuto)
            menus = [
                MenuAuto(menuauto_name="แกงเขียวหวานไก่", menuauto_image="แกงเขียวหวานไก่.jpg"),
                MenuAuto(menuauto_name="แกงหมูกับผักบุ้ง", menuauto_image="แกงหมูกับผักบุ้ง.jpg"),
                MenuAuto(menuauto_name="แกงเลียง", menuauto_image="แกงเลียง.jpg"),
                MenuAuto(menuauto_name="ต้มจืดเต้าหู้หมูสับ", menuauto_image="ต้มจืดเต้าหู้หมูสับ.jpg"),
                MenuAuto(menuauto_name="มัสมั่นไก่", menuauto_image="มัสมั่นไก่.jpg"),
                MenuAuto(menuauto_name="แกงส้ม", menuauto_image="แกงส้ม.jpg"),
                MenuAuto(menuauto_name="ข้าวไข่เจียว", menuauto_image="ข้าวไข่เจียว.jpg"), # เปลี่ยนชื่อจาด ไข่เจียว
                MenuAuto(menuauto_name="ข้าวไข่ดาว", menuauto_image="ข้าวไข่ดาว.jpg"), # เปลี่ยนชื่อจาด ไข่ดาว
                MenuAuto(menuauto_name="ไข่พะโล้", menuauto_image="ไข่พะโล้.jpg"),
                MenuAuto(menuauto_name="ผัดไทยไก่", menuauto_image="ผัดไทยไก่.jpg"),
                MenuAuto(menuauto_name="กุ้งอบวุ้นเส้น", menuauto_image="กุ้งอบวุ้นเส้น.jpg"),
                MenuAuto(menuauto_name="ขาหมูพะโล้", menuauto_image="ขาหมูพะโล้.jpg"),
                MenuAuto(menuauto_name="ข้าวผัดกะปิ", menuauto_image="ข้าวผัดกะปิ.jpg"),
                MenuAuto(menuauto_name="ข้าวซอยไก่", menuauto_image="ข้าวซอยไก่.jpg"),
                MenuAuto(menuauto_name="ข้าวผัด", menuauto_image="ข้าวผัด.jpg"),
                MenuAuto(menuauto_name="ข้าวผัดกุ้ง", menuauto_image="ข้าวผัดกุ้ง.jpg"),
                MenuAuto(menuauto_name="ข้าวมันไก่", menuauto_image="ข้าวมันไก่.jpg"),# เปลี่ยนชื่อจาด ข้าวมันไก่ตอนนิ่
                MenuAuto(menuauto_name="ข้าวหมกไก่", menuauto_image="ข้าวหมกไก่.jpg"),
                MenuAuto(menuauto_name="ต้มข่าไก่", menuauto_image="ต้มข่าไก่.jpg"),
                MenuAuto(menuauto_name="ต้มยำกุ้ง", menuauto_image="ต้มยำกุ้ง.jpg"), #เปลี่ยนชื่อจาด ต้มยำกุ้งแม่น้ำ
                MenuAuto(menuauto_name="ผัดผักบุ้งไฟแดง", menuauto_image="ผัดผักบุ้งไฟแดง.jpg"),
                MenuAuto(menuauto_name="ผัดไทยกุ้งสด", menuauto_image="ผัดไทยกุ้งสด.jpg"),
                MenuAuto(menuauto_name="ผัดกะเพราหมูสับ", menuauto_image="ผัดกะเพราหมูสับ.jpg"),
                MenuAuto(menuauto_name="ผัดซีอิ๊ว", menuauto_image="ผัดซีอิ๊ว.jpg"),
                MenuAuto(menuauto_name="ฟักทองผัดไข่", menuauto_image="ฟักทองผัดไข่.jpg"),
                MenuAuto(menuauto_name="หอยลายผัดพริกเผา", menuauto_image="หอยลายผัดพริกเผา.jpg"),
                MenuAuto(menuauto_name="พะแนงไก่", menuauto_image="พะแนงไก่.jpg"),
                MenuAuto(menuauto_name="ยำวุ้นเส้น", menuauto_image="ยำวุ้นเส้น.jpg"),
                MenuAuto(menuauto_name="ลาบหมู", menuauto_image="ลาบหมู.jpg"),
                MenuAuto(menuauto_name="ส้มตำ", menuauto_image="ส้มตำ.jpg")
            ]
            db.session.add_all(menus)
            db.session.commit()
            print("✅ Added menuautos!")
            
            # กำหนดข้อมูลวัตถุดิบแต่ละเมนูแบบ dictionary
            menuauto_ingredients = {
                "แกงเขียวหวานไก่": ["เนื้อไก่", "กะทิ", "พริกเเกงเขียวหวาน", "น้ำปลา", "ใบมะกรูด", "น้ำตาลปิ๊บ", "มะเขือเปราะ", "พริกชี้ฟ้า", "โหระพา"],
                "แกงหมูกับผักบุ้ง": ["เนื้อหมู", "ผักบุ้ง", "กระเทียม", "น้ำปลา", "น้ำมันพืช", "น้ำตาลทราย"],
                "แกงเลียง": ["กุ้ง", "บวบ", "ฟักทอง", "ข้าวโพดอ่อน", "เห็ดฟาง", "ใบแมงลัก", "พริกไทย", "หอมแดง", "กะปิ", "น้ำปลา"],
                "ต้มจืดเต้าหู้หมูสับ": ["เนื้อหมู", "เต้าหู้ไข่", "ผักกาดขาว", "แครอท", "ต้นหอม”,”ผักชี", "กระเทียมเจียว", "น้ำปลา", "พริกไทย"],
                "มัสมั่นไก่": ["เนื้อไก่", "มันฝรั่ง", "กะทิ", "พริกแกงมัสมั่น", "ถั่วลิสงคั่ว", "น้ำตาลปิ๊บ", "น้ำปลา", "หอมแดง", "อบเชย,”ผักชี”,”กานพลู"],
                "แกงส้ม": ["ปลา", "กะหล่ำปลี", "แครอท", "ถั่วฝักยาว", "มะขามเปียก", "น้ำตาลปิ๊บ", "น้ำปลา", "พริกแกงส้ม"],
                "ข้าวไข่เจียว": ["ข้าวสวย", "ไข่ไก่", "น้ำมันพืช", "น้ำปลา"],
                "ข้าวไข่ดาว": ["ข้าวสวย", "ไข่ไก่", "น้ำมันพืช"],
                "ไข่พะโล้": ["ไข่ไก่", "เนื้อหมูสามชั้น", "น้ำตาลปิ๊บ", "ซีอิ๊วขาว", "ผงพะโล้", "กระเทียม"],
                "ผัดไทยไก่": ["เส้นจันท์", "เนื้อไก่", "ถั่วงอก", "เต้าหู้เหลือง", "กุยช่าย", "หัวไชโป๊หวาน", "น้ำมันพื้ช", "ไข่ไก่", "น้ำตาลปิ๊บ", "น้ำปลา", "มะขามเปียก", "พริกป่น", "ถั่วลิสงบด"],
                "กุ้งอบวุ้นเส้น": ["กุ้ง", "วุ้นเส้น", "ขิง", "กระเทียม", "ซีอิ๊วดำ", "น้ำมันพืช", "พริกไทย", "ขึ้นฉ่าย"],
                "ขาหมูพะโล้": ["ขาหมู", "ไข่ไก่", "ซีอิ๊วดำ", "กระเทียม", "ผักชี", "พริกไทย", "น้ำตาลปิ๊บ"],
                "ข้าวผัดกะปิ": ["ข้าวสวย", "กะปิ", "น้ำมันพืช", "เนื้อหมู", "กุ้ง", "หอมแดง", "พริกขี้หนู", "มะม่วงดิบ", "ไข่ไก่", "ถั่วฝักยาว", "แตงกวา"],
                "ข้าวซอยไก่": ["เนื้อไก่", "เส้นข้าวซอย", "กะทิ", "พริกแกงข้าวซอย", "น้ำตาลปิ๊บ", "น้ำปลา", "ผักกาดดอง", "หอมแดง", "พริกทอด", "น้ำมันพืช"],
                "ข้าวผัด": ["ข้าวสวย", "ไข่ไก่", "น้ำมันพืช", "กระเทียม", "ต้นหอม", "ซีอิ๊วขาว", "พริกไทย"],
                "ข้าวผัดกุ้ง": ["ข้าวสวย", "กุ้ง", "ไข่ไก่", "น้ำมันพืช", "กระเทียม", "ต้นหอม", "มะเขือเทศ", "ซีอิ๊วขาว", "พริกไทย"],
                "ข้าวมันไก่": ["ข้าวสวย", "น้ำมันพืช", "เนื้อไก่", "แตงกวา", "น้ำจิ้ม", "น้ำซุป"],
                "ข้าวหมกไก่": ["ข้าวหมก", "เนื้อไก่", "แตงกวา", "หอมเจียว", "น้ำจิ้ม"],
                "ต้มข่าไก่": ["เนื้อไก่", "กะทิ", "ข่า", "ตะไคร้", "ใบมะกรูด", "เห็ดฟาง", "น้ำปลา", "มะนาว", "พริกขี้หนู"],
                "ต้มยำกุ้ง": ["กุ้ง", "เห็ดฟาง", "น้ำปลา", "มะนาว", "พริกขี้หนู", "ข่า", "ตะไคร้", "ใบมะกรูด", "กะทิ"],
                "ผัดผักบุ้งไฟแดง": ["ผักบุ้ง", "กระเทียม", "พริกแดง", "น้ำมันพืช", "น้ำปลา", "เต้าเจี้ยว"],
                "ผัดไทยกุ้งสด": ["เส้นจันท์", "กุ้ง", "ถั่วงอก", "เต้าหู้เหลือง", "กุยช่าย", "หัวไชโป๊หวาน", "น้ำมันพืช", "ไข่ไก่", "น้ำตาลปิ๊บ", "น้ำปลา", "มะขามเปียก", "พริกป่น", "ถั่วลิสงบด"],
                "ผัดกะเพราหมูสับ": ["เนื้อหมู", "ใบกระเพรา", "กระเทียม", "พริกขี้หนู", "น้ำปลา", "น้ำมันพืช"],
                "ผัดซีอิ๊ว": ["เส้นใหญ่", "เนื้อหมู", "ไข่ไก่", "คะน้า", "กระเทียม", "ซีอิ๊วดำ", "น้ำปลา", "น้ำมันพืช", "พริกไทย"],
                "ฟักทองผัดไข่": ["ฟักทอง", "ไขไก่", "กระเทียม", "น้ำปลา", "น้ำมันพืช"],
                "หอยลายผัดพริกเผา": ["หอยลาย", "พริกเผา", "น้ำมันพืช", "กระเทียม", "ใบโหระพา", "น้ำปลา"],
                "พะแนงไก่": ["เนื้อไก่", "กะทิ", "พริกแกงพะแนง", "น้ำปลา", "น้ำตาลปิ๊บ", "ใบมะกรูด", "พริกชี้ฟ้า"],
                "ยำวุ้นเส้น": ["วุ้นเส้น", "เนื้อหมู", "กุ้ง", "หัวหอมใหญ่", "มะเขือเทศ", "ขึ้นฉ่าย", "พริกขี้หนู", "น้ำปลา", "มะนาว", "น้ำตาลทราย"],
                "ลาบหมู": ["เนื้อหมู", "ข้าวคั่ว", "พริกป่น", "น้ำปลา", "มะนาว", "หอมแดงซอย", "ผักชี”,”สะระเเหน่"],
                "ส้มตำ": ["มะละกอ", "มะเขือเทศ", "ถั่วฝักยาว", "พริกขี้หนู", "กระเทียม", "น้ำปลา", "มะนาว", "น้ำตาลปิ๊บ", "ถั่วลิสงคั่ว", "กุ้ง"],
            }


            for menu_name, ingredient_names in menuauto_ingredients.items():
                menu = MenuAuto.query.filter_by(menuauto_name=menu_name).first()
                if menu:
                    for ing_name in ingredient_names:
                        ingredient = Ingredient.query.filter_by(ingredient_name=ing_name).first()
                        if ingredient:
                            # ตรวจสอบว่าไม่มีซ้ำ
                            exists = MenuAuto_Ingredient.query.filter_by(
                                menuauto_id=menu.menuauto_id,
                                ingredient_id=ingredient.ingredient_id
                            ).first()
                            if not exists:
                                menuauto_ingredients = MenuAuto_Ingredient(
                                    menuauto_id=menu.menuauto_id,
                                    ingredient_id=ingredient.ingredient_id
                                )
                                db.session.add(menuauto_ingredients)
            db.session.commit()
            print("✅ Added menuauto_ingredients!")                        

        except Exception as e:
            print(f"❌ Error adding initial data: {str(e)}")
            db.session.rollback()