const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Generate hashes for your default passwords
const hashes = {
  admin: bcrypt.hashSync('nini', saltRounds),
  ground: bcrypt.hashSync('nana', saltRounds),
};

console.log(hashes);