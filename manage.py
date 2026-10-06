#!/usr/bin/env python3
"""
MarketPulse Platform - Super Admin Creation CLI
Usage: python manage.py createsuperadmin
"""
import sys
import hashlib
import os
import json
import secrets
from datetime import datetime

FORBIDDEN = {"admin", "admin123", "password", "123456", "12345678", "qwerty", "superadmin"}

def validate_password(pwd: str):
    if len(pwd) < 8:
        return "Password must be at least 8 characters long."
    if pwd.lower() in FORBIDDEN:
        return "Password is too weak or common."
    if not any(c.isupper() for c in pwd):
        return "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in pwd):
        return "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in pwd):
        return "Password must contain at least one digit."
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in pwd):
        return "Password must contain at least one special character."
    return None

def main():
    if len(sys.argv) < 2 or sys.argv[1] != "createsuperadmin":
        print("Usage: python manage.py createsuperadmin")
        sys.exit(1)

    print("\n==================================================")
    print(" MARKETPULSE PLATFORM - SUPER ADMIN INITIAL SETUP")
    print("==================================================\n")

    email = input("Super Admin Email: ").strip()
    if not email or "@" not in email:
        print("❌ Invalid email address.")
        sys.exit(1)

    name = input("Full Name: ").strip()
    if not name:
        print("❌ Name is required.")
        sys.exit(1)

    import getpass
    password = getpass.getpass("Super Admin Password: ")
    err = validate_password(password)
    if err:
        print(f"❌ Security Policy Error: {err}")
        sys.exit(1)

    confirm = getpass.getpass("Confirm Password: ")
    if password != confirm:
        print("❌ Passwords do not match.")
        sys.exit(1)

    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha512", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    admin_id = "sa_" + secrets.token_hex(8)

    data = {
        "id": admin_id,
        "email": email.lower(),
        "name": name,
        "role": "SUPER_ADMIN",
        "salt": salt,
        "passwordHash": pwd_hash,
        "twoFactorEnabled": False,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "isPrimaryOwner": True
    }

    os.makedirs("src/config", exist_ok=True)
    with open("src/config/superadmin.json", "w") as f:
        json.dump(data, f, indent=2)

    print("\n✅ Super Admin account successfully created!")
    print(f"   ID:    {admin_id}")
    print(f"   Email: {email}")
    print(f"   Name:  {name}")
    print(f"   Role:  SUPER_ADMIN\n")

if __name__ == "__main__":
    main()
