const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/users.json');

function readUsers() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function validateUser(body) {
  const errors = [];

  if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim() === '') {
    errors.push('El nombre es obligatorio');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || !emailRegex.test(body.email)) {
    errors.push('El email debe ser válido');
  }

  if (body.edad === undefined || typeof body.edad !== 'number' || body.edad <= 0) {
    errors.push('La edad debe ser un número mayor a 0');
  }

  if (body.activo === undefined || typeof body.activo !== 'boolean') {
    errors.push('El campo activo debe ser booleano');
  }

  return errors;
}

router.get('/', (req, res) => {
  const users = readUsers();
  res.status(200).json(users);
});

router.get('/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.status(200).json(user);
});

router.post('/', (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errores: errors });
  }

  const users = readUsers();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id: newId,
    nombre: req.body.nombre.trim(),
    email: req.body.email,
    edad: req.body.edad,
    activo: req.body.activo
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

router.put('/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errores: errors });
  }

  users[index] = {
    id: users[index].id,
    nombre: req.body.nombre.trim(),
    email: req.body.email,
    edad: req.body.edad,
    activo: req.body.activo
  };

  writeUsers(users);
  res.status(200).json(users[index]);
});

router.delete('/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const deleted = users.splice(index, 1)[0];
  writeUsers(users);

  res.status(200).json({ mensaje: 'Usuario eliminado', usuario: deleted });
});

module.exports = router;
