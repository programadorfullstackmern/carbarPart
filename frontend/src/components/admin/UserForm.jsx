import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAdmin } from '../../context/AdminContext';

const UserForm = ({ user, onClose }) => {
  const { createUser, updateUser } = useAdmin();
  // Estado inicial incluyendo rol para nuevos usuarios
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Cliente',
    telefono: '',
    direccion: '',
    activo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      // Para edición: mantener rol pero no mostrarlo como editable
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '',
        rol: user.rol || 'Cliente', // Mantenemos el rol para mostrar
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        activo: user.activo !== undefined ? user.activo : true
      });
    } else {
      // Para nuevo usuario: restablecer valores predeterminados
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'Cliente',
        telefono: '',
        direccion: '',
        activo: true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (user) {
        // Para actualización: eliminar rol de los datos enviados
        const { rol, password, ...updateData } = formData;
        
        // Si hay contraseña, incluirla
        const dataToSend = password 
          ? { ...updateData, password } 
          : updateData;
        
        await updateUser(user._id, dataToSend);
      } else {
        // Para creación: enviar todos los datos incluyendo rol
        await createUser(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Usuario guardado correctamente!</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Nombre completo</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={!!user}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!user}
          placeholder={user ? "Dejar en blanco para no cambiar" : ""}
        />
        {user && (
          <Form.Text className="text-muted">
            Solo completa si deseas cambiar la contraseña
          </Form.Text>
        )}
      </Form.Group>

      {/* CAMPO ROL: SOLO PARA NUEVOS USUARIOS */}
      {!user && (
        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select 
            name="rol" 
            value={formData.rol} 
            onChange={handleChange}
            required
          >
            <option value="admin">Administrador</option>
            <option value="proveedor">Proveedor</option>
            <option value="cliente">Cliente</option>
          </Form.Select>
        </Form.Group>
      )}

      {/* MOSTRAR ROL ACTUAL EN MODO EDICIÓN */}
      {user && (
        <Form.Group className="mb-3">
          <Form.Label>Rol actual</Form.Label>
          <Form.Control
            type="text"
            value={formData.rol}
            readOnly
            plaintext
          />
          <Form.Text className="text-muted">
            El rol no puede modificarse después del registro
          </Form.Text>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check 
          type="switch"
          id="active-switch"
          label="Usuario activo"
          name="activo"
          checked={formData.activo}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner 
                as="span" 
                animation="border" 
                size="sm" 
                role="status"
                className="me-2"
              />
              Guardando...
            </>
          ) : 'Guardar'}
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;