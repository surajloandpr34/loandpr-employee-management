from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.security import hash_password


def main():
    print()
    print("=" * 55)
    print("LoanDPR Creditum - Admin / Manager Account Setup")
    print("=" * 55)
    print()

    full_name = input("Full Name: ").strip()
    employee_id = input("Employee ID: ").strip()
    email = input("Email: ").strip().lower()
    mobile = input("Mobile (optional): ").strip() or None

    role = input("Role (admin/manager): ").strip().lower()

    if role not in {"admin", "manager"}:
        print()
        print("ERROR: Role must be either 'admin' or 'manager'.")
        return

    password = getpass("Password: ")
    confirm_password = getpass("Confirm Password: ")

    if password != confirm_password:
        print()
        print("ERROR: Passwords do not match.")
        return

    if len(password) < 8:
        print()
        print("ERROR: Password must contain at least 8 characters.")
        return

    db = SessionLocal()

    try:
        existing_employee = db.scalar(
            select(User).where(
                User.employee_id == employee_id
            )
        )

        if existing_employee:
            print()
            print(
                f"ERROR: Employee ID '{employee_id}' already exists."
            )
            return

        existing_email = db.scalar(
            select(User).where(
                User.email == email
            )
        )

        if existing_email:
            print()
            print(
                f"ERROR: Email '{email}' already exists."
            )
            return

        user = User(
            full_name=full_name,
            employee_id=employee_id,
            email=email,
            mobile=mobile,
            password_hash=hash_password(password),
            role=role,
            department="Administration",
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print()
        print("=" * 55)
        print("ACCOUNT CREATED SUCCESSFULLY")
        print("=" * 55)
        print(f"Name       : {user.full_name}")
        print(f"Employee ID: {user.employee_id}")
        print(f"Email      : {user.email}")
        print(f"Role       : {user.role}")
        print(f"Status     : {'Active' if user.is_active else 'Inactive'}")
        print("=" * 55)
        print()
        print("You can now use Admin / Manager Login.")
        print()

    except Exception as error:
        db.rollback()

        print()
        print("ERROR: Account could not be created.")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    main()