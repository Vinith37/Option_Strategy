"""
Setup Verification Script
Run this to verify your backend is configured correctly.

Usage:
    python verify_setup.py
"""
import sys
import os


def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def check_python_version():
    """Check Python version."""
    print_header("Checking Python Version")
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print("❌ Python 3.11+ required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    
    print("✅ Python version OK")
    return True


def check_dependencies():
    """Check if required packages are installed."""
    print_header("Checking Dependencies")
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2",
        "pydantic",
        "pydantic_settings",
        "alembic"
    ]
    
    all_installed = True
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - NOT INSTALLED")
            all_installed = False
    
    if not all_installed:
        print("\n💡 Install missing packages:")
        print("   pip install -r requirements.txt")
        return False
    
    return True


def check_env_file():
    """Check if .env file exists and has required variables."""
    print_header("Checking Environment Variables")
    
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    
    if not os.path.exists(env_path):
        print("❌ .env file not found")
        print("\n💡 Create .env file:")
        print("   cp .env.example .env")
        print("   Then edit .env and add your configuration")
        return False
    
    print("✅ .env file exists")
    
    # Check required variables
    required_vars = [
        "DATABASE_URL",
        "FRONTEND_URL",
        "SECRET_KEY"
    ]
    
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    all_vars_set = True
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if "URL" in var or "KEY" in var:
                display_value = value[:20] + "..." if len(value) > 20 else value
            else:
                display_value = value
            print(f"✅ {var} = {display_value}")
        else:
            print(f"❌ {var} - NOT SET")
            all_vars_set = False
    
    if not all_vars_set:
        print("\n💡 Set missing variables in .env file")
        return False
    
    return True


def check_database_connection():
    """Check if database connection works."""
    print_header("Checking Database Connection")
    
    try:
        from app.config import settings
        from sqlalchemy import create_engine, text
        
        print(f"Connecting to: {settings.database_url.split('@')[1] if '@' in settings.database_url else '***'}")
        
        engine = create_engine(settings.database_url)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.scalar()
        
        print("✅ Database connection successful")
        return True
    
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("\n💡 Check your DATABASE_URL:")
        print("   - Ensure Neon database is active")
        print("   - Verify connection string format")
        print("   - Must include ?sslmode=require")
        return False


def check_database_tables():
    """Check if database tables exist."""
    print_header("Checking Database Tables")
    
    try:
        from app.database import engine
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if "strategies" in tables:
            print("✅ 'strategies' table exists")
        else:
            print("⚠️  'strategies' table not found")
            print("\n💡 Initialize database:")
            print("   python -c \"from app.database import init_db; init_db()\"")
            return False
        
        return True
    
    except Exception as e:
        print(f"❌ Error checking tables: {str(e)}")
        return False


def check_fastapi_app():
    """Check if FastAPI app loads correctly."""
    print_header("Checking FastAPI Application")
    
    try:
        from app.main import app
        
        print(f"✅ FastAPI app loaded")
        print(f"   Title: {app.title}")
        print(f"   Version: {app.version}")
        
        # Check routes
        routes = [route.path for route in app.routes]
        required_routes = ["/", "/api/health", "/api/payoff/calculate", "/api/strategies"]
        
        all_routes_exist = True
        for route in required_routes:
            if route in routes:
                print(f"✅ Route: {route}")
            else:
                print(f"❌ Route missing: {route}")
                all_routes_exist = False
        
        return all_routes_exist
    
    except Exception as e:
        print(f"❌ Failed to load FastAPI app: {str(e)}")
        return False


def main():
    """Run all checks."""
    print("\n" + "=" * 60)
    print("  🔍 Backend Setup Verification")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment File", check_env_file),
        ("Database Connection", check_database_connection),
        ("Database Tables", check_database_tables),
        ("FastAPI Application", check_fastapi_app),
    ]
    
    results = []
    
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Unexpected error in {name}: {str(e)}")
            results.append((name, False))
    
    # Summary
    print_header("Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{'=' * 60}")
    print(f"  {passed}/{total} checks passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All checks passed! Your backend is ready to run.")
        print("\n▶️  Start the server:")
        print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\n📚 Documentation:")
        print("   - README.md")
        print("   - QUICK_START.md")
        print("   - backend/README.md")
    
    print()
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nVerification cancelled.")
        sys.exit(1)
