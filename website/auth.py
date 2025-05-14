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
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False
        
        user = User.query.filter_by(email=email).first()
        
        if user:
            if check_password_hash(user.password, password):
                flash('Logged in successfully!', category='success')
                session.permanent = True
                login_user(user, remember=remember)
                return redirect(url_for('views.home'))
            else:
                return redirect(url_for('auth.login', password_error='รหัสผ่านไม่ถูกต้อง'))
        else:
            return redirect(url_for('auth.login', email_error='อีเมลไม่ถูกต้อง'))
    
    # Get error messages from URL parameters
    email_error = request.args.get('email_error', '')
    password_error = request.args.get('password_error', '')
    
    return render_template("Login.html", user=current_user, email_error=email_error, password_error=password_error)

@auth.route('/logout')
@login_required
def logout():
    # ลบ session
    session.clear()
    # ลบ remember cookie
    logout_user()
    return redirect(url_for('views.home'))  # เปลี่ยนจาก views.home เป็น views.home_logout

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    errors = {}
    if request.method == 'POST':
        # Get form data
        email = request.form.get('email')
        Username = request.form.get('Username')
        user_birthday = request.form.get('user_birthday')
        user_gender = request.form.get('user_gender')
        user_weight = request.form.get('user_weight')
        user_height = request.form.get('user_height')
        password1 = request.form.get('password1')
        password2 = request.form.get('password2')

        # --- Start Validation --- 
        # Validate email format
        if not email or '@' not in email or '.' not in email:
            errors['email'] = 'Please enter a valid email address.'
        else:
            # Check if email already exists (only if format is valid)
            user = User.query.filter_by(email=email).first()
            if user:
                errors['email'] = 'Email already exists. Please use a different email.'
            
        # Validate username
        if not Username or len(Username.strip()) < 2:
            errors['username'] = 'Username must be at least 2 characters long.'
            
        # Validate height and weight
        try:
            h = float(user_height)
            w = float(user_weight)
            if h <= 0:
                 errors['height'] = 'Height must be a positive number.'
            if w <= 0:
                 errors['weight'] = 'Weight must be a positive number.'
        except (ValueError, TypeError):
            if not user_height:
                errors['height'] = 'Height is required.'
            else:
                errors['height'] = 'Please enter a valid number for height.'
            if not user_weight:
                 errors['weight'] = 'Weight is required.'
            else:
                 errors['weight'] = 'Please enter a valid number for weight.'
            
        # Validate password
        if not password1 or len(password1) < 7:
            errors['password'] = 'Password must be at least 7 characters long.'
        if password1 != password2:
            errors['confirm_password'] = 'Passwords do not match.'
            
        # Validate gender
        if not user_gender or user_gender not in ['Male', 'Female']:
            errors['gender'] = 'Please select a valid gender.'
            
        # Validate birthday
        if not user_birthday:
            errors['birthday'] = 'Please enter your birthday.'
        else:
            # Check if birthday is in current year
            current_year = datetime.now().year
            birthday_year = datetime.strptime(user_birthday, '%Y-%m-%d').year
            if birthday_year >= current_year:
                errors['birthday'] = 'Birthday cannot be in the current year or future.'
        # --- End Validation --- 

        # If no errors, create user
        if not errors:
            try:
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
                flash('Account created successfully! Welcome to CalsFood!', category='success')
                # Redirect to a different page after successful signup
                # Decide where to redirect, e.g., home_login or a profile page
                return redirect(url_for('views.home')) # Example redirect
            except Exception as e:
                db.session.rollback()
                flash('An error occurred while creating your account. Please try again.', category='error')
                # Log the exception for debugging
                print(f"Error creating user: {e}") 
                # Render template with general error flash, but keep form data
                return render_template("Create_Account.html", user=current_user, errors={}, form_data=request.form)
        
        # If errors exist, render the form again with errors and form data
        if errors:
             # Pass both errors and original form data back to the template
             return render_template("Create_Account.html", user=current_user, errors=errors, form_data=request.form)
            
    # For GET requests or if POST fails before validation logic (shouldn't happen normally)
    return render_template("Create_Account.html", user=current_user, errors={}, form_data={})
