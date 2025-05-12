import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import os
from website.models import MenuAuto, db


class ThaiFoodPredictor:
    def __init__(self):
        
        #กำหนดชื่ออาหารตามลำดับของการทำนาย
        self.label_mapping = {
            "00": "แกงเขียวหวานไก่",
            "01": "แกงหมูกับผักบุ้ง",
            "02": "แกงเลียง",
            "03": "ต้มจืดเต้าหู้หมูสับ",
            "04": "มัสมั่นไก่",
            "05": "แกงส้ม",
            "06": "ข้าวไข่เจียว",
            "07": "ข้าวไข่ดาว",
            "08": "ไข่พะโล้",
            "09": "ผัดไทยไก่",
            "10": "กุ้งอบวุ้นเส้น",
            "11": "ข้าวขาหมู",
            "12": "ข้าวผัดกะปิ",
            "13": "ข้าวซอยไก่",
            "14": "ข้าวผัด",
            "15": "ข้าวผัดกุ้ง",
            "16": "ข้าวมันไก่",
            "17": "ข้าวหมกไก่",
            "18": "ต้มข่าไก่",
            "19": "ต้มยำกุ้ง",
            "20": "ผัดผักบุ้งไฟแดง",
            "21": "ผัดไทยกุ้งสด",
            "22": "ผัดกะเพราหมูสับ",
            "23": "ผัดซีอิ๊ว",
            "24": "ฟักทองผัดไข่",
            "25": "หอยลายผัดพริกเผา",
            "26": "พะแนงไก่",
            "27": "ยำวุ้นเส้น",
            "28": "ลาบหมู",
            "29": "ส้มตำ",
            "30": "อาหารที่ไม่รู้จัก"
        }
        
        # การแปลงรูปภาพเพื่อทำการทำนาย
        # กำหนด transformation
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        # โหลด model และปรับ architecture
        self.model = models.resnet50(pretrained=False)
        # แก้ไขส่วน fully connected layer ให้มี output เป็น 31 classes (รวม "อาหารที่ไม่รู้จัก")
        num_classes = 31  # จำนวน classes อาหารไทย + 1 class สำหรับอาหารที่ไม่รู้จัก
        self.model.fc = torch.nn.Linear(2048, num_classes)
        
        # โหลด weights
        model_path = os.path.join(os.path.dirname(__file__), 'models/resnet.pth')
        self.model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        self.model.eval()
    
    
    #การทำนายอาหารไทย
    def predict(self, image):
        # แปลงรูปเป็น tensor
        image_tensor = self.transform(image).unsqueeze(0)
        
        # ทำนาย
        with torch.no_grad():
            outputs = self.model(image_tensor)
            # คำนวณค่า softmax probability
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            max_prob, predicted_idx = torch.max(probabilities, 1)
            
            # ตั้งค่า threshold สำหรับความมั่นใจขั้นต่ำ
            confidence_threshold = 0.5
            
            # ถ้าความมั่นใจต่ำกว่า threshold ให้ถือว่าไม่ใช่รูปอาหาร
            if max_prob.item() < confidence_threshold:
                return "ไม่สามารถระบุได้ (อาจไม่ใช่รูปอาหาร) หรืออาหารนี้ไม่มีในฐานข้อมูล"
                
            # แปลงผลลัพธ์เป็นชื่ออาหาร
            predicted_class = f"{predicted_idx.item():02d}"
            food_name = self.label_mapping.get(predicted_class, "ไม่รู้จัก")
        
            return food_name
        
    # การทำนายอาหารไทย with วัตถุดิบ
    def predict_with_ingredients(self, image):
        food_name = self.predict(image)
        
        if food_name == "ไม่สามารถระบุได้ (อาจไม่ใช่รูปอาหาร)":
            return {
                "menu": food_name,
                "ingredients": "ไม่สามารถระบุส่วนผสมได้",
                "total_calories": 0
            }
            
        menu = MenuAuto.query.filter_by(menuauto_name=food_name).first()
        if menu:
            ingredients_data = []
            for ingredient in menu.ingredients:
                ingredients_data.append({
                    "name": ingredient.ingredient_name,
                    "calories": ingredient.ingredient_calories,
                    "value": ingredient.ingredient_value,
                    "category": ingredient.category.category_name
                })
            return {
                "menu": food_name,
                "ingredients": ingredients_data,
                "total_calories": sum(float(i["calories"].split()[0]) for i in ingredients_data)
            }
            
        else:
            return {
                "menu": food_name,
                "ingredients": "ไม่พบข้อมูลส่วนผสม",
                "total_calories": 0
            }
            