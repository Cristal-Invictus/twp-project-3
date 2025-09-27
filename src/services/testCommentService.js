import commentService from './commentService.js';

async function testCreateComment() {
  const result = await commentService.create({
    post: 9, // Remplace par l'ID d'un post existant
    content: 'Ceci est un commentaire de test.',
    author_name: 'Testeur',
    author_email: 'testeur@example.com'
  });
  console.log(result);
}

testCreateComment();
