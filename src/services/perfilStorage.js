// Guarda y recupera el perfil del estudiante en LocalStorage (sin cuentas ni servidor).
const CLAVE = "becalink_perfil";

export const perfilVacio = {
  nivel: "",
  area: "",
  entidad: "",
  municipio: "",
  situacion: "",
};

export function cargarPerfil() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || "null");
    return guardado ? { ...perfilVacio, ...guardado } : { ...perfilVacio };
  } catch {
    return { ...perfilVacio }; // LocalStorage no disponible
  }
}

export function guardarPerfil(perfil) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(perfil));
    return true;
  } catch {
    return false;
  }
}
