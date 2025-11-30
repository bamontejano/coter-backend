// middleware/roleMiddleware.js
const authorize = (roles = []) => {
    // Si 'roles' es una cadena, conviértela en un array (ej: authorize('THERAPIST'))
    if (typeof roles === 'string') {
        roles = [roles];
    }
    
    return (req, res, next) => {
        // req.userRole viene del middleware 'protect'
        if (!roles.includes(req.userRole)) {
            // El usuario no tiene el rol necesario
            return res.status(403).json({ message: 'Acceso denegado: Rol no autorizado.' });
        }
        next(); // Permite el acceso
    };
};

module.exports = { authorize };