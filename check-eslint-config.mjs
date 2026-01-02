import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
    const nextVitals = require("eslint-config-next/core-web-vitals");
    console.log('Values loaded successfully');
    console.log('Type:', typeof nextVitals);
    console.log('Is Array:', Array.isArray(nextVitals));
    if (typeof nextVitals === 'object') {
        console.log('Keys:', Object.keys(nextVitals));
    }
} catch (e) {
    console.error('Error loading module:', e.message);
}
