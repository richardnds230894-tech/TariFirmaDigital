/**
 * Configuración de Tailwind CSS 3.4 (solo desarrollo).
 * Genera tailwind.css a partir de las clases usadas en las páginas y en script.js:
 *   npx tailwindcss@3.4 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
 * La hoja generada se versiona en el repositorio (constitución 1.1.0, Principio I).
 */
module.exports = {
    content: ['./*.html', './script.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            },
            colors: {
                taris: {
                    navy: '#061A3A',
                    dark: '#040F22',
                    card: '#0C1624',
                    gold: '#E5B94C',
                    goldLight: '#F6D377',
                    goldDark: '#B88924',
                    emerald: '#284B32',
                    emeraldHover: '#346141',
                    royal: '#1D3B6E',
                    sky: '#38BDF8'
                }
            },
            boxShadow: {
                gold: '0 10px 30px -10px rgba(229, 185, 76, 0.35)',
                card: '0 15px 35px -5px rgba(0, 0, 0, 0.5)'
            }
        }
    }
};
