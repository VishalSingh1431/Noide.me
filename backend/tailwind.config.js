/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './views/businessTemplate.js',
    ],
    theme: {
        extend: {
            borderRadius: {
                '2rem': '2rem',
                '40px': '40px',
            },
            fontSize: {
                '10px': '10px',
            },
            lineHeight: {
                '1.1': '1.1',
            },
        },
    },
    plugins: [],
}
