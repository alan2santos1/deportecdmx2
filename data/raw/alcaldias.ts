export type AlcaldiaSeed = {
  name: string;
  population2020: number;
  publicSportsCenters: number;
  pilares: number;
  privateGyms: number;
  parks: number;
  centroid: { lat: number; lon: number };
  obesityBase: number;
  overweightBase: number;
  diabetesBase: number;
  territorialAccessFactor: number;
  privateAccessPenalty: number;
};

export const alcaldiasSeed: AlcaldiaSeed[] = [
  { name: "Álvaro Obregón", population2020: 759137, publicSportsCenters: 28, pilares: 14, privateGyms: 164, parks: 24, centroid: { lat: 19.3602, lon: -99.2145 }, obesityBase: 34.1, overweightBase: 37.6, diabetesBase: 11.3, territorialAccessFactor: 1.03, privateAccessPenalty: 0.9 },
  { name: "Azcapotzalco", population2020: 432205, publicSportsCenters: 16, pilares: 8, privateGyms: 119, parks: 18, centroid: { lat: 19.4847, lon: -99.1857 }, obesityBase: 35.9, overweightBase: 38.4, diabetesBase: 12.1, territorialAccessFactor: 1.01, privateAccessPenalty: 0.94 },
  { name: "Benito Juárez", population2020: 434153, publicSportsCenters: 18, pilares: 8, privateGyms: 212, parks: 22, centroid: { lat: 19.3807, lon: -99.1635 }, obesityBase: 28.4, overweightBase: 34.8, diabetesBase: 9.1, territorialAccessFactor: 1.12, privateAccessPenalty: 0.82 },
  { name: "Coyoacán", population2020: 614447, publicSportsCenters: 26, pilares: 11, privateGyms: 196, parks: 26, centroid: { lat: 19.3467, lon: -99.1617 }, obesityBase: 31.8, overweightBase: 36.9, diabetesBase: 10.7, territorialAccessFactor: 1.08, privateAccessPenalty: 0.85 },
  { name: "Cuajimalpa", population2020: 217686, publicSportsCenters: 10, pilares: 4, privateGyms: 58, parks: 11, centroid: { lat: 19.3692, lon: -99.2901 }, obesityBase: 33.4, overweightBase: 37.2, diabetesBase: 11.0, territorialAccessFactor: 0.98, privateAccessPenalty: 0.95 },
  { name: "Cuauhtémoc", population2020: 545884, publicSportsCenters: 17, pilares: 9, privateGyms: 205, parks: 21, centroid: { lat: 19.4333, lon: -99.1461 }, obesityBase: 32.5, overweightBase: 36.7, diabetesBase: 10.4, territorialAccessFactor: 1.05, privateAccessPenalty: 0.86 },
  { name: "Gustavo A. Madero", population2020: 1173351, publicSportsCenters: 36, pilares: 19, privateGyms: 189, parks: 29, centroid: { lat: 19.4856, lon: -99.117 }, obesityBase: 37.9, overweightBase: 39.5, diabetesBase: 13.2, territorialAccessFactor: 0.95, privateAccessPenalty: 1.02 },
  { name: "Iztacalco", population2020: 404695, publicSportsCenters: 14, pilares: 8, privateGyms: 94, parks: 14, centroid: { lat: 19.3953, lon: -99.0977 }, obesityBase: 36.4, overweightBase: 38.8, diabetesBase: 12.7, territorialAccessFactor: 0.97, privateAccessPenalty: 1.01 },
  { name: "Iztapalapa", population2020: 1835486, publicSportsCenters: 45, pilares: 28, privateGyms: 220, parks: 34, centroid: { lat: 19.3574, lon: -99.0926 }, obesityBase: 38.8, overweightBase: 40.4, diabetesBase: 13.7, territorialAccessFactor: 0.93, privateAccessPenalty: 1.05 },
  { name: "La Magdalena Contreras", population2020: 247622, publicSportsCenters: 12, pilares: 5, privateGyms: 49, parks: 13, centroid: { lat: 19.3083, lon: -99.2417 }, obesityBase: 36.8, overweightBase: 39.0, diabetesBase: 12.5, territorialAccessFactor: 0.96, privateAccessPenalty: 1.0 },
  { name: "Miguel Hidalgo", population2020: 414470, publicSportsCenters: 19, pilares: 7, privateGyms: 181, parks: 22, centroid: { lat: 19.4326, lon: -99.2002 }, obesityBase: 29.2, overweightBase: 35.6, diabetesBase: 9.6, territorialAccessFactor: 1.09, privateAccessPenalty: 0.84 },
  { name: "Milpa Alta", population2020: 152685, publicSportsCenters: 11, pilares: 5, privateGyms: 21, parks: 9, centroid: { lat: 19.1925, lon: -99.0236 }, obesityBase: 40.6, overweightBase: 41.2, diabetesBase: 14.2, territorialAccessFactor: 0.88, privateAccessPenalty: 1.08 },
  { name: "Tláhuac", population2020: 392313, publicSportsCenters: 15, pilares: 10, privateGyms: 64, parks: 15, centroid: { lat: 19.2869, lon: -99.0413 }, obesityBase: 39.4, overweightBase: 40.7, diabetesBase: 13.8, territorialAccessFactor: 0.91, privateAccessPenalty: 1.04 },
  { name: "Tlalpan", population2020: 699928, publicSportsCenters: 31, pilares: 16, privateGyms: 138, parks: 28, centroid: { lat: 19.2869, lon: -99.1717 }, obesityBase: 35.2, overweightBase: 38.1, diabetesBase: 11.9, territorialAccessFactor: 1.02, privateAccessPenalty: 0.93 },
  { name: "Venustiano Carranza", population2020: 443704, publicSportsCenters: 15, pilares: 7, privateGyms: 103, parks: 15, centroid: { lat: 19.4302, lon: -99.0987 }, obesityBase: 35.7, overweightBase: 38.0, diabetesBase: 12.4, territorialAccessFactor: 0.99, privateAccessPenalty: 0.97 },
  { name: "Xochimilco", population2020: 442178, publicSportsCenters: 18, pilares: 10, privateGyms: 71, parks: 17, centroid: { lat: 19.2578, lon: -99.1036 }, obesityBase: 38.1, overweightBase: 39.8, diabetesBase: 13.1, territorialAccessFactor: 0.94, privateAccessPenalty: 1.03 }
];
