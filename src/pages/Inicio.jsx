import { Link } from "react-router-dom";
import Ilustraciones from "../components/Ilustraciones.jsx";
import { IconBrujula, IconCheck, IconRobot } from "../components/Icons.jsx";

const tarjetas = [
  {
    Icono: IconBrujula,
    titulo: "Explora Oportunidades",
    texto: "Busca entre miles de becas verificadas personalizadas para ti.",
    boton: "Ver becas",
    to: "/becas",
  },
  {
    Icono: IconCheck,
    titulo: "Guía de Postulación",
    texto: "Organiza tus documentos y fechas clave fácilmente sin complicaciones.",
    boton: "Ver ruta",
    to: "/progreso",
  },
  {
    Icono: IconRobot,
    titulo: "Asistente IA Gemini",
    texto: "Resuelve dudas y recibe consejos de nuestro asistente inteligente.",
    boton: "Chatear con IA",
    to: "/asistente",
  },
];

export default function Inicio() {
  return (
    <>
      <section className="fondo-menta hero">
        <Ilustraciones />
        <h1>Encuentra y entiende tu próxima beca sin complicaciones</h1>
        <p>Plataforma gratuita que traduce convocatorias educativas en México a lenguaje claro y paso a paso</p>
        <Link className="btn btn-primary" to="/perfil">
          Comenzar mi perfil
        </Link>
      </section>

      <section className="cards-inicio" aria-label="Qué puedes hacer en BecaLink">
        {tarjetas.map(({ Icono, titulo, texto, boton, to }) => (
          <article className="card" key={titulo}>
            <Icono className="icono" />
            <h2>{titulo}</h2>
            <p>{texto}</p>
            <Link className="btn btn-outline btn-block" to={to}>
              {boton}
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
