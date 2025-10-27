import {Usuario} from '../models';

class UsuarioDAO {
  async crearUsuario(data) {
    try {
      return await Usuario.create(data);
    } catch (error) {
      throw error;
    }
  }

  async listarUsuarios() {
    try {
      return await Usuario.findAll();
    } catch (error) {
      throw error;
    }
  }

  async buscarPorId(id) {
    try {
      return await Usuario.findByPk(id);
    } catch (error) {
      throw error;
    }
  }

  async autenticarUsuario(email, password) {
    try {
      return await Usuario.findOne({ where: { email, password } });
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuario(id, data) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return null;
      return await usuario.update(data);
    } catch (error) {
      throw error;
    }
  }

  async eliminarUsuario(id) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return null;
      await usuario.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new UsuarioDAO();
