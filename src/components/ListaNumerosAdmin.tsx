"use client";

import { useState } from "react";
import { Numero } from "../hooks/useReservas";

type Props = {
  numeros: Numero[];
};

export default function ListaNumerosAdmin({ numeros }: Props) {
  const [filtro, setFiltro] = useState<"todos" | "libre" | "reservado" | "pagado">("todos");
  const [busqueda, setBusqueda] = useState("");

  const numerosFiltrados = numeros
    .filter((n) => {
      if (filtro === "todos") return true;
      return n.estado === filtro;
    })
    .filter((n) =>
      n.numero.includes(busqueda)
    )
    .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

  return (
    <div className="admin-lista-container">

      <h2 className="admin-titulo">Panel de Números</h2>

      {/* FILTROS */}
      <div className="admin-filtros">
        <button onClick={() => setFiltro("todos")} className={filtro === "todos" ? "activo" : ""}>Todos</button>
        <button onClick={() => setFiltro("libre")} className={filtro === "libre" ? "activo" : ""}>Libres</button>
        <button onClick={() => setFiltro("reservado")} className={filtro === "reservado" ? "activo" : ""}>Reservados</button>
        <button onClick={() => setFiltro("pagado")} className={filtro === "pagado" ? "activo" : ""}>Pagados</button>
      </div>

      {/* BUSCADOR */}
      <div className="admin-buscador">
        <input
          type="text"
          placeholder="Buscar número..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <div className="admin-tabla-wrapper">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Número</th>
              <th>Estado</th>
              <th>Nombre</th>
              <th>Contacto</th>
            </tr>
          </thead>
          <tbody>
            {numerosFiltrados.map((n) => (
              <tr key={n.numero} className={`estado-${n.estado}`}>
                <td>{n.numero}</td>
                <td>{n.estado}</td>
                <td>{n.comprador || "-"}</td>
                <td>{n.contacto || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}