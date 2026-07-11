import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from 'app';
import type { VeganWeaponsResponse, VeganWeapon, GetVeganWeaponsParams } from 'types';
import { trackVeganWeapons, trackUserEngagement } from 'utils/analytics';
import Footer from 'components/Footer';

const VeganWeapons = () => {
  const navigate = useNavigate();
  const [weapons, setWeapons] = useState<VeganWeapon[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeapons = async (category?: string) => {
    try {
      setLoading(true);
      console.log('Fetching weapons with category:', category);
      
      const queryParams: GetVeganWeaponsParams = category && category !== 'all' ? { category } : {};
      console.log('Query params:', queryParams);
      
      const response = await apiClient.get_vegan_weapons(queryParams);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data: VeganWeaponsResponse = await response.json();
      console.log('Response data:', data);
      console.log('Number of weapons:', data.weapons?.length || 0);
      console.log('Categories:', data.categories);
      
      setWeapons(data.weapons);
      setCategories(['all', ...data.categories]);
      setError(null);
      
      // Track Vegan Weapons browsing
      if (category && category !== 'all') {
        trackVeganWeapons.browse();
      }
    } catch (err) {
      console.error('Failed to fetch vegan weapons:', err);
      setError('Failed to load Vegan Weapons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeapons();
    trackVeganWeapons.browse();
    trackUserEngagement.pageView('Vegan Weapons');
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchWeapons(category);
  };

  const handleWeaponView = (weapon: VeganWeapon) => {
    trackVeganWeapons.view(weapon.name, weapon.category);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'dressings': 'bg-green-100 text-green-800 border-green-200',
      'sauces': 'bg-orange-100 text-orange-800 border-orange-200',
      'dips': 'bg-blue-100 text-blue-800 border-blue-200',
      'bases': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading your flavor arsenal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchWeapons()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              back to home
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-black text-black leading-tight mb-4 lowercase">
              vegan weapons
            </h1>
            <p className="text-black/80 text-lg max-w-2xl mx-auto mb-2">
              Your secret arsenal of flavor enhancers. These foundational sauces, dressings, and dips transform simple ingredients into extraordinary dishes.
            </p>
            <p className="text-primary font-medium text-sm">
              From the book 'How to Be Vegan in 28 Days' by Laila Madsö
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-6 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4 lowercase">browse by category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className={`lowercase ${
                  selectedCategory === category 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'all weapons' : category}
                {category !== 'all' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({weapons.filter(w => w.category === category).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Weapons Grid */}
        {weapons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No weapons found in this category.</p>
            <Button 
              variant="outline" 
              onClick={() => handleCategoryChange('all')}
            >
              View All Weapons
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weapons.map((weapon) => (
              <Card 
                key={weapon.id} 
                className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleWeaponView(weapon)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-black lowercase leading-tight">
                        {weapon.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 text-xs font-medium border ${getCategoryColor(weapon.category)}`}
                      >
                        {weapon.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {weapon.description && (
                    <CardDescription className="text-gray-600 text-sm leading-relaxed mt-2">
                      {weapon.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {weapon.prep_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {weapon.prep_time_minutes} min
                      </div>
                    )}
                    {weapon.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {weapon.servings}
                      </div>
                    )}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-bold text-black text-sm mb-2 lowercase">ingredients:</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {weapon.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2 mt-0.5">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions Preview */}
                  <div>
                    <h4 className="font-bold text-black text-sm mb-2 lowercase">method:</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {weapon.instructions}
                    </p>
                  </div>

                  {/* Tags */}
                  {weapon.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {weapon.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 border-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Credits */}
        <div className="mt-16 pt-8 border-t border-gray-200/50 text-center">
          <p className="text-xs text-gray-500">
            Vegan Weapons curated by <span className="font-medium text-primary">Laila Madsø</span> • 
            Based on "How to Be Vegan in 28 Days"
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Transform your cooking with these foundational recipes
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VeganWeapons;