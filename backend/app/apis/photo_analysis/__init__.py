from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
import base64

router = APIRouter()

class PhotoAnalysisRequest(BaseModel):
    image_base64: str
    analysis_type: str = "recipe"  # "recipe" or "dish"

class PhotoAnalysisResponse(BaseModel):
    extracted_text: str
    analysis_type: str
    confidence: str
    suggestions: list[str]

@router.post("/photo-analysis")
async def analyze_photo(request: PhotoAnalysisRequest) -> PhotoAnalysisResponse:
    """
    Analyze a photo using OpenAI Vision API to extract recipe text or identify dishes.
    
    Supports two modes:
    - recipe: Extract text from recipe images
    - dish: Identify the dish and suggest a recipe
    """
    print(f"📸 Received photo analysis request: {request.analysis_type}")
    print(f"📸 Image data length: {len(request.image_base64)}")
    
    try:
        # Initialize OpenAI client
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            print("❌ OpenAI API key not found")
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key not configured"
            )
        
        print(f"✅ OpenAI API key found: {openai_key[:10]}...")
        client = OpenAI(api_key=openai_key)
        
        # Validate base64 image
        try:
            # Basic validation - try to decode the base64
            decoded_data = base64.b64decode(request.image_base64)
            print(f"✅ Image decoded successfully: {len(decoded_data)} bytes")
        except Exception as e:
            print(f"❌ Image validation error: {str(e)}")
            raise HTTPException(
                status_code=400, 
                detail="Invalid base64 image data"
            ) from None
        
        # Prepare prompts based on analysis type
        if request.analysis_type == "recipe":
            system_prompt = """
            You are a recipe extraction expert specializing in OCR and text recognition. Analyze the provided image and extract any recipe text you can see with high accuracy.
            
            IMPORTANT OCR INSTRUCTIONS:
            - Look carefully at all text in the image, including small print
            - Pay attention to ingredient measurements (cups, tablespoons, etc.)
            - Extract cooking times, temperatures, and serving sizes
            - Include any notes, tips, or variations mentioned
            - If text is partially obscured, indicate with [unclear] but try your best
            
            If you can see a recipe, extract:
            - Recipe title (if visible)
            - Complete ingredients list with exact measurements
            - Step-by-step instructions in order
            - Any cooking times, temperatures, or servings mentioned
            - Any additional notes or tips
            
            Format your response as a complete, readable recipe that can be easily converted to plant-based.
            If you cannot clearly see recipe text, respond with: "No clear recipe text found in image."
            
            Be thorough and accurate - extract all visible text related to cooking.
            """
            
            user_prompt = "Please extract ALL recipe text from this image with high accuracy. Include every ingredient with measurements, all cooking instructions, times, temperatures, and any notes. Be thorough and detailed."
            
        else:  # dish analysis
            system_prompt = """
            You are a culinary expert. Analyze the provided image of food/dish and identify what it is.
            
            Provide:
            1. The name of the dish
            2. Key ingredients you can identify
            3. Cooking method (fried, baked, grilled, etc.)
            4. Basic recipe structure
            
            Format as a recipe with:
            - Dish name
            - Estimated ingredients list
            - Basic cooking instructions
            
            If you cannot identify the dish clearly, respond with: "Unable to identify the dish in this image."
            """
            
            user_prompt = "Please identify this dish and provide a basic recipe for making it, including ingredients and cooking method."
        
        # Call OpenAI Vision API with better error handling
        try:
            response = client.chat.completions.create(
                model="gpt-5.4-nano",  # Cost-optimized model with full vision
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": user_prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{request.image_base64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_completion_tokens=1500,
                temperature=0.1  # Low temperature for more consistent extraction
            )
        except Exception as api_error:
            # Try with different image format if JPEG fails
            if "image_parse_error" in str(api_error) or "unsupported image" in str(api_error):
                try:
                    response = client.chat.completions.create(
                        model="gpt-5.4-nano",
                        messages=[
                            {
                                "role": "system",
                                "content": system_prompt
                            },
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": user_prompt
                                    },
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/png;base64,{request.image_base64}",
                                            "detail": "high"
                                        }
                                    }
                                ]
                            }
                        ],
                        max_completion_tokens=1500,
                        temperature=0.1
                    )
                except Exception as retry_error:
                    raise HTTPException(
                        status_code=400,
                        detail="Image format not supported. Please try a different photo."
                    ) from None
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"OpenAI API error: {str(api_error)}"
                ) from None
        
        extracted_text = response.choices[0].message.content
        
        # Smart fallback: If no recipe text found, try dish identification
        if "no clear recipe" in extracted_text.lower() or "unable to identify" in extracted_text.lower():
            
            # Try dish identification as fallback
            dish_prompt = """
            I couldn't find readable recipe text in this image. Let me try to identify the food/dish instead.
            
            Analyze this image and:
            1. Identify what food/dish you can see
            2. List the main ingredients you can observe
            3. Suggest cooking method and basic preparation
            4. Create a simple recipe structure
            
            If you can identify food items, provide a basic recipe. If not, respond with "Unable to identify food in this image."
            """
            
            try:
                fallback_response = client.chat.completions.create(
                    model="gpt-5.4-nano",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": dish_prompt
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{request.image_base64}",
                                        "detail": "high"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=1000,
                    temperature=0.3
                )
                
                dish_analysis = fallback_response.choices[0].message.content
                
                if "unable to identify food" not in dish_analysis.lower():
                    # Success with dish identification
                    extracted_text = dish_analysis
                    confidence = "medium"
                    suggestions = [
                        "Recipe generated from visual dish analysis!",
                        "This is based on identifying ingredients in your photo",
                        "Feel free to edit and adjust the recipe as needed"
                    ]
                else:
                    # Both attempts failed
                    confidence = "low"
                    suggestions = [
                        "Could not identify recipe text or food in the image",
                        "Try taking a clearer photo with better lighting",
                        "Ensure recipe text is visible or food is clearly shown"
                    ]
                    
            except Exception as fallback_error:
                confidence = "low"
                suggestions = [
                    "Could not analyze image content",
                    "Try taking a clearer photo with better lighting",
                    "Ensure the recipe text is fully visible and not cut off"
                ]
        else:
            # Original recipe text extraction was successful
            confidence = "high"
            suggestions = [
                "Recipe extracted successfully!",
                "You can now convert this to a plant-based version",
                "Feel free to edit the extracted text before converting"
            ]
        
        result = PhotoAnalysisResponse(
            extracted_text=extracted_text,
            analysis_type=request.analysis_type,
            confidence=confidence,
            suggestions=suggestions
        )
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to analyze photo: {str(e)}"
        ) from None