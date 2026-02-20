import { useEffect, useState } from "react";

type Config = {
  mensaje: string;
  fondo: string;
};

const CONFIG_DEFAULT: Config = {
  mensaje: "📊 Mira el estado actual 👇",
  fondo: "#ffffff",
};

export default function useConfigCompartir() {
  const [config, setConfig] = useState<Config>(CONFIG_DEFAULT);

  useEffect(() => {
    const guardado = localStorage.getItem("configCompartir");
    if (guardado) {
      setConfig(JSON.parse(guardado));
    }
  }, []);

  const actualizarConfig = (nueva: Config) => {
    setConfig(nueva);
    localStorage.setItem("configCompartir", JSON.stringify(nueva));
  };

  return { config, actualizarConfig };
}