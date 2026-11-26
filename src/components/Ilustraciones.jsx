// Ilustraciones decorativas opcionales a los lados de la página.
// Coloca tus imágenes en client/public/img/ con estos nombres.
// Si no existen, simplemente no se muestran.
const ocultar = (e) => {
  e.currentTarget.style.display = "none";
};

export default function Ilustraciones() {
  return (
    <>
      <img className="ilustracion izq" src="/img/estudiantes-izq.png" alt="" onError={ocultar} />
      <img className="ilustracion der" src="/img/estudiantes-der.png" alt="" onError={ocultar} />
    </>
  );
}
