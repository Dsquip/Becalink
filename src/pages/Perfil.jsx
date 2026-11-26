import { useState } from "react";
import Ilustraciones from "../components/Ilustraciones.jsx";
import { IconCandado } from "../components/Icons.jsx";
import { cargarPerfil, guardarPerfil } from "../services/perfilStorage.js";

const NIVELES = ["Educación Media Superior", "Licenciatura", "Técnico Superior Universitario", "Posgrado"];
const AREAS = ["Ingenierías y Tecnología", "Ciencias Sociales", "Salud", "Artes y Humanidades"];
const SITUACIONES = [
  "Estudiante de primera generación",
  "Apoyo económico prioritario",
  "Estudiante de primera generación / Apoyo económico prioritario",
  "Prefiero no decirlo",
];

export default function Perfil() {
  const [perfil, setPerfil] = useState(cargarPerfil);
  const [mensaje, setMensaje] = useState("");

  const cambiar = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
    setMensaje("");
  };

  const enviar = (e) => {
    e.preventDefault();
    setMensaje(
      guardarPerfil(perfil)
        ? "Perfil guardado en tu navegador."
        : "No se pudo guardar el perfil en este navegador."
    );
  };

  return (
    <div className="fondo-menta">
      <Ilustraciones />
      <div className="contenido-centrado">
        <section className="panel" aria-labelledby="titulo-perfil">
          <h1 id="titulo-perfil">Mi Perfil Académico</h1>
          <p className="subtitulo">Completa tus datos educativos para filtrar apoyos compatibles en México</p>

          <form onSubmit={enviar}>
            <div className="campo">
              <label htmlFor="nivel">1. Nivel educativo actual</label>
              <select id="nivel" name="nivel" value={perfil.nivel} onChange={cambiar} required>
                <option value="">Selecciona tu nivel</option>
                {NIVELES.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="area">2. Área de estudio</label>
              <select id="area" name="area" value={perfil.area} onChange={cambiar} required>
                <option value="">Selecciona tu área</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>

            <fieldset className="campo">
              <legend>3. Entidad federativa y municipio</legend>
              <div className="fila-2">
                <div>
                  <label className="sr-only" htmlFor="entidad">Entidad federativa</label>
                  <input
                    type="text"
                    id="entidad"
                    name="entidad"
                    placeholder="Ciudad de México"
                    autoComplete="address-level1"
                    value={perfil.entidad}
                    onChange={cambiar}
                    required
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="municipio">Municipio o alcaldía</label>
                  <input
                    type="text"
                    id="municipio"
                    name="municipio"
                    placeholder="Alcaldía Cuauhtémoc"
                    autoComplete="address-level2"
                    value={perfil.municipio}
                    onChange={cambiar}
                    required
                  />
                </div>
              </div>
            </fieldset>

            <div className="campo">
              <label htmlFor="situacion">4. Situación socioeconómica</label>
              <select id="situacion" name="situacion" value={perfil.situacion} onChange={cambiar} required>
                <option value="">Selecciona tu situación</option>
                {SITUACIONES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="acciones">
              <button type="submit" className="btn btn-primary">
                Guardar perfil en navegador
              </button>
              <p className="nota-privacidad">
                <IconCandado />
                Tus datos se guardan localmente sin crear cuenta
              </p>
            </div>
            <p className="estado-guardado" role="status" aria-live="polite">
              {mensaje}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
