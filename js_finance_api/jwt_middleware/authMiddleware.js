import { verifyToken } from '../jwt_services/jwtService.js';

export default (req, res, next) => {
    //get AuthO header
    const authHeader = req.headers["authorization"];
    if (!authHeader) 
        return res.status(401).json({ error: 'No token provided' });

    //extract token
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: 'Malformed token' });

    try {
        //verify token
        const decoded = verifyToken(token);

        //attach decoded user info to req obj
        req.user = decoded;

        //proceed to next middleware/controller
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid token or expired token' });
    }
};