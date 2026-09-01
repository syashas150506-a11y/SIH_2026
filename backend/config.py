class Settings:
    PROJECT_NAME: str = "MediCare AI Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # SQLite Database
    DATABASE_URL: str = "sqlite:///./medicare_ai.db"
    
    # CORS Configuration
    CORS_ORIGINS: list = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8000",
        "http://127.0.0.1",
        "http://127.0.0.1:5500",
        "*"
    ]
    
    # Admin Emails for notifications
    ADMIN_EMAILS: list = [
        "rajivgowdayc541@gmail.com",
        "syashas150506@gmail.com",
        "sankethmanomay@gmail.com"
    ]

settings = Settings()
