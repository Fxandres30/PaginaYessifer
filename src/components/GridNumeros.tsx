"use client";

import React from "react";
import { Numero } from "../hooks/useReservas";

type Props = {
  numeros: Numero[];
  seleccionados: string[];
  userId: string;
  toggleSeleccion: (numero: string) => void;
};

const GridNumeros: React.FC<Props> = ({
  numeros,
  seleccionados,
  userId,
  toggleSeleccion,
}) => {

  const numerosOrdenados = [...numeros].sort(
    (a, b) => parseInt(a.numero) - parseInt(b.numero)
  );

  return (
    <div className="gridNumeros">
      {numerosOrdenados.map((n) => {

        let estadoClase = "libre";

        if (n.estado === "reservado") estadoClase = "reservado";
        else if (n.estado === "pagado") estadoClase = "pagado";
        else if (n.estado === "temporal") estadoClase = "temporal";

        if (seleccionados.includes(n.numero)) {
          estadoClase = "seleccionado";
        }

        const disabled =
          (n.estado === "temporal" && n.temporal_por !== userId);

        return (
          <button
            key={n.numero}
            disabled={disabled}
            className={`botonNumero ${estadoClase}`}
            onClick={() => toggleSeleccion(n.numero)}
          >
            <span className="numeroTexto">
              {n.numero}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default GridNumeros;