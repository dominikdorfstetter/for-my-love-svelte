// src/i18n.js
import { init, getLocaleFromNavigator, addMessages } from 'svelte-i18n';

import en from './lang/en.json';
import de from './lang/de.json';
import es from './lang/es.json';

// @ts-ignore
addMessages('en', en);
// @ts-ignore
addMessages('de', de);
// @ts-ignore
addMessages('es', es);
// starts loading 'en-US' and 'en'

init({
    fallbackLocale: 'de',
    initialLocale: getLocaleFromNavigator(),
});