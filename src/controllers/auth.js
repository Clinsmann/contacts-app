import JWT from 'jsonwebtoken';
import User from '../entities/user';
import logger from '../utils/logger';
import HttpStatus from 'http-status-codes';

/**
 * Given a json request 
 * {"username": "<...>", "password": "<...>"}
 * Verify the user is valid and return some authentication token
 * which can be used to verify protected resources
 * {"user": <{...}>, "token": "<...>""}
 */
export const login = (req, res) => {
  if (req.isAuthenticated()) res.json(authResponse(req.user));
};

/**
 * Given a json request 
 * {"username": "<...>", "password": "<...>"}
 * Create a new user and return some authentication token 
 * which can be used to verify protected resources
 * {"user": <{...}>, "token": "<...>""}
 */
export const signup = async (req, res) => {
  const { email, password, name, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(HttpStatus.CONFLICT).json({ error: 'Email already exist' });

    const data = { email, password, name, username };
    const user = new User(data);

    var { error } = user.joiValidate(data);
    if (error) return res.status(HttpStatus.BAD_REQUEST).json({ error: error.details });

    await user.save();
    res.status(HttpStatus.CREATED).json(authResponse(user));

  } catch (error) {
    logger.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
};

/**
 * Implement a way to recover user accounts
 */
export const forgotPassword = (req, res) => {
  res.status(HttpStatus.NOT_FOUND).json({ err: "not implemented" })
};

/**
 * SIGN JWT accessToken
 */
const signToken = user => (JWT.sign(
  { iss: process.env.APP_NAME, sub: user._id, user },
  process.env.JWT_SECRET,
  { expiresIn: process.env.EXPIRES_IN }
));

/**
 * auth response
 */
const authResponse = ({ _id, username, name, email }) => {
  const user = { _id, username, name, email };
  return { user, accessToken: signToken(user) }
};

export default { login, signup, forgotPassword }
