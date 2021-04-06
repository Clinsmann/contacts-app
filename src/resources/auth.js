require('../utils/passport');//do not remove passport config
import express from 'express';
import passport from 'passport';
import Auth from '../controllers/auth';

const authRouter = express.Router();

// module.exports = app => {
// 	app.route('/auth/login').post(Auth.login);
// 	app.route('/auth/signup').post(Auth.signup);

// 	/*** BONUS POINTS ***/
// 	app.route('/auth/forgotPassword').post(Auth.forgotPassword);
// };


authRouter.post('/login', passport.authenticate('local', { session: false }), Auth.login);
authRouter.post('/signup', Auth.signup);
/*** BONUS POINTS ***/
authRouter.post('/forgotPassword', Auth.forgotPassword);

module.exports = authRouter;
