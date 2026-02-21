"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import html2canvas from "html2canvas";

import useConfigCompartir from "../hooks/useConfigCompartir";
import EditorCompartir from "../components/EditorCompartir";
import useReservas from "../hooks/useReservas";

import GridNumeros from "../components/GridNumeros";
import FormularioReserva from "../components/FormularioReserva";
import BarraProgreso from "../components/BarraProgreso";
import ListaNumerosAdmin from "../components/ListaNumerosAdmin";

import "../styles/adminLista.css";
import "../styles/editor.css";
import "../styles/BarraProgreso.css";
import "../styles/header.css";
import "../styles/GridNumeros.css";
import "../styles/estados.css";
import "../styles/FormularioReserva.css";
import "../styles/RyCBotones.css";

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

  const { config, actualizarConfig } = useConfigCompartir();
  const [mostrarEditor, setMostrarEditor] = useState(false);

  const cambiarEstado = async (estado: "libre" | "reservado" | "pagado") => {
  if (seleccionados.length === 0) return;

  if (estado === "libre") {
    await supabase
      .from("semanales20k")
      .update({
        estado: "libre",
        comprador: null,
        contacto: null,
        temporal_por: null,
      })
      .in("numero", seleccionados);
  } else {
    await supabase
      .from("semanales20k")
      .update({ estado })
      .in("numero", seleccionados);
  }

  window.location.reload();
};
  /* =======================
     FUNCIÓN COMPARTIR PRO
  ======================== */
  const compartirTabla = async () => {
    const contenedor = document.querySelector(".numeros-card") as HTMLElement;
    if (!contenedor) return;

    try {
      contenedor.classList.add("modo-captura");

      await new Promise(resolve => setTimeout(resolve, 80));

      const rect = contenedor.getBoundingClientRect();

      const canvas = await html2canvas(contenedor, {
        scale: window.devicePixelRatio * 2,
        backgroundColor: config.fondo,
        useCORS: true,
        width: rect.width,
        height: rect.height,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      } as any);

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
          text: config.mensaje,
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
        <Image
          src="/titulo.png"
          alt="Título"
          width={260}
          height={70}
          priority
        />
      </header>
      {/* BOTONES SUPERIORES */}
      <div className="acciones-superiores">
        <button className="btn-reiniciar" onClick={reiniciarNumeros}>
          🔄 Reiniciar
        </button>

        <button
          className="btn-editar"
          onClick={() => setMostrarEditor(true)}
        >
          ✏ Editar
        </button>

        <button
          className="btn-compartir"
          onClick={compartirTabla}
        >
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
  cambiarEstado={cambiarEstado}
  seleccionados={seleccionados}
/>

      <div className="numeros-container">
        <div
  className="numeros-card"
  style={{ background: config.fondo }}
>
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

<ListaNumerosAdmin numeros={numeros} />

      {/* EDITOR MODAL */}
      {mostrarEditor && (
        <EditorCompartir
          mensajeActual={config.mensaje}
          fondoActual={config.fondo}
          onGuardar={(mensaje, fondo) => {
            actualizarConfig({ mensaje, fondo });
            setMostrarEditor(false);
          }}
          onCerrar={() => setMostrarEditor(false)}
        />
      )}
    </div>
  );
}