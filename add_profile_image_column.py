from website import create_app, db

def add_profile_image_column():
    app = create_app()
    with app.app_context():
        # เพิ่ม column profile_image
        db.session.execute('ALTER TABLE user ADD COLUMN profile_image VARCHAR(255);')
        db.session.commit()
        print("✅ เพิ่ม column profile_image สำเร็จ!")

if __name__ == '__main__':
    add_profile_image_column() 