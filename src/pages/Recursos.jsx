import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Ilustraciones from "../components/Ilustraciones.jsx";
import { cargarPerfil } from "../services/perfilStorage.js";

const TODAS_CATEGORIAS = "Todas";

const RECURSOS_COMUNITARIOS = [
  {
    id: "bibliotecas",
    categoria: "Bibliotecas públicas",
    titulo: "Bibliotecas públicas locales",
    esVerificado: true,
    institucionReferencia: "Red Nacional de Bibliotecas Públicas (Secretaría de Cultura)",
    descripcion:
      "Espacios públicos gratuitos que ofrecen áreas de lectura silenciosa, consulta de materiales y, en muchas sedes, acceso a equipo de cómputo.",
    beneficios: [
      "Acceso gratuito sin necesidad de membresía ni pago.",
      "Ambiente tranquilo para leer convocatorias y redactar tu carta de motivos.",
      "Consulta de orientación bibliográfica y apoyo comunitario.",
    ],
    terminoMaps: "Biblioteca pública",
    enlaceOficial: "https://dgb.cultura.gob.mx/",
    textoEnlaceOficial: "Directorio oficial de Bibliotecas (Cultura)",
  },
  {
    id: "internet-gratuito",
    categoria: "Espacios con internet gratuito",
    titulo: "Puntos de conectividad Wi-Fi gratuito",
    esVerificado: false,
    descripcion:
      "Plazas públicas, parques, centros culturales y puntos comunitarios con acceso abierto a internet para descargar documentos y llenar solicitudes.",
    beneficios: [
      "Ahorro de datos móviles al descargar convocatorias en PDF.",
      "Posibilidad de subir documentos pesados a plataformas de becas.",
      "Ubicados en puntos céntricos de fácil acceso por transporte público.",
    ],
    terminoMaps: "WiFi gratis plaza pública punto de acceso internet",
    enlaceOficial: null,
    textoEnlaceOficial: null,
  },
  {
    id: "centros-comunitarios",
    categoria: "Centros comunitarios",
    titulo: "Centros comunitarios y culturales",
    esVerificado: false,
    descripcion:
      "Espacios vecinales, casas de cultura y centros de desarrollo comunitario que brindan talleres, asesoría ciudadana y espacios de estudio.",
    beneficios: [
      "Acompañamiento cercano dentro de tu propia colonia o municipio.",
      "Talleres de habilidades digitales y apoyo para trámites básicos.",
      "Entorno seguro e inclusivo para estudiantes de primera generación.",
    ],
    terminoMaps: "Centro comunitario casa de cultura",
    enlaceOficial: null,
    textoEnlaceOficial: null,
  },
  {
    id: "orientacion-educativa",
    categoria: "Oficinas de orientación educativa",
    titulo: "Servicios escolares y orientación educativa",
    esVerificado: false,
    descripcion:
      "Áreas de control escolar, tutorías y departamentos de becas dentro de planteles públicos de nivel medio superior y superior.",
    beneficios: [
      "Emisión de constancias de estudios, historiales académicos y sellos oficiales.",
      "Validación de matrícula y promedio ante convocatorias institucionales.",
      "Orientación directa sobre convocatorias internas de tu escuela.",
    ],
    terminoMaps: "Servicios escolares oficina orientación educativa universidad preparatoria",
    enlaceOficial: null,
    textoEnlaceOficial: null,
  },
  {
    id: "acceso-computadoras",
    categoria: "Espacios de acceso a computadoras",
    titulo: "Módulos públicos de cómputo y digitalización",
    esVerificado: false,
    descripcion:
      "Aulas digitales, centros de acceso a tecnologías y espacios públicos donde puedes usar una computadora para escanear y organizar tus archivos.",
    beneficios: [
      "Facilita llenar formularios extensos que son difíciles de completar en celular.",
      "Permite revisar formatos PDF, unir documentos y guardar respaldos.",
      "Apoyo básico en el uso de herramientas digitales.",
    ],
    terminoMaps: "Aula digital centro de cómputo público biblioteca",
    enlaceOficial: null,
    textoEnlaceOficial: null,
  },
  {
    id: "apoyo-estudiantil",
    categoria: "Instituciones de apoyo estudiantil",
    titulo: "Coordinación Nacional de Becas para el Bienestar",
    esVerificado: true,
    institucionReferencia: "Gobierno de México (gob.mx/becasbenitojuarez)",
    descripcion:
      "Institución pública federal encargada de coordinar programas de becas educativas para estudiantes de escuelas públicas en México.",
    beneficios: [
      "Consulta de convocatorias federales oficiales y reglas de operación.",
      "Información verificada sobre sedes de atención y canales oficiales.",
      "Trámites gratuitos sin intermediarios.",
    ],
    terminoMaps: "Oficina Coordinación Nacional de Becas para el Bienestar",
    enlaceOficial: "https://www.gob.mx/becasbenitojuarez",
    textoEnlaceOficial: "Portal oficial gob.mx/becasbenitojuarez",
  },
];

function construirUrlGoogleMaps(terminoBase, municipio, entidad) {
  const partesUbicacion = [municipio.trim(), entidad.trim(), "México"].filter(Boolean);
  const consultaCompleta = `${terminoBase} en ${partesUbicacion.join(", ")}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    consultaCompleta
  )}`;
}

function IconoCategoria({ id }) {
  switch (id) {
    case "bibliotecas":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "internet-gratuito":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      );
    case "centros-comunitarios":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "orientacion-educativa":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "acceso-computadoras":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );
  }
}

export default function Recursos() {
  const perfilGuardado = useMemo(cargarPerfil, []);

  // Estado local editable para explorar sin modificar automáticamente el perfil en LocalStorage
  const [entidadBusqueda, setEntidadBusqueda] = useState(
    perfilGuardado.entidad || ""
  );
  const [municipioBusqueda, setMunicipioBusqueda] = useState(
    perfilGuardado.municipio || ""
  );
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(TODAS_CATEGORIAS);

  const tieneUbicacionEnPerfil = Boolean(
    perfilGuardado.entidad || perfilGuardado.municipio
  );

  const difiereDePerfil =
    entidadBusqueda !== (perfilGuardado.entidad || "") ||
    municipioBusqueda !== (perfilGuardado.municipio || "");

  function restaurarUbicacionPerfil() {
    setEntidadBusqueda(perfilGuardado.entidad || "");
    setMunicipioBusqueda(perfilGuardado.municipio || "");
  }

  const recursosFiltrados = RECURSOS_COMUNITARIOS.filter(
    (recurso) =>
      categoriaSeleccionada === TODAS_CATEGORIAS ||
      recurso.categoria === categoriaSeleccionada
  );

  const etiquetaUbicacionActual = [
    municipioBusqueda.trim(),
    entidadBusqueda.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      className="fondo-menta recursos-seccion"
      aria-labelledby="titulo-recursos"
    >
      <Ilustraciones />
      <div className="recursos-contenedor">
        <header className="recursos-encabezado">
          <h1 id="titulo-recursos">Recursos comunitarios</h1>
          <p>
            Encuentra espacios públicos gratuitos, puntos con acceso a internet y
            servicios de apoyo cercanos para consultar convocatorias y realizar tus
            trámites educativos.
          </p>
        </header>

        {/* Alternativa cuando el estudiante aún no registra ubicación en su perfil */}
        {!tieneUbicacionEnPerfil && (
          <div className="recursos-aviso-perfil" role="region" aria-label="Configurar ubicación en perfil">
            <div className="recursos-aviso-texto">
              <strong>Aún no has guardado tu ubicación en Mi perfil</strong>
              <span>
                Puedes escribir tu entidad y municipio abajo para buscar espacios
                cercanos, o guardarlos de forma permanente en tu perfil.
              </span>
            </div>
            <Link to="/perfil" className="btn btn-primary">
              Completar Mi perfil
            </Link>
          </div>
        )}

        {/* Controles de ubicación temporal y filtro */}
        <div className="recursos-controles">
          <div className="recursos-ubicacion-grid">
            <div className="recursos-campo">
              <label htmlFor="rec-entidad">Entidad federativa de búsqueda</label>
              <input
                id="rec-entidad"
                type="text"
                value={entidadBusqueda}
                onChange={(e) => setEntidadBusqueda(e.target.value)}
                placeholder="Ej. Ciudad de México, Estado de México..."
              />
            </div>

            <div className="recursos-campo">
              <label htmlFor="rec-municipio">Municipio o alcaldía</label>
              <input
                id="rec-municipio"
                type="text"
                value={municipioBusqueda}
                onChange={(e) => setMunicipioBusqueda(e.target.value)}
                placeholder="Ej. Cuauhtémoc, Ecatepec..."
              />
            </div>

            <div className="recursos-campo">
              <label htmlFor="rec-categoria-select">Filtrar por categoría</label>
              <select
                id="rec-categoria-select"
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              >
                <option value={TODAS_CATEGORIAS}>Todas las categorías (6)</option>
                {RECURSOS_COMUNITARIOS.map((r) => (
                  <option key={r.id} value={r.categoria}>
                    {r.categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="recursos-nota-ubicacion">
            <span>
              {etiquetaUbicacionActual
                ? `Mostrando búsquedas sugeridas para: ${etiquetaUbicacionActual} (no modifica tu perfil guardado).`
                : "Escribe una entidad o municipio arriba para personalizar las búsquedas en Google Maps."}
            </span>

            {tieneUbicacionEnPerfil && difiereDePerfil && (
              <button
                type="button"
                className="recursos-restaurar-btn"
                onClick={restaurarUbicacionPerfil}
              >
                Restaurar ubicación de mi perfil
              </button>
            )}
          </div>
        </div>

        {/* Filtros rápidos por categoría */}
        <div
          className="recursos-chips"
          role="group"
          aria-label="Filtros rápidos por tipo de recurso"
        >
          <button
            type="button"
            className="recursos-chip"
            aria-pressed={categoriaSeleccionada === TODAS_CATEGORIAS}
            onClick={() => setCategoriaSeleccionada(TODAS_CATEGORIAS)}
          >
            Todas
          </button>
          {RECURSOS_COMUNITARIOS.map((recurso) => (
            <button
              key={recurso.id}
              type="button"
              className="recursos-chip"
              aria-pressed={categoriaSeleccionada === recurso.categoria}
              onClick={() => setCategoriaSeleccionada(recurso.categoria)}
            >
              {recurso.categoria}
            </button>
          ))}
        </div>

        {/* Tarjetas de recursos */}
        <div className="recursos-grid" aria-live="polite">
          {recursosFiltrados.map((recurso) => {
            const urlMaps = construirUrlGoogleMaps(
              recurso.terminoMaps,
              municipioBusqueda,
              entidadBusqueda
            );

            return (
              <article key={recurso.id} className="recursos-card">
                <div className="recursos-card-top">
                  <div className="recursos-card-icono">
                    <IconoCategoria id={recurso.id} />
                  </div>
                  <span
                    className={`recursos-badge-tipo ${
                      recurso.esVerificado ? "verificado" : ""
                    }`}
                  >
                    {recurso.esVerificado
                      ? "Institución verificada"
                      : "Búsqueda sugerida en mapa"}
                  </span>
                </div>

                <h2>{recurso.titulo}</h2>

                {recurso.institucionReferencia && (
                  <p className="recursos-card-desc">
                    <strong>Referencia:</strong> {recurso.institucionReferencia}
                  </p>
                )}

                <p className="recursos-card-desc">{recurso.descripcion}</p>

                <ul className="recursos-beneficios">
                  {recurso.beneficios.map((beneficio, idx) => (
                    <li key={idx}>{beneficio}</li>
                  ))}
                </ul>

                <div className="recursos-card-acciones">
                  <a
                    href={urlMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-dark btn-block"
                  >
                    Buscar en Google Maps ↗
                  </a>

                  {recurso.enlaceOficial && (
                    <a
                      href={recurso.enlaceOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-block"
                    >
                      {recurso.textoEnlaceOficial} ↗
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Consejos para conectividad limitada + Contribución a ODS 10 y 11 */}
        <div className="recursos-info-grid">
          <aside
            className="recursos-bloque-info"
            aria-labelledby="titulo-consejos-offline"
          >
            <h2 id="titulo-consejos-offline">
              Recomendaciones si tienes internet limitado
            </h2>
            <p>
              Aprovecha al máximo tus visitas a bibliotecas o puntos Wi-Fi gratuitos
              siguiendo estos pasos:
            </p>
            <ul className="recursos-consejos-lista">
              <li>
                <strong>Prepara tus datos antes de salir:</strong> Lleva anotados
                tu CURP, matrícula, promedio y correo electrónico activo.
              </li>
              <li>
                <strong>Descarga las convocatorias en PDF:</strong> Guárdalas en
                tu teléfono para leerlas sin gastar datos móviles.
              </li>
              <li>
                <strong>Digitaliza tus documentos en una sola carpeta:</strong>{" "}
                Escanea o toma fotos claras de tu identificación, comprobante de
                domicilio y constancia escolar antes de iniciar el registro.
              </li>
              <li>
                <strong>Guarda tu avance sin conexión:</strong> Tu perfil y tu
                checklist en <Link to="/progreso">Mi progreso</Link> funcionan
                directamente en el navegador.
              </li>
            </ul>
          </aside>

          <aside
            className="recursos-bloque-info"
            aria-labelledby="titulo-ods-recursos"
          >
            <h2 id="titulo-ods-recursos">
              Compromiso con los ODS 10 y 11
            </h2>
            <p>
              Esta sección vincula la tecnología con la infraestructura pública
              de tu comunidad para reducir brechas de acceso:
            </p>
            <div className="recursos-ods-lista">
              <div className="recursos-ods-item">
                <strong>ODS 10 · Reducción de las desigualdades:</strong> Facilita
                que estudiantes sin computadora propia o internet en casa puedan
                completar trámites educativos en igualdad de condiciones.
              </div>
              <div className="recursos-ods-item">
                <strong>ODS 11 · Ciudades y comunidades sostenibles:</strong>{" "}
                Promueve el aprovechamiento de bibliotecas, centros comunitarios y
                espacios públicos inclusivos para fortalecer el tejido educativo
                local.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}