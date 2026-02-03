import mixpanel from "mixpanel-browser";
// Importa una instancia singleton del SDK.
// No creas una clase nueva; es un objeto global que mantiene estado interno.


if (typeof window !== "undefined") {
  //Conectas tu app con un proyecto específico de Mixpanel
  //El token identifica a qué proyecto se envían los eventos
  mixpanel.init(
    process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!,
    {
      debug: process.env.NODE_ENV === "development",
      persistence: "localStorage",
      ignore_dnt: true,
    }
  );
}

export default mixpanel;
