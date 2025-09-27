import postService from './postService.js';

async function testCreatePost() {
  const result = await postService.create({
    title: 'Post de test',
    content: 'Ceci est le contenu du post.',
    excerpt: 'Résumé du post',
    categories: [9], // L'ID d'une catégorie existante
    status: 'publish',
    meta: { custom: 'valeur' }
  });
  console.log(result);
}

testCreatePost();
