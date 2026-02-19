"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Toaster } from "react-hot-toast";
import "../styles/BarraProgreso.css";
import "../styles/header.css";
import "../styles/GridNumeros.css";
import "../styles/FormularioReserva.css";
import useReservas from "../hooks/useReservas";
import GridNumeros from "../components/GridNumeros";
import FormularioReserva from "../components/FormularioReserva";
import BarraProgreso from "../components/BarraProgreso";

export default function Home() {
  const {
    numeros,
    seleccionados,
    toggleSeleccion,
    nombre,
    contacto,
    setNombre,
    setContacto,
    confirmarReserva,
    reiniciarNumeros,
    userId, // 👈 IMPORTANTE
  } = useReservas();

  return (
    <div className="app-container">

      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="header">
        <Image src="/titulo.png" alt="Título" width={260} height={70} />
      </header>

      {/* TÍTULO */}
      <h1 className="titulo-principal">
        Dinámica Activa
      </h1>

      {/* BOTÓN REINICIAR */}
      <button className="btn-reiniciar" onClick={reiniciarNumeros}>
        🔄 Reiniciar números
      </button>

      {/* FORMULARIO */}
      <FormularioReserva
        nombre={nombre}
        contacto={contacto}
        setNombre={setNombre}
        setContacto={setContacto}
        confirmarReserva={confirmarReserva}
        seleccionados={seleccionados}
      />

      {/* GRID */}
      <GridNumeros
        numeros={numeros}
        seleccionados={seleccionados}
        userId={userId}          // 👈 ESTA LÍNEA FALTABA
        toggleSeleccion={toggleSeleccion}
      />

      <div className="leyenda-estados">
  <div className="item-estado">
    <span className="circulo reservado"></span>
    <span>Reservado</span>
  </div>

  <div className="item-estado">
    <span className="circulo pagado"></span>
    <span>Pagado</span>
  </div>

  <div className="item-estado">
    <span className="circulo libre"></span>
    <span>Disponible</span>
  </div>
</div>

      {/* BARRA PROGRESO */}
      <BarraProgreso numeros={numeros} />

      {/* WHATSAPP FLOAT */}
      <Link
        href="https://wa.me/573014123951"
        target="_blank"
        className="whatsapp-float"
      >
        <FaWhatsapp size={28} />
      </Link>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 EFAAT</p>
      </footer>

    </div>
  );
}
