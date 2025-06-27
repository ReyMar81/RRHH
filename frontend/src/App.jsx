import { Routes, HashRouter as Router, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Departamentos from './pages/Departamentos/Departamentos';
import Empleados from './pages/Empleados/Empleados';
import Documentos from './pages/Documentos/Documentos';
import Cargos from './pages/Departamentos/Cargos';
import Asistencia from './pages/Asistencia/Asistencia';
import Contratos from './pages/Contratos/Contratos';
import Categorias from './pages/Documentos/Categorias';
import Tipos from './pages/Documentos/Tipos';
import CargosDepartamentos from './pages/Departamentos/CargosDepartamentos';
import Perfil from './pages/Perfil/Perfil';
import { ThemeProvider } from './themes/ThemeContext';
import LandingPage from './pages/LandingPage/LandingPage';
import Suscripciones from './pages/Suscripciones/Suscripciones';
import Registro from './pages/Suscripciones/Registro';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import LoginAdmin from './pages/Login/LoginAdmin';
import Empresas from './pages/GestionAdmin/Empresas';
import Bitacora from './pages/GestionAdmin/Bitacora';
import BitacoraEmpresa from './pages/GestionAdmin/BitacoraEmpresa';
import Reglas from './pages/Nomina/Reglas';
import Estructura from './pages/Nomina/Estructura';
import Nomina from './pages/Nomina/Nomina';
import Aprobadores from './pages/HorasExtra/Aprobadores';
import HorasExtraPendientes from './pages/HorasExtra/HorasExtraPendientes';
import HistorialHorasExtra from './pages/HorasExtra/HistorialHorasExtra';
import Evaluaciones from './pages/Evaluaciones/Evaluaciones';
import Criterios from './pages/Evaluaciones/Criterios';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/suscripciones/*" element={<Suscripciones />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admindashboard" element={<AdminDashboard />}>
          <Route path="empresas" element={<Empresas />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="logs" element={<BitacoraEmpresa />} />
        </Route>

        <Route path="/dashboard" element={<ThemeProvider><Dashboard /></ThemeProvider>}>
          <Route path="departamentos" element={<Departamentos />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="cargos" element={<Cargos />} />
          <Route path="asistencia" element={<Asistencia />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="tipos" element={<Tipos />} />
          <Route path="cargos_departamentos" element={<CargosDepartamentos />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="reglas" element={<Reglas />} />
          <Route path="estructura" element={<Estructura />} />
          <Route path="nomina" element={<Nomina />} />
          <Route path="aprobadores" element={<Aprobadores />} />
          <Route path="horas_extra_pendientes" element={<HorasExtraPendientes />} />
          <Route path="historial_horas_extra" element={<HistorialHorasExtra />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
          <Route path="criterios" element={<Criterios />} />

        </Route>
        <Route path="/login" element={<ThemeProvider><Login /> </ThemeProvider>}/>
        <Route path="/loginadmin" element={<ThemeProvider><LoginAdmin /> </ThemeProvider>}/>

      </Routes>
    </Router>
  );
}

export default App;
