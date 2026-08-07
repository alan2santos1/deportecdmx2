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
  publicSpace: {
    dataset: "Espacio público de la Ciudad de México",
    url: "https://datos.cdmx.gob.mx/dataset/1ba93027-5f1b-467a-b88e-4c58757b46ee/resource/4c54880e-2c81-47ae-ac7f-416a3a7dde0c/download/espacios-publicos-de-la-ciudad-de-mexico.zip",
    dictionaryUrl:
      "https://datos.cdmx.gob.mx/dataset/1ba93027-5f1b-467a-b88e-4c58757b46ee/resource/94f330c7-333a-4233-8048-f8123e965bdc/download/dicc_esppub_cdmx.csv",
    localPath: "data/raw/external/public_space_cdmx.zip",
    dictionaryLocalPath: "data/raw/external/public_space_cdmx_dictionary.csv",
    type: "real" as const
  },
  greenAreas: {
    dataset: "Inventario de Áreas Verdes",
    url: "https://datos.cdmx.gob.mx/dataset/33f7efb2-540a-41e5-a7b2-f5c83e030b54/resource/e443a870-08d2-42ad-843f-ac4e0eb5541e/download/inventario-de-reas-verdes-en-la-ciudad-de-mxico..json",
    dictionaryUrl:
      "https://datos.cdmx.gob.mx/dataset/33f7efb2-540a-41e5-a7b2-f5c83e030b54/resource/9385bd44-2d9e-4cd2-9aa4-03aa8c6f523a/download/diccionario_datos_inventario_areas_verdes_1.csv",
    localPath: "data/raw/external/green_areas_cdmx.geojson",
    dictionaryLocalPath: "data/raw/external/green_areas_cdmx_dictionary.csv",
    type: "real" as const
  },
  geometry: {
    dataset: "Geometría de alcaldías CDMX",
    localPath: "data/raw/external/alcaldias.geojson",
    type: "preparado" as const
  }
};
