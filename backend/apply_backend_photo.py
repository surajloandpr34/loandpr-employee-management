
from pathlib import Path
import base64
import binascii
import shutil
import sys

from sqlalchemy import inspect, text

root = Path.cwd()
app = root / "app"

required = [
    app / "models.py",
    app / "schemas.py",
    app / "routes" / "admin.py",
    app / "routes" / "employee.py",
]

if not all(path.exists() for path in required):
    sys.exit(
        "ERROR: Terminal backend folder mein open karo, "
        "jahan app folder hai."
    )

files = {
    path: path.read_text(encoding="utf-8")
    for path in required
}


def change(path, old, new):
    source = files[path]

    if new in source:
        return

    if old not in source:
        sys.exit(
            f"ERROR: Expected code not found: {path}. "
            "Koi source file change nahi hui."
        )

    files[path] = source.replace(old, new, 1)


models, schemas, admin, employee = required

# 1. Database model
change(
    models,
    '''    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )''',
    '''    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    image_data: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )''',
)

# 2. Announcement create schema
change(
    schemas,
    '''class AnnouncementCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=1, max_length=10000)''',
    '''class AnnouncementCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=1, max_length=10000)
    image_data: str | None = Field(
        default=None, max_length=3000000
    )''',
)

# 3. Announcement response schema
change(
    schemas,
    '''class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str''',
    '''class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    image_data: str | None = None''',
)

# 4. Admin API imports
change(
    admin,
    "from datetime import datetime",
    '''import base64
import binascii
from datetime import datetime''',
)

# 5. Validate uploaded photo
change(
    admin,
    '''@router.post("/announcements")
def create_announcement(''',
    '''def validate_announcement_image(
    image_data: str | None,
) -> str | None:
    if not image_data:
        return None

    allowed = (
        "data:image/jpeg;base64,",
        "data:image/png;base64,",
        "data:image/webp;base64,",
        "data:image/gif;base64,",
    )

    prefix = next(
        (item for item in allowed if image_data.startswith(item)),
        None,
    )

    if prefix is None:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, WebP and GIF photos are allowed.",
        )

    try:
        raw = base64.b64decode(
            image_data[len(prefix):],
            validate=True,
        )
    except (ValueError, binascii.Error):
        raise HTTPException(
            status_code=400,
            detail="Invalid photo data.",
        )

    if not raw or len(raw) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Photo must be 2 MB or smaller.",
        )

    signatures = {
        "image/jpeg": raw.startswith(bytes.fromhex("ffd8ff")),
        "image/png": raw.startswith(
            bytes.fromhex("89504e470d0a1a0a")
        ),
        "image/webp": (
            raw.startswith(b"RIFF")
            and raw[8:12] == b"WEBP"
        ),
        "image/gif": raw.startswith((b"GIF87a", b"GIF89a")),
    }

    mime = prefix.split(";")[0].split(":")[1]

    if not signatures[mime]:
        raise HTTPException(
            status_code=400,
            detail="Photo content does not match file type.",
        )

    return image_data


@router.post("/announcements")
def create_announcement(''',
)

# 6. Save photo with announcement
change(
    admin,
    '''    announcement = Announcement(
        title=request.title.strip(),
        content=request.content.strip(),''',
    '''    announcement = Announcement(
        title=request.title.strip(),
        content=request.content.strip(),
        image_data=validate_announcement_image(
            request.image_data
        ),''',
)

# 7. Send photo to employee
change(
    employee,
    '''            "content": announcement.content,
            "created_by": announcement.created_by,''',
    '''            "content": announcement.content,
            "image_data": announcement.image_data,
            "created_by": announcement.created_by,''',
)

# Verify Python syntax before changing database/files
import ast

for path, source in files.items():
    ast.parse(source, filename=str(path))

# Backup original files
for path in required:
    backup = path.with_name(path.name + ".before_photo.bak")
    if not backup.exists():
        shutil.copy2(path, backup)

# Update existing database without deleting announcements
sys.path.insert(0, str(root))
from app.database import engine

with engine.begin() as connection:
    columns = {
        column["name"]
        for column in inspect(connection).get_columns(
            "announcements"
        )
    }

    if "image_data" not in columns:
        connection.execute(
            text(
                "ALTER TABLE announcements "
                "ADD COLUMN image_data TEXT"
            )
        )

# Write updated source files
for path, source in files.items():
    path.write_text(source, encoding="utf-8")
    print("Updated:", path)

print("SUCCESS! Backend photo support added.")
print("Restart your FastAPI server.")
