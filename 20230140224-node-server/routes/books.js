
const express = require('express');
const router = express.Router();

let books = []; // penyimpanan sementara (array)


router.post('/add', (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: 'Title dan author wajib diisi' });
  }

  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);

  res.status(201).json({ message: 'Buku berhasil ditambahkan', data: newBook });
});


// READ: GET /api/books
router.get('/', (req, res) => {
  res.json({ message: 'Daftar semua buku', data: books });
});

// UPDATE: PUT /api/books/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;

  const book = books.find(b => b.id === parseInt(id));
  if (!book) {
    return res.status(404).json({ message: 'Buku tidak ditemukan' });
  }

  if (!title && !author) {
    return res.status(400).json({ message: 'Minimal isi salah satu field untuk update' });
  }

  if (title) book.title = title;
  if (author) book.author = author;

  res.json({ message: 'Buku berhasil diperbarui', data: book });
});

// DELETE: DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = books.findIndex(b => b.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: 'Buku tidak ditemukan' });
  }

  books.splice(index, 1);
  res.json({ message: 'Buku berhasil dihapus' });
});

router.put('/test', (req, res) => {
  res.json({ message: 'PUT test berhasil' });
});

module.exports = router;
