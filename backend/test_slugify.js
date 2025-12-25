import { slugify } from './utils/slugify.js';

// Test cases
const testCases = [
    'Indian Institute of Technology BHU Varanasi',
    'Aadarsh Library',
    'A+ Library & Books',
    'Test-Business-Name',
    'My Cool Shop 123'
];

console.log('=== SLUG GENERATION TEST ===\n');

testCases.forEach(name => {
    const slug = slugify(name);
    console.log(`Input:  "${name}"`);
    console.log(`Output: "${slug}"`);
    console.log('---');
});

// Test validation regex (what accepts user edits)
console.log('\n=== VALIDATION TEST (User Edits) ===\n');

const slugRegex = /^[a-z0-9-]{3,50}$/;
const userEditedSlugs = [
    'indianinstituteoftechnologybhuvaranasi',  // auto-generated (no hyphens)
    'indian-institute-of-technology',           // user-edited (with hyphens)
    'aadarsh-library',                          // user-edited (with hyphens)
    'aadarshlibrary',                           // auto-generated (no hyphens)
];

userEditedSlugs.forEach(slug => {
    const isValid = slugRegex.test(slug);
    console.log(`Slug: "${slug}"`);
    console.log(`Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    console.log('---');
});
