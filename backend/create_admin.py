from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.security import hash_password


def create_admin():
    print("=" * 50)
    print("LoanDPR Creditum - Admin Account Setup")
    print("=" * 50)

    full_name = input(
        "Admin full name: "
    ).strip()

    employee_id = input(
        "Admin ID: "
    ).strip()

    email = input(
        "Admin email: "
    ).strip().lower()

    mobile = input(
        "Admin mobile (optional): "
    ).strip()

    password = getpass(
        "Admin password: "
    )

    confirm_password = getpass(
        "Confirm password: "
    )

    if not full_name:
        print("ERROR: Full name is required.")
        return

    if not employee_id:
        print("ERROR: Admin ID is required.")
        return

    if not email:
        print("ERROR: Email is required.")
        return

    if len(password) < 8:
        print(
            "ERROR: Password must contain at least 8 characters."
        )
        return

    if password != confirm_password:
        print(
            "ERROR: Passwords do not match."
        )
        return

    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(User).where(
                (User.email == email)
                | (
                    User.employee_id
                    == employee_id
                )
            )
        )

        if existing_user:
            print(
                "ERROR: An account already exists "
                "with this email or employee ID."
            )
            return

        admin = User(
            full_name=full_name,
            employee_id=employee_id,
            email=email,
            mobile=mobile or None,
            password_hash=hash_password(
                password
            ),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print()
        print("=" * 50)
        print("ADMIN ACCOUNT CREATED SUCCESSFULLY")
        print("=" * 50)
        print(
            f"Name       : {admin.full_name}"
        )
        print(
            f"Admin ID   : {admin.employee_id}"
        )
        print(
            f"Email      : {admin.email}"
        )
        print(
            f"Role       : {admin.role}"
        )
        print("=" * 50)

    except Exception as error:
        db.rollback()

        print()
        print("ERROR: Admin creation failed.")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()