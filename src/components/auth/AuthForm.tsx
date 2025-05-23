import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { login, register } from '../../services/authService';
import { useAuth } from '../../context';
import { useSuccessMessage } from '../../context/SuccessMessageContext';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess?: () => void;
  mode: 'login' | 'register';
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, mode }) => {
  const { login: loginContext } = useAuth();
  const { showSuccess } = useSuccessMessage();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      
      if (mode === 'register') {
        const result = await register({
          username: data.username,
          email: data.email,
          password: data.password
        });

        if (!result.success) {
          setError(result.message || 'Error en el registro');
          return;
        }

        const user = await login(data.username, data.password);
        if (user) {
          loginContext(user);
          showSuccess('Registro exitoso, bienvenido!');
          onSuccess?.();
        } else {
          setError('Error al iniciar sesión después del registro');
        }
      } else {
        const user = await login(data.username, data.password);
        if (user) {
          loginContext(user);
          showSuccess('¡Bienvenido de nuevo!');
          onSuccess?.();
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Ocurrió un error. Por favor intenta de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="username">Nombre de usuario</label>
        <input
          id="username"
          type="text"
          placeholder="Ingresa tu nombre de usuario"
          {...registerField('username', { 
            required: 'El nombre de usuario es requerido',
            minLength: {
              value: 3,
              message: 'El nombre de usuario debe tener al menos 3 caracteres'
            }
          })}
        />
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      {mode === 'register' && (
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            {...registerField('email', { 
              required: 'El correo electrónico es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Correo electrónico inválido'
              }
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <div className="password-input">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            {...registerField('password', { 
              required: 'La contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      {mode === 'register' && (
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <div className="password-input">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirma tu contraseña"
              {...registerField('confirmPassword', { 
                required: 'Por favor confirma tu contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden'
              })}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
        </div>
      )}

      <button type="submit" className="submit-button">
        {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </button>
    </form>
  );
};

export default AuthForm;
