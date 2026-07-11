// Google Analytics event tracking utility
// Tracks user behavior and conversions for Vegan Converter app

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

// Track recipe conversion events
export const trackRecipeConversion = {
  start: (method: 'text' | 'photo') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'recipe_conversion_start', {
        event_category: 'Recipe',
        event_label: method,
        input_method: method
      });
    }
  },
  
  complete: (method: 'text' | 'photo', success: boolean = true) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'recipe_conversion_complete', {
        event_category: 'Recipe',
        event_label: method,
        input_method: method,
        success: success
      });
    }
  },
  
  error: (method: 'text' | 'photo', errorType: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'recipe_conversion_error', {
        event_category: 'Recipe',
        event_label: `${method}_error`,
        input_method: method,
        error_type: errorType
      });
    }
  }
};

// Track photo analysis events
export const trackPhotoAnalysis = {
  start: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'photo_analysis_start', {
        event_category: 'Photo',
        event_label: 'camera_capture'
      });
    }
  },
  
  success: (confidence: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'photo_analysis_success', {
        event_category: 'Photo',
        event_label: 'text_extracted',
        confidence_level: confidence
      });
    }
  },
  
  error: (errorType: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'photo_analysis_error', {
        event_category: 'Photo',
        event_label: 'extraction_failed',
        error_type: errorType
      });
    }
  }
};

// Track Vegan Weapons browsing
export const trackVeganWeapons = {
  browse: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'vegan_weapons_browse', {
        event_category: 'VeganWeapons',
        event_label: 'library_access'
      });
    }
  },
  
  view: (weaponName: string, category: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'vegan_weapon_view', {
        event_category: 'VeganWeapons',
        event_label: weaponName,
        weapon_category: category
      });
    }
  }
};

// Track general user engagement
export const trackUserEngagement = {
  cameraOpen: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'camera_opened', {
        event_category: 'Engagement',
        event_label: 'mobile_feature_usage'
      });
    }
  },
  
  recipeCopy: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'recipe_copied', {
        event_category: 'Engagement',
        event_label: 'content_shared'
      });
    }
  },
  
  pageView: (pageName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href
      });
    }
  }
};

// Track conversion goals
export const trackConversionGoals = {
  recipeCompleted: (method: 'text' | 'photo') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'G-CX1PGWDN61',
        event_category: 'Goal',
        event_label: 'recipe_conversion_completed',
        input_method: method,
        value: 1
      });
    }
  }
};
