import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.scss';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellidos.trim()) {
        newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.email) {
        newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      // Aquí irá la llamada a tu API cuando tenga lista
      // const response = await axios.post('API_URL/auth/register', {
      //   nombre: formData.nombre,
      //   apellidos: formData.apellidos,
      //   email: formData.email,
      //   password: formData.password
      // });
        
      // Quitar cuando se complete 
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      // Guardar token (cuando esté el backend real)
      // localStorage.setItem('token', response.data.token);
        
        console.log('Registro exitoso:', formData);
      navigate('/login'); // Redirigir al login o al home
        
    } catch (error) {
        setServerError(error.response?.data?.message || 'Error al registrarse. Intenta nuevamente.');
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
        <div className="auth-container auth-container--wide">
            <div className="auth-card">
            <h1 className="auth-title">REGÍSTRATE</h1>
            <p className="auth-subtitle">
                CREA TU CUENTA DE REGISTRACIÓN
            </p>

            {serverError && (
                <div className="auth-alert auth-alert--error">
                {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre(s)"
                    className={`form-input ${errors.nombre ? 'form-input--error' : ''}`}
                    disabled={isLoading}
                />
                {errors.nombre && (
                    <span className="form-error">{errors.nombre}</span>
                )}
                </div>

                <div className="form-group">
                <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Apellido(s)"
                    className={`form-input ${errors.apellidos ? 'form-input--error' : ''}`}
                    disabled={isLoading}
                />
                {errors.apellidos && (
                    <span className="form-error">{errors.apellidos}</span>
                )}
                </div>

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

                <div className="form-group">
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña"
                    className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                    disabled={isLoading}
                />
                {errors.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword}</span>
                )}
                </div>

                <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading}
                >
                {isLoading ? 'CARGANDO...' : 'CREAR CUENTA'}
                </button>

                <div className="form-divider">
                <span>¿YA TIENES UNA CUENTA? INICIA SESIÓN</span>
                </div>
            </form>
            </div>
        </div>
        </main>

      {/* Footer */}
        <footer className="auth-footer">
        <Link to="/login" className="footer-link">Login</Link>
        </footer>
    </div>
    );
};

export default Register;