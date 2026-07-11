import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChefHat, Sparkles, Loader2, Copy, Check, Lightbulb, Camera, X } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { CameraCapture } from "components/CameraCapture";
import { PhotoAnalysisRequest, PhotoAnalysisResponse } from "types";
import { trackRecipeConversion, trackPhotoAnalysis, trackUserEngagement, trackConversionGoals } from "utils/analytics";
import Footer from "components/Footer";

interface ConversionResult {
  converted_recipe: string;
  substitutions_made: string[];
  cooking_tips: string[];
  vegan_weapons_used?: { name: string; category: string; description: string }[];
}

export default function Convert() {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Camera functionality state
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  
  // Check if camera is available (desktop and mobile)
  const isCameraAvailable = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  // Helper function for automatic conversion after photo OCR
  const convertRecipeFromText = async (recipeText: string) => {
    trackRecipeConversion.start('photo');
    try {
      const response = await brain.convert_recipe({
        original_recipe: recipeText
      });
      const result = await response.json();
      setConvertedRecipe(result);
      trackRecipeConversion.complete('photo', true);
      trackConversionGoals.recipeCompleted('photo');
    } catch (error) {
      console.error("Error converting recipe from photo:", error);
      trackRecipeConversion.error('photo', error instanceof Error ? error.message : 'unknown_error');
      throw error;
    }
  };

  const handleConvert = async () => {
    if (!recipe.trim()) {
      toast.error("Please enter a recipe to convert");
      return;
    }

    setIsLoading(true);
    trackRecipeConversion.start('text');
    
    try {
      const response = await brain.convert_recipe({
        original_recipe: recipe
      });

      const result = await response.json();
      setConvertedRecipe(result);
      
      trackRecipeConversion.complete('text', true);
      trackConversionGoals.recipeCompleted('text');
      toast.success("Recipe converted successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      trackRecipeConversion.error('text', error instanceof Error ? error.message : 'api_error');
      toast.error("Failed to convert recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (convertedRecipe) {
      await navigator.clipboard.writeText(convertedRecipe.converted_recipe);
      trackUserEngagement.recipeCopy();
      setCopied(true);
      toast.success("Recipe copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setRecipe("");
    setConvertedRecipe(null);
    setCopied(false);
  };

  // Camera functionality
  const handleTakePhoto = async () => {
    if (!isCameraAvailable()) {
      toast.error("Camera not available on this device or browser");
      return;
    }

    try {
      setShowCamera(true);
      trackUserEngagement.cameraOpen();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera for better recipe photos
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Camera stream will be handled by the camera component
    } catch (error) {
      console.error('Camera access error:', error);
      setShowCamera(false);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please enable camera permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Unable to access camera. Please try again.');
      }
    }
  };

  const handlePhotoCapture = async (imageDataUrl: string) => {
    setIsCameraLoading(true);
    setShowCamera(false);
    trackPhotoAnalysis.start();
    
    try {
      // Convert image to base64 and send to backend for analysis
      const base64Image = imageDataUrl.split(',')[1];
      
      toast.loading('Analyzing your photo... It will take a few seconds', { id: 'photo-analysis' });
      
      // Call the real photo analysis API
      const analysisRequest: PhotoAnalysisRequest = {
        image_base64: base64Image,
        analysis_type: 'recipe' // Default to recipe analysis
      };
      
      const response = await brain.analyze_photo(analysisRequest);
      const result: PhotoAnalysisResponse = await response.json();
      
      trackPhotoAnalysis.success(result.confidence);
      
      if (result.confidence === 'low') {
        trackPhotoAnalysis.error('low_confidence');
        toast.error('Could not clearly extract recipe from image', { id: 'photo-analysis' });
        // Still set the text so user can see what was extracted
        setRecipe(result.extracted_text);
        setIsCameraLoading(false);
      } else if (result.confidence === 'medium') {
        toast.success('Generated recipe from dish photo! 🍽️', { id: 'photo-analysis' });
        setRecipe(result.extracted_text);
        
        // Auto-convert dish-identified recipes
        toast.loading('Converting to vegan recipe...', { id: 'auto-conversion' });
        
        try {
          await convertRecipeFromText(result.extracted_text);
          toast.success('✨ Complete! Your vegan recipe is ready!', { id: 'auto-conversion' });
        } catch (conversionError) {
          toast.error('Recipe generated! Click "Convert Recipe" to continue.', { id: 'auto-conversion' });
        }
        
        setIsCameraLoading(false);
      } else {
        toast.success('Photo analyzed! Recipe text extracted successfully', { id: 'photo-analysis' });
        setRecipe(result.extracted_text);
        
        // **NEW: Automatically convert the recipe after successful OCR**
        toast.loading('Converting to vegan recipe...', { id: 'auto-conversion' });
        
        try {
          await convertRecipeFromText(result.extracted_text);
          toast.success('✨ Complete! Your vegan recipe is ready!', { id: 'auto-conversion' });
        } catch (conversionError) {
          toast.error('Text extracted successfully! Click "Convert Recipe" to continue.', { id: 'auto-conversion' });
        }
        
        setIsCameraLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Photo analysis error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      trackPhotoAnalysis.error(error instanceof Error ? error.message : 'unknown_error');
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        toast.error('Authentication required. Please try converting text directly.', { id: 'photo-analysis' });
        console.log('💡 Suggestion: Try typing or pasting recipe text instead');
      } else {
        toast.error('Failed to analyze photo. Please try again or paste recipe text.', { id: 'photo-analysis' });
      }
      
      setIsCameraLoading(false);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary px-6 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-black hover:bg-black/10 p-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              back to home
            </Button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black lowercase">vegan converter</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-black text-black leading-tight mb-4 lowercase">
              convert your recipe
            </h1>
            <p className="text-black/80 text-lg max-w-2xl mx-auto">
              Take a photo of, or copy your favorite recipe and paste it here.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 lowercase">take a photo of recipe</h2>
              
              {/* Camera button - Works on desktop and mobile */}
              {isCameraAvailable() && (
                <div className="mb-4">
                  <Button
                    onClick={handleTakePhoto}
                    disabled={isLoading || isCameraLoading}
                    variant="default"
                    className="w-full bg-primary text-black hover:bg-primary/90 font-bold py-4 text-lg lowercase border-2 border-primary"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {isCameraLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        analyzing photo...
                      </>
                    ) : (
                      "take photo of recipe"
                    )}
                  </Button>
                  
                  {isCameraLoading && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-gray-600 font-medium">📸 Analyzing your photo... Please wait a few seconds</p>
                      <div className="mt-2 flex justify-center">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="w-2 h-2 bg-primary rounded-full" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-primary rounded-full" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-gray-600 text-sm mb-4">
                Or, if you prefer, paste the recipe or just type the name of your favorite dish into the box below.
              </p>
            </div>

            <Textarea
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              placeholder="Enter a recipe or simply type the name of your favorite dish here."
              className="h-[200px] resize-none border-2 border-gray-200 focus:border-primary text-sm overflow-y-auto"
              disabled={isLoading || isCameraLoading}
            />



            <div className="flex gap-4 mt-4">
              <Button 
                onClick={handleConvert}
                disabled={isLoading || !recipe.trim()}
                className="flex-1 bg-black text-white hover:bg-gray-800 font-bold py-4 sm:py-6 text-base sm:text-lg lowercase"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    converting your recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    convert to plant-based recipe
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2 lowercase">
                {convertedRecipe ? "your plant-based recipe" : "your conversion will appear here"}
              </h2>
              <p className="text-gray-600 text-sm">
                {convertedRecipe 
                  ? "Your recipe has been transformed with wholesome plant-based alternatives!"
                  : "Your converted recipe will appear here with ingredient swaps and cooking tips"
                }
              </p>
            </div>

            {convertedRecipe ? (
              <div className="space-y-6">
                {/* Main Converted Recipe */}
                <Card className="border-2 border-accent">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-accent">
                        <Sparkles className="w-5 h-5 mr-2" />
                        <span className="font-bold lowercase">conversion complete</span>
                        <span className="ml-3 bg-accent text-white px-2 py-1 rounded text-xs font-bold lowercase">
                          minimal processing
                        </span>
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-black"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copied ? "copied!" : "copy recipe"}
                      </Button>
                    </div>

                    {/* Clean Recipe Display */}
                    <div className="bg-white space-y-6 max-w-4xl mx-auto">
                      {convertedRecipe.converted_recipe.split('\n\n').map((section, index) => {
                        const lines = section.split('\n').filter(line => line.trim());
                        if (lines.length === 0) return null;

                        const title = lines[0];
                        const content = lines.slice(1);

                        // All substituted ingredients to highlight (both plant-based and other substitutions)
                        const substitutedIngredients = [
                          // Plant-based proteins
                          'tofu', 'tempeh', 'seitan', 'chickpeas', 'lentils', 'beans', 'black beans',
                          'kidney beans', 'white beans', 'cannellini beans', 'pinto beans', 'navy beans',
                          'hemp hearts', 'chia seeds', 'flax seeds', 'sunflower seeds', 'pumpkin seeds',
                          
                          // Plant-based dairy alternatives
                          'oat milk', 'almond milk', 'coconut milk', 'soy milk', 'rice milk', 'cashew milk',
                          'oat cream', 'coconut cream', 'cashew cream', 'nutritional yeast', 'cashew cheese',
                          'vegan butter', 'plant butter', 'coconut butter', 'vegan cheese', 'plant-based cheese',
                          
                          // Egg replacements
                          'aquafaba', 'flax egg', 'chia egg', 'ground flaxseed', 'applesauce', 'mashed banana',
                          
                          // Alternative flours and oils
                          'coconut oil', 'olive oil', 'avocado oil', 'tahini', 'almond butter', 'peanut butter',
                          'rice flour', 'oat flour', 'almond flour', 'chickpea flour', 'coconut flour',
                          'whole wheat flour', 'spelt flour',
                          
                          // Other common substitutions
                          'soy sauce', 'tamari', 'miso', 'coconut aminos', 'plant milk', 'plant-based milk',
                          'maple syrup', 'agave', 'date syrup', 'coconut sugar', 'brown sugar',
                          'vegetable broth', 'mushroom broth'
                        ];

                        const highlightSubstitutions = (text) => {
                          let result = text;
                          substitutedIngredients.forEach(ingredient => {
                            const regex = new RegExp(`\\b${ingredient}\\b`, 'gi');
                            result = result.replace(regex, `<strong class="font-bold text-black">${ingredient}</strong>`);
                          });
                          return result;
                        };

                        // Recipe title detection
                        if (lines.length === 1 && !title.toLowerCase().includes('ingredient') && !title.toLowerCase().includes('instruction')) {
                          return (
                            <div key={index} className="text-center border-b border-gray-200 pb-6">
                              <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight">
                                {title.replace(/[#*]/g, '').trim()}
                              </h1>
                            </div>
                          );
                        }

                        // Section detection (Ingredients, Instructions, etc.)
                        const isTitle = title && (
                          title.toLowerCase().includes('ingredient') ||
                          title.toLowerCase().includes('instruction') ||
                          title.toLowerCase().includes('direction') ||
                          title.toLowerCase().includes('method') ||
                          title.toLowerCase().includes('serving') ||
                          title.toLowerCase().includes('note') ||
                          title.toLowerCase().includes('tip')
                        );

                        if (isTitle && content.length > 0) {
                          const isIngredients = title.toLowerCase().includes('ingredient');
                          const isInstructions = title.toLowerCase().includes('instruction') || 
                                               title.toLowerCase().includes('method') || 
                                               title.toLowerCase().includes('direction');
                          
                          return (
                            <div key={index} className="space-y-4">
                              <h2 className="text-2xl font-bold text-black border-b-2 border-accent pb-2">
                                {title.replace(/[#*]/g, '').trim()}
                              </h2>
                              <div className="space-y-3">
                                {content.map((item, itemIndex) => {
                                  const cleanItem = item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                                  
                                  // Check for ingredient category subtitles
                                  const isCategory = cleanItem.match(/^[A-Z\s]+:?$/) || 
                                                    (cleanItem.includes(':') && cleanItem.length < 30 && !cleanItem.match(/\d/));
                                  
                                  if (isCategory && isIngredients) {
                                    return (
                                      <h3 key={itemIndex} className="font-bold text-black text-lg mt-6 mb-2 first:mt-2 uppercase tracking-wide">
                                        {cleanItem.replace(':', '').replace(/\*\*/g, '')}
                                      </h3>
                                    );
                                  }

                                  return (
                                    <div key={itemIndex} className="flex items-start">
                                      {isInstructions ? (
                                        <span className="bg-accent text-white font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                                          {itemIndex + 1}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 mr-3 mt-2 text-sm flex-shrink-0">•</span>
                                      )}
                                      <span 
                                        className="text-gray-800 leading-relaxed text-xs"
                                        dangerouslySetInnerHTML={{
                                          __html: isIngredients ? highlightSubstitutions(cleanItem) : cleanItem
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        
                        // Handle tips/notes sections
                        if (content.length > 0) {
                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-6">
                              <h3 className="font-bold text-black text-lg mb-3">
                                {title.replace(/[#*]/g, '').trim()}
                              </h3>
                              <div className="space-y-2">
                                {lines.slice(1).map((line, lineIndex) => (
                                  <p key={lineIndex} className="text-gray-800 leading-relaxed">
                                    {line.replace(/[#*]/g, '').trim()}
                                  </p>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        return null;
                      }).filter(Boolean)}

                      {/* Recipe Tags */}
                      <div className="text-center pt-6 border-t border-gray-200">
                        <div className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Gluten-free</span>
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">Minimal processing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Substitutions and Tips */}
                {(convertedRecipe.substitutions_made?.length > 0 || convertedRecipe.cooking_tips?.length > 0 || convertedRecipe.vegan_weapons_used?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Substitutions */}
                    {convertedRecipe.substitutions_made?.length > 0 && (
                      <Card className="border border-gray-200">
                        <div className="p-4">
                          <h3 className="font-bold text-black mb-3 lowercase flex items-center">
                            <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                            ingredient swaps made
                          </h3>
                          <ul className="space-y-2">
                            {convertedRecipe.substitutions_made.map((sub, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="text-accent mr-2 mt-1">→</span>
                                {sub}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    )}

                    {/* Cooking Tips */}
                    {convertedRecipe.cooking_tips?.length > 0 && (
                      <Card className="border border-gray-200">
                        <div className="p-4">
                          <h3 className="font-bold text-black mb-3 lowercase flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2 text-accent" />
                            cooking tips
                          </h3>
                          <ul className="space-y-2">
                            {convertedRecipe.cooking_tips.map((tip, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* Vegan Weapons Used */}
                {convertedRecipe.vegan_weapons_used && convertedRecipe.vegan_weapons_used.length > 0 && (
                  <Card className="border-2 border-primary bg-primary/5">
                    <div className="p-6">
                      <h3 className="font-bold text-black mb-4 lowercase flex items-center">
                        <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-black">VW</span>
                        </span>
                        vegan weapons used in this recipe
                      </h3>
                      <div className="grid gap-4">
                        {convertedRecipe.vegan_weapons_used.map((weapon, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-black">{weapon.name}</h4>
                              <span className="text-xs bg-primary/20 text-black px-2 py-1 rounded font-medium">
                                {weapon.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">
                              {weapon.description}
                            </p>
                            <Button
                              onClick={() => navigate('/vegan-weapons')} 
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary hover:text-black text-xs"
                            >
                              View in Vegan Weapons →
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-gray-700">
                          💡 <strong>Tip:</strong> Visit the{' '}
                          <Button 
                            variant="link" 
                            onClick={() => navigate('/vegan-weapons')}
                            className="p-0 h-auto text-primary hover:text-black underline font-bold"
                          >
                            Vegan Weapons library
                          </Button>
                          {' '}to see all available sauces, dressings, and dips for your plant-based cooking!
                        </p>
                      </div>
                    </div>
                  </Card>
                )}


              </div>
            ) : (
              <Card className="border-2 border-dashed border-gray-300">
                <div className="p-12 text-center text-gray-400">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="lowercase font-medium mb-2">ready to convert your recipe?</p>
                  <p className="text-sm">Paste any recipe on the left and click the convert button!</p>
                  <div className="mt-4 text-xs text-gray-500">
                    <p>✨ Get ingredient swaps</p>
                    <p>🥄 Suggested Vegan Weapon</p>
                    <p>🌱 Minimal processing badge</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Ingredient Image Section */}
        <div className="mt-16 relative h-64 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
          <img 
            src="https://static.databutton.com/public/36bea00c-96e6-4d13-bc05-25dddec64ca0/veganese_10837_1-kopi.jpg" 
            alt="Fresh plant-based ingredients for cooking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/10 z-5"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold lowercase mb-2">whole foods, maximum flavor</h3>
              <p className="text-sm opacity-90">Real ingredients, real nutrition, real results</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-black mb-6 lowercase text-center">conversion tips</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-black">1</span>
              </div>
              <h4 className="font-bold text-black mb-2 lowercase">include everything</h4>
              <p className="text-gray-600">Paste the complete recipe with ingredients, measurements, and instructions for best results</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-white">2</span>
              </div>
              <h4 className="font-bold text-black mb-2 lowercase">be specific</h4>
              <p className="text-gray-600">The more details you provide, the better our AI can create an accurate plant-based version</p>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold text-black">3</span>
              </div>
              <h4 className="font-bold text-black mb-2 lowercase">review & adjust</h4>
              <p className="text-gray-600">Feel free to modify the converted recipe to match your taste preferences and dietary needs</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>

    {/* Camera Modal */}
    {showCamera && (
      <div className="fixed inset-0 z-50 bg-black">
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={handleCameraClose}
        />
      </div>
    )}
  </>
  );
}