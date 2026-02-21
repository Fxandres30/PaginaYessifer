"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast"; // <- añadido
import { v4 as uuidv4 } from "uuid";

export type Numero = {
  id: number;
  numero: string;
  estado: "libre" | "temporal" | "reservado" | "pagado";
  comprador: string | null;
  contacto: string | null;
  bloqueado_hasta: string | null;
  temporal_por?: string | null;
};

export default function useReservas() {
  const [userId] = useState(() => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("userId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("userId", id);
    }
    return id;
  });

  const [numeros, setNumeros] = useState<Numero[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [reservados, setReservados] = useState<Numero[]>([]);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [updatingSet, setUpdatingSet] = useState<Set<string>>(new Set());

  const fetchNumeros = useCallback(async () => {
  const { data, error } = await supabase.from("reservas_dos_cifras").select("*");
  if (error) {
    toast.error("Error al cargar los números.");
    console.error("Error al cargar números:", error);
    return;
  }

  const ahora = new Date();

  // Libera números expirados
  const expirados = data?.filter((n) => 
    n.estado === "temporal" && 
    n.bloqueado_hasta &&
    new Date(n.bloqueado_hasta) < ahora
  );

  if (expirados && expirados.length > 0) {
    const numerosExpirados = expirados.map((n) => n.numero);
    await supabase
      .from("reservas_dos_cifras")
      .update({
        estado: "libre",
        temporal_por: null,
        bloqueado_hasta: null,
      })
      .in("numero", numerosExpirados);
  }

  const dataFinal = data?.map((n) => {
    const estaExpirado = n.estado === "temporal" && n.bloqueado_hasta && new Date(n.bloqueado_hasta) < ahora;
    return estaExpirado ? { ...n, estado: "libre", temporal_por: null, bloqueado_hasta: null } : n;
  });

  setNumeros(dataFinal || []);

  const seleccionadosPropios = dataFinal
    ?.filter((n) => n.estado === "temporal" && n.temporal_por === userId)
    .map((n) => n.numero);
    
  setSeleccionados(seleccionadosPropios || []);
}, [userId]);


  useEffect(() => {
    fetchNumeros();

    const channel = supabase
      .channel("reservas_dos_cifras")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservas_dos_cifras",
        },
        (payload) => {
          const newData = payload.new as Numero;
          setNumeros((prev) =>
            prev.map((n) => (n.numero === newData.numero ? { ...n, ...newData } : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNumeros]);

  const toggleSeleccion = async (numero: string) => {
  if (updatingSet.has(numero)) return;

  setUpdatingSet((prev) => new Set(prev).add(numero));

  const esSeleccionado = seleccionados.includes(numero);

  // Actualiza visual primero
  setSeleccionados((prev) =>
    esSeleccionado ? prev.filter((n) => n !== numero) : [...prev, numero]
  );

  try {
    const { data: checkData, error } = await supabase
      .from("reservas_dos_cifras")
      .select("estado, temporal_por")
      .eq("numero", numero)
      .single();

    if (error || !checkData) {
      toast.error("Error al verificar el número.");
      await fetchNumeros();
      return;
    }

    // 🔒 SOLO bloquea si es temporal de otro usuario
    if (
      !esSeleccionado &&
      checkData.estado === "temporal" &&
      checkData.temporal_por !== userId
    ) {
      toast.error(`El número ${numero} está siendo usado por otro usuario.`);
      setSeleccionados((prev) => prev.filter((n) => n !== numero));
      await fetchNumeros();
      return;
    }

    // 🔥 SOLO si está libre manejamos temporal
    if (checkData.estado === "libre") {
      const expiracion = new Date(Date.now() + 5 * 60_000).toISOString();

      const { data: updateData } = await supabase
        .from("reservas_dos_cifras")
        .update({
          estado: esSeleccionado ? "libre" : "temporal",
          temporal_por: esSeleccionado ? null : userId,
          bloqueado_hasta: esSeleccionado ? null : expiracion,
        })
        .eq("numero", numero)
        .select();

      if (!updateData || updateData.length === 0) {
        toast.error("Otro usuario tomó este número.");
        await fetchNumeros();
        return;
      }
    }

    // 🔥 Si está reservado o pagado:
    // Solo lo dejamos seleccionarse visualmente
    // NO tocamos base de datos

  } catch {
    toast.error("Error al seleccionar el número.");
    await fetchNumeros();
  } finally {
    setUpdatingSet((prev) => {
      const copy = new Set(prev);
      copy.delete(numero);
      return copy;
    });
  }
};

const confirmarReserva = async () => {
  if (seleccionados.length === 0 || !nombre.trim() || !contacto.trim()) {
    toast.error("Faltan datos o números.");
    return;
  }

  // 1. Obtener la IP del usuario
  let ip = null;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const json = await res.json();
    ip = json.ip;
  } catch (e) {
    console.warn("No se pudo obtener la IP:", e);
  }

  // 2. Actualizar la reserva con la IP si está disponible
  const { data, error } = await supabase
    .from("reservas_dos_cifras")
    .update({
      estado: "reservado",
      comprador: nombre.trim(),
      contacto: contacto.trim(),
      bloqueado_hasta: null,
      temporal_por: null,
      ip_reserva: ip || null, // <-- Asegúrate de tener este campo en tu tabla
    })
    .in("numero", seleccionados)
    .eq("estado", "temporal")
    .eq("temporal_por", userId)
    .select();

  if (error || !data) {
    toast.error("Error al confirmar la reserva.");
    await fetchNumeros(); // Forzamos sincronización con BD
    return;
  }

  if (data.length !== seleccionados.length) {
    const numerosReservados = data.map((n) => n.numero);
    const numerosNoDisponibles = seleccionados.filter(
      (num) => !numerosReservados.includes(num)
    );

    setSeleccionados((prev) =>
      prev.filter((num) => !numerosNoDisponibles.includes(num))
    );

    await fetchNumeros();

    toast.error(
      `Algunos números ya no están disponibles: ${numerosNoDisponibles.join(", ")}`
    );
    return;
  }

  const nuevosReservados = numeros
    .filter((n) => seleccionados.includes(n.numero))
    .map((n) => ({
      ...n,
      estado: "reservado" as const,
      comprador: nombre.trim(),
      contacto: contacto.trim(),
    }));

  setReservados(nuevosReservados);

  setNumeros((prevNumeros) =>
    prevNumeros.map((n) =>
      seleccionados.includes(n.numero)
        ? {
            ...n,
            estado: "reservado",
            comprador: nombre.trim(),
            contacto: contacto.trim(),
            bloqueado_hasta: null,
            temporal_por: null,
          }
        : n
    )
  );

  setSeleccionados([]);
  setNombre("");
  setContacto("");
  setReservaConfirmada(true);

  toast.success("Reserva confirmada con éxito.");
};

const reiniciarNumeros = async () => {
  const seguro = confirm(
    "⚠️ ATENCIÓN\n\nEsto liberará TODOS los números.\n¿Seguro que deseas continuar?"
  );

  if (!seguro) return; // 👈 si cancela, NO hace nada

  const { error } = await supabase
    .from("reservas_dos_cifras")
    .update({
      estado: "libre",
      comprador: null,
      contacto: null,
      temporal_por: null,
      bloqueado_hasta: null,
    })
    .neq("estado", "libre");

  if (error) {
    toast.error("Error al reiniciar");
    console.error(error);
    return;
  }

  toast.success("Números reiniciados correctamente 🔄");

  setTimeout(() => {
    window.location.reload();
  }, 800);
};

  return {
  numeros,
  seleccionados,
  reservados,
  nombre,
  contacto,
  setNombre,
  setContacto,
  toggleSeleccion,
  confirmarReserva,
  reservaConfirmada,
  userId,
  reiniciarNumeros, // 👈 ESTA
};

}