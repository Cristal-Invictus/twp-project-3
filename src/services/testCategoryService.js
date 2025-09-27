import categoryService from './categoryService.js';

async function Cristal() {
    const result = await categoryService.create(
        { 
            name: 'Paris sportif', 
            slug: 'paris-sportif', 
            description: 'Categorie de test' 
        });
    console.log(result);
}
Cristal();