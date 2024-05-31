const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../data/dbConfig"); // Adjust the path as needed

const JWT_SECRET = process.env.JWT_SECRET || "shh";

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }
  
  try {
    const hash = await bcrypt.hash(password, 8);
    const [id] = await db("users").insert({ username, password: hash });
    const newUser = await db("users").where({ id }).first();
    res.status(201).json(newUser);
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') { // SQLite specific error code for unique constraint
      res.status(400).json({ message: "username taken" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db('users').select('*').where({ username }).first();
    if (user && await bcrypt.compare(password, user.password)) {
      const payload = { userId: user.id };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      res.json({ 
        message: `welcome, ${user.username}`,
        token
      });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    res.status(500).json({ message: "username and password required" });
  }
});

module.exports = router;
