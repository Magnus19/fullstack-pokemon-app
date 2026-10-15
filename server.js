require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI || '';

const pokemonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  level: { type: Number, required: true, min: 1 },
  nature: { type: String, required: true, trim: true },
});
const Pokemon = mongoose.model('Pokemon', pokemonSchema);

app.post('/api/pokemon', async (req, res) => {
  try {
    const pokemon = await new Pokemon(req.body).save();
    res.status(201).send(pokemon);
  } catch (err) {
    res.status(err.name === 'ValidationError' ? 400 : 500).send({ error: err.message });
  }
});

app.get('/api/pokemon', async (req, res) => {
  try {
    res.send(await Pokemon.find());
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.put('/api/pokemon/:id', async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pokemon) return res.status(404).send({ error: 'Pokémon not found' });
    res.send(pokemon);
  } catch (err) {
    const status = ['CastError', 'ValidationError'].includes(err.name) ? 400 : 500;
    res.status(status).send({ error: err.message });
  }
});

app.delete('/api/pokemon/:id', async (req, res) => {
  try {
    const pokemon = await Pokemon.findByIdAndDelete(req.params.id);

    if (!pokemon) return res.status(404).send({ error: 'Pokémon not found' });
    res.status(204).end();
  } catch (err) {
    const status = err.name === 'CastError' ? 400 : 500;
    res.status(status).send({ error: err.message });
  }
});

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running at http://localhost:5000'));
  })
  .catch((err) => {
    console.error('Mongo error:', err.message);
    process.exit(1);
  });