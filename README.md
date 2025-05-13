# capstone-CalsFood

## การติดตั้งและรันโปรเจค

### สิ่งที่ต้องมีก่อนเริ่มต้น
1. Python เวอร์ชัน 3.7 หรือสูงกว่า
2. pip (ตัวจัดการ package ของ Python)
3. Git (สำหรับดาวน์โหลดโปรเจค)

### ขั้นตอนการติดตั้ง

1. **ดาวน์โหลดโปรเจค**
   ```bash
   git clone [URL ของโปรเจค]
   cd capstone-CalsFood
   ```

2. **สร้างและเปิดใช้งาน Virtual Environment**
   - สำหรับ Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - สำหรับ Mac/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **ติดตั้ง Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### การรันโปรเจค

1. **ตรวจสอบว่าอยู่ในโฟลเดอร์หลักของโปรเจค**
   ```bash
   cd capstone-CalsFood
   ```

2. **รันแอปพลิเคชัน**
   ```bash
   python main.py
   ```

3. **เปิดเว็บเบราว์เซอร์**
   - ไปที่ URL: `http://localhost:5000`

### การปิดโปรเจค
1. กด `Ctrl + C` ในเทอร์มินัลเพื่อหยุดการทำงานของเซิร์ฟเวอร์
2. ปิด Virtual Environment:
   ```bash
   deactivate
   ```

### หมายเหตุ
- หากพบปัญหาในการติดตั้ง dependencies ให้ตรวจสอบเวอร์ชัน Python ที่ใช้
- ตรวจสอบว่ามีการติดตั้ง pip เวอร์ชันล่าสุด
- หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อผู้พัฒนาได้

### ระบบที่รองรับ
- Windows 10 หรือสูงกว่า
- macOS 10.15 หรือสูงกว่า
- Linux (Ubuntu 20.04 หรือสูงกว่า)

