import { useMemo, useState } from "react";
import Ilustraciones from "../components/Ilustraciones.jsx";
import BecaCard from "../components/BecaCard.jsx";
import { IconLupa } from "../components/Icons.jsx";
import convocatorias from "../data/convocatorias.json";
import { cargarPerfil } from "../services/perfilStorage.js";

const TODOS = "Todos";
const NIVELES = ["Licenciatura", "Educación Media Superior", "Técnico Superior Universitario", "Posgrado"];
const ENTIDADES = ["CDMX / Nacional", "Nacional"];
const TIPOS = ["Manutención / Transporte", "Continuidad de estudios", "Excelencia académica"];

export default function Becas() {
  const perfil = useMemo(cargarPerfil, []);
  const [nivel, setNivel] = useState(perfil.nivel || TODOS);
  const [entidad, setEntidad] = useState(TODOS);
  const [tipo, setTipo] = useState(TODOS);
  const [busqueda, setBusqueda] = useState("");

  const resultados = convocatorias.filter((b) => {
    const texto = `${b.nombre} ${b.descripcion}`.toLowerCase();
    return (
      (nivel === TODOS || b.niveles.includes(nivel)) &&
      (entidad === TODOS || b.entidad === entidad) &&
      (tipo === TODOS || b.tipo === tipo) &&
      texto.includes(busqueda.trim().toLowerCase())
    );
  });

  return (
    <div className="fondo-menta">
      <Ilustraciones />
      <div className="buscador">
        <h1>Buscador de Becas Compatibles</h1>
        <p className="nota">(Datos ilustrativos de ejemplo)</p>

        <form className="filtros" role="search" aria-label="Filtrar becas" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="f-nivel">Nivel educativo</label>
            <select id="f-nivel" value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option>{TODOS}</option>
              {NIVELES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-entidad">Entidad federativa</label>
            <select id="f-entidad" value={entidad} onChange={(e) => setEntidad(e.target.value)}>
              <option>{TODOS}</option>
              {ENTIDADES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-tipo">Tipo de apoyo</label>
            <select id="f-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option>{TODOS}</option>
              {TIPOS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="busqueda">
            <label className="sr-only" htmlFor="f-buscar">Buscar becas</label>
            <input
              type="search"
              id="f-buscar"
              placeholder="Buscar becas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <IconLupa />
          </div>
        </form>

        <section className="lista-becas" aria-label="Resultados" aria-live="polite">
          {resultados.length === 0 && <p>No encontramos becas con esos filtros. Prueba cambiando alguno.</p>}
          {resultados.map((b) => (
            <BecaCard key={b.id} beca={b} compatible={!!perfil.nivel && b.niveles.includes(perfil.nivel)} />
          ))}
        </section>
      </div>
    </div>
  );
}
