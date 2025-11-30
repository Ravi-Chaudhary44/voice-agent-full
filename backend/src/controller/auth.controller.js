import axios from 'axios';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '../utils/google.config.js';
import {GoogleModel} from '../models/googlelogin.model.js';

const googleLogin = async (req, res) => {
console.log(req.query.code);
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email, name, picture } = userRes.data;
        
        let user = await GoogleModel.findOne({ email });

       if (!user) {
  user = await GoogleModel.create({
    name,
    email,
    image: picture,
  });
} 


        const token = jwt.sign(
            { _id: user._id, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TIMEOUT }
        );

        res.status(200).json({
            message: 'success',
            token,
            user
        });
    }
     catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export default googleLogin;
