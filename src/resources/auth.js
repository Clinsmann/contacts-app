import '../utils/passport';
import express from 'express';
import passport from 'passport';
import Auth from '../controllers/auth';

const authRouter = express.Router();

authRouter.post('/login', passport.authenticate('local', { session: false }), Auth.login);
authRouter.post('/signup', Auth.signup);
/*** BONUS POINTS ***/
authRouter.post('/forgotPassword', Auth.forgotPassword);

export default authRouter;
