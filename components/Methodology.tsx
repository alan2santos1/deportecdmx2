"use client";

import type { SheetData } from "../lib/types";
import { buildSheetTextBlocks } from "../lib/selectors";

type MethodologyProps = {
  sheets: Array<{ title: string; sheet: SheetData | null }>;
};

export default function Methodology({ sheets }: MethodologyProps) {
  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-3">
        <div className="text-base font-semibold text-ink-900">Metodología del MVP</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>MOPRADEF funciona como ancla oficial para actividad física por sexo y grupo de edad.</li>
          <li>ENSANUT aporta la capa de salud para obesidad, sobrepeso y diabetes como referencia pública preparada.</li>
          <li>La infraestructura del MVP combina conteos preparados de deportivos públicos, PILARES, gimnasios privados y parques con equipamiento.</li>
          <li>La actividad por alcaldía está marcada como estimación controlada y no como dato censal directo.</li>
        </ul>
      </div>
      <div className="card p-6 space-y-3">
        <div className="text-base font-semibold text-ink-900">Cómo leer el dashboard</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Panorama integra KPIs, comparativos por sexo y edad, infraestructura y salud.</li>
          <li>Calidad resume faltantes, reglas de revisión y consistencia del dataset base.</li>
          <li>Hojas permite explorar todas las tablas del workbook con búsqueda, orden y exportación.</li>
          <li>Las tasas se calculan contra población total del segmento cuando el dato existe.</li>
          <li>Usa el diccionario del MVP para distinguir entre campos agregados preparados, capas preparadas y estimaciones.</li>
          <li>Las visualizaciones del MVP son para priorización y no sustituyen una estimación territorial formal.</li>
        </ul>
      </div>
      {sheets.map((section) => {
        const blocks = buildSheetTextBlocks(section.sheet);
        return (
          <div key={section.title} className="card p-6 space-y-4">
            <div className="text-base font-semibold text-ink-900">{section.title}</div>
            {section.sheet === null ? (
              <div className="text-sm text-ink-600">Sheet not found in the workbook.</div>
            ) : (
              blocks.map((block, index) => {
                if (block.type === "table") {
                  const rows = block.content as string[][];
                  const header = rows[0] || [];
                  const body = rows.slice(1);
                  return (
                    <div key={index} className="overflow-auto rounded-xl border border-mist-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-mist-100 text-xs uppercase tracking-wide text-ink-600">
                          <tr>
                            {header.map((cell, cellIndex) => (
                              <th key={cellIndex} className="px-3 py-2 text-left font-semibold">
                                {cell}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {body.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-mist-200">
                              {header.map((_, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2 text-ink-700">
                                  {row[cellIndex] || ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                const lines = block.content as string[];
                return (
                  <div key={index} className="space-y-2 text-sm text-ink-700">
                    {lines.map((line, lineIndex) => (
                      <p key={`${section.title}-${lineIndex}`}>{line}</p>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
