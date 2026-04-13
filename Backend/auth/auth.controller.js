import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../users/user.model.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.ACCES_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
};
