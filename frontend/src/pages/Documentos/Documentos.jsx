import React, { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebaseConfig";
import axios from "axios";
import { Apiurl } from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Documentos = () => {
    const [documentos, setDocumentos] = useState([]);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        tipo_documento: "",
        empleado_id: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    // Obtener el token JWT desde el almacenamiento local
    const getAuthHeaders = () => {
        const token = localStorage.getItem("access_token");
        return {
            Authorization: `Bearer ${token}`,
        };
    };

    // Obtener documentos
    const fetchDocumentos = async () => {
        try {
            const response = await axios.get(`${Apiurl}documentos/`, {
                headers: getAuthHeaders(),
            });
            setDocumentos(response.data);
        } catch (error) {
            console.error("Error al obtener documentos:", error);
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

    // Subir documento
    const handleUpload = async () => {
        if (!file) {
            setMessage("Por favor, selecciona un archivo.");
            return;
        }

        setUploading(true);
        setMessage("");

        try {
            // Subir archivo a Firebase Storage
            const storageRef = ref(storage, `documentos/${file.name}`);
            await uploadBytes(storageRef, file);

            // Obtener la URL de descarga
            const downloadURL = await getDownloadURL(storageRef);

            // Crear o actualizar documento en el backend
            if (isEditing) {
                await axios.put(
                    `${Apiurl}documentos/${editId}/`,
                    { ...formData, url: downloadURL },
                    { headers: getAuthHeaders() }
                );
                setMessage("Documento actualizado con éxito.");
            } else {
                await axios.post(
                    `${Apiurl}documentos/`,
                    { ...formData, url: downloadURL },
                    { headers: getAuthHeaders() }
                );
                setMessage("Documento subido con éxito.");
            }

            fetchDocumentos();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            setMessage("Error al subir el archivo.");
        } finally {
            setUploading(false);
        }
    };

    // Eliminar documento
    const deleteDocumento = async (id) => {
        try {
            await axios.delete(`${Apiurl}documentos/${id}/`, {
                headers: getAuthHeaders(),
            });
            fetchDocumentos();
            setMessage("Documento eliminado con éxito.");
        } catch (error) {
            console.error("Error al eliminar documento:", error);
            setMessage("Error al eliminar el documento.");
        }
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            tipo_documento: "",
            empleado_id: "",
        });
        setFile(null);
        setIsEditing(false);
        setEditId(null);
    };

    // Cargar documentos al montar el componente
    useEffect(() => {
        fetchDocumentos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Documentos</h1>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Subir Documento
                </Button>
            </div>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Empleado</th>
                        <th>Fecha Subida</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {documentos.map((doc) => (
                        <tr key={doc.id}>
                            <td>{doc.id}</td>
                            <td>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    {doc.nombre}
                                </a>
                            </td>
                            <td>{doc.tipo_documento}</td>
                            <td>{doc.empleado_id}</td>
                            <td>{new Date(doc.fecha_subida).toLocaleString()}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditId(doc.id);
                                            setFormData({
                                                nombre: doc.nombre,
                                                tipo_documento: doc.tipo_documento,
                                                empleado_id: doc.empleado_id,
                                            });
                                            setShowModal(true);
                                        }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => deleteDocumento(doc.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para subir/editar documentos */}
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
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                placeholder="Nombre del documento"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Documento</Form.Label>
                            <Form.Control
                                type="text"
                                name="tipo_documento"
                                placeholder="Tipo de documento"
                                value={formData.tipo_documento}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>ID del Empleado</Form.Label>
                            <Form.Control
                                type="number"
                                name="empleado_id"
                                placeholder="ID del empleado"
                                value={formData.empleado_id}
                                onChange={handleChange}
                                required
                            />
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Subiendo..." : isEditing ? "Actualizar" : "Subir"}
                    </Button>
                </Modal.Footer>
            </Modal>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Documentos;