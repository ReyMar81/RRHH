import { Routes, HashRouter as Router, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Departamentos from './pages/Departamentos/Departamentos';
import Empleados from './pages/Empleados/Empleados';
import Documentos from './pages/Documentos/Documentos';
import Cargos from './pages/Departamentos/Cargos';
import Asistencia from './pages/Asistencia/Asistencia';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="departamentos" element={<Departamentos />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="cargos" element={<Cargos />} />
          <Route path="asistencia" element={<Asistencia/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
