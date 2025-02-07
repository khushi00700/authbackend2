import jwt from 'jsonwebtoken';

//use userID to generate token

const generateToken = (id) => {
    //return jwt token back to client
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export default generateToken;