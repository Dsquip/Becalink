import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Inicio from "./pages/Inicio.jsx";
import Perfil from "./pages/Perfil.jsx";
import Becas from "./pages/Becas.jsx";
import Asistente from "./pages/Asistente.jsx";
import Progreso from "./pages/Progreso.jsx";
import Recursos from "./pages/Recursos.jsx";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/becas" element={<Becas />} />
          <Route path="/asistente" element={<Asistente />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/recursos" element={<Recursos />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>
    </>
  );
}