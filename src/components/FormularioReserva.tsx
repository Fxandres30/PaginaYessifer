// components/FormularioReserva.tsx
import React from "react";

type Props = {
  nombre: string;
  contacto: string;
  setNombre: (value: string) => void;
  setContacto: (value: string) => void;
  confirmarReserva: () => void;
  cambiarEstado: (estado: "libre" | "reservado" | "pagado") => void;
  seleccionados: string[];
};

const FormularioReserva: React.FC<Props> = ({
  nombre,
  contacto,
  setNombre,
  setContacto,
  confirmarReserva,
  cambiarEstado,
  seleccionados,
}) => {
  if (seleccionados.length === 0) return null;

  const PRECIO_POR_NUMERO = 2000;
  const total = seleccionados.length * PRECIO_POR_NUMERO;

  return (
    <div className="formulario-contenedor">
      
      <div className="campo-formulario">
        <label className="etiqueta-campo">Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-campo"
          placeholder="Escribe tu nombre"
        />
      </div>

      <div className="campo-formulario">
        <label className="etiqueta-campo">Contacto:</label>
        <input
          type="tel"
          maxLength={10}
          pattern="[0-9]*"
          value={contacto}
          onChange={(e) => {
            const soloNumeros = e.target.value.replace(/\D/g, "");
            setContacto(soloNumeros);
          }}
          className="input-campo"
          placeholder="Ingresa tu número de celular"
        />
      </div>

      <div className="resumen-seleccion">
        <p><strong>Números seleccionados:</strong> {seleccionados.join(", ")}</p>
        <p><strong>Total:</strong> ${total.toLocaleString("es-CO")}</p>
      </div>

      {/* BOTONES */}
      <div className="boton-contenedor">

        <button
          className="boton-reservar"
          disabled={
            nombre.trim() === "" || contacto.trim().length !== 10
          }
          onClick={confirmarReserva}
        >
          Confirmar
        </button>

        <button
          className="boton-estado reservado"
          onClick={() => cambiarEstado("reservado")}
        >
          Reservado
        </button>

        <button
          className="boton-estado pagado"
          onClick={() => cambiarEstado("pagado")}
        >
          Pagado
        </button>

        <button
          className="boton-estado libre"
          onClick={() => cambiarEstado("libre")}
        >
          Liberar
        </button>

      </div>
    </div>
  );
};

export default FormularioReserva;