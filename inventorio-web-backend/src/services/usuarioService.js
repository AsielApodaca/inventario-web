const usuarioDAO = require('../daos/usuario.dao.js');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

class UsuarioService {
  ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    EMPLEADO: 'empleado',
    ALMACENISTA: 'almacenista'
  };

  async crearUsuario(data, usuarioCreador) {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre del usuario es requerido');
    }

    if (!data.email || data.email.trim() === '') {
      throw new Error('El email es requerido');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('El formato del email es inválido');
    }

    if (data.rol && !Object.values(this.ROLES).includes(data.rol)) {
      throw new Error(`Rol inválido. Roles permitidos: ${Object.values(this.ROLES).join(', ')}`);
    }

    try {
      const usuarioExistente = await usuarioDAO.autenticarUsuario(data.email, '');
      if (usuarioExistente) {
        throw new Error('Ya existe un usuario con ese email');
      }
    } catch (error) {
    }

    data.nombre = data.nombre.trim();
    data.email = data.email.trim().toLowerCase();
    data.rol = data.rol || this.ROLES.EMPLEADO;

    data.password = await bcrypt.hash(data.password, 10);

    data.creado_por = usuarioCreador;
    data.fecha_creacion = new Date();

    const usuario = await usuarioDAO.crearUsuario(data);

    const { password, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  }

  async listarUsuarios(opciones = {}) {
    let usuarios = await usuarioDAO.listarUsuarios();

    usuarios = usuarios.map(u => {
      const { password, ...usuarioSinPassword } = u.toJSON();
      return usuarioSinPassword;
    });

    if (opciones.rol) {
      usuarios = usuarios.filter(u => u.rol === opciones.rol);
    }

    if (opciones.activos_solamente) {
      usuarios = usuarios.filter(u => u.activo !== false);
    }

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

  async autenticarUsuario(email, password) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const usuarios = await usuarioDAO.listarUsuarios();
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    if (usuario.activo === false) {
      throw new Error('Usuario inactivo. Contacte al administrador');
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
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

  async actualizarUsuario(id, data, usuarioActualizador) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    const usuarioActual = await usuarioDAO.buscarPorId(id);
    if (!usuarioActual) {
      throw new Error('Usuario no encontrado');
    }
    if (data.nombre && data.nombre.trim() === '') {
      throw new Error('El nombre del usuario no puede estar vacío');
    }

    if (data.email && data.email.trim() === '') {
      throw new Error('El email no puede estar vacío');
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('El formato del email es inválido');
      }
    }

    if (data.rol && !Object.values(this.ROLES).includes(data.rol)) {
      throw new Error(`Rol inválido. Roles permitidos: ${Object.values(this.ROLES).join(', ')}`);
    }

    if (data.email && data.email.toLowerCase() !== usuarioActual.email.toLowerCase()) {
      const usuarios = await usuarioDAO.listarUsuarios();
      const emailExiste = usuarios.some(u => 
        u.id !== id && u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (emailExiste) {
        throw new Error('Ya existe un usuario con ese email');
      }
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (data.nombre) data.nombre = data.nombre.trim();
    if (data.email) data.email = data.email.trim().toLowerCase();

    data.actualizado_por = usuarioActualizador;
    data.fecha_actualizacion = new Date();

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

    await usuarioDAO.actualizarUsuario(id, { 
      password: passwordEncriptada,
      fecha_cambio_password: new Date()
    });

    return { mensaje: 'Contraseña actualizada exitosamente' };
  }

  async cambiarEstadoUsuario(id, activo, usuarioActualizador) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    const usuario = await usuarioDAO.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (!activo && usuario.rol === this.ROLES.ADMIN) {
      const usuarios = await usuarioDAO.listarUsuarios();
      const adminsActivos = usuarios.filter(u => 
        u.rol === this.ROLES.ADMIN && u.activo !== false && u.id !== id
      );

      if (adminsActivos.length === 0) {
        throw new Error('No se puede desactivar al único administrador activo');
      }
    }

    const usuarioActualizado = await usuarioDAO.actualizarUsuario(id, { 
      activo,
      actualizado_por: usuarioActualizador,
      fecha_actualizacion: new Date()
    });

    const { password, ...usuarioSinPassword } = usuarioActualizado.toJSON();
    return usuarioSinPassword;
  }

  async eliminarUsuario(id, usuarioEliminador) {
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
      if (!usuario || usuario.activo === false) {
        throw new Error('Token inválido o usuario inactivo');
      }

      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  async verificarPermisos(usuarioId, permisosRequeridos) {
    const usuario = await usuarioDAO.buscarPorId(usuarioId);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const jerarquia = {
      [this.ROLES.ADMIN]: 4,
      [this.ROLES.GERENTE]: 3,
      [this.ROLES.ALMACENISTA]: 2,
      [this.ROLES.EMPLEADO]: 1
    };

    const nivelUsuario = jerarquia[usuario.rol] || 0;
    const nivelRequerido = jerarquia[permisosRequeridos] || 0;

    return nivelUsuario >= nivelRequerido;
  }

  async buscarPorEmail(email) {
    if (!email || email.trim() === '') {
      throw new Error('El email es requerido');
    }

    const usuarios = await usuarioDAO.listarUsuarios();
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const { password, ...usuarioSinPassword } = usuario.toJSON();
    return usuarioSinPassword;
  }

  async obtenerEstadisticasUsuario(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID de usuario inválido');
    }

    const usuario = await this.buscarPorId(id);

    const estadisticas = {
      usuario,
      actividad: {
        movimientos_registrados: 0,
        ordenes_creadas: 0,
        ultima_actividad: null
      }
   
    };

    return estadisticas;
  }

  async registrarSesion(id) {
    return await usuarioDAO.actualizarUsuario(id, {
      ultima_sesion: new Date()
    });
  }

  _contarPorRol(usuarios) {
    const conteo = {};
    Object.values(this.ROLES).forEach(rol => {
      conteo[rol] = usuarios.filter(u => u.rol === rol).length;
    });
    return conteo;
  }
}

module.exports = new UsuarioService();