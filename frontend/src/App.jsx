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

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route
            path="/dashboard/*"
            element={
              <ThemeProvider>
                <Dashboard />
              </ThemeProvider>
            }
          >
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
          </Route>
          <Route
            path="/login"
            element={
              <ThemeProvider>
                <Login />
              </ThemeProvider>
            }
          />
        </Routes>
      </Router>
  );
}

export default App;
