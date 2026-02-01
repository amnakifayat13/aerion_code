from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import uvicorn
import os
import cloudinary
import cloudinary.uploader
from bson import ObjectId
import bcrypt
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt , JWTError


load_dotenv()


# ------------------ SETUP ------------------
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ==========================================================
#           PASSWORD HASHING & JWT CONFIGURATION
# ==========================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production-minimum-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admins/login")


DB_NAME = "aerion"
COLLECTION_NAME = "products"
SUPPLIERS_COLLECTION = "suppliers"
ADMIN_COLLECTION = "admins"


# ------------------ DATABASE ------------------
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI not set")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]
suppliers_collection = db[SUPPLIERS_COLLECTION]
admins_collection = db[ADMIN_COLLECTION]

# ------------------ CLOUDINARY ------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# ------------------ APP ------------------
app = FastAPI(title="Extended CRUD Server with Suppliers")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


# ==========================================================
#              AUTHENTICATION HELPER FUNCTIONS
# ==========================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt directly"""
    password_bytes = password.encode('utf-8')[:72]  # Truncate to 72 bytes
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt directly"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    """Verify JWT token and get current admin."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        admin = await admins_collection.find_one({"email": email})
        if admin is None:
            raise credentials_exception
        return admin
    
    except JWTError:
        raise credentials_exception


# ------------------ MODELS ------------------
class Product(BaseModel):
    name: str
    price: float
    stock: int
    category: Optional[str] = None
    aircraft_system: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class Supplier(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    products_supplied: List[str]

# ------------------ HELPERS ------------------
def serialize_item(item):
    return {**item, "_id": str(item["_id"])}

def upload_image_to_cloudinary(file: UploadFile) -> str:
    try:
        result = cloudinary.uploader.upload(file.file)
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

# ------------------ SUPPLIERS SEED ------------------
suppliers_seed = [
    {
        "name": "Alpha Auto Parts",
        "email": "alpha@supplier.com",
        "phone": "03001234501",
        "address": "Karachi, Pakistan",
        "products_supplied": [
            "Steel Sheet 1mm (Car Body Panels)",
            "Aluminum Alloy Sheet (Engine / Lightweight Panels)"
        ]
    },
    {
        "name": "Beta Automotive",
        "email": "beta@supplier.com",
        "phone": "03001234502",
        "address": "Lahore, Pakistan",
        "products_supplied": [
            "ABS Plastic Dashboard Panel",
            "Polyurethane Foam Car Seat Cushion"
        ]
    },
    {
        "name": "Gamma Components",
        "email": "gamma@supplier.com",
        "phone": "03001234503",
        "address": "Islamabad, Pakistan",
        "products_supplied": [
            "Rubber Tire Tube / Hose",
            "Wiring Harness for Car"
        ]
    },
    {
        "name": "Delta Motors",
        "email": "delta@supplier.com",
        "phone": "03001234504",
        "address": "Faisalabad, Pakistan",
        "products_supplied": [
            "Car Engine Sensor Module",
            "Engine Oil Bottle (Automotive)"
        ]
    },
    {
        "name": "Epsilon Engineering",
        "email": "epsilon@supplier.com",
        "phone": "03001234505",
        "address": "Multan, Pakistan",
        "products_supplied": [
            "Bolt & Nut Set (Chassis Assembly)",
            "Rivets (Car Body Panel Assembly)"
        ]
    }
]

# @app.on_event("startup")
# async def seed_suppliers():
#     """Automatically add 5 suppliers on server startup if they don't exist"""
#     for supplier in suppliers_seed:
#         existing = await suppliers_collection.find_one({"email": supplier["email"]})
#         if existing:
#             continue
#         supplier["created_at"] = datetime.utcnow()
#         await suppliers_collection.insert_one(supplier)
#         logger.info(f"✅ Supplier added: {supplier['name']}")

# ==========================================================
#             🔐 ADMIN AUTHENTICATION ENDPOINTS
# ==========================================================

@app.post("/api/admins/register")
async def register_admin(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    image: UploadFile = File(None)
):
    """Register a new admin with hashed password."""
    try:
        existing = await admins_collection.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        image_url = None
        if image:
            result = cloudinary.uploader.upload(image.file)
            image_url = result.get("secure_url")
        
        hashed_password = hash_password(password)
        
        admin_data = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "image_url": image_url,
            "role": "admin",
            "created_at": datetime.utcnow()
        }
        
        await admins_collection.insert_one(admin_data)
        logger.info(f"✅ Admin registered: {email}")
        
        return {
            "success": True,
            "message": f"Admin '{name}' registered successfully!"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Admin registration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@app.post("/api/admins/login")
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login admin and return JWT token."""
    try:
        admin = await admins_collection.find_one({"email": form_data.username})
        
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not verify_password(form_data.password, admin["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": admin["email"], "name": admin["name"]},
            expires_delta=access_token_expires
        )
        
        logger.info(f"✅ Admin logged in: {admin['email']}")
        
        return {
            "success": True,
            "message": f"Welcome {admin['name']}!",
            "access_token": access_token,
            "token_type": "bearer",
            "admin_info": {
                "name": admin["name"],
                "email": admin["email"],
                "image_url": admin.get("image_url"),
                "role": admin.get("role")
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login failed: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@app.get("/api/admins/me")
async def get_current_admin_info(current_admin: dict = Depends(get_current_admin)):
    """Get current logged-in admin info (protected route)."""
    return {
        "success": True,
        "data": {
            "_id": str(current_admin["_id"]),
            "name": current_admin["name"],
            "email": current_admin["email"],
            "image_url": current_admin.get("image_url"),
            "role": current_admin["role"]
        }
    }


@app.get("/api/admins")
async def get_all_admins(current_admin: dict = Depends(get_current_admin)):
    """Get all admins (protected route)."""
    admins = []
    async for item in admins_collection.find():
        admins.append({
            "_id": str(item.get("_id")),
            "name": item.get("name"),
            "email": item.get("email"),
            "image_url": item.get("image_url"),
            "role": item.get("role"),
            "created_at": item.get("created_at")
        })
    return {"success": True, "data": admins}



# ------------------ SUPPLIERS CRUD ------------------
@app.get("/suppliers")
async def get_all_suppliers():
    suppliers = []
    async for item in suppliers_collection.find():
        suppliers.append(serialize_item(item))
    return {"success": True, "data": suppliers}

@app.get("/suppliers/{supplier_name}")
async def get_supplier(supplier_name: str):
    supplier = await suppliers_collection.find_one({"name": supplier_name})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"success": True, "data": serialize_item(supplier)}

@app.post("/suppliers")
async def add_supplier(supplier: Supplier):
    existing = await suppliers_collection.find_one({"email": supplier.email})
    if existing:
        raise HTTPException(status_code=400, detail="Supplier already exists")
    supplier_data = supplier.dict()
    supplier_data["created_at"] = datetime.utcnow()
    await suppliers_collection.insert_one(supplier_data)
    return {"success": True, "message": f"Supplier '{supplier.name}' added!"}

# ------------------ PRODUCT CRUD ------------------
@app.post("/products")
async def add_product(
    name: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category: str = Form(...),
    aircraft_system: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...)
):
    image_url = upload_image_to_cloudinary(image)
    product_data = {
        "name": name,
        "price": price,
        "stock": stock,
        "category": category,
        "aircraft_system": aircraft_system,
        "description": description,
        "image_url": image_url,
        "created_at": datetime.utcnow()
    }
    await collection.insert_one(product_data)
    return {"success": True, "message": f"Product '{name}' added successfully!"}

@app.get("/products")
async def get_all_products():
    products = []
    async for item in collection.find():
        products.append(serialize_item(item))
    return {"success": True, "data": products}

@app.get("/products/{name}")
async def get_product(name: str):
    product = await collection.find_one({"name": name})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "data": serialize_item(product)}

# ------------------ RUN ------------------
if __name__ == "__main__":
    logger.info("🚀 Starting Server on port 8006...")
    uvicorn.run("main:app", host="0.0.0.0", port=8006, reload=True)