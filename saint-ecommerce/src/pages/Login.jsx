import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.scss';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    email: '',
    password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
    };

    const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
        newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      // Aquí Llamada a api
      // const response = await axios.post('API_URL/auth/login', formData);
        
      // Quitar cuando este el backend
        await new Promise(resolve => setTimeout(resolve, 1000));

      // Guardar token (cuando esté el backend real)
      // localStorage.setItem('token', response.data.token);
        
        console.log('Login exitoso:', formData);
      navigate('/'); // Redirigir al home
    
    } catch (error) {
        setServerError(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
        setIsLoading(false);
    }
    };

    return (
    <div className="auth-page">
      {/* Header */}
        <header className="auth-header">
        <Link to="/" className="auth-logo">Saint</Link>
        </header>

      {/* Main Content */}
        <main className="auth-main">
        <div className="auth-container">
            <div className="auth-card">
            <h1 className="auth-title">INICIAR SESIÓN</h1>
            <p className="auth-subtitle">
                ESCRIBE TU CORREO ELECTRÓNICO Y CONTRASEÑA PARA INGRESAR
            </p>

            {serverError && (
                <div className="auth-alert auth-alert--error">
                {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    disabled={isLoading}
                />
                {errors.email && (
                    <span className="form-error">{errors.email}</span>
                )}
                </div>

                <div className="form-group">
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                    disabled={isLoading}
                />
                {errors.password && (
                    <span className="form-error">{errors.password}</span>
                )}
                </div>

                <div className="form-link">
                <Link to="/recuperar-password" className="link-small">
                    ¿olvidaste tu contraseña?
                </Link>
                </div>

                <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading}
                >
                {isLoading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
                </button>

                <div className="form-divider">
                <span>¿NO TIENES UNA CUENTA? REGISTRATE</span>
                </div>
            </form>
            </div>
        </div>
        </main>

      {/* Footer */}
        <footer className="auth-footer">
        <Link to="/register" className="footer-link">Registro</Link>
        </footer>
    </div>
    );
};

export default Login;