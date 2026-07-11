from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import asyncpg
import os
from app.env import mode, Mode

router = APIRouter()

class VeganWeapon(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    ingredients: List[str]
    instructions: str
    prep_time_minutes: Optional[int] = None
    servings: Optional[str] = None
    tags: List[str] = []
    created_at: str
    updated_at: str

class VeganWeaponsResponse(BaseModel):
    weapons: List[VeganWeapon]
    categories: List[str]
    total_count: int

@router.get("/vegan-weapons")
async def get_vegan_weapons(category: Optional[str] = None) -> VeganWeaponsResponse:
    """Get all vegan weapons, optionally filtered by category"""
    
    # Get database connection string based on environment
    if mode == Mode.PROD:
        database_url = os.getenv("DATABASE_URL_PROD")
    else:
        database_url = os.getenv("DATABASE_URL_DEV")
    
    conn = await asyncpg.connect(database_url)
    
    try:
        # Build query with optional category filter
        if category:
            query = """
                SELECT id, name, category, description, ingredients, instructions, 
                       prep_time_minutes, servings, tags, created_at, updated_at
                FROM vegan_weapons 
                WHERE category = $1
                ORDER BY name ASC
            """
            rows = await conn.fetch(query, category)
        else:
            query = """
                SELECT id, name, category, description, ingredients, instructions,
                       prep_time_minutes, servings, tags, created_at, updated_at
                FROM vegan_weapons 
                ORDER BY category ASC, name ASC
            """
            rows = await conn.fetch(query)
        
        # Get all unique categories
        categories_query = "SELECT DISTINCT category FROM vegan_weapons ORDER BY category ASC"
        category_rows = await conn.fetch(categories_query)
        categories = [row['category'] for row in category_rows]
        
        # Convert rows to VeganWeapon objects
        weapons = []
        for row in rows:
            weapon = VeganWeapon(
                id=row['id'],
                name=row['name'],
                category=row['category'],
                description=row['description'],
                ingredients=list(row['ingredients']),
                instructions=row['instructions'],
                prep_time_minutes=row['prep_time_minutes'],
                servings=row['servings'],
                tags=list(row['tags']) if row['tags'] else [],
                created_at=row['created_at'].isoformat(),
                updated_at=row['updated_at'].isoformat()
            )
            weapons.append(weapon)
        
        return VeganWeaponsResponse(
            weapons=weapons,
            categories=categories,
            total_count=len(weapons)
        )
    
    finally:
        await conn.close()

@router.get("/vegan-weapons/{weapon_id}")
async def get_vegan_weapon(weapon_id: int) -> VeganWeapon:
    """Get a specific vegan weapon by ID"""
    
    # Get database connection string based on environment
    if mode == Mode.PROD:
        database_url = os.getenv("DATABASE_URL_PROD")
    else:
        database_url = os.getenv("DATABASE_URL_DEV")
    
    conn = await asyncpg.connect(database_url)
    
    try:
        query = """
            SELECT id, name, category, description, ingredients, instructions,
                   prep_time_minutes, servings, tags, created_at, updated_at
            FROM vegan_weapons 
            WHERE id = $1
        """
        row = await conn.fetchrow(query, weapon_id)
        
        if not row:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Vegan weapon not found")
        
        return VeganWeapon(
            id=row['id'],
            name=row['name'],
            category=row['category'],
            description=row['description'],
            ingredients=list(row['ingredients']),
            instructions=row['instructions'],
            prep_time_minutes=row['prep_time_minutes'],
            servings=row['servings'],
            tags=list(row['tags']) if row['tags'] else [],
            created_at=row['created_at'].isoformat(),
            updated_at=row['updated_at'].isoformat()
        )
    
    finally:
        await conn.close()
