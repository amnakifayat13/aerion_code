from fastapi import FastAPI, HTTPException, UploadFile
from pydantic import BaseModel
from mcp.server.fastmcp import FastMCP
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import uvicorn
from dotenv import load_dotenv
import os
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
import asyncio
from bson import ObjectId
import aiohttp
from datetime import datetime, timedelta
import json
from typing import List, Dict


load_dotenv()

BASE_URL = os.getenv("BASE_URL")
FACEBOOK_PAGE_ID = os.getenv("FACEBOOK_PAGE_ID")
FACEBOOK_PAGE_ACCESS_TOKEN = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN")

print("PAGE ID:", FACEBOOK_PAGE_ID)
print("ACCESS TOKEN:", FACEBOOK_PAGE_ACCESS_TOKEN)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.debug(f"MONGO_URI: {os.getenv('MONGO_URI')[:10]}... (masked)")
logger.debug(f"CLOUDINARY_CLOUD_NAME: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
logger.debug(f"CLOUDINARY_API_KEY: {os.getenv('CLOUDINARY_API_KEY')[:5]}... (masked)")


mcp = FastMCP(name="FastMCP", stateless_http=False, json_response=True)


connection = os.getenv("MONGO_URI")
if not connection:
    logger.error("MONGO_URI not set in environment variables")
    raise ValueError("MONGO_URI not set")
DB_NAME = "aerion"
COLLECTION_NAME = "products"
SUPPLIERS_COLLECTION = "suppliers"


client = AsyncIOMotorClient(connection)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]
suppliers_collection = db[SUPPLIERS_COLLECTION]


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

if not all([cloudinary.config().cloud_name, cloudinary.config().api_key, cloudinary.config().api_secret]):
    logger.error("Cloudinary configuration incomplete")
    raise ValueError("Cloudinary configuration incomplete")


class Product(BaseModel):
    name: str
    price: int
    stock: int
    size: str | None = None
    color: str | None = None
    category: str | None = None
    image_url: str | None = None

class Supplier(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    products_supplied: List[str]

LOW_STOCK_LIMIT = 10
OVER_STOCK_LIMIT = 50

# Get absolute path based on script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "mock_data", "machines.json")

def load_data():
    try:
        with open(DATA_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {DATA_PATH}")
        return {"machines": [], "thresholds": {}}
    

@mcp.tool()
async def get_all_products_inventory() -> List[dict]:
        result = []
        async for p in collection.find():
            result.append({
                "name": p.get("name"),
                "stock": p.get("stock", 0),
                "category": p.get("category")
            })
        return result

    # ✅ Tool 2: Check stock status
@mcp.tool()
async def check_stock_status() -> Dict:
        low, normal, over = [], [], []

        async for p in collection.find():
            stock = p.get("stock", 0)
            item = {
                "name": p.get("name"),
                "stock": stock,
                "category": p.get("category")
            }

            if stock < LOW_STOCK_LIMIT:
                low.append(item)
            elif stock > OVER_STOCK_LIMIT:
                over.append(item)
            else:
                normal.append(item)

        return {
            "low_stock": low,
            "normal_stock": normal,
            "over_stock": over
        }

    # ✅ Tool 3: Get supplier by product
@mcp.tool()
async def get_supplier_by_product(product_name: str) -> Dict:
        supplier = await suppliers_collection.find_one({
            "products_supplied": product_name
        })

        if not supplier:
            return {"error": "Supplier not found"}

        return {
            "name": supplier.get("name"),
            "email": supplier.get("email"),
            "phone": supplier.get("phone"),
            "address": supplier.get("address")
        }

    # ✅ Tool 4: Notify finance (dummy)
@mcp.tool()
async def notify_finance(issue_type: str, product: str, supplier: dict) -> str:
        msg = (
            f"📢 FINANCE ALERT | {issue_type}\n"
            f"Product: {product}\n"
            f"Supplier: {supplier.get('name')} | {supplier.get('phone')}"
        )
        print(msg)
        return msg

@mcp.tool()
def get_machine_health(machine_id: str) -> dict:
    """
    Fetch health data of automotive manufacturing machine.
    """
    data = load_data()
    for m in data["machines"]:
        if m["machine_id"] == machine_id:
            return {
                "machine_id": machine_id,
                "machine_name": m["machine_name"],
                "production_stage": m["production_stage"],
                "status": m["status"],
                "temperature": m["sensor_data"]["temperature_celsius"],
                "vibration": m["sensor_data"]["vibration_mm_s"],
                "cycle_time": m["sensor_data"]["cycle_time_seconds"],
                "days_since_maintenance": m["maintenance"]["days_since_last_maintenance"],
                "criticality": m["criticality"]
            }
    return {"error": "Machine not found"}

@mcp.tool()
def raise_maintenance_request(machine_id: str, reason: str) -> str:
    """
    Simulate maintenance request for automotive plant.
    """
    return f"🔧 Maintenance request raised for {machine_id} | Reason: {reason}"

@mcp.tool()
def analyze_machine_risk():
    data = load_data()
    machines = data["machines"]
    t = data["thresholds"]

    risks = []

    for m in machines:
        score = 0
        reasons = []

        if m["sensor_data"]["temperature_celsius"] > t["max_temperature"]:
            score += 2
            reasons.append("High temperature")

        if m["sensor_data"]["vibration_mm_s"] > t["max_vibration"]:
            score += 2
            reasons.append("High vibration")

        if m["maintenance"]["days_since_last_maintenance"] > t["max_days_without_maintenance"]:
            score += 1
            reasons.append("Maintenance overdue")

        if score >= 4:
            level = "HIGH"
        elif score >= 2:
            level = "MEDIUM"
        else:
            level = "LOW"

        risks.append({
            "machine_id": m["machine_id"],
            "machine_name": m["machine_name"],
            "stage": m["production_stage"],
            "risk": level,
            "reasons": reasons,
            "temperature": m["sensor_data"]["temperature_celsius"],
            "vibration": m["sensor_data"]["vibration_mm_s"],
            "status": m["status"]
        })

    return risks


@mcp.tool()
async def analyze_inventory_risk():
    risks = []

    async for p in collection.find():
        if p.get("stock", 0) < LOW_STOCK_LIMIT:
            risks.append({
                "product": p["name"],
                "stock": p["stock"],
                "risk": "HIGH",
                "reason": "Below safety stock"
            })
        elif p.get("stock", 0) > OVER_STOCK_LIMIT:
            risks.append({
                "product": p["name"],
                "stock": p["stock"],
                "risk": "OVER",
                "reason": "Over stocking"
            })

    return risks

from suppliers_data import suppliers_seed

@mcp.tool()
async def analyze_supplier_risk():
    risks = []
    for s in suppliers_seed:
        delay = float(s.get("delay_score", 0.2))
        if delay > 0.6:
            risks.append({
                "supplier": s.get("name"),
                "risk": "HIGH",
                "reason": "Frequent delivery delays",
                "phone": s.get("phone")
            })
    return risks






app = FastAPI(title="MCP Server with Test Endpoints")

@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "MCP Server + MongoDB + Cloudinary",
        "mcp_endpoint": "/mcp",
        "test_endpoints": {
            "database": "/test/db",
            "inventory": "/test/inventory/{product_name}",
            "low_sellers": "/test/low-sellers"
        }
    }

@app.get("/test/db")
async def test_db():
    try:
        count = await collection.count_documents({})
        products = await collection.find({}).limit(10).to_list(length=10)
        product_names = [p.get("name") for p in products]
        return {
            "status": "success",
            "db_name": DB_NAME,
            "collection": COLLECTION_NAME,
            "total_products": count,
            "sample_products": product_names
        }
    except Exception as e:
        logger.error(f"Database test failed: {e}", exc_info=True)
        return {"status": "failed", "error": str(e)}


    

mcp_app = mcp.streamable_http_app()
app.mount("/mcp", mcp_app)

if __name__ == "__main__":
    logger.info("🚀 Starting FastAPI + MCP Server on port 8003...")
    uvicorn.run("server:mcp_app", host="0.0.0.0", port=8003, reload=True)