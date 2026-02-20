"use client";

import { useState } from "react";

type Props = {
  mensajeActual: string;
  fondoActual: string;
  onGuardar: (mensaje: string, fondo: string) => void;
  onCerrar: () => void;
};

export default function EditorCompartir({
  mensajeActual,
  fondoActual,
  onGuardar,
  onCerrar,
}: Props) {

  const [mensaje, setMensaje] = useState(mensajeActual);
  const [fondo, setFondo] = useState(fondoActual);

  return (
    <div className="editor-overlay">
      <div className="editor-card">

        <h3>Editar configuración de compartir</h3>

        <label>Mensaje:</label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />

        <label>Color de fondo:</label>
        <input
          type="color"
          value={fondo}
          onChange={(e) => setFondo(e.target.value)}
        />

        <div className="editor-botones">
          <button onClick={() => onGuardar(mensaje, fondo)}>
            Guardar
          </button>
          <button onClick={onCerrar}>
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}