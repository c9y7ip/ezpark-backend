
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;


function initialize(passport, getUserByEmail, getUserByID) {
    const authenticateUser = async (email, password, done) => {
        getUserByEmail(email).then(async (user) => {
            if(user === null || user === undefined){
                console.log("user not found", email);
                return done(null, false, {message: 'No user found'});
            }
            try {
                if (await bcrypt.compare(password, user.password)){
                    console.log("Auth'd", email, password);
                    return done(null, user);
                } else {
                    console.log("Bad Pass", email, password);
                    return done(null, false, {message: 'Incorrect password or email'});
                }
            } catch (e) {
                return done(e);
            }
        })
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.use(
        new JWTstrategy(
            {
                secretOrKey: 'secretKey',
                jwtFromRequest: req => req.cookies.jwt
            },
            async (token, done) => {
                try {
                    return done(null, token.user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );


    passport.serializeUser((user, done) => { return done(null, user.id)});
    passport.deserializeUser((id, done) => { return done(null, getUserByID(id))});
}

module.exports = initialize;