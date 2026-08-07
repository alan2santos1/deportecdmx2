import baseCatalog from "../../raw/manual/utopias-base-catalog.json";
import evidencesSource from "../../raw/manual/utopias-evidencias-oficiales.json";
import type {
  CoverageLevel,
  QualityGrade,
  UtopiaActivityRecord,
  UtopiaAmenityRecord,
  UtopiaChangeLogEntry,
  UtopiaEvidenceRecord,
  UtopiaLayerDataset,
  UtopiaOperationalStatus,
  UtopiaOpeningStatus,
  UtopiaProjectStatus,
  UtopiaRecord,
  UtopiaType,
  VerificationStatus
} from "../../../lib/dashboard-types";

type UtopiaBaseRecord = {
  utopiaId: string;
  canonicalName: string;
  sourceName: string;
  aliases: string[];
  alcaldia: string | null;
  address: string | null;
  operator: string;
  projectStatus: UtopiaProjectStatus;
  openingStatus: UtopiaOpeningStatus;
  operationalStatus: UtopiaOperationalStatus;
  openingDate: string | null;
  surfaceM2: number | null;
  coordinateStatus: UtopiaRecord["coordinateStatus"];
  utopiaType: UtopiaType;
  sourceInstitution: string;
  originalSourceFields: Record<string, unknown>;
};

const version = "utopias-v2-2026-08-07";
const generatedAt = new Date().toISOString();
const sourceDate = "2026-08-07";

const toComparableDate = (value: string | null) => (value ? new Date(value).getTime() : 0);

const isCountableInfrastructure = (
  record: Pick<UtopiaRecord, "projectStatus" | "openingStatus" | "operationalStatus" | "utopiaType">
) => {
  if (record.utopiaType === "espacio_publico_elevado") return false;
  if (record.operationalStatus === "operando_confirmado" || record.operationalStatus === "temporalmente_cerrada") return true;
  if (record.openingStatus === "inaugurada_confirmada") return true;
  return record.projectStatus === "terminada";
};

const resolveCoverage = (record: UtopiaBaseRecord): CoverageLevel =>
  record.alcaldia && record.address ? "parcial" : "no_disponible";

const resolveVerificationStatus = (
  base: UtopiaBaseRecord,
  evidences: UtopiaEvidenceRecord[]
): VerificationStatus => {
  if (evidences.length === 0) return "pendiente";
  if (base.projectStatus === "planeacion" || base.projectStatus === "anunciada") return "fuente_limitada";
  return "verificado";
};

const resolveQualityGrade = (
  base: UtopiaBaseRecord,
  evidences: UtopiaEvidenceRecord[],
  amenityCount: number
): QualityGrade => {
  if (
    evidences.length >= 2 &&
    (base.openingStatus === "inaugurada_confirmada" || base.operationalStatus === "operando_confirmado") &&
    (amenityCount > 0 || base.surfaceM2 !== null)
  ) {
    return "A";
  }
  if (evidences.length >= 1 && (base.alcaldia || base.address)) return "B";
  if (evidences.length >= 1) return "C";
  return "D";
};

const buildChangeHistory = (evidences: UtopiaEvidenceRecord[]): UtopiaChangeLogEntry[] =>
  evidences
    .slice()
    .sort((a, b) => {
      const left = toComparableDate(a.effectiveDate ?? a.publicationDate);
      const right = toComparableDate(b.effectiveDate ?? b.publicationDate);
      return left - right;
    })
    .map((evidence) => ({
      evidenceId: evidence.evidenceId,
      effectiveDate: evidence.effectiveDate,
      publicationDate: evidence.publicationDate,
      title: evidence.title,
      projectStatus: evidence.statusSupported.projectStatus ?? null,
      openingStatus: evidence.statusSupported.openingStatus ?? null,
      operationalStatus: evidence.statusSupported.operationalStatus ?? null,
      notes: evidence.notes
    }));

const buildAmenities = (evidences: UtopiaEvidenceRecord[]): UtopiaAmenityRecord[] =>
  evidences.flatMap((evidence, evidenceIndex) =>
    evidence.amenityClaims.map((claim, claimIndex) => ({
      amenityId: `${evidence.evidenceId}-amenity-${evidenceIndex + 1}-${claimIndex + 1}`,
      utopiaId: evidence.utopiaId,
      originalLabel: claim.originalLabel,
      normalizedAmenity: claim.normalizedAmenity,
      category: claim.category,
      evidenceId: evidence.evidenceId,
      verificationStatus: "verificado",
      sourceDate: evidence.effectiveDate ?? evidence.publicationDate
    }))
  );

const buildActivities = (evidences: UtopiaEvidenceRecord[]): UtopiaActivityRecord[] =>
  evidences.flatMap((evidence, evidenceIndex) =>
    evidence.activityClaims.map((claim, claimIndex) => ({
      activityId: `${evidence.evidenceId}-activity-${evidenceIndex + 1}-${claimIndex + 1}`,
      utopiaId: evidence.utopiaId,
      originalLabel: claim.originalLabel,
      normalizedDiscipline: claim.normalizedDiscipline,
      context: claim.context,
      evidenceId: evidence.evidenceId,
      sourceDate: evidence.effectiveDate ?? evidence.publicationDate
    }))
  );

export const buildUtopiasLayer = (): UtopiaLayerDataset => {
  const baseRecords = baseCatalog as UtopiaBaseRecord[];
  const evidenceRecords = evidencesSource as UtopiaEvidenceRecord[];
  const evidencesByUtopia = evidenceRecords.reduce<Record<string, UtopiaEvidenceRecord[]>>((acc, evidence) => {
    acc[evidence.utopiaId] = [...(acc[evidence.utopiaId] ?? []), evidence];
    return acc;
  }, {});

  const amenityCatalog = baseRecords.flatMap((base) => buildAmenities(evidencesByUtopia[base.utopiaId] ?? []));
  const activityCatalog = baseRecords.flatMap((base) => buildActivities(evidencesByUtopia[base.utopiaId] ?? []));

  const utopias: UtopiaRecord[] = baseRecords
    .map((base) => {
      const evidences = evidencesByUtopia[base.utopiaId] ?? [];
      const latestEvidence = evidences
        .slice()
        .sort((a, b) => toComparableDate(b.effectiveDate ?? b.publicationDate) - toComparableDate(a.effectiveDate ?? a.publicationDate))[0];
      const relatedAmenities = amenityCatalog.filter((item) => item.utopiaId === base.utopiaId);
      const verificationStatus = resolveVerificationStatus(base, evidences);
      const qualityGrade = resolveQualityGrade(base, evidences, relatedAmenities.length);

      return {
        utopiaId: base.utopiaId,
        canonicalName: base.canonicalName,
        sourceName: base.sourceName,
        aliases: base.aliases,
        alcaldia: base.alcaldia,
        address: base.address,
        coordinates: latestEvidence?.coordinates ?? null,
        coordinateStatus: base.coordinateStatus,
        utopiaType: base.utopiaType,
        surfaceM2: latestEvidence?.surfaceM2 ?? base.surfaceM2,
        operator: base.operator,
        projectStatus: base.projectStatus,
        openingStatus: base.openingStatus,
        operationalStatus: base.operationalStatus,
        openingDate: base.openingDate,
        lastVerifiedAt: latestEvidence?.effectiveDate ?? latestEvidence?.publicationDate ?? null,
        sourceDate: latestEvidence?.publicationDate ?? latestEvidence?.effectiveDate ?? null,
        sourceInstitution: latestEvidence?.sourceInstitution ?? base.sourceInstitution,
        evidenceIds: evidences.map((item) => item.evidenceId),
        qualityGrade,
        coverageLevel: resolveCoverage(base),
        verificationStatus,
        countAsRealInfrastructure: isCountableInfrastructure(base),
        originalSourceFields: base.originalSourceFields,
        changeHistory: buildChangeHistory(evidences)
      };
    })
    .sort((a, b) => {
      const alcaldiaOrder = (a.alcaldia ?? "Sin alcaldía").localeCompare(b.alcaldia ?? "Sin alcaldía", "es");
      if (alcaldiaOrder !== 0) return alcaldiaOrder;
      return a.canonicalName.localeCompare(b.canonicalName, "es");
    });

  const byAlcaldia = Array.from(
    utopias.reduce<Map<string, number>>((acc, record) => {
      const key = record.alcaldia ?? "Sin alcaldía documentada";
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map())
  )
    .map(([alcaldia, total]) => ({ alcaldia, total }))
    .sort((a, b) => b.total - a.total || a.alcaldia.localeCompare(b.alcaldia, "es"));

  const amenityTotals = Array.from(
    amenityCatalog.reduce<Map<string, { amenity: string; count: number; category: UtopiaAmenityRecord["category"] }>>((acc, amenity) => {
      const current = acc.get(amenity.normalizedAmenity);
      if (current) {
        current.count += 1;
        return acc;
      }
      acc.set(amenity.normalizedAmenity, {
        amenity: amenity.normalizedAmenity,
        count: 1,
        category: amenity.category
      });
      return acc;
    }, new Map())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.count - a.count || a.amenity.localeCompare(b.amenity, "es"));

  return {
    meta: {
      generatedAt,
      version,
      sourceDate,
      methodology:
        "Conciliación nominal por sede a partir de evidencia oficial institucional. Se separan proyecto, inauguración y operación; las amenidades se registran solo cuando una fuente oficial las documenta explícitamente.",
      note:
        "La capa distingue UTOPÍAs operando, inauguradas, en construcción y solo anunciadas. No se infieren disciplinas desde amenidades ni se cuentan proyectos anunciados como infraestructura actual disponible."
    },
    summary: {
      totalCatalogRecords: utopias.length,
      territorialCount: utopias.filter((item) => item.utopiaType === "territorial").length,
      historicalIztapalapaCount: utopias.filter((item) => item.utopiaType === "historica_iztapalapa").length,
      newGenerationCount: utopias.filter((item) => item.utopiaType !== "historica_iztapalapa").length,
      specialNonTerritorialCount: utopias.filter((item) => item.utopiaType === "espacio_publico_elevado" || item.utopiaType === "otro_documentado").length,
      multisiteProjectCount: utopias.filter((item) => item.utopiaType === "proyecto_multisitio").length,
      inauguratedConfirmed: utopias.filter((item) => item.openingStatus === "inaugurada_confirmada").length,
      operatingConfirmed: utopias.filter((item) => item.operationalStatus === "operando_confirmado").length,
      underConstruction: utopias.filter((item) => item.projectStatus === "construccion" || item.projectStatus === "terminacion").length,
      announcedOrPlanning: utopias.filter((item) => item.projectStatus === "anunciada" || item.projectStatus === "planeacion").length,
      withVerifiedAmenities: new Set(amenityCatalog.map((item) => item.utopiaId)).size,
      officialCoordinates: utopias.filter((item) => item.coordinateStatus === "oficial" && item.coordinates).length,
      derivedCoordinates: utopias.filter((item) => item.coordinateStatus === "derivada" && item.coordinates).length,
      approximateCoordinates: utopias.filter((item) => item.coordinateStatus === "aproximada" && item.coordinates).length,
      withoutCoordinates: utopias.filter((item) => item.coordinateStatus === "sin_coordenada" || !item.coordinates).length,
      withDocumentedSurface: utopias.filter((item) => item.surfaceM2 !== null).length,
      byAlcaldia,
      amenityTotals
    },
    utopias,
    amenities: amenityCatalog,
    activities: activityCatalog,
    evidences: evidenceRecords
  };
};
