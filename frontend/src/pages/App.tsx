import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { trackUserEngagement } from "utils/analytics";
import Footer from "components/Footer";

export default function App() {
  const navigate = useNavigate();

  // Track page view on component mount
  React.useEffect(() => {
    trackUserEngagement.pageView('Home');
  }, []);

  const handleConvertRecipe = () => {
    navigate("/convert");
  };

  const handleBrowseWeapons = () => {
    navigate("/vegan-weapons");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Bold Orange Block */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left - Orange Block with Main Message */}
        <div className="bg-primary p-12 lg:p-16 flex items-center">
          <div className="max-w-lg">
            <h1 className="text-6xl lg:text-7xl font-black text-black leading-tight mb-8 lowercase">
              transform any recipe into
              <span className="block">plant-based</span>
              <span className="block">magic</span>
            </h1>
            <div className="flex items-center text-black/80 text-sm font-medium">
              <Button 
                onClick={handleConvertRecipe}
                className="bg-black text-white hover:bg-gray-800 font-bold px-6 py-3 text-sm lowercase"
              >
                convert a recipe now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right - White Section with Navigation */}
        <div className="bg-white p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md">
            {/* App Title */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-black lowercase">vegan converter</h2>
              </div>
            </div>

            {/* Main Question */}
            <h3 className="text-4xl lg:text-5xl font-black text-black leading-tight mb-8 lowercase">
              ready to convert your favorite recipes?
            </h3>

            {/* Description */}
            <div className="mb-8">
              <p className="text-primary font-bold text-lg mb-4 lowercase">this is not just another cookbook.</p>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                Our AI follows proven principles from "How to Be Vegan in 28 Days" to transform any recipe into nutritious, whole-food plant-based dishes. No processed alternatives - just real, delicious ingredients.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm">
                Whether you're converting a family favorite or exploring our curated Vegan Weapons library, you'll discover how simple it is to create satisfying plant-based meals that everyone will love.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleConvertRecipe}
                size="lg" 
                className="w-full bg-black text-white hover:bg-gray-800 font-bold text-base py-6 lowercase"
              >
                convert a recipe now
              </Button>
              <Button 
                onClick={handleBrowseWeapons}
                variant="outline" 
                size="lg" 
                className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold text-base py-6 lowercase"
              >
                browse vegan weapons
              </Button>
            </div>

            {/* Small Print */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                Based on cooking principles from the book 'How to Be Vegan in 28 Days' by renowned nutrition experts. Get started with 23 plant-based recipes that will be a perfect fit with all your veggie dishes found in the Vegan Weapons content.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created by <span className="font-medium text-primary">Laila Madsø</span> • Transforming kitchens, one recipe at a time
              </p>
              
              {/* Author Photo */}
              <div className="mt-8 w-full">
                <img 
                  src="https://static.databutton.com/public/36bea00c-96e6-4d13-bc05-25dddec64ca0/_DSC0140_1-kopi.jpg" 
                  alt="Laila Madsø, author of How to Be Vegan in 28 Days"
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Features */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h4 className="font-bold text-black mb-2 lowercase">ai-powered conversion</h4>
              <p className="text-sm text-gray-600">
                Smart substitutions that maintain flavor while boosting nutrition
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-black mb-2 lowercase">whole foods focus</h4>
              <p className="text-sm text-gray-600">
                No processed alternatives - just real, nutritious plant ingredients
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
              <h4 className="font-bold text-black mb-2 lowercase">expert guidance</h4>
              <p className="text-sm text-gray-600">
                Based on proven plant-based cooking principles and nutritional science
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
