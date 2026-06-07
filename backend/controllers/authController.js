import authService from '../services/authService.js';

function validateUserFields({ name, email, password, address }) {
  if (!name || name.length < 20 || name.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  if (!address || address.length > 400) {
    return 'Address must not exceed 400 characters.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return 'Invalid email format.';
  }
  if (password !== undefined) {
    if (password.length < 8 || password.length > 16) {
      return 'Password must be between 8 and 16 characters.';
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUppercase || !hasSpecial) {
      return 'Password must contain at least one uppercase letter and one special character.';
    }
  }
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasUppercase || !hasSpecial) {
    return 'Password must contain at least one uppercase letter and one special character.';
  }
  return null;
}

class AuthController {
  async register(req, res) {
    const { name, email, password, address, role } = req.body;

    const validationError = validateUserFields({ name, email, password, address });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    try {
      const result = await authService.register({ name, email, password, address, role });
      return res.status(201).json({ message: 'User registered successfully', userId: result.userId });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const result = await authService.login({ email, password });
      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: err.message });
    }
  }

  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    try {
      await authService.changePassword(userId, { oldPassword, newPassword });
      return res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new AuthController();
export { validateUserFields, validatePassword };
