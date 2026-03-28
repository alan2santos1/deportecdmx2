export const officialSourceConfig = {
  pilares: {
    dataset: "Ubicación y Estatus PILARES",
    url: "https://datos.cdmx.gob.mx/dataset/9b42193a-6a6d-41b0-8de2-9f636c0affbe/resource/8a6d280d-3ac4-4341-aad4-8ab1b66f1efb/download/pilares300.csv",
    localPath: "data/raw/external/pilares.csv",
    type: "real" as const
  },
  publicSports: {
    dataset: "Deportivos Públicos de la CDMX",
    url: "https://datos.cdmx.gob.mx/dataset/c35ecde0-ab8b-43ba-a002-6c99173a97cf/resource/2782b1fa-7c4a-4c35-a9f2-a8670059253e/download/deportivos_publicos-r.xlsx-todos2.0.csv",
    localPath: "data/raw/external/deportivos_publicos.csv",
    type: "real" as const
  },
  denue: {
    dataset: "Directorio Estadístico de Unidades Económicas CDMX",
    url: "https://datos.cdmx.gob.mx/dataset/b042f288-836d-4e29-9be2-d25e7a311a5c/resource/3ffedf9d-10ad-429c-aa7c-db305b3e7909/download/directorio-de-unidades-econmicas.json",
    localPath: "data/raw/external/denue_cdmx.geojson",
    type: "real" as const,
    scianTargets: [
      { code: "713941", label: "Clubes deportivos privados" },
      { code: "713942", label: "Clubes deportivos públicos o mixtos" },
      { code: "713943", label: "Gimnasios privados" },
      { code: "713944", label: "Instalaciones acuáticas y balnearios" },
      { code: "611621", label: "Escuelas deportivas privadas" },
      { code: "611622", label: "Escuelas deportivas públicas o mixtas" }
    ]
  },
  geometry: {
    dataset: "Geometría de alcaldías CDMX",
    localPath: "data/raw/external/alcaldias.geojson",
    type: "preparado" as const
  }
};
