from datetime import date

from app.database import SessionLocal
from app.models import Holiday


HOLIDAYS_2026 = [
    {
        "holiday_date": date(2026, 1, 26),
        "name": "Republic Day",
        "description": "Company holiday for Republic Day.",
    },
    {
        "holiday_date": date(2026, 3, 19),
        "name": "Gudi Padwa",
        "description": "Company holiday for Gudi Padwa.",
    },
    {
        "holiday_date": date(2026, 8, 15),
        "name": "Independence Day",
        "description": "Company holiday for Independence Day.",
    },
    {
        "holiday_date": date(2026, 9, 14),
        "name": "Ganesh Chaturthi",
        "description": "Company holiday for Ganesh Chaturthi.",
    },
    {
        "holiday_date": date(2026, 9, 25),
        "name": "Anant Chaturdashi",
        "description": "Company holiday for Anant Chaturdashi.",
    },
    {
        "holiday_date": date(2026, 10, 20),
        "name": "Dussehra",
        "description": "Company holiday for Dussehra.",
    },
    {
        "holiday_date": date(2026, 11, 8),
        "name": "Diwali",
        "description": "Company holiday for Diwali.",
    },
    {
        "holiday_date": date(2026, 11, 9),
        "name": "Diwali",
        "description": "Company holiday for Diwali.",
    },
    {
        "holiday_date": date(2026, 11, 10),
        "name": "Diwali",
        "description": "Company holiday for Diwali.",
    },
]


def seed_holidays():
    db = SessionLocal()

    try:
        inserted_count = 0
        skipped_count = 0

        for holiday_data in HOLIDAYS_2026:
            existing_holiday = (
                db.query(Holiday)
                .filter(
                    Holiday.holiday_date
                    == holiday_data["holiday_date"]
                )
                .first()
            )

            if existing_holiday:
                print(
                    f"SKIPPED: "
                    f"{holiday_data['holiday_date']} - "
                    f"{holiday_data['name']} already exists."
                )
                skipped_count += 1
                continue

            holiday = Holiday(
                holiday_date=holiday_data["holiday_date"],
                name=holiday_data["name"],
                description=holiday_data["description"],
                is_active=True,
            )

            db.add(holiday)
            inserted_count += 1

        db.commit()

        print()
        print("======================================")
        print("Holiday seeding completed successfully")
        print("======================================")
        print(f"Inserted : {inserted_count}")
        print(f"Skipped  : {skipped_count}")
        print(f"Total    : {inserted_count + skipped_count}")
        print("======================================")

    except Exception as error:
        db.rollback()

        print()
        print("======================================")
        print("ERROR: Holiday seeding failed")
        print("======================================")
        print(error)

        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_holidays()