import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Ilustraciones from "../components/Ilustraciones.jsx";
import convocatorias from "../data/convocatorias.json";

const CLAVE_PROGRESO = "becalink_progreso_v1";

// Pasos guía orientativos generales (no sustituyen los requisitos oficiales de cada convocatoria)
const PASOS_ORIENTATIVOS_BASE = [
  {
    id: "req-convocatoria",
    titulo: "Leer la convocatoria oficial completa y verificar fechas",
    detalle: "Confirma en el portal oficial que cumples con el perfil y plazos vigentes.",
    completado: false,
    personalizado: false,
  },
  {
    id: "req-curp",
    titulo: "Descargar CURP actualizada",
    detalle: "Trámite gratuito en línea a través del portal oficial gob.mx/curp.",
    completado: false,
    personalizado: false,
  },
  {
    id: "req-identificacion",
    titulo: "Preparar identificación oficial o credencial escolar vigente",
    detalle: "Revisa que sea legible por ambos lados en formato PDF o imagen.",
    completado: false,
    personalizado: false,
  },
  {
    id: "req-constancia",
    titulo: "Solicitar constancia de estudios o historial académico",
    detalle: "Tramítala en Servicios Escolares o Control Escolar con firma y sello oficial.",
    completado: false,
    personalizado: false,
  },
  {
    id: "req-domicilio",
    titulo: "Reunir comprobante de domicilio reciente",
    detalle: "Recibo de luz, agua o teléfono (verifica la antigüedad máxima permitida).",
    completado: false,
    personalizado: false,
  },
  {
    id: "req-registro",
    titulo: "Completar el registro en la plataforma oficial y guardar acuse",
    detalle: "Descarga o imprime tu comprobante de solicitud al finalizar.",
    completado: false,
    personalizado: false,
  },
];

function leerEstadoStorage() {
  try {
    const raw = localStorage.getItem(CLAVE_PROGRESO);
    if (!raw) return { becaActivaId: "", checklists: {} };
    const parsed = JSON.parse(raw);
    return {
      becaActivaId: parsed.becaActivaId || "",
      checklists: parsed.checklists || {},
    };
  } catch {
    return { becaActivaId: "", checklists: {} };
  }
}

function obtenerMensajeMotivador(porcentaje) {
  if (porcentaje === 0) {
    return "Dar el primer paso es lo más importante. Marca tu primer requisito cuando estés listo.";
  }
  if (porcentaje < 50) {
    return "¡Buen comienzo! Ya tienes tu ruta en marcha, sigue avanzando paso a paso.";
  }
  if (porcentaje < 100) {
    return "¡Ya superaste la mitad del camino! Estás cada vez más cerca de completar tu postulación.";
  }
  return "¡Excelente trabajo! Completaste todos los puntos de tu lista. Verifica tu acuse en el portal oficial.";
}

export default function Progreso() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [estado, setEstado] = useState(leerEstadoStorage);
  const [nuevoRequisito, setNuevoRequisito] = useState("");
  const [avisoGuardado, setAvisoGuardado] = useState("Avance guardado en este navegador");

  // Si llega ?beca=id desde el catálogo, selecciona esa beca automáticamente
  useEffect(() => {
    const becaParam = searchParams.get("beca");
    if (becaParam && convocatorias.some((c) => c.id === becaParam)) {
      seleccionarBeca(becaParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Persiste cualquier cambio en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(estado));
    } catch {
      setAvisoGuardado("No se pudo acceder al almacenamiento local");
    }
  }, [estado]);

  function seleccionarBeca(idBeca) {
    if (!idBeca) return;
    setEstado((prev) => {
      const yaExiste = Array.isArray(prev.checklists[idBeca]);
      return {
        becaActivaId: idBeca,
        checklists: {
          ...prev.checklists,
          [idBeca]: yaExiste
            ? prev.checklists[idBeca]
            : PASOS_ORIENTATIVOS_BASE.map((paso) => ({ ...paso })),
        },
      };
    });
    setAvisoGuardado("Beca seleccionada y guardada localmente");
  }

  function limpiarSeleccion() {
    setEstado((prev) => ({
      ...prev,
      becaActivaId: "",
    }));
    if (searchParams.get("beca")) {
      setSearchParams({});
    }
  }

  const becaActiva = convocatorias.find((c) => c.id === estado.becaActivaId) || null;
  const listaActual = becaActiva ? estado.checklists[becaActiva.id] || [] : [];

  const totalRequisitos = listaActual.length;
  const completados = listaActual.filter((item) => item.completado).length;
  const pendientes = totalRequisitos - completados;
  const porcentaje =
    totalRequisitos > 0 ? Math.round((completados / totalRequisitos) * 100) : 0;

  function alternarRequisito(idReq) {
    if (!becaActiva) return;
    setEstado((prev) => ({
      ...prev,
      checklists: {
        ...prev.checklists,
        [becaActiva.id]: prev.checklists[becaActiva.id].map((item) =>
          item.id === idReq ? { ...item, completado: !item.completado } : item
        ),
      },
    }));
    setAvisoGuardado("Avance actualizado en LocalStorage");
  }

  function agregarRequisitoPersonalizado(e) {
    e.preventDefault();
    const texto = nuevoRequisito.trim();
    if (!texto || !becaActiva) return;

    const nuevoItem = {
      id: `custom-${Date.now()}`,
      titulo: texto,
      detalle: "Requisito agregado por ti según la convocatoria oficial.",
      completado: false,
      personalizado: true,
    };

    setEstado((prev) => ({
      ...prev,
      checklists: {
        ...prev.checklists,
        [becaActiva.id]: [...(prev.checklists[becaActiva.id] || []), nuevoItem],
      },
    }));
    setNuevoRequisito("");
    setAvisoGuardado("Requisito agregado y guardado");
  }

  function eliminarRequisito(idReq) {
    if (!becaActiva) return;
    setEstado((prev) => ({
      ...prev,
      checklists: {
        ...prev.checklists,
        [becaActiva.id]: prev.checklists[becaActiva.id].filter(
          (item) => item.id !== idReq
        ),
      },
    }));
    setAvisoGuardado("Lista actualizada");
  }

  function reiniciarChecklist() {
    if (!becaActiva) return;
    setEstado((prev) => ({
      ...prev,
      checklists: {
        ...prev.checklists,
        [becaActiva.id]: PASOS_ORIENTATIVOS_BASE.map((paso) => ({ ...paso })),
      },
    }));
    setAvisoGuardado("Lista restablecida a los pasos guía");
  }

  return (
    <section className="fondo-menta progreso-seccion" aria-labelledby="titulo-progreso">
      <Ilustraciones />
      <div className="progreso-contenedor">
        <header className="progreso-encabezado">
          <h1 id="titulo-progreso">Mi Progreso y Ruta de Postulación</h1>
          <p>
            Organiza tus documentos paso a paso y guarda tu avance sin crear cuentas
          </p>
        </header>

        <div className="progreso-panel">
          {!becaActiva ? (
            /* ---------- Estado inicial: aún no selecciona una beca ---------- */
            <div className="progreso-vacio">
              <div className="progreso-vacio-icono" aria-hidden="true">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h2>Aún no has seleccionado una beca para preparar</h2>
              <p>
                Elige una convocatoria de ejemplo del catálogo para activar tu lista de
                verificación interactiva y dar seguimiento a tus documentos.
              </p>

              <div className="progreso-selector-rapido">
                <label htmlFor="select-beca-inicial">
                  Selecciona una beca del catálogo:
                </label>
                <select
                  id="select-beca-inicial"
                  value=""
                  onChange={(e) => seleccionarBeca(e.target.value)}
                >
                  <option value="" disabled>
                    -- Elige una opción para comenzar --
                  </option>
                  {convocatorias.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="progreso-vacio-acciones">
                <Link to="/becas" className="btn btn-primary">
                  Ir al buscador de becas
                </Link>
                <Link to="/asistente" className="btn btn-outline">
                  Pedir ayuda al Asistente IA
                </Link>
              </div>
            </div>
          ) : (
            /* ---------- Vista activa con checklist y progreso ---------- */
            <div>
              <div className="progreso-beca-top">
                <div className="progreso-beca-info">
                  <span className="etiqueta">Ruta de postulación activa</span>
                  <h2>{becaActiva.nombre}</h2>
                  <p className="progreso-fecha">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Fecha límite: {becaActiva.fechaLimite}</span>
                  </p>
                </div>

                <div className="progreso-cambiar-box">
                  <label htmlFor="cambiar-beca-activa">Cambiar de beca:</label>
                  <select
                    id="cambiar-beca-activa"
                    value={becaActiva.id}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        limpiarSeleccion();
                      } else {
                        seleccionarBeca(e.target.value);
                      }
                    }}
                  >
                    {convocatorias.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    ))}
                    <option value="">-- Ver pantalla de selección --</option>
                  </select>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="progreso-resumen-box">
                <div className="progreso-barra-header">
                  <span className="progreso-porcentaje-titulo">
                    Avance de tu preparación
                  </span>
                  <span className="progreso-porcentaje-numero">{porcentaje}%</span>
                </div>

                <div
                  className="progreso-barra-track"
                  role="progressbar"
                  aria-valuenow={porcentaje}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Porcentaje de requisitos completados"
                >
                  <div
                    className="progreso-barra-fill"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>

                <div className="progreso-indicadores">
                  <span className="progreso-pill completados">
                    ✓ Completados: {completados} de {totalRequisitos}
                  </span>
                  <span className="progreso-pill pendientes">
                    ○ Pendientes: {pendientes}
                  </span>
                </div>

                <p className="progreso-mensaje-motivador" role="status">
                  {obtenerMensajeMotivador(porcentaje)}
                </p>
              </div>

              {/* Checklist interactivo */}
              <h3 className="progreso-checklist-titulo">
                Lista de documentos y pasos guía
              </h3>
              <p className="progreso-checklist-nota">
                Esta lista es una guía orientativa. Confirma siempre los documentos exactos en la convocatoria oficial y añade los que necesites.
              </p>

              <ul className="progreso-lista">
                {listaActual.map((item) => (
                  <li
                    key={item.id}
                    className={`progreso-item ${item.completado ? "completado" : ""}`}
                  >
                    <label className="progreso-item-label">
                      <input
                        type="checkbox"
                        className="progreso-checkbox"
                        checked={item.completado}
                        onChange={() => alternarRequisito(item.id)}
                      />
                      <span className="progreso-item-texto">
                        <strong>{item.titulo}</strong>
                        <span>{item.detalle}</span>
                      </span>
                    </label>

                    {item.personalizado && (
                      <button
                        type="button"
                        className="progreso-eliminar-btn"
                        onClick={() => eliminarRequisito(item.id)}
                        aria-label={`Eliminar requisito ${item.titulo}`}
                      >
                        Quitar
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Agregar requisito específico de la convocatoria */}
              <form
                className="progreso-agregar-form"
                onSubmit={agregarRequisitoPersonalizado}
              >
                <label htmlFor="nuevo-requisito-input" className="sr-only">
                  Agregar otro documento o requisito de tu convocatoria
                </label>
                <input
                  id="nuevo-requisito-input"
                  type="text"
                  value={nuevoRequisito}
                  onChange={(e) => setNuevoRequisito(e.target.value)}
                  placeholder="Agregar otro documento que pida tu convocatoria..."
                />
                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={!nuevoRequisito.trim()}
                >
                  + Agregar requisito
                </button>
              </form>

              {/* Pie de acciones */}
              <div className="progreso-footer-acciones">
                <span className="progreso-guardado-badge" role="status">
                  🔒 {avisoGuardado}
                </span>

                <div className="progreso-links-pie">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={reiniciarChecklist}
                  >
                    Reiniciar lista
                  </button>
                  <Link to="/becas" className="btn btn-primary">
                    ← Volver al catálogo de becas
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}