import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/Apirest";
import supabase from "../../services/supabaseClient"; // Importar Supabase
import { Table, Button, Modal, Form } from "react-bootstrap";

const Documentos = () => {
    const [documentos, setDocumentos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [formData, setFormData] = useState({
        titulo: "",
        tipo_id: "",
        categoria_id: "",
        empleado_id: "",
        contrato_id: "",
    });
    const [file, setFile] = useState(null); // Estado para el archivo
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false); // Estado para la carga del archivo

    const navigate = useNavigate();

    // Obtener documentos
    const fetchDocumentos = async () => {
        try {
            const response = await apiClient.get("documentos/");
            setDocumentos(response.data);
        } catch (error) {
            console.error("Error al obtener documentos:", error);
        }
    };

    // Obtener tipos
    const fetchTipos = async () => {
        try {
            const response = await apiClient.get("tipos/");
            setTipos(response.data);
        } catch (error) {
            console.error("Error al obtener tipos:", error);
        }
    };

    // Obtener categorías
    const fetchCategorias = async () => {
        try {
            const response = await apiClient.get("categorias/");
            setCategorias(response.data);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
        }
    };

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get("empleados/");
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Obtener contratos
    const fetchContratos = async () => {
        try {
            const response = await apiClient.get("contratos/");
            setContratos(response.data);
        } catch (error) {
            console.error("Error al obtener contratos:", error);
        }
    };

    // Subir archivo a Supabase
    const uploadFile = async () => {
        if (!file) {
            setMessage("Por favor, selecciona un archivo.");
            return null;
        }

        setUploading(true);
        try {
            // Limpia el nombre del archivo
            const sanitizedFileName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
            const filePath = `documentos/${sanitizedFileName}`;

            const { data, error } = await supabase.storage
                .from("documentos") // Nombre del bucket
                .upload(filePath, file);

            if (error) {
                throw error;
            }

            // Obtener la URL pública del archivo
            const { data: publicUrlData } = supabase.storage
                .from("documentos")
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            setMessage("Error al subir el archivo.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    // Crear o editar documento
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fileUrl = await uploadFile();

        if (!fileUrl && !isEditing) {
            return; // No continuar si no hay archivo en creación
        }

        try {
            const payload = {
                ...formData,
                url: fileUrl || formData.url, // Usar la URL existente si se está editando
            };

            if (isEditing) {
                await apiClient.put(`documentos/${editId}/`, payload);
                setMessage("Documento actualizado con éxito.");
            } else {
                await apiClient.post("documentos/", payload);
                setMessage("Documento creado con éxito.");
            }
            fetchDocumentos();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar el documento:", error);
            setMessage("Error al guardar el documento.");
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Manejar selección de archivo
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            titulo: "",
            tipo_id: "",
            categoria_id: "",
            empleado_id: "",
            contrato_id: "",
        });
        setFile(null);
        setIsEditing(false);
        setEditId(null);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchDocumentos();
        fetchTipos();
        fetchCategorias();
        fetchEmpleados();
        fetchContratos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 ">Gestión de Documentos</h1>
            <div className="d-flex justify-content-between mb-3">
                <div>
                    <Button
                        className="me-2"
                        onClick={() => navigate("/dashboard/categorias")}
                    >
                        Categorías
                    </Button>
                    <Button
                        onClick={() => navigate("/dashboard/tipos")}
                    >
                        Tipos
                    </Button>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    Subir Documento
                </Button>
            </div>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>Categoría</th>
                        <th>Empleado</th>
                        <th>Contrato</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {documentos.map((doc) => (
                        <tr key={doc.id}>
                            <td>
                                {doc.url ? (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        {doc.titulo}
                                    </a>
                                ) : (
                                    doc.titulo
                                )}
                            </td>
                            <td>{tipos.find((tipo) => tipo.id === doc.tipo_id)?.nombre || "—"}</td>
                            <td>{categorias.find((cat) => cat.id === doc.categoria_id)?.nombre || "—"}</td>
                            <td>
                                {empleados.find((emp) => emp.id === doc.empleado_id)?.nombre || "—"}
                            </td>
                            <td>
                                {contratos.find((con) => con.id === doc.contrato_id)?.tipo_contrato || "—"}
                            </td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(doc.id);
                                        setFormData({
                                            titulo: doc.titulo,
                                            tipo_id: doc.tipo_id,
                                            categoria_id: doc.categoria_id,
                                            empleado_id: doc.empleado_id,
                                            contrato_id: doc.contrato_id,
                                            url: doc.url, // Guardar la URL existente
                                        });
                                        setShowModal(true);
                                    }}
                                >
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para crear/editar documento */}
            <Modal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    resetForm();
                }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Documento" : "Subir Documento"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título</Form.Label>
                            <Form.Control
                                type="text"
                                name="titulo"
                                placeholder="Título del documento"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select
                                name="tipo_id"
                                value={formData.tipo_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un tipo</option>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Categoría</Form.Label>
                            <Form.Select
                                name="categoria_id"
                                value={formData.categoria_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Empleado</Form.Label>
                            <Form.Select
                                name="empleado_id"
                                value={formData.empleado_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un empleado</option>
                                {empleados.map((empleado) => (
                                    <option key={empleado.id} value={empleado.id}>
                                        {empleado.nombre} {empleado.apellidos}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Contrato</Form.Label>
                            <Form.Select
                                name="contrato_id"
                                value={formData.contrato_id}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione un contrato</option>
                                {contratos.map((contrato) => (
                                    <option key={contrato.id} value={contrato.id}>
                                        {contrato.tipo_contrato}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Archivo</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                                accept="application/pdf"
                                required={!isEditing}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="me-2"
                            >
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={uploading}>
                                {uploading ? "Subiendo..." : isEditing ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Documentos;