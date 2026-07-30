// Base inicial de creadores para importar al book desde /admin.
// Los nichos/formatos vacíos se clasifican después en el panel.
export interface CreadorSeed {
  nombre: string;
  telefono?: string;
  ciudad?: string;
  instagram?: string;
  tiktok?: string;
  nichos?: string[];
  notas?: string;
}

const CUCUTA: CreadorSeed[] = [
  { nombre: "Christian Guerrero", telefono: "3185217642", instagram: "@guerrerosapetitosalvaje", nichos: ["Gastronomía"], notas: "Parche de restaurantes que crean contenido y mueven bastante gente. También: @parchehamburguesero, @platanoverdes, @maduritos_co" },
  { nombre: "Marlon Gonzalo Ramírez Cáceres", telefono: "3137592591", instagram: "Marlon Cáceres", tiktok: "@Marloncaceresr" },
  { nombre: "Douglas Mackarthur Bueno", telefono: "3012750650", instagram: "@douglasmackarthurbueno", tiktok: "@douglasmackarthurbueno" },
  { nombre: "Adriana Bohórquez", telefono: "3103494747", tiktok: "@adrianabohorqz" },
  { nombre: "Yuliana Suárez", telefono: "3134383730", instagram: "@yulianarsl", tiktok: "@yuli.rsm" },
  { nombre: "Qué hay pa' hacer", telefono: "3212947374", instagram: "@que_hay_pahacer_", nichos: ["Lifestyle"], notas: "Cuenta de planes/agenda de ciudad." },
  { nombre: "Natalia Soler", telefono: "3144885774", instagram: "@natsoler120", tiktok: "@natsoler0712" },
  { nombre: "Valentina Salazar", telefono: "3123380165", instagram: "@valentina_salazarm", tiktok: "@valentinasalazar072" },
  { nombre: "Julieth Contreras", telefono: "3104203054", tiktok: "@julicontrerass15" },
  { nombre: "Tuty Maria", telefono: "3173789701", instagram: "@Tutymaria", tiktok: "@tutymusic", nichos: ["Música"] },
  { nombre: "Vale P", telefono: "3043940414", instagram: "@Latinavalep", tiktok: "@latinavalep" },
  { nombre: "Gresly Perez", telefono: "3004994461", instagram: "@gresly.perez", tiktok: "@Greslyperez" },
  { nombre: "Julieth Pita", telefono: "3208664345", instagram: "@juliethpita", tiktok: "@juliethpita" },
  { nombre: "Juan Carrillo", telefono: "3012958448", instagram: "@judacapa_", tiktok: "@judacapa" },
  { nombre: "Camila Ordoñez", telefono: "3219316912", instagram: "@Camilaordz_", tiktok: "@camio150" },
  { nombre: "Carlos Mejía", telefono: "3054547837", instagram: "@carloosshh", tiktok: "@carloosshh" },
  { nombre: "Nicolt Cuellar", telefono: "3059476250", instagram: "@nicoltcuellar", tiktok: "@nicoltc23" },
  { nombre: "Daniela Arias", telefono: "3225167024", instagram: "@shidani0127", tiktok: "@shidaqu75" },
  { nombre: "María Alejandra Guzmán", telefono: "3183307346", instagram: "@Malejandrag2", tiktok: "@Malejandrag2" },
  { nombre: "Yoel Páez", telefono: "3018586694", instagram: "@yoe_paez_25", tiktok: "@me_dicen_elyoe" },
  { nombre: "Saray Celeste", telefono: "3042296381", instagram: "@celestedigital.co", tiktok: "@azulceleste285" },
  { nombre: "Jessica Omaña", telefono: "3116425337", instagram: "@Jessicomana", tiktok: "@Jessomana" },
  { nombre: "Carolina Rojas", telefono: "3159061064", instagram: "@Carolinarojas.10", tiktok: "@Carolinared.10" },
  { nombre: "Yose Rangel", telefono: "3125331754", instagram: "@yoselinrangel13", tiktok: "@yoselinrangel13" },
  { nombre: "Ari Toscanno", telefono: "3229226256", instagram: "@Ariadnatoscanom", tiktok: "@Aritoscano_" },
  { nombre: "Abi Ovalles", telefono: "3019636377", instagram: "@abileess", tiktok: "@abileees" },
  { nombre: "Nirvana Miranda", telefono: "3209985900", instagram: "@mirandannirvana", tiktok: "@mirandanirvanna" },
  { nombre: "Steven Roa", telefono: "3215021057", instagram: "@stevenroa22", tiktok: "@stevenroa2" },
  { nombre: "María Camila Pabón", telefono: "3013301908", instagram: "@Mariacamilap7", tiktok: "@Mariacamilaps7" },
  { nombre: "Mariana Monsalve", telefono: "3232085303", instagram: "@marianamonsalvc", tiktok: "@Yosoywenn" },
  { nombre: "Mariann Duarte", telefono: "3213713788", instagram: "@Marianaduartep", tiktok: "@Marianaduartep17" },
  { nombre: "Andrea Cárdenas", telefono: "3012577214", instagram: "@andreapcs1", tiktok: "@ancardenas1" },
].map((c) => ({ ciudad: "Cúcuta", ...c }));

export const CREADORES_SEED: CreadorSeed[] = [...CUCUTA];
