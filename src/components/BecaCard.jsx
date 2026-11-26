import { IconBrujula, IconCalendario } from "./Icons.jsx";

export default function BecaCard({ beca, compatible }) {
  return (
    <article className="beca">
      {compatible && (
        <span className="etiqueta">
          <IconBrujula strokeWidth={2} />
          Perfil compatible
        </span>
      )}
      <h2>{beca.nombre}</h2>
      <p className="fecha">
        <IconCalendario />
        <span>Fecha límite: {beca.fechaLimite}</span>
      </p>
      <p className="descripcion">{beca.descripcion}</p>
      {/* Pendiente: conectar a la ruta paso a paso (Función 2 con Gemini) */}
      <a className="btn btn-dark btn-block" href="#">
        Ver ruta de postulación
      </a>
      <a className="btn btn-outline btn-block" href={beca.convocatoriaUrl} target="_blank" rel="noreferrer">
        Convocatoria oficial
      </a>
    </article>
  );
}
