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
    const elemento = document.getElementById("area-compartir");
    if (!elemento) return;

    try {
      const canvas = await html2canvas(
  elemento,
  {
    scale: 2,
  } as any
);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) return;

      const file = new File([blob], "dinamica.png", {
        type: "image/png",
      });

      // Compartir nativo en móviles modernos
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Dinámica Activa",
          text: "Mira el estado actual de la dinámica 👇",
          files: [file],
        });
      } else {
        // Fallback elegante
        alert("Tu navegador no permite compartir imagen directamente.");
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

      {/* AREA QUE SE CONVIERTE EN IMAGEN */}
      <div id="area-compartir">
        <GridNumeros
          numeros={numeros}
          seleccionados={seleccionados}
          userId={userId}
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