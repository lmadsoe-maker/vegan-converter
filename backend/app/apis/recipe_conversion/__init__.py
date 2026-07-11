from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
import asyncpg
from app.env import mode, Mode

router = APIRouter()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class RecipeConversionRequest(BaseModel):
    original_recipe: str

class RecipeConversionResponse(BaseModel):
    converted_recipe: str
    substitutions_made: list[str]
    cooking_tips: list[str]
    vegan_weapons_used: list[dict] = []  # List of Vegan Weapons referenced

async def get_vegan_weapons_list():
    """Get all available Vegan Weapons for reference in conversions"""
    # Get database connection string based on environment
    if mode == Mode.PROD:
        database_url = os.getenv("DATABASE_URL_PROD")
    else:
        database_url = os.getenv("DATABASE_URL_DEV")
    
    conn = await asyncpg.connect(database_url)
    
    try:
        query = """
            SELECT name, category, description
            FROM vegan_weapons 
            ORDER BY category ASC, name ASC
        """
        rows = await conn.fetch(query)
        
        weapons_by_category = {}
        for row in rows:
            category = row['category']
            if category not in weapons_by_category:
                weapons_by_category[category] = []
            weapons_by_category[category].append({
                'name': row['name'],
                'description': row['description']
            })
        
        return weapons_by_category
    
    finally:
        await conn.close()

@router.post("/convert-recipe")
async def convert_recipe(request: RecipeConversionRequest) -> RecipeConversionResponse:
    """
    Convert any recipe to a plant-based version following 'How to Be Vegan in 28 Days' principles.
    """
    if not request.original_recipe.strip():
        raise HTTPException(status_code=400, detail="Recipe cannot be empty")

    print(f"[RECIPE_CONVERSION] Input recipe: {request.original_recipe[:100]}...")
    print(f"[RECIPE_CONVERSION] OpenAI API key set: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
    
    try:
        # Get available Vegan Weapons for reference
        vegan_weapons = await get_vegan_weapons_list()
        # Create Vegan Weapons reference text
        weapons_text = "\n\nAVAILABLE VEGAN WEAPONS LIBRARY:\n"
        for category, items in vegan_weapons.items():
            weapons_text += f"\n{category.upper()}:\n"
            for item in items:
                weapons_text += f"- {item['name']}: {item['description']}\n"
        
        # Craft a detailed prompt following the book's guidelines
        prompt = f"""
You are an expert plant-based chef following the principles from "How to Be Vegan in 28 Days". 
Convert the following recipe to a completely plant-based version using ONLY whole-food ingredients.

CRITICAL: ALWAYS check the Vegan Weapons Library first for existing sauces, dressings, dips, and sides before creating new ones.

IMPORTANT SUBSTITUTION RULES (based on "How to Be Vegan in 28 Days"):

FOR MEAT REPLACEMENTS - BE INTELLIGENT ABOUT CONTEXT:
- SEAFOOD-STYLE DISHES (Skagenrøre, shrimp salad, crab cakes, fish dishes): TOFU is the preferred substitute
- ASIAN DISHES (stir-fries, curries, pad thai): Tofu or tempeh are appropriate
- HEARTY WESTERN DISHES (lasagne, stews, chili, pasta sauces, tacos, burritos): Use lentils, beans, chickpeas, mushrooms, or eggplant
- GROUND MEAT: Lentils, mushrooms, or finely chopped walnuts
- CHICKEN (non-Asian): Cauliflower, chickpeas, or mushrooms
- BEEF/PORK: Mushrooms, lentils, beans, or eggplant
- NEVER suggest seitan, wheat-based meat substitutes, or processed vegan products

FOR DAIRY:
- MILK: Oat milk, almond milk, soy milk, or coconut milk
- CHEESE: Cashew cheese, nutritional yeast, or homemade nut-based cheese
- BUTTER: Coconut oil, olive oil, or avocado
- CREAM: Coconut cream, cashew cream, or oat cream
- YOGURT: Coconut yogurt or homemade cashew yogurt

FOR EGGS:
- BAKING: Flax eggs (1 tbsp ground flaxseed + 3 tbsp water per egg), chia eggs, or aquafaba
- BINDING: Ground flaxseed, breadcrumbs, or mashed beans
- SCRAMBLED: Tofu scramble with nutritional yeast and turmeric

FOR OTHER INGREDIENTS:
- HONEY: Maple syrup, agave, or date syrup
- FISH SAUCE: Soy sauce or tamari with seaweed
- WORCESTERSHIRE: Soy sauce with vinegar and spices

VEGAN WEAPONS INTEGRATION RULES:
1. ALWAYS check if a sauce, dressing, dip, or side exists in the Vegan Weapons Library
2. If found, USE THE EXACT NAME and reference it (e.g., "Use Vegan Mayo from Vegan Weapons")
3. DO NOT create new versions of existing Vegan Weapons (e.g., don't make cashew mayo if Vegan Mayo exists)
4. When referencing a Vegan Weapon, add: "(See Vegan Weapons library for recipe)"
5. Only create new sauces/dressings if they don't exist in the library

PRIORITIES:
1. Follow "How to Be Vegan in 28 Days" substitution strategies as the default framework
2. For seafood dishes, prioritize tofu-based alternatives
3. Choose substitutions based on dish type and cultural context
4. Prioritize whole, unprocessed plant foods over any processed alternatives
5. Use existing Vegan Weapons instead of creating duplicates
6. Maintain the original dish's flavor profile and cooking method
7. Ensure nutritional balance with protein, healthy fats, and fiber
8. Use naturally gluten-free ingredients when possible, but wheat is allowed when essential
{weapons_text}
FORMAT:
Provide a complete recipe with:
- Recipe title
- Ingredients list with measurements (reference Vegan Weapons by name when applicable)
- Step-by-step instructions
- Cooking time and servings
- Note any Vegan Weapons used

Original Recipe:
{request.original_recipe}

Converted Plant-Based Recipe:"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-5.4-nano",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert plant-based chef specializing in whole-food conversions. Always provide practical, delicious alternatives that follow whole-food plant-based principles."
                },
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=1500,
            temperature=0.7
        )
        
        converted_text = response.choices[0].message.content
        print(f"[RECIPE_CONVERSION] Response received from OpenAI ({len(converted_text)} chars)")
        print(f"[RECIPE_CONVERSION] First 200 chars of response: {converted_text[:200]}...")
        
        # Parse the response to extract Vegan Weapons used
        vegan_weapons_used = []
        weapons_names = []
        for category, items in vegan_weapons.items():
            for item in items:
                weapons_names.append(item['name'])
        
        # Check which Vegan Weapons were referenced in the converted recipe
        for weapon_name in weapons_names:
            if weapon_name.lower() in converted_text.lower():
                # Find the weapon details
                for category, items in vegan_weapons.items():
                    for item in items:
                        if item['name'] == weapon_name:
                            vegan_weapons_used.append({
                                'name': weapon_name,
                                'category': category,
                                'description': item['description']
                            })
                            break
        
        # Extract substitutions based on intelligent context-aware logic
        substitutions = []
        original_lower = request.original_recipe.lower()
        
        # Check for seafood dishes and confirm tofu substitution
        seafood_keywords = ['fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'seafood', 'skagenrøre', 'prawns']
        if any(keyword in original_lower for keyword in seafood_keywords):
            substitutions.append("Seafood replaced with tofu (preferred for seafood-style dishes)")
        
        # Check for meat and add appropriate substitutions
        if any(meat in original_lower for meat in ['chicken', 'beef', 'pork', 'meat']):
            if any(asian in original_lower for asian in ['stir-fry', 'curry', 'asian', 'thai', 'chinese']):
                substitutions.append("Meat replaced with tofu/tempeh (appropriate for Asian cuisine)")
            else:
                substitutions.append("Meat replaced with lentils, beans, mushrooms (whole-food Western approach)")
        
        # Check for dairy
        if any(dairy in original_lower for dairy in ['milk', 'cream', 'cheese', 'butter', 'yogurt']):
            substitutions.append("Dairy replaced with plant-based alternatives (oat/almond milk, cashew cheese, etc.)")
        
        # Add Vegan Weapons usage
        if vegan_weapons_used:
            weapon_names = [w['name'] for w in vegan_weapons_used]
            substitutions.append(f"Using Vegan Weapons: {', '.join(weapon_names)}")
        
        substitutions.append("All substitutions follow 'How to Be Vegan in 28 Days' principles")
        
        # Extract cooking tips focused on whole foods and book principles
        tips = [
            "Follow 'How to Be Vegan in 28 Days' approach for optimal nutrition",
            "For seafood-style dishes, tofu provides the best texture and protein",
            "Season generously - plant-based ingredients often need extra herbs and spices",
            "Use Vegan Weapons library for consistent, tested sauces and dressings"
        ]
        
        # Add specific tips based on Vegan Weapons used
        if vegan_weapons_used:
            tips.append("Check the Vegan Weapons section for detailed recipes of referenced items")
        
        return RecipeConversionResponse(
            converted_recipe=converted_text,
            substitutions_made=substitutions,
            cooking_tips=tips,
            vegan_weapons_used=vegan_weapons_used
        )
        
    except Exception as e:
        print(f"[ERROR] Recipe conversion failed: {str(e)}")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to convert recipe: {str(e)}"
        )