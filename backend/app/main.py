from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, engine
from .routes.auth import router as auth_router
from .routes.employee import router as employee_router


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="LoanDPR Creditum Employee Management API",
    description="Employee Management System Backend",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": (
            "LoanDPR Creditum "
            "Employee Management API"
        ),
        "status": "running",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
    }


app.include_router(
    auth_router
)

app.include_router(
    employee_router
)