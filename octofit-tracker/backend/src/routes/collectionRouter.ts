import { Router } from 'express';
import mongoose, { type Model } from 'mongoose';

export function createCollectionRouter<T>(model: Model<T>) {
  const router = Router();

  router.get('/', async (_request, response) => {
    const records = await model.find().sort({ createdAt: -1 });
    response.json(records);
  });

  router.post('/', async (request, response) => {
    const record = await model.create(request.body);
    response.status(201).json(record);
  });

  router.get('/:id', async (request, response) => {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: 'Invalid record id' });
      return;
    }

    const record = await model.findById(id);
    if (!record) {
      response.status(404).json({ error: 'Record not found' });
      return;
    }

    response.json(record);
  });

  router.patch('/:id', async (request, response) => {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: 'Invalid record id' });
      return;
    }

    const record = await model.findByIdAndUpdate(id, request.body, {
      new: true,
      runValidators: true,
    });
    if (!record) {
      response.status(404).json({ error: 'Record not found' });
      return;
    }

    response.json(record);
  });

  router.delete('/:id', async (request, response) => {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      response.status(400).json({ error: 'Invalid record id' });
      return;
    }

    const record = await model.findByIdAndDelete(id);
    if (!record) {
      response.status(404).json({ error: 'Record not found' });
      return;
    }

    response.status(204).end();
  });

  return router;
}