/**
 * Location directory powering nairaBay's local landing pages.
 * Each state carries the towns/cities people actually search for plus the
 * campuses (universities, polytechnics, colleges) around them.
 */

export type NairaState = {
  name: string;
  slug: string;
  capital: string;
  cities: string[];
  campuses: string[];
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const STATES: NairaState[] = [
  { name: "Abia", slug: "abia", capital: "Umuahia", cities: ["Umuahia", "Aba", "Ohafia", "Arochukwu", "Isiala Ngwa", "Bende"], campuses: ["Abia State University Uturu", "Michael Okpara University Umudike", "Abia State Polytechnic Aba"] },
  { name: "Adamawa", slug: "adamawa", capital: "Yola", cities: ["Yola", "Jimeta", "Mubi", "Numan", "Ganye", "Michika"], campuses: ["Modibbo Adama University Yola", "American University of Nigeria Yola", "Adamawa State Polytechnic Yola"] },
  { name: "Akwa Ibom", slug: "akwa-ibom", capital: "Uyo", cities: ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak", "Ikot Abasi"], campuses: ["University of Uyo", "Akwa Ibom State University", "Akwa Ibom State Polytechnic Ikot Osurua"] },
  { name: "Anambra", slug: "anambra", capital: "Awka", cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ihiala", "Aguata"], campuses: ["Nnamdi Azikiwe University Awka", "Chukwuemeka Odumegwu Ojukwu University", "Federal Polytechnic Oko"] },
  { name: "Bauchi", slug: "bauchi", capital: "Bauchi", cities: ["Bauchi", "Azare", "Misau", "Jama'are", "Katagum", "Ningi"], campuses: ["Abubakar Tafawa Balewa University", "Bauchi State University Gadau", "Federal Polytechnic Bauchi"] },
  { name: "Bayelsa", slug: "bayelsa", capital: "Yenagoa", cities: ["Yenagoa", "Ogbia", "Sagbama", "Brass", "Nembe", "Ekeremor"], campuses: ["Niger Delta University Wilberforce Island", "Federal University Otuoke", "Bayelsa State Polytechnic Aleibiri"] },
  { name: "Benue", slug: "benue", capital: "Makurdi", cities: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala", "Vandeikya", "Adikpo"], campuses: ["Benue State University Makurdi", "Joseph Sarwuan Tarka University", "Akperan Orshi Polytechnic Yandev"] },
  { name: "Borno", slug: "borno", capital: "Maiduguri", cities: ["Maiduguri", "Biu", "Bama", "Konduga", "Monguno", "Damboa"], campuses: ["University of Maiduguri", "Borno State University", "Ramat Polytechnic Maiduguri"] },
  { name: "Cross River", slug: "cross-river", capital: "Calabar", cities: ["Calabar", "Ugep", "Ikom", "Ogoja", "Obudu", "Akamkpa"], campuses: ["University of Calabar", "Cross River University of Technology", "Federal Polytechnic Ugep"] },
  { name: "Delta", slug: "delta", capital: "Asaba", cities: ["Asaba", "Warri", "Sapele", "Ughelli", "Agbor", "Effurun", "Oleh"], campuses: ["Delta State University Abraka", "Federal University of Petroleum Resources Effurun", "Delta State Polytechnic Ozoro"] },
  { name: "Ebonyi", slug: "ebonyi", capital: "Abakaliki", cities: ["Abakaliki", "Afikpo", "Onueke", "Ezzamgbo", "Ishieke"], campuses: ["Ebonyi State University", "Alex Ekwueme Federal University Ndufu-Alike", "Akanu Ibiam Federal Polytechnic Unwana"] },
  { name: "Edo", slug: "edo", capital: "Benin City", cities: ["Benin City", "Auchi", "Ekpoma", "Uromi", "Igarra", "Irrua"], campuses: ["University of Benin", "Ambrose Alli University Ekpoma", "Auchi Polytechnic", "Benson Idahosa University"] },
  { name: "Ekiti", slug: "ekiti", capital: "Ado-Ekiti", cities: ["Ado-Ekiti", "Ikere-Ekiti", "Ikole", "Oye", "Emure", "Ijero"], campuses: ["Ekiti State University", "Federal University Oye-Ekiti", "Federal Polytechnic Ado-Ekiti"] },
  { name: "Enugu", slug: "enugu", capital: "Enugu", cities: ["Enugu", "Nsukka", "Awgu", "Oji River", "Udi", "Agbani"], campuses: ["University of Nigeria Nsukka", "Enugu State University of Science and Technology", "Institute of Management and Technology Enugu"] },
  { name: "FCT - Abuja", slug: "abuja", capital: "Abuja", cities: ["Abuja", "Garki", "Wuse", "Maitama", "Gwarinpa", "Kubwa", "Lugbe", "Nyanya", "Gwagwalada", "Karu"], campuses: ["University of Abuja Gwagwalada", "Baze University", "Nile University of Nigeria", "Federal Polytechnic Nasarawa"] },
  { name: "Gombe", slug: "gombe", capital: "Gombe", cities: ["Gombe", "Kaltungo", "Billiri", "Dukku", "Bajoga"], campuses: ["Gombe State University", "Federal University Kashere", "Federal Polytechnic Bajoga"] },
  { name: "Imo", slug: "imo", capital: "Owerri", cities: ["Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta", "Nkwerre"], campuses: ["Federal University of Technology Owerri", "Imo State University", "Federal Polytechnic Nekede"] },
  { name: "Jigawa", slug: "jigawa", capital: "Dutse", cities: ["Dutse", "Hadejia", "Gumel", "Birnin Kudu", "Kazaure"], campuses: ["Federal University Dutse", "Sule Lamido University Kafin Hausa", "Hussaini Adamu Federal Polytechnic Kazaure"] },
  { name: "Kaduna", slug: "kaduna", capital: "Kaduna", cities: ["Kaduna", "Zaria", "Kafanchan", "Sabon Gari", "Zonkwa", "Birnin Gwari"], campuses: ["Ahmadu Bello University Zaria", "Kaduna State University", "Kaduna Polytechnic", "Nuhu Bamalli Polytechnic"] },
  { name: "Kano", slug: "kano", capital: "Kano", cities: ["Kano", "Wudil", "Gwarzo", "Rano", "Bichi", "Dawakin Kudu"], campuses: ["Bayero University Kano", "Kano University of Science and Technology Wudil", "Kano State Polytechnic"] },
  { name: "Katsina", slug: "katsina", capital: "Katsina", cities: ["Katsina", "Daura", "Funtua", "Malumfashi", "Dutsin-Ma"], campuses: ["Umaru Musa Yar'adua University", "Federal University Dutsin-Ma", "Hassan Usman Katsina Polytechnic"] },
  { name: "Kebbi", slug: "kebbi", capital: "Birnin Kebbi", cities: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Jega"], campuses: ["Federal University Birnin Kebbi", "Kebbi State University of Science and Technology Aliero", "Waziri Umaru Federal Polytechnic Birnin Kebbi"] },
  { name: "Kogi", slug: "kogi", capital: "Lokoja", cities: ["Lokoja", "Okene", "Idah", "Kabba", "Ankpa", "Anyigba"], campuses: ["Prince Abubakar Audu University Anyigba", "Federal University Lokoja", "Federal Polytechnic Idah"] },
  { name: "Kwara", slug: "kwara", capital: "Ilorin", cities: ["Ilorin", "Offa", "Omu-Aran", "Jebba", "Lafiagi", "Patigi"], campuses: ["University of Ilorin", "Kwara State University Malete", "Kwara State Polytechnic Ilorin", "Landmark University Omu-Aran"] },
  { name: "Lagos", slug: "lagos", capital: "Ikeja", cities: ["Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere", "Ikorodu", "Ajah", "Alimosho", "Festac", "Agege", "Badagry", "Epe", "Apapa", "Oshodi"], campuses: ["University of Lagos Akoka", "Lagos State University Ojo", "Yaba College of Technology", "Lagos State Polytechnic Ikorodu", "Pan-Atlantic University"] },
  { name: "Nasarawa", slug: "nasarawa", capital: "Lafia", cities: ["Lafia", "Keffi", "Akwanga", "Karu", "Nasarawa", "Doma"], campuses: ["Nasarawa State University Keffi", "Federal University of Lafia", "Isa Mustapha Agwai Polytechnic Lafia"] },
  { name: "Niger", slug: "niger", capital: "Minna", cities: ["Minna", "Suleja", "Bida", "Kontagora", "Lapai", "New Bussa"], campuses: ["Federal University of Technology Minna", "Ibrahim Badamasi Babangida University Lapai", "Federal Polytechnic Bida"] },
  { name: "Ogun", slug: "ogun", capital: "Abeokuta", cities: ["Abeokuta", "Ijebu-Ode", "Sagamu", "Ota", "Ilaro", "Ijebu-Igbo", "Mowe"], campuses: ["Federal University of Agriculture Abeokuta", "Olabisi Onabanjo University Ago-Iwoye", "Federal Polytechnic Ilaro", "Covenant University Ota", "Babcock University Ilishan"] },
  { name: "Ondo", slug: "ondo", capital: "Akure", cities: ["Akure", "Ondo City", "Owo", "Ikare", "Okitipupa", "Ore"], campuses: ["Federal University of Technology Akure", "Adekunle Ajasin University Akungba", "Rufus Giwa Polytechnic Owo"] },
  { name: "Osun", slug: "osun", capital: "Osogbo", cities: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo", "Ikirun"], campuses: ["Obafemi Awolowo University Ile-Ife", "Osun State University", "Federal Polytechnic Ede"] },
  { name: "Oyo", slug: "oyo", capital: "Ibadan", cities: ["Ibadan", "Ogbomosho", "Oyo Town", "Iseyin", "Saki", "Eruwa"], campuses: ["University of Ibadan", "Ladoke Akintola University of Technology Ogbomosho", "The Polytechnic Ibadan", "Lead City University"] },
  { name: "Plateau", slug: "plateau", capital: "Jos", cities: ["Jos", "Bukuru", "Pankshin", "Shendam", "Barkin Ladi", "Langtang"], campuses: ["University of Jos", "Plateau State University Bokkos", "Plateau State Polytechnic Barkin Ladi"] },
  { name: "Rivers", slug: "rivers", capital: "Port Harcourt", cities: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Ahoada", "Okrika"], campuses: ["University of Port Harcourt", "Rivers State University", "Captain Elechi Amadi Polytechnic"] },
  { name: "Sokoto", slug: "sokoto", capital: "Sokoto", cities: ["Sokoto", "Tambuwal", "Illela", "Gwadabawa", "Bodinga"], campuses: ["Usmanu Danfodiyo University Sokoto", "Sokoto State University", "Umaru Ali Shinkafi Polytechnic Sokoto"] },
  { name: "Taraba", slug: "taraba", capital: "Jalingo", cities: ["Jalingo", "Wukari", "Bali", "Gembu", "Takum"], campuses: ["Taraba State University Jalingo", "Federal University Wukari", "Taraba State Polytechnic Suntai"] },
  { name: "Yobe", slug: "yobe", capital: "Damaturu", cities: ["Damaturu", "Potiskum", "Gashua", "Nguru", "Geidam"], campuses: ["Yobe State University Damaturu", "Federal University Gashua", "Federal Polytechnic Damaturu"] },
  { name: "Zamfara", slug: "zamfara", capital: "Gusau", cities: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka", "Bungudu"], campuses: ["Federal University Gusau", "Zamfara State University Talata Mafara", "Abdu Gusau Polytechnic Talata Mafara"] },
];

export function findState(slug: string) {
  return STATES.find((s) => s.slug === slug) ?? null;
}

export type Place = { name: string; slug: string; kind: "city" | "campus" };

export function placesForState(state: NairaState): Place[] {
  return [
    ...state.cities.map((name) => ({ name, slug: slugify(name), kind: "city" as const })),
    ...state.campuses.map((name) => ({ name, slug: slugify(name), kind: "campus" as const })),
  ];
}

export function findPlace(state: NairaState, placeSlug: string) {
  return placesForState(state).find((p) => p.slug === placeSlug) ?? null;
}

/** Nigerian mobile networks and the prefixes they own — used to label sellers. */
export const NETWORKS: { name: string; prefixes: string[] }[] = [
  { name: "MTN Nigeria", prefixes: ["0803", "0806", "0703", "0706", "0813", "0816", "0810", "0814", "0903", "0906", "0913", "0916", "07025", "07026"] },
  { name: "Airtel Nigeria", prefixes: ["0802", "0808", "0708", "0812", "0701", "0902", "0901", "0904", "0907", "0912"] },
  { name: "Glo Nigeria", prefixes: ["0805", "0807", "0705", "0815", "0811", "0905", "0915"] },
  { name: "9mobile", prefixes: ["0809", "0817", "0818", "0908", "0909"] },
];

/** Best-effort network name from a Nigerian number (local or +234 form). */
export function networkForPhone(phoneDigits: string): string | null {
  let local = phoneDigits.replace(/[^0-9]/g, "");
  if (local.startsWith("234")) local = "0" + local.slice(3);
  if (!local.startsWith("0") || local.length < 7) return null;
  for (const net of NETWORKS) {
    if (net.prefixes.some((p) => local.startsWith(p))) return net.name;
  }
  return null;
}
