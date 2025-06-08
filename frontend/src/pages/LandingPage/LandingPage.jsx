import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Archivo CSS personalizado

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <header className="hero-section text-center py-5 position-relative">
                <img src="/src/assets/logo.png" alt="HRM System Logo" className="logo position-absolute top-0 end-0 m-4" />
                <h1 className="display-4 fw-bold">HRM System</h1>
                <p className="lead text-muted">
                    La solución integral para la gestión de recursos humanos. Optimiza procesos, mejora la productividad y asegura la eficiencia.
                </p>
                <div className="cta-buttons mt-4">
                    <button
                        className="btn btn-primary btn-lg me-3 shadow"
                        onClick={() => navigate('/login')}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-lg shadow"
                        onClick={() => navigate('/suscripciones')}
                    >
                        Suscribete
                    </button>
                </div>
            </header>
            <section className="benefits-section py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h2 className="h3 fw-bold">Beneficios del Software</h2>
                            <ul className="list-unstyled mt-3">
                                <li>✔ Gestión eficiente de empleados</li>
                                <li>✔ Automatización de procesos administrativos</li>
                                <li>✔ Reportes detallados y análisis</li>
                                <li>✔ Seguridad y accesibilidad</li>
                            </ul>
                        </div>
                        <div className="col-md-6 text-center">
                            <img src="/src/assets/RH1.jpg" alt="Adorno" className="img-fluid rounded shadow-lg" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="contact-section py-5 bg-light">
                <div className="container text-center">
                    <h2 className="h3 fw-bold">Contáctanos</h2>
                    <p className="mt-3">¿Tienes preguntas? Estamos aquí para ayudarte.</p>
                    <div className="contact-links mt-4">
                        <a href="mailto:fernandojose78097809@gmail.com" className="btn btn-outline-primary me-3">
                            <i className="bi bi-envelope"></i> Correo Electrónico
                        </a>
                        <a href="https://wa.me/59176957273" target="_blank" rel="noopener noreferrer" className="btn btn-outline-success">
                            <i className="bi bi-whatsapp"></i> WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;