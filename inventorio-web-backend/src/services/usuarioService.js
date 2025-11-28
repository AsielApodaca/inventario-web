import usuarioDAO from '../daos/usuario.dao.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UsuarioService {
  ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    EMPLEADO: 'empleado',
    ALMACENISTA: 'almacenista'
  };

  async crearUsuario(data) {
    if (!data.username || data.username.trim() === '') {
      throw new Error('El username es requerido');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (data.rol && !Object.values(this.ROLES).includes(data.rol)) {
      throw new Error(`Rol inválido. Roles permitidos: ${Object.values(this.ROLES).join(', ')}`);
    }

    const usuarios = await usuarioDAO.listarUsuarios();
    const usuarioExistente = usuarios.find(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con ese username');
    }

    data.username = data.username.trim();
    data.rol = data.rol || this.ROLES.EMPLEADO;
    data.password = await bcrypt.hash(data.password, 10);

    const usuario = await usuarioDAO.crearUsuario(data);

    const { password, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  }

  async listarUsuarios() {
    let usuarios = await usuarioDAO.listarUsuarios();

    usuarios = usuarios.map(u => {
      const { password, ...usuarioSinPassword } = u.toJSON();
      return usuarioSinPassword;
    });

    return {
      usuarios,
      resumen: {
        total: usuarios.length,
        por_rol: this._contarPorRol(usuarios)
      }
    };
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    const usuario = await usuarioDAO.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const { password, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  }

  async autenticarUsuario(username, password) {
    if (!username || !password) {
      throw new Error('Username y contraseña son requeridos');
    }

    const usuarios = await usuarioDAO.listarUsuarios();
    const usuario = usuarios.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui',
      { expiresIn: '24h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario.toJSON();

    return {
      usuario: usuarioSinPassword,
      token,
      expires_in: '24h'
    };
  }

  async actualizarUsuario(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    const usuarioActual = await usuarioDAO.buscarPorId(id);
    if (!usuarioActual) {
      throw new Error('Usuario no encontrado');
    }

    if (data.username && data.username.trim() === '') {
      throw new Error('El username no puede estar vacío');
    }

    if (data.rol && !Object.values(this.ROLES).includes(data.rol)) {
      throw new Error(`Rol inválido. Roles permitidos: ${Object.values(this.ROLES).join(', ')}`);
    }

    if (data.username && data.username.toLowerCase() !== usuarioActual.username.toLowerCase()) {
      const usuarios = await usuarioDAO.listarUsuarios();
      const usernameExiste = usuarios.some(u => 
        u.id !== id && u.username.toLowerCase() === data.username.toLowerCase()
      );

      if (usernameExiste) {
        throw new Error('Ya existe un usuario con ese username');
      }
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (data.username) data.username = data.username.trim();

    const usuario = await usuarioDAO.actualizarUsuario(id, data);

    const { password, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  }

  async cambiarPassword(id, passwordActual, passwordNueva) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    if (!passwordActual || !passwordNueva) {
      throw new Error('Las contraseñas actual y nueva son requeridas');
    }

    if (passwordNueva.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const usuario = await usuarioDAO.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordValida) {
      throw new Error('La contraseña actual es incorrecta');
    }

    const passwordEncriptada = await bcrypt.hash(passwordNueva, 10);

    await usuarioDAO.actualizarUsuario(id, { password: passwordEncriptada });

    return { mensaje: 'Contraseña actualizada exitosamente' };
  }

  async eliminarUsuario(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    const usuario = await usuarioDAO.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.rol === this.ROLES.ADMIN) {
      const usuarios = await usuarioDAO.listarUsuarios();
      const admins = usuarios.filter(u => u.rol === this.ROLES.ADMIN && u.id !== id);

      if (admins.length === 0) {
        throw new Error('No se puede eliminar al único administrador');
      }
    }

    return await usuarioDAO.eliminarUsuario(id);
  }

  async verificarToken(token) {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui'
      );

      const usuario = await usuarioDAO.buscarPorId(decoded.id);
      if (!usuario) {
        throw new Error('Token inválido o usuario no existe');
      }

      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  _contarPorRol(usuarios) {
    const conteo = {};
    Object.values(this.ROLES).forEach(rol => {
      conteo[rol] = usuarios.filter(u => u.rol === rol).length;
    });
    return conteo;
  }
}

export default new UsuarioService();