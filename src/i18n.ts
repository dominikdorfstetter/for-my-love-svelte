// src/i18n.ts
import { init, getLocaleFromNavigator, addMessages } from 'svelte-i18n';

// Import locale files
import en from './lang/en.json';
import de from './lang/de.json';
import es from './lang/es.json';

// Define our own dictionary type
type LocaleDictionary = {
  [key: string]: string | LocaleDictionary | null;
};

// Convert to compatible format with type assertion
const processLocale = (locale: any): Record<string, any> => {
  // Create a flattened version of the locale that conforms to requirements
  const processedLocale: Record<string, any> = {};
  
  // Process top-level strings directly
  for (const key in locale) {
    if (typeof locale[key] === 'string') {
      processedLocale[key] = locale[key];
    } else if (typeof locale[key] === 'object' && !Array.isArray(locale[key])) {
      // Handle nested objects (like 'shortcode')
      processedLocale[key] = locale[key];
    } else if (Array.isArray(locale[key])) {
      // For arrays, create an object with keys that match the array indices
      processedLocale[key] = {};
      locale[key].forEach((item: any, index: number) => {
        if (typeof item === 'object') {
          // For objects in arrays (like wishes and greetings entries)
          // Create an entry with proper formatting
          const itemKey = `${index}`;
          processedLocale[key][itemKey] = {};
          
          // Add each property of the item to the dictionary
          for (const itemProp in item) {
            processedLocale[key][itemKey][itemProp] = item[itemProp];
          }
        } else {
          // For primitive values in arrays
          processedLocale[key][`${index}`] = item;
        }
      });
    }
  }
  
  return processedLocale;
};

// Process and add messages for each locale
addMessages('en', processLocale(en));
addMessages('de', processLocale(de));
addMessages('es', processLocale(es));

// Initialize with fallback locale and get browser locale
init({
    fallbackLocale: 'en',  // Changed fallback from 'de' to 'en'
    initialLocale: 'de',   // Set initial locale to 'de' directly
});