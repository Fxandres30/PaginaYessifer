"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Toaster } from "react-hot-toast";
import html2canvas from "html2canvas";

import "../styles/BarraProgreso.css";
import "../styles/header.css";
import "../styles/GridNumeros.css";
import "../styles/estados.css";
import "../styles/FormularioReserva.css";
import "../styles/RyCBotones.css";

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
    userId,
  } = useReservas();

  /* =======================
     FUNCIÓN COMPARTIR PRO
  ======================== */
const compartirTabla = async () => {
  const contenedor = document.querySelector(".numeros-card") as HTMLElement;
  if (!contenedor) return;

  try {
    // Activar modo captura
    contenedor.classList.add("modo-captura");

    // Esperar que el DOM aplique estilos
    await new Promise(resolve => setTimeout(resolve, 80));

    const rect = contenedor.getBoundingClientRect();

    const canvas = await html2canvas(contenedor, {
      scale: window.devicePixelRatio * 3, // 🔥 MÁS CALIDAD REAL
      backgroundColor: "#ffffff",
      useCORS: true,
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    // Quitar modo captura
    contenedor.classList.remove("modo-captura");

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 1.0)
    );

    if (!blob) return;

    const file = new File([blob], "estado-numeros.png", {
      type: "image/png",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Estado actual",
        text: "📊 Mira el estado actual 👇",
        files: [file],
      });
    } else {
      alert("Tu dispositivo no permite compartir imagen directamente.");
    }

  } catch (error) {
    console.error("Error al compartir:", error);
  }
};
  return (
    <div className="app-container">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="header">
        <Image src="/titulo.png" alt="Título" width={260} height={70} />
      </header>

      {/* TÍTULO */}
      <h1 className="titulo-principal">Dinámica Activa</h1>

      {/* BOTONES SUPERIORES */}
      <div className="acciones-superiores">
        <button className="btn-reiniciar" onClick={reiniciarNumeros}>
          🔄 Reiniciar
        </button>

        <button className="btn-compartir" onClick={compartirTabla}>
          📤 Compartir
        </button>
      </div>

      {/* FORMULARIO */}
      <FormularioReserva
        nombre={nombre}
        contacto={contacto}
        setNombre={setNombre}
        setContacto={setContacto}
        confirmarReserva={confirmarReserva}
        seleccionados={seleccionados}
      />

      <div id="area-compartir" className="numeros-container">
  <div className="numeros-card">

    <GridNumeros
      numeros={numeros}
      seleccionados={seleccionados}
      userId={userId}
      toggleSeleccion={toggleSeleccion}
    />

  </div>
  
</div>
<div className="leyenda-estados">
      <span><span className="dot libre"></span> Disponible</span>
      <span><span className="dot reservado"></span> Reservado</span>
      <span><span className="dot pagado"></span> Pagado</span>
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