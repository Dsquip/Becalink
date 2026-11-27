import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { cargarPerfil } from "../services/perfilStorage.js";

// En producción (Vercel) se usa la misma dirección del sitio: /api/asistente
const API_URL = import.meta.env.VITE_API_URL ?? "";

const ACCIONES_RAPIDAS = [
  {
    id: "traducir",
    titulo: "Traducir convocatoria a lenguaje claro",
    promptBase:
      "Por favor traduce el siguiente texto de una convocatoria a lenguaje claro, sencillo y paso a paso, explicando qué piden y qué debo hacer:\n\n[Pega aquí el texto oficial de la convocatoria]",
    guiaInput:
      "Pega debajo el fragmento de la convocatoria oficial que quieras traducir a lenguaje sencillo y presiona Enviar:",
  },
  {
    id: "documentos",
    titulo: "Crear lista de documentos",
    promptBase:
      "Con base en mi perfil académico guardado, ayúdame a generar una lista ordenada de los documentos escolares y personales más comunes que debo ir reuniendo para postularme a una beca en México, explicando dónde se tramita cada uno.",
    guiaInput:
      "Puedes enviar esta solicitud directamente o especificar el nombre de la beca:",
  },
  {
    id: "carta",
    titulo: "Orientación para carta de motivos",
    promptBase:
      "Ayúdame a estructurar paso a paso una carta de motivos clara y honesta para solicitar una beca educativa en México, sin tecnicismos y destacando mi esfuerzo académico.",
    guiaInput:
      "Cuéntame brevemente qué estudias y por qué buscas el apoyo, o envía la consulta base:",
  },
];

const MENSAJE_BIENVENIDA = {
  id: "bienvenida",
  autor: "ia",
  hora: "Ahora",
  texto:
    "¡Hola! Soy el Asistente Virtual de BecaLink impulsado por Gemini.\n\nEstoy aquí para ayudarte a entender convocatorias en lenguaje sencillo, organizar tus documentos escolares en México y estructurar tu carta de motivos.\n\nElige una acción rápida a la izquierda o escribe tu duda abajo.",
};

function obtenerHoraActual() {
  return new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Respuesta de respaldo pedagógica (sin inventar convocatorias ni fechas)
// si el servidor backend aún no está encendido durante las pruebas.
function generarRespuestaRespaldo(textoUsuario, perfil) {
  const consulta = textoUsuario.toLowerCase();
  const nivelTexto = perfil?.nivel
    ? `para tu nivel (${perfil.nivel})`
    : "para tu nivel educativo";

  if (consulta.includes("carta") || consulta.includes("motivos")) {
    return (
      "Aquí tienes una estructura sencilla en 4 pasos para redactar tu carta de motivos:\n\n" +
      "1. Presentación breve: Indica tu nombre completo, escuela o institución, carrera o grado actual y matrícula.\n" +
      "2. Tu trayectoria y compromiso: Explica tu interés por tus estudios, tu constancia académica o actividades comunitarias.\n" +
      "3. Necesidad del apoyo: Describe de forma clara y honesta cómo la beca te ayudará a continuar tus estudios (transporte, materiales, manutención).\n" +
      "4. Cierre y agradecimiento: Reafirma tu compromiso de aprovechar el apoyo y despídete cordialmente.\n\n" +
      "Nota: Revisa siempre la convocatoria oficial por si solicita una extensión máxima de cuartillas o datos específicos."
    );
  }

  if (consulta.includes("documento") || consulta.includes("lista") || consulta.includes("constancia")) {
    return (
      `Lista orientativa de documentos frecuentes ${nivelTexto} en México:\n\n` +
      "• Identificación oficial vigente (INE si eres mayor de edad, o credencial escolar vigente).\n" +
      "• CURP actualizada (descargable gratuitamente en el portal oficial gob.mx/curp).\n" +
      "• Constancia de estudios o historial académico: Se solicita en el área de Servicios Escolares o Control Escolar de tu plantel y debe llevar firma y sello oficial.\n" +
      "• Comprobante de domicilio reciente (recibo de agua, luz o teléfono no mayor a 3 meses).\n" +
      "• Comprobante de ingresos familiares o carta bajo protesta de decir verdad (según lo indique la convocatoria).\n\n" +
      "Importante: Confirma siempre la lista exacta y vigencia en la convocatoria oficial antes de subir tus archivos."
    );
  }

  return (
    "Para ayudarte mejor con esta consulta:\n\n" +
    "• Si tienes el texto de una convocatoria con palabras técnicas o legales, pégalo aquí y te lo explicaré en puntos claros y sencillos.\n" +
    "• Verifica siempre los requisitos, fechas y enlaces directamente en la convocatoria oficial publicada por la institución convocante.\n" +
    "• También puedes guardar tus checklists en la sección «Mi progreso» para llevar el control de tus documentos."
  );
}

export default function Asistente() {
  const [perfil, setPerfil] = useState(null);
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
  const [entrada, setEntrada] = useState("");
  const [accionActiva, setAccionActiva] = useState("");
  const [ayudaContextual, setAyudaContextual] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modoBackend, setModoBackend] = useState("Listo para conectar con Gemini");

  const finChatRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const datosGuardados = cargarPerfil();
    setPerfil(datosGuardados);
  }, []);

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  const tienePerfilCompleto = Boolean(
    perfil && (perfil.nivel || perfil.area || perfil.entidad || perfil.situacion)
  );

  function manejarAccionRapida(accion) {
    setAccionActiva(accion.id);
    setEntrada(accion.promptBase);
    setAyudaContextual(accion.guiaInput);
    textareaRef.current?.focus();
  }

  function limpiarConversacion() {
    setMensajes([MENSAJE_BIENVENIDA]);
    setAccionActiva("");
    setAyudaContextual("");
    setEntrada("");
  }

  async function enviarMensaje(e) {
    e.preventDefault();
    const textoLimpio = entrada.trim();
    if (!textoLimpio || cargando) return;

    const nuevoMensajeUsuario = {
      id: `usr-${Date.now()}`,
      autor: "usuario",
      hora: obtenerHoraActual(),
      texto: textoLimpio,
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setEntrada("");
    setAyudaContextual("");
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/asistente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: textoLimpio,
          accion: accionActiva || "consulta_general",
          perfil: tienePerfilCompleto ? perfil : null,
        }),
      });

      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`);
      }

      const data = await respuesta.json();
      const textoIA = data.respuesta || data.reply;
      if (!textoIA) throw new Error("Respuesta vacía del servidor");

      setModoBackend("Conectado a Gemini API");
      setMensajes((prev) => [
        ...prev,
        {
          id: `ia-${Date.now()}`,
          autor: "ia",
          hora: obtenerHoraActual(),
          texto: textoIA,
        },
      ]);
    } catch {
      // Si el servidor Node.js aún no responde, se usa la guía local estructurada
      setModoBackend("Modo guía local (sin servidor activo)");
      const textoRespaldo = generarRespuestaRespaldo(textoLimpio, perfil);
      setMensajes((prev) => [
        ...prev,
        {
          id: `ia-${Date.now()}`,
          autor: "ia",
          hora: obtenerHoraActual(),
          texto: textoRespaldo,
        },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function manejarTecla(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(e);
    }
  }

  return (
    <section className="fondo-menta asistente-seccion" aria-labelledby="titulo-asistente">
      <div className="asistente-contenedor">
        <header className="asistente-encabezado">
          <h1 id="titulo-asistente">Asistente Virtual BecaLink</h1>
          <p>
            Traduce convocatorias a lenguaje sencillo y recibe orientación paso a paso con IA
          </p>
        </header>

        <div className="asistente-grid">
          {/* Panel lateral izquierdo: Acciones rápidas */}
          <aside className="asistente-sidebar" aria-label="Acciones rápidas con Gemini">
            <h2>Acciones rápidas con Gemini</h2>

            <div className="asistente-acciones-lista">
              {ACCIONES_RAPIDAS.map((accion) => (
                <button
                  key={accion.id}
                  type="button"
                  className="asistente-accion-btn"
                  aria-pressed={accionActiva === accion.id}
                  onClick={() => manejarAccionRapida(accion)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {accion.id === "traducir" && (
                      <>
                        <path d="M5 8l6 6" />
                        <path d="M4 14l6-6 2-3" />
                        <path d="M2 5h12" />
                        <path d="M7 2h1" />
                        <path d="M22 22l-5-10-5 10" />
                        <path d="M14 18h6" />
                      </>
                    )}
                    {accion.id === "documentos" && (
                      <>
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </>
                    )}
                    {accion.id === "carta" && (
                      <>
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </>
                    )}
                  </svg>
                  <span>{accion.titulo}</span>
                </button>
              ))}
            </div>

            <div className="asistente-perfil-badge">
              {tienePerfilCompleto ? (
                <>
                  <strong>Contexto de tu perfil activo:</strong>
                  <span>
                    {[perfil.nivel, perfil.area, perfil.entidad]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </>
              ) : (
                <>
                  <strong>Personaliza tus respuestas:</strong>
                  <span>
                    Completa tu perfil académico en el navegador para recibir orientación más precisa.
                  </span>
                  <Link to="/perfil" className="asistente-perfil-link">
                    Ir a Mi perfil
                  </Link>
                </>
              )}
            </div>
          </aside>

          {/* Panel principal derecho: Chat */}
          <div className="asistente-chat-panel">
            <div className="asistente-chat-top">
              <span className="asistente-estado-api" role="status">
                ✦ {modoBackend}
              </span>
              <button
                type="button"
                className="asistente-limpiar-btn"
                onClick={limpiarConversacion}
              >
                Nueva consulta
              </button>
            </div>

            <div
              className="asistente-mensajes"
              role="log"
              aria-live="polite"
              aria-label="Historial de conversación con el asistente"
            >
              {mensajes.map((msg) => (
                <article
                  key={msg.id}
                  className={`asistente-mensaje ${msg.autor}`}
                >
                  <div className="asistente-meta">
                    <span>
                      {msg.autor === "ia" ? "Asistente BecaLink" : "Tú"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{msg.hora}</span>
                  </div>
                  <div className="asistente-burbuja">{msg.texto}</div>
                </article>
              ))}

              {cargando && (
                <div className="asistente-cargando" role="status">
                  Analizando tu consulta con Gemini...
                </div>
              )}
              <div ref={finChatRef} />
            </div>

            {ayudaContextual && (
              <p className="asistente-meta" id="guia-input-asistente">
                {ayudaContextual}
              </p>
            )}

            <form className="asistente-form" onSubmit={enviarMensaje}>
              <label htmlFor="campo-mensaje-ia" className="sr-only">
                Escribe tu duda o pega el texto de una convocatoria
              </label>
              <textarea
                id="campo-mensaje-ia"
                ref={textareaRef}
                className="asistente-textarea"
                rows="2"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={manejarTecla}
                aria-describedby={ayudaContextual ? "guia-input-asistente" : undefined}
                placeholder="Escribe tu duda aquí o pega el fragmento de una convocatoria..."
              />
              <button
                type="submit"
                className="btn btn-primary asistente-enviar-btn"
                disabled={!entrada.trim() || cargando}
              >
                <span>Enviar</span>
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
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            <p className="asistente-disclaimer">
              Orientación basada en fuentes oficiales y verificadas. No garantiza la obtención de apoyos ni sustituye los procesos oficiales de selección.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}