import os
import pathlib
import json
import dotenv
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load environment files
dotenv.load_dotenv(".env")
environment = os.getenv("ENV", "dev")
env_file = f".env.{environment}"
dotenv.load_dotenv(env_file, override=True)

print(f"Loaded environment: {environment}")


def get_router_config() -> dict:
    try:
        cfg = json.loads(open("routers.json").read())
    except:
        return False
    return cfg


def import_api_routers() -> APIRouter:
    """Create top level router including all user defined endpoints."""
    routes = APIRouter(prefix="/api")
    router_config = get_router_config()
    src_path = pathlib.Path(__file__).parent
    apis_path = src_path / "app" / "apis"

    api_names = [
        p.relative_to(apis_path).parent.as_posix()
        for p in apis_path.glob("*/__init__.py")
    ]

    api_module_prefix = "app.apis."

    for name in api_names:
        print(f"Importing API: {name}")
        try:
            api_module = __import__(api_module_prefix + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            if isinstance(api_router, APIRouter):
                routes.include_router(api_router)
        except Exception as e:
            print(f"Error importing {name}: {e}")
            continue

    return routes


def create_app() -> FastAPI:
    """Create the FastAPI app."""
    app = FastAPI()

    # Add CORS middleware to allow frontend to call backend API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins (for development/production)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    try:
        app.include_router(import_api_routers())
    except Exception as e:
        print(f"Error loading API routers: {e}")
        import traceback
        traceback.print_exc()
    return app


app = create_app()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "environment": os.getenv("ENV", "dev")}


# Mount static frontend files
static_path = pathlib.Path("/app/frontend/dist")
if static_path.exists():
    app.mount("/", StaticFiles(directory=str(static_path), html=True), name="static")
    print(f"✓ Frontend served from {static_path}")
else:
    print(f"✗ Frontend dist not found at {static_path}")

