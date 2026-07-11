import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* App branding */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-black text-lg lowercase">vegan converter</h3>
            <p className="text-gray-600 text-sm mt-1">
              Transform any recipe into plant-based magic
            </p>
          </div>
          
          {/* Created by */}
          <div className="text-center md:text-right">
            <p className="text-gray-800 font-medium text-sm">
              Created by{" "}
              <a
                href="https://ailamedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline transition-colors"
              >
                Laila Madsø for Ailamedia.com
              </a>
            </p>
          </div>
        </div>
        
        {/* Bottom line */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Based on "How to Be Vegan in 28 Days" • Transforming kitchens, one recipe at a time
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
