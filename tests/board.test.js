 const postService = {
   update: jest.fn()
 };

 const boards = [
   { id: 1, name: 'CatA', tasks: [{ id: 101, categories: [1] }] },
   { id: 2, name: 'CatB', tasks: [] }
 ];

 async function handleDrop(sourceName, targetName, dropResult) {
   const sourceCategory = boards.find(b => b.name === sourceName);
   const targetCategory = boards.find(b => b.name === targetName);
   let movedTask = null;
   if (dropResult.removedIndex != null) {
     movedTask = sourceCategory.tasks.splice(dropResult.removedIndex, 1)[0];
   }
   if (dropResult.addedIndex != null && movedTask) {
     targetCategory.tasks.splice(dropResult.addedIndex, 0, movedTask);
     await postService.update(movedTask.id, { categories: [targetCategory.id] });
   }
 }

 describe('handleDrop', () => {
   test('déplace la tâche et sauvegarde sur WordPress', async () => {
     postService.update.mockResolvedValue({ success: true });
     await handleDrop('CatA', 'CatB', { removedIndex: 0, addedIndex: 0 });
     expect(boards[0].tasks.length).toBe(0);
     expect(boards[1].tasks.length).toBe(1);
     expect(postService.update).toHaveBeenCalledWith(101, { categories: [2] });
   });
 });

