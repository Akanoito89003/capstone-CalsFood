from PIL import Image, ImageDraw, ImageFont
import os

def create_default_avatar():
    # สร้างรูปภาพขนาด 150x150 พิกเซล พื้นหลังสีเทา
    size = 150
    image = Image.new('RGB', (size, size), color='#f0f0f0')
    draw = ImageDraw.Draw(image)
    
    # วาดวงกลมสีฟ้าอ่อน
    circle_color = '#4a90e2'
    draw.ellipse([0, 0, size, size], fill=circle_color)
    
    # วาดไอคอนคนด้านบน (เป็นวงกลมเล็กๆ)
    head_size = size // 3
    head_pos = ((size - head_size) // 2, size // 4)
    draw.ellipse([head_pos[0], head_pos[1], 
                 head_pos[0] + head_size, head_pos[1] + head_size], 
                 fill='white')
    
    # วาดส่วนตัว (เป็นครึ่งวงกลม)
    body_width = size // 2
    body_height = size // 2
    body_pos = ((size - body_width) // 2, size // 2 + size // 8)
    draw.ellipse([body_pos[0], body_pos[1],
                 body_pos[0] + body_width, body_pos[1] + body_height],
                 fill='white')
    
    # บันทึกไฟล์
    output_path = os.path.join('website', 'static', 'profile_pics', 'default.png')
    # สร้างโฟลเดอร์ถ้ายังไม่มี
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image.save(output_path, 'PNG')
    print(f"✅ สร้างไฟล์ default.png สำเร็จที่: {output_path}")

if __name__ == '__main__':
    create_default_avatar() 