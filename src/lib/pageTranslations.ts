// ============================================================
// PAGE TRANSLATIONS — All non-UI page content for all languages
// EN, FR, ES, AF — complete, 100% translated, no partial keys
// ============================================================

export type Lang = 'en' | 'fr' | 'es' | 'af';

export const SUPPORTED_LANGS: Lang[] = ['en', 'fr', 'es', 'af'];
export const NON_DEFAULT_LANGS: Lang[] = ['fr', 'es', 'af'];

export function getLangPrefix(lang: Lang): string {
  return lang === 'en' ? '' : `/${lang}`;
}

// ─── ABOUT PAGE ─────────────────────────────────────────────
const about = {
  en: {
    meta: { title: "About Arbre Bio Africa — Precision Agriculture Pioneer", description: "Meet Sydney Abouna, founder of Arbre Bio Africa. Transforming agriculture across Africa through precision irrigation, greenhouses, and modern farming technologies." },
    hero: { title: "About Arbre Bio Africa", subtitle: "The story behind Africa's precision agriculture leader — built from the ground up in Abidjan, Côte d'Ivoire" },
    founderLabel: "The Founder",
    founderName: "Sydney Abouna",
    founderTitle: "Founder & CEO — Arbre Bio Africa · Arbre Bio Côte d'Ivoire · Organic Tree Group",
    p1: "My name is Sydney Abouna. I founded Arbre Bio Africa, Arbre Bio Côte d'Ivoire and the Organic Tree Group with one clear vision: to make Africa the continent with the most advanced, productive and sustainable agricultural ecosystem in the world.",
    p2: "I built this company from zero — alone, handling everything from operations and project management to client relations, marketing and partnerships. Every greenhouse we build, every irrigation system we install, every farmer we help is the result of a personal commitment to excellence and innovation.",
    p3: "I search tirelessly for the world's best agricultural techniques — the most innovative solutions for increasing yield, improving food quality, and making farming profitable and sustainable in Africa's unique climate conditions.",
    p4: "Today, Arbre Bio operates in 5 African countries with 500+ completed projects, partnerships with the World Bank, African Development Bank, GIZ, FAO, the Ministry of Agriculture and leading global agritech companies.",
    cta: "Work With Us", whatsapp: "WhatsApp Me Directly",
    whatWeDoTitle: "What We Do",
    cards: [
      { icon: "🏗️", title: "Greenhouse Construction", desc: "High-tech sawtooth and tunnel greenhouses engineered for African tropical conditions, with full climate control and drip irrigation integration." },
      { icon: "💧", title: "Precision Irrigation", desc: "Smart drip and sprinkler systems that save up to 60% water while dramatically increasing crop yields. Designed and installed for African farms." },
      { icon: "🌱", title: "Growing Solutions", desc: "Premium coco peat substrates and organic growing mediums for hydroponic and soil-based cultivation of high-yield vegetables and fruits." }
    ],
    missionTitle: "Our Mission", missionText: "To transform African agriculture by providing every farmer with access to the best precision farming technologies in the world — increasing yields, reducing waste, and creating sustainable food systems across the continent.",
    visionTitle: "Our Vision", visionText: "To be the #1 agricultural innovation company in Africa — the most trusted name for modern greenhouse farming, precision irrigation, and smart agriculture solutions from Abidjan to Nairobi.",
    journeyTitle: "Our Journey",
    ctaTitle: "Ready to Work Together?", ctaText: "Whether you're a farmer, investor, institution or government partner — we want to hear from you.", ctaBtn: "Get in Touch"
  },
  fr: {
    meta: { title: "À Propos d'Arbre Bio Africa — Pionnière de l'Agriculture de Précision", description: "Découvrez Sydney Abouna, fondatrice d'Arbre Bio Africa. Transformer l'agriculture en Afrique grâce à l'irrigation de précision, les serres et les technologies agricoles modernes." },
    hero: { title: "À Propos d'Arbre Bio Africa", subtitle: "L'histoire derrière le leader de l'agriculture de précision en Afrique — construit depuis zéro à Abidjan, Côte d'Ivoire" },
    founderLabel: "La Fondatrice",
    founderName: "Sydney Abouna",
    founderTitle: "Fondatrice & PDG — Arbre Bio Africa · Arbre Bio Côte d'Ivoire · Organic Tree Group",
    p1: "Je suis Sydney Abouna. J'ai fondé Arbre Bio Africa, Arbre Bio Côte d'Ivoire et l'Organic Tree Group avec une vision claire : faire de l'Afrique le continent possédant l'écosystème agricole le plus avancé, productif et durable au monde.",
    p2: "J'ai construit cette entreprise de zéro — seule, gérant tout moi-même depuis les opérations et la gestion de projets jusqu'aux relations clients, au marketing et aux partenariats. Chaque serre que nous construisons, chaque système d'irrigation que nous installons est le fruit d'un engagement personnel envers l'excellence.",
    p3: "Je cherche sans relâche les meilleures techniques agricoles du monde — les solutions les plus innovantes pour augmenter les rendements, améliorer la qualité alimentaire et rendre l'agriculture rentable et durable dans les conditions climatiques uniques de l'Afrique.",
    p4: "Aujourd'hui, Arbre Bio opère dans 5 pays africains avec 500+ projets réalisés, des partenariats avec la Banque Mondiale, la BAD, la GIZ, la FAO, le Ministère de l'Agriculture et des leaders mondiaux de l'agritech comme Hortalan, AZUD et Novagric.",
    cta: "Travailler avec Nous", whatsapp: "WhatsApp Direct",
    whatWeDoTitle: "Ce Que Nous Faisons",
    cards: [
      { icon: "🏗️", title: "Construction de Serres", desc: "Serres sawtooth et tunnel haute technologie conçues pour les conditions tropicales africaines, avec contrôle climatique complet et irrigation goutte-à-goutte intégrée." },
      { icon: "💧", title: "Irrigation de Précision", desc: "Systèmes goutte-à-goutte et d'aspersion intelligents qui économisent jusqu'à 60% d'eau tout en augmentant considérablement les rendements agricoles." },
      { icon: "🌱", title: "Solutions de Culture", desc: "Substrats premium à base de coco peat et milieux de culture organiques pour la culture hydroponique et en sol de légumes et fruits à haut rendement." }
    ],
    missionTitle: "Notre Mission", missionText: "Transformer l'agriculture africaine en donnant à chaque agriculteur accès aux meilleures technologies d'agriculture de précision au monde — augmenter les rendements, réduire les déchets et créer des systèmes alimentaires durables à travers le continent.",
    visionTitle: "Notre Vision", visionText: "Être la n°1 des entreprises d'innovation agricole en Afrique — le nom le plus fiable pour la culture en serre moderne, l'irrigation de précision et les solutions d'agriculture intelligente d'Abidjan à Nairobi.",
    journeyTitle: "Notre Parcours",
    ctaTitle: "Prêt à Travailler Ensemble ?", ctaText: "Que vous soyez agriculteur, investisseur, institution ou partenaire gouvernemental — nous voulons vous entendre.", ctaBtn: "Nous Contacter"
  },
  es: {
    meta: { title: "Sobre Arbre Bio Africa — Pionera en Agricultura de Precisión", description: "Conoce a Sydney Abouna, fundadora de Arbre Bio Africa. Transformando la agricultura en África a través de riego de precisión, invernaderos y tecnologías agrícolas modernas." },
    hero: { title: "Sobre Arbre Bio Africa", subtitle: "La historia detrás del líder en agricultura de precisión de África — construida desde cero en Abidján, Costa de Marfil" },
    founderLabel: "La Fundadora",
    founderName: "Sydney Abouna",
    founderTitle: "Fundadora & CEO — Arbre Bio Africa · Arbre Bio Costa de Marfil · Organic Tree Group",
    p1: "Mi nombre es Sydney Abouna. Fundé Arbre Bio Africa, Arbre Bio Costa de Marfil y el Organic Tree Group con una visión clara: convertir a África en el continente con el ecosistema agrícola más avanzado, productivo y sostenible del mundo.",
    p2: "Construí esta empresa desde cero — sola, gestionando todo desde las operaciones y la gestión de proyectos hasta las relaciones con clientes, marketing y alianzas. Cada invernadero que construimos, cada sistema de riego que instalamos es el resultado de un compromiso personal con la excelencia.",
    p3: "Busco incansablemente las mejores técnicas agrícolas del mundo — las soluciones más innovadoras para aumentar los rendimientos, mejorar la calidad alimentaria y hacer que la agricultura sea rentable y sostenible en las condiciones climáticas únicas de África.",
    p4: "Hoy, Arbre Bio opera en 5 países africanos con más de 500 proyectos completados, alianzas con el Banco Mundial, el Banco Africano de Desarrollo, GIZ, FAO, el Ministerio de Agricultura y empresas líderes en agrotecnología como Hortalan, AZUD y Novagric.",
    cta: "Trabajar con Nosotros", whatsapp: "WhatsApp Directo",
    whatWeDoTitle: "Lo Que Hacemos",
    cards: [
      { icon: "🏗️", title: "Construcción de Invernaderos", desc: "Invernaderos de alta tecnología tipo sawtooth y túnel diseñados para condiciones tropicales africanas, con control climático completo e irrigación por goteo integrada." },
      { icon: "💧", title: "Riego de Precisión", desc: "Sistemas de goteo y aspersión inteligentes que ahorran hasta un 60% de agua y aumentan drásticamente los rendimientos de los cultivos." },
      { icon: "🌱", title: "Soluciones de Cultivo", desc: "Sustratos premium de fibra de coco y medios de cultivo orgánicos para el cultivo hidropónico y en suelo de hortalizas y frutas de alto rendimiento." }
    ],
    missionTitle: "Nuestra Misión", missionText: "Transformar la agricultura africana proporcionando a cada agricultor acceso a las mejores tecnologías de agricultura de precisión del mundo — aumentar los rendimientos, reducir desperdicios y crear sistemas alimentarios sostenibles en todo el continente.",
    visionTitle: "Nuestra Visión", visionText: "Ser la empresa de innovación agrícola n°1 en África — el nombre más confiable para la agricultura en invernadero moderno, el riego de precisión y las soluciones de agricultura inteligente desde Abiyán hasta Nairobi.",
    journeyTitle: "Nuestro Camino",
    ctaTitle: "¿Listo para Trabajar Juntos?", ctaText: "Ya seas agricultor, inversor, institución o socio gubernamental — queremos escucharte.", ctaBtn: "Ponerse en Contacto"
  },
  af: {
    meta: { title: "Oor Arbre Bio Africa — Presisieboerdery Pionier", description: "Ontmoet Sydney Abouna, stigter van Arbre Bio Africa. Transformeer landbou regoor Afrika deur presisiebesproeiing, kweekhuise en moderne boerderytegnologieë." },
    hero: { title: "Oor Arbre Bio Africa", subtitle: "Die verhaal agter Afrika se presisieboerdery leier — gebou van niks af in Abidjan, Ivoorkus" },
    founderLabel: "Die Stigter",
    founderName: "Sydney Abouna",
    founderTitle: "Stigter & Uitvoerende Hoof — Arbre Bio Africa · Arbre Bio Ivoorkus · Organic Tree Group",
    p1: "My naam is Sydney Abouna. Ek het Arbre Bio Africa, Arbre Bio Ivoorkus en die Organic Tree Group gestig met een duidelike visie: om Afrika die kontinent te maak met die mees gevorderde, produktiewe en volhoubare landbou-ekosisteem ter wêreld.",
    p2: "Ek het hierdie maatskappy van niks af gebou — alleen, en alles self bestuur van bedrywighede en projekbestuur tot kliënteverhoudings, bemarking en vennootskappe. Elke kwekhuis wat ons bou is die resultaat van 'n persoonlike toewyding aan uitnemendheid.",
    p3: "Ek soek onverpoos na die wêreld se beste landboutegnieke — die mees innoverende oplossings om opbrengste te verhoog, voedsekwaliteit te verbeter en boerdery winsgewend en volhoubaar te maak in Afrika se unieke klimaattoestande.",
    p4: "Vandag werk Arbre Bio in 5 Afrika-lande met 500+ voltooide projekte, vennootskappe met die Wêreldbank, die Afrikaanse Ontwikkelingsbank, GIZ, FAO, die Ministerie van Landbou en toonaangewende globale agritech-maatskappye.",
    cta: "Saamwerk", whatsapp: "WhatsApp My Direk",
    whatWeDoTitle: "Wat Ons Doen",
    cards: [
      { icon: "🏗️", title: "Kwekhuis Konstruksie", desc: "Hoë-tegnologie sawtooth en tonnel kweekhuise ontwerp vir Afrika se tropiese toestande, met volledige klimaatbeheer en drup besproeiing integrasie." },
      { icon: "💧", title: "Presisie Besproeiing", desc: "Slim drup- en sproeistelsels wat tot 60% water bespaar terwyl gewasopbrengste dramaties verhoog word. Ontwerp en geïnstalleer vir Afrika se plase." },
      { icon: "🌱", title: "Groei Oplossings", desc: "Premium koko-turfmos substrate en organiese groeimedia vir hidroponies en grondgebaseerde verbouing van hoë-opbrengs groente en vrugte." }
    ],
    missionTitle: "Ons Missie", missionText: "Om Afrika se landbou te transformeer deur elke boer toegang te gee tot die beste presisieboerdery tegnologieë ter wêreld — opbrengste verhoog, vermorsing verminder en volhoubare voedselsisteme oor die kontinent skep.",
    visionTitle: "Ons Visie", visionText: "Om die nommer 1 landbou-innovasie maatskappy in Afrika te wees — die mees vertroude naam vir moderne kwekhuis boerdery, presisie besproeiing en slim landbou oplossings van Abidjan tot Nairobi.",
    journeyTitle: "Ons Reis",
    ctaTitle: "Gereed om Saam te Werk?", ctaText: "Of jy 'n boer, belegger, instelling of regeringsvennoot is — ons wil van jou hoor.", ctaBtn: "Kontak Ons"
  }
};

// ─── COMPANY PAGE ────────────────────────────────────────────
const company = {
  en: {
    meta: { title: "About Arbre Bio Africa — Leading Agricultural Innovation", description: "Discover how Arbre Bio Africa is transforming agriculture across Africa through innovative precision farming technology and sustainable solutions." },
    hero: { title: "Transforming Agriculture Through Innovation", subtitle: "Empowering farmers across Africa with cutting-edge technology and sustainable solutions." },
    founderLabel: "Our Founder", founderName: "Sydney Abouna",
    founderDesc: "Sydney Abouna is the founder of Arbre Bio Africa, Arbre Bio Côte d'Ivoire and the Organic Tree Group — a precision agriculture company with a single bold mission: to become the #1 agricultural innovation company in Africa.",
    founderDesc2: "Driven by a deep belief that African farmers deserve access to the world's best farming technologies, Sydney built Arbre Bio from the ground up — personally managing every aspect of the company.",
    founderDesc3: "Today, Arbre Bio works with the World Bank, African Development Bank, GIZ, FAO, the Ivorian Ministry of Agriculture and leading international agritech companies including Hortalan, AZUD and Novagric — bringing world-class precision farming solutions to farmers across 5 African countries.",
    founderCta: "Work with Sydney",
    missionTitle: "Our Mission", missionText: "At Arbre Bio Africa, we're committed to revolutionizing agriculture through innovative technology and sustainable practices. Our mission is to empower farmers with solutions that increase productivity while preserving natural resources — making Africa the leader in modern, high-yield, eco-friendly farming.",
    solutionsTitle: "Our Solutions",
    journeyTitle: "Our Journey",
    ctaTitle: "Ready to Transform Your Farm?", ctaText: "Join hundreds of successful farmers across Africa who trust Arbre Bio.", ctaBtn1: "Get a Free Consultation", ctaBtn2: "Chat on WhatsApp",
    stats: ["Projects Completed", "African Countries", "Hectares Optimized", "Average Water Savings"]
  },
  fr: {
    meta: { title: "À Propos d'Arbre Bio Africa — Innovation Agricole de Pointe", description: "Découvrez comment Arbre Bio Africa transforme l'agriculture à travers l'Afrique grâce aux technologies d'agriculture de précision innovantes." },
    hero: { title: "Transformer l'Agriculture par l'Innovation", subtitle: "Donner aux agriculteurs africains les moyens d'agir grâce à une technologie de pointe et des solutions durables." },
    founderLabel: "Notre Fondatrice", founderName: "Sydney Abouna",
    founderDesc: "Sydney Abouna est la fondatrice d'Arbre Bio Africa, Arbre Bio Côte d'Ivoire et l'Organic Tree Group — une entreprise d'agriculture de précision avec une seule mission audacieuse : devenir la n°1 des entreprises d'innovation agricole en Afrique.",
    founderDesc2: "Animée par la conviction profonde que les agriculteurs africains méritent d'accéder aux meilleures technologies agricoles mondiales, Sydney a bâti Arbre Bio depuis zéro — gérant personnellement chaque aspect de l'entreprise.",
    founderDesc3: "Aujourd'hui, Arbre Bio collabore avec la Banque Mondiale, la BAD, la GIZ, la FAO, le Ministère ivoirien de l'Agriculture et des entreprises internationales leaders en agritech comme Hortalan, AZUD et Novagric — apportant des solutions d'agriculture de précision de classe mondiale à 5 pays africains.",
    founderCta: "Travailler avec Sydney",
    missionTitle: "Notre Mission", missionText: "Chez Arbre Bio Africa, nous nous engageons à révolutionner l'agriculture grâce à des technologies innovantes et des pratiques durables. Notre mission est de donner aux agriculteurs des solutions qui augmentent la productivité tout en préservant les ressources naturelles — faisant de l'Afrique le leader de l'agriculture moderne, à haut rendement et écologique.",
    solutionsTitle: "Nos Solutions",
    journeyTitle: "Notre Parcours",
    ctaTitle: "Prêt à Transformer Votre Ferme ?", ctaText: "Rejoignez des centaines d'agriculteurs prospères à travers l'Afrique qui font confiance à Arbre Bio.", ctaBtn1: "Obtenir une Consultation Gratuite", ctaBtn2: "Discuter sur WhatsApp",
    stats: ["Projets Réalisés", "Pays Africains", "Hectares Optimisés", "Économies d'Eau Moyennes"]
  },
  es: {
    meta: { title: "Sobre Arbre Bio Africa — Innovación Agrícola Líder", description: "Descubre cómo Arbre Bio Africa está transformando la agricultura en toda África a través de tecnología innovadora de agricultura de precisión." },
    hero: { title: "Transformando la Agricultura a través de la Innovación", subtitle: "Empoderando a los agricultores de toda África con tecnología de vanguardia y soluciones sostenibles." },
    founderLabel: "Nuestra Fundadora", founderName: "Sydney Abouna",
    founderDesc: "Sydney Abouna es la fundadora de Arbre Bio Africa, Arbre Bio Costa de Marfil y el Organic Tree Group — una empresa de agricultura de precisión con una única misión audaz: convertirse en la empresa de innovación agrícola n°1 en África.",
    founderDesc2: "Impulsada por la profunda creencia de que los agricultores africanos merecen acceso a las mejores tecnologías agrícolas del mundo, Sydney construyó Arbre Bio desde cero — gestionando personalmente cada aspecto de la empresa.",
    founderDesc3: "Hoy, Arbre Bio trabaja con el Banco Mundial, el Banco Africano de Desarrollo, GIZ, FAO, el Ministerio de Agricultura de Costa de Marfil y empresas internacionales líderes en agrotecnología incluyendo Hortalan, AZUD y Novagric.",
    founderCta: "Trabajar con Sydney",
    missionTitle: "Nuestra Misión", missionText: "En Arbre Bio Africa, estamos comprometidos a revolucionar la agricultura a través de tecnología innovadora y prácticas sostenibles. Nuestra misión es empoderar a los agricultores con soluciones que aumenten la productividad mientras preservan los recursos naturales.",
    solutionsTitle: "Nuestras Soluciones",
    journeyTitle: "Nuestro Camino",
    ctaTitle: "¿Listo para Transformar tu Granja?", ctaText: "Únete a cientos de agricultores exitosos en toda África que confían en Arbre Bio.", ctaBtn1: "Obtener una Consulta Gratuita", ctaBtn2: "Chatear en WhatsApp",
    stats: ["Proyectos Completados", "Países Africanos", "Hectáreas Optimizadas", "Ahorro Promedio de Agua"]
  },
  af: {
    meta: { title: "Oor Arbre Bio Africa — Voorste Landbou Innovasie", description: "Ontdek hoe Arbre Bio Africa landbou regoor Afrika transformeer deur innoverende presisieboerdery tegnologie en volhoubare oplossings." },
    hero: { title: "Transformeer Landbou Deur Innovasie", subtitle: "Bemagtig boere regoor Afrika met toonaangewende tegnologie en volhoubare oplossings." },
    founderLabel: "Ons Stigter", founderName: "Sydney Abouna",
    founderDesc: "Sydney Abouna is die stigter van Arbre Bio Africa, Arbre Bio Ivoorkus en die Organic Tree Group — 'n presisieboerdery maatskappy met 'n enkele gedurfdede missie: om die nommer 1 landbou-innovasie maatskappy in Afrika te word.",
    founderDesc2: "Gedryf deur die diep oortuiging dat Afrika se boere toegang verdien tot die wêreld se beste boerderytegnologieë, het Sydney Arbre Bio van niks af gebou — en persoonlik elke aspek van die maatskappy bestuur.",
    founderDesc3: "Vandag werk Arbre Bio saam met die Wêreldbank, die Afrikaanse Ontwikkelingsbank, GIZ, FAO, die Ivoorkus Ministerie van Landbou en internasionale toonaangewende agritech-maatskappye soos Hortalan, AZUD en Novagric.",
    founderCta: "Saamwerk met Sydney",
    missionTitle: "Ons Missie", missionText: "By Arbre Bio Africa is ons daartoe verbind om landbou te revolusioneer deur innoverende tegnologie en volhoubare praktyke. Ons missie is om boere te bemagtig met oplossings wat produktiwiteit verhoog terwyl dit natuurlike hulpbronne bewaar.",
    solutionsTitle: "Ons Oplossings",
    journeyTitle: "Ons Reis",
    ctaTitle: "Gereed om Jou Plaas te Transformeer?", ctaText: "Sluit aan by honderde suksesvolle boere regoor Afrika wat Arbre Bio vertrou.", ctaBtn1: "Kry 'n Gratis Konsultasie", ctaBtn2: "Gesels op WhatsApp",
    stats: ["Projekte Voltooi", "Afrika Lande", "Hektaar Geoptimaliseer", "Gemiddelde Water Besparing"]
  }
};

// ─── PROJECTS PAGE ───────────────────────────────────────────
const projects = {
  en: {
    meta: { title: "Agricultural Projects Across Africa | Arbre Bio Africa", description: "Discover our portfolio of successful agricultural projects — greenhouses, precision irrigation, smart farming across Côte d'Ivoire, Ghana, Burkina Faso, Zimbabwe and Kenya." },
    hero: { title: "Our Projects", subtitle: "Transforming African Agriculture — One Project at a Time" },
    stats: ["Projects Completed", "African Countries", "Hectares Under Management", "Client Satisfaction"],
    sectionTitle: "Featured Projects",
    ctaTitle: "Ready to Start Your Project?", ctaText: "Contact us today for expert consultation and project planning.", ctaBtn1: "Get Started", ctaBtn2: "Chat on WhatsApp",
    items: [
      { title: "PDC2V Greenhouse Project", location: "Abidjan (Brofodoumé), Côte d'Ivoire", area: "1 hectare", type: "PDC2V Beneficiary Program", description: "Construction of two tropical greenhouses (Sawtooth) of 500 m² each + drip irrigation system for producing Bell Pepper, tomato and all types of vegetable crops.", stats: [["Greenhouse Area","1,000 m²"],["Expected Production","50 tons/year"],["Water Efficiency","70%"]] },
      { title: "Greenhouse Project", location: "Bulawayo, Zimbabwe", area: "10 hectares", type: "Commercial Farm", description: "State-of-the-art greenhouse facility producing premium vegetables for local and export markets.", stats: [["Annual Production","3,000 tons"],["Water Savings","65%"],["Employment","200+ jobs"]] },
      { title: "Smart Irrigation Project", location: "Yamoussoukro, Côte d'Ivoire", area: "5 hectares", type: "Government-sponsored initiative", description: "Comprehensive water system integration including water tank installation and management systems.", stats: [["Water Efficiency","85%"],["Yield Increase","40%"],["ROI Period","2 years"]] },
      { title: "UN-FAO NETHOUSE Project", location: "Burkina Faso", area: "2 hectares", type: "UN-OPS / FAO Project", description: "Advanced research facility focusing on sustainable farming practices and crop optimization.", stats: [["Research Projects","15+"],["Partner Institutions","8"],["Training Programs","12/year"]] }
    ]
  },
  fr: {
    meta: { title: "Projets Agricoles à Travers l'Afrique | Arbre Bio Africa", description: "Découvrez notre portefeuille de projets agricoles réussis — serres, irrigation de précision et agriculture intelligente en Côte d'Ivoire, Ghana, Burkina Faso, Zimbabwe et Kenya." },
    hero: { title: "Nos Projets", subtitle: "Transformer l'Agriculture Africaine — Un Projet à la Fois" },
    stats: ["Projets Réalisés", "Pays Africains", "Hectares Gérés", "Satisfaction Client"],
    sectionTitle: "Projets en Vedette",
    ctaTitle: "Prêt à Démarrer Votre Projet ?", ctaText: "Contactez-nous dès aujourd'hui pour une consultation d'experts et une planification de projet.", ctaBtn1: "Démarrer", ctaBtn2: "Discuter sur WhatsApp",
    items: [
      { title: "Projet Serre PDC2V", location: "Abidjan (Brofodoumé), Côte d'Ivoire", area: "1 hectare", type: "Programme Bénéficiaire PDC2V", description: "Construction de deux serres tropicales (Sawtooth) de 500 m² chacune + système d'irrigation goutte-à-goutte pour la production de poivrons, tomates et cultures maraîchères.", stats: [["Surface de Serre","1 000 m²"],["Production Attendue","50 tonnes/an"],["Efficacité Eau","70%"]] },
      { title: "Projet Serre", location: "Bulawayo, Zimbabwe", area: "10 hectares", type: "Ferme Commerciale", description: "Installation de serre ultramoderne produisant des légumes premium pour les marchés locaux et d'exportation.", stats: [["Production Annuelle","3 000 tonnes"],["Économies d'Eau","65%"],["Emplois Créés","200+"]] },
      { title: "Projet Irrigation Intelligente", location: "Yamoussoukro, Côte d'Ivoire", area: "5 hectares", type: "Initiative gouvernementale", description: "Intégration complète de système d'eau incluant l'installation de réservoirs et des systèmes de gestion.", stats: [["Efficacité Eau","85%"],["Augmentation Rendement","40%"],["Période de ROI","2 ans"]] },
      { title: "Projet NETHOUSE ONU-FAO", location: "Burkina Faso", area: "2 hectares", type: "Projet UN-OPS / FAO", description: "Centre de recherche avancé axé sur les pratiques agricoles durables et l'optimisation des cultures.", stats: [["Projets de Recherche","15+"],["Institutions Partenaires","8"],["Programmes de Formation","12/an"]] }
    ]
  },
  es: {
    meta: { title: "Proyectos Agrícolas en Toda África | Arbre Bio Africa", description: "Descubre nuestra cartera de proyectos agrícolas exitosos — invernaderos, riego de precisión y agricultura inteligente en Costa de Marfil, Ghana, Burkina Faso, Zimbabwe y Kenia." },
    hero: { title: "Nuestros Proyectos", subtitle: "Transformando la Agricultura Africana — Un Proyecto a la Vez" },
    stats: ["Proyectos Completados", "Países Africanos", "Hectáreas en Gestión", "Satisfacción del Cliente"],
    sectionTitle: "Proyectos Destacados",
    ctaTitle: "¿Listo para Iniciar tu Proyecto?", ctaText: "Contáctanos hoy para consultoría experta y planificación de proyectos.", ctaBtn1: "Comenzar", ctaBtn2: "Chatear en WhatsApp",
    items: [
      { title: "Proyecto Invernadero PDC2V", location: "Abiyán (Brofodoumé), Costa de Marfil", area: "1 hectárea", type: "Programa Beneficiario PDC2V", description: "Construcción de dos invernaderos tropicales (Sawtooth) de 500 m² cada uno + sistema de riego por goteo para la producción de pimientos, tomates y todo tipo de cultivos hortícolas.", stats: [["Área de Invernadero","1.000 m²"],["Producción Esperada","50 ton/año"],["Eficiencia del Agua","70%"]] },
      { title: "Proyecto Invernadero", location: "Bulawayo, Zimbabue", area: "10 hectáreas", type: "Granja Comercial", description: "Instalación de invernadero de última generación que produce verduras premium para los mercados locales y de exportación.", stats: [["Producción Anual","3.000 toneladas"],["Ahorro de Agua","65%"],["Empleo","200+ puestos"]] },
      { title: "Proyecto de Riego Inteligente", location: "Yamoussoukro, Costa de Marfil", area: "5 hectáreas", type: "Iniciativa gubernamental", description: "Integración completa del sistema de agua, incluyendo la instalación de tanques y sistemas de gestión.", stats: [["Eficiencia del Agua","85%"],["Aumento del Rendimiento","40%"],["Período de ROI","2 años"]] },
      { title: "Proyecto NETHOUSE ONU-FAO", location: "Burkina Faso", area: "2 hectáreas", type: "Proyecto UN-OPS / FAO", description: "Instalación de investigación avanzada centrada en prácticas agrícolas sostenibles y optimización de cultivos.", stats: [["Proyectos de Investigación","15+"],["Instituciones Asociadas","8"],["Programas de Capacitación","12/año"]] }
    ]
  },
  af: {
    meta: { title: "Landbouprojekte Regoor Afrika | Arbre Bio Africa", description: "Ontdek ons portefeulje van suksesvolle landbouprojekte — kweekhuise, presisiebesproeiing en slim boerdery in Ivoorkus, Ghana, Burkina Faso, Zimbabwe en Kenia." },
    hero: { title: "Ons Projekte", subtitle: "Transformeer Afrika se Landbou — Een Projek op 'n Slag" },
    stats: ["Projekte Voltooi", "Afrika Lande", "Hektaar Bestuur", "Kliënttevredenheid"],
    sectionTitle: "Uitgestalde Projekte",
    ctaTitle: "Gereed om Jou Projek te Begin?", ctaText: "Kontak ons vandag vir deskundige konsultasie en projekbeplanning.", ctaBtn1: "Begin", ctaBtn2: "Gesels op WhatsApp",
    items: [
      { title: "PDC2V Kwekhuis Projek", location: "Abidjan (Brofodoumé), Ivoorkus", area: "1 hektaar", type: "PDC2V Begunstigde Program", description: "Bou van twee tropiese kweekhuise (Sawtooth) van 500 m² elk + drup besproeiing stelsel vir die produksie van soetrissies, tamaties en alle groentesoorte.", stats: [["Kwekhuis Oppervlak","1 000 m²"],["Verwagte Produksie","50 ton/jaar"],["Water Doeltreffendheid","70%"]] },
      { title: "Kwekhuis Projek", location: "Bulawayo, Zimbabwe", area: "10 hektaar", type: "Kommersiële Plaas", description: "Moderne kwekhuis fasiliteit wat premium groente produseer vir plaaslike en uitvoermarkte.", stats: [["Jaarlikse Produksie","3 000 ton"],["Water Besparing","65%"],["Indiensneming","200+"]] },
      { title: "Slim Besproeiing Projek", location: "Yamoussoukro, Ivoorkus", area: "5 hektaar", type: "Regeringsgedrewe inisiatief", description: "Omvattende watertelsel integrasie insluitend watertenkinstallasie en bestuurstelsels.", stats: [["Water Doeltreffendheid","85%"],["Opbrengs Toename","40%"],["ROI Tydperk","2 jaar"]] },
      { title: "ONU-FAO NETHOUSE Projek", location: "Burkina Faso", area: "2 hektaar", type: "UN-OPS / FAO Projek", description: "Gevorderde navorsingsfasiliteit wat fokus op volhoubare boerdery praktyke en gewas optimalisering.", stats: [["Navorsingsprojekte","15+"],["Vennoot Instellings","8"],["Opleidingsprogramme","12/jaar"]] }
    ]
  }
};

// ─── SOLUTIONS PAGE ──────────────────────────────────────────
const solutions = {
  en: {
    meta: { title: "Our Agricultural Solutions | Arbre Bio Africa", description: "Comprehensive precision farming solutions for Africa: high-tech greenhouses, precision irrigation, premium substrates and digital farming tools." },
    hero: { title: "Our Solutions", subtitle: "Comprehensive Agricultural Solutions Designed for African Conditions" },
    categories: [
      { title: "Protected Farming Solutions", subtitle: "Climate-smart greenhouse technology for year-round production", description: "Our greenhouse solutions are specifically engineered for African climate conditions, enabling farmers to grow high-value crops year-round while protecting against extreme weather, pests, and diseases.", benefits: ["Up to 10x higher yields vs open-field farming","Year-round production regardless of weather","Significant reduction in water usage","90% reduction in pesticide use"], link: "/greenhouses" },
      { title: "Water Management Solutions", subtitle: "Precision irrigation technology for optimal water efficiency", description: "Our irrigation solutions help African farmers maximize crop yields while conserving precious water resources. From simple drip systems to advanced automated solutions.", benefits: ["Up to 60% reduction in water usage","Increased crop yields through precision delivery","Reduced labor costs through automation","Adaptable to all farm sizes"], link: "/irrigation" },
      { title: "Growing Substrate Solutions", subtitle: "Premium substrates for optimal plant growth and development", description: "Our premium growing media products provide the perfect environment for plant roots, ensuring optimal water retention, aeration, and nutrient availability.", benefits: ["100% organic and certified","8x better water retention vs soil","pH-balanced for optimal nutrition","Suitable for all crop types"], link: "/substrates" }
    ],
    ctaTitle: "Ready to Transform Your Farm?", ctaText: "Contact us today for a free consultation.", ctaBtn: "Get a Free Consultation"
  },
  fr: {
    meta: { title: "Nos Solutions Agricoles | Arbre Bio Africa", description: "Solutions complètes d'agriculture de précision pour l'Afrique : serres high-tech, irrigation de précision, substrats premium et outils d'agriculture digitale." },
    hero: { title: "Nos Solutions", subtitle: "Solutions Agricoles Complètes Conçues pour les Conditions Africaines" },
    categories: [
      { title: "Solutions de Culture Protégée", subtitle: "Technologie de serre intelligente pour une production annuelle", description: "Nos solutions de serres sont spécifiquement conçues pour les conditions climatiques africaines, permettant aux agriculteurs de cultiver des cultures à forte valeur ajoutée toute l'année tout en les protégeant contre les intempéries, les nuisibles et les maladies.", benefits: ["Rendements jusqu'à 10 fois supérieurs","Production toute l'année quelle que soit la météo","Réduction significative de l'utilisation d'eau","Réduction de 90% des pesticides"], link: "/fr/greenhouses" },
      { title: "Solutions de Gestion de l'Eau", subtitle: "Technologie d'irrigation de précision pour une efficacité optimale", description: "Nos solutions d'irrigation aident les agriculteurs africains à maximiser les rendements tout en préservant les précieuses ressources en eau. Des systèmes goutte-à-goutte simples aux solutions automatisées avancées.", benefits: ["Jusqu'à 60% de réduction de l'utilisation d'eau","Rendements accrus grâce à une livraison précise","Réduction des coûts de main-d'œuvre par l'automatisation","Adaptable à toutes les tailles de ferme"], link: "/fr/irrigation" },
      { title: "Solutions de Substrats de Culture", subtitle: "Substrats premium pour une croissance et un développement optimaux", description: "Nos produits de milieux de culture premium offrent l'environnement parfait pour les racines des plantes, assurant une rétention d'eau, une aération et une disponibilité des nutriments optimales.", benefits: ["100% biologique et certifié","8x meilleure rétention d'eau vs sol","pH équilibré pour une nutrition optimale","Adapté à tous les types de cultures"], link: "/fr/substrates" }
    ],
    ctaTitle: "Prêt à Transformer Votre Ferme ?", ctaText: "Contactez-nous aujourd'hui pour une consultation gratuite.", ctaBtn: "Obtenir une Consultation Gratuite"
  },
  es: {
    meta: { title: "Nuestras Soluciones Agrícolas | Arbre Bio Africa", description: "Soluciones integrales de agricultura de precisión para África: invernaderos de alta tecnología, riego de precisión, sustratos premium y herramientas de agricultura digital." },
    hero: { title: "Nuestras Soluciones", subtitle: "Soluciones Agrícolas Integrales Diseñadas para las Condiciones Africanas" },
    categories: [
      { title: "Soluciones de Cultivo Protegido", subtitle: "Tecnología de invernadero inteligente para producción anual", description: "Nuestras soluciones de invernadero están específicamente diseñadas para las condiciones climáticas africanas, permitiendo a los agricultores cultivar cultivos de alto valor durante todo el año.", benefits: ["Rendimientos hasta 10 veces mayores","Producción anual independientemente del clima","Reducción significativa del uso del agua","Reducción del 90% en el uso de pesticidas"], link: "/es/greenhouses" },
      { title: "Soluciones de Gestión del Agua", subtitle: "Tecnología de riego de precisión para eficiencia hídrica óptima", description: "Nuestras soluciones de riego ayudan a los agricultores africanos a maximizar los rendimientos mientras conservan los preciosos recursos hídricos.", benefits: ["Hasta 60% de reducción en el uso de agua","Mayores rendimientos a través de entrega de precisión","Reducción de costos laborales mediante automatización","Adaptable a todos los tamaños de granja"], link: "/es/irrigation" },
      { title: "Soluciones de Sustratos de Cultivo", subtitle: "Sustratos premium para crecimiento y desarrollo óptimo de plantas", description: "Nuestros productos de medios de cultivo premium brindan el ambiente perfecto para las raíces de las plantas, asegurando retención de agua, aireación y disponibilidad de nutrientes óptimas.", benefits: ["100% orgánico y certificado","8x mejor retención de agua vs suelo","pH equilibrado para nutrición óptima","Adecuado para todo tipo de cultivos"], link: "/es/substrates" }
    ],
    ctaTitle: "¿Listo para Transformar tu Granja?", ctaText: "Contáctanos hoy para una consulta gratuita.", ctaBtn: "Obtener una Consulta Gratuita"
  },
  af: {
    meta: { title: "Ons Landbou Oplossings | Arbre Bio Africa", description: "Omvattende presisieboerdery oplossings vir Afrika: hoë-tegnologie kweekhuise, presisiebesproeiing, premium substrate en digitale boerdery gereedskap." },
    hero: { title: "Ons Oplossings", subtitle: "Omvattende Landbou Oplossings Ontwerp vir Afrika se Toestande" },
    categories: [
      { title: "Beskermde Boerdery Oplossings", subtitle: "Slim kwekhuis tegnologie vir jaarrondse produksie", description: "Ons kwekhuis oplossings is spesifiek ontwerp vir Afrika se klimaattoestande, wat boere in staat stel om hoëwaarde gewasse die hele jaar deur te groei.", benefits: ["Tot 10x hoër opbrengste vs oopveldboerdery","Jaarrondse produksie ongeag die weer","Beduidende vermindering in watergebruik","90% vermindering in plaagdodergebruik"], link: "/af/greenhouses" },
      { title: "Waterbestuur Oplossings", subtitle: "Presisie besproeiing tegnologie vir optimale watereffektiwiteit", description: "Ons besproeiing oplossings help Afrika se boere om gewasopbrengste te maksimeer terwyl hulle kosbare waterbronne bewaar.", benefits: ["Tot 60% vermindering in watergebruik","Verhoogde gewasopbrengste deur presisie aflewering","Verminderde arbeidskoste deur outomatisering","Aanpasbaar vir alle plaasgroottes"], link: "/af/greenhouses" },
      { title: "Groei Substraat Oplossings", subtitle: "Premium substrate vir optimale plant groei en ontwikkeling", description: "Ons premium groeimedia produkte bied die perfekte omgewing vir plantwortels, wat optimale waterretensie, belugting en voedingstofbeskikbaarheid verseker.", benefits: ["100% organies en gesertifiseer","8x beter waterretensie vs grond","pH-gebalanseer vir optimale voeding","Geskik vir alle gewastipes"], link: "/af/substrates" }
    ],
    ctaTitle: "Gereed om Jou Plaas te Transformeer?", ctaText: "Kontak ons vandag vir 'n gratis konsultasie.", ctaBtn: "Kry 'n Gratis Konsultasie"
  }
};

// ─── CONTACT PAGE ────────────────────────────────────────────
const contact = {
  en: {
    meta: { title: "Contact Us — Arbre Bio Africa", description: "Contact Arbre Bio Africa for expert consultation on precision agriculture, greenhouse technology and irrigation systems." },
    hero: { title: "Contact Us", subtitle: "Get expert advice on transforming your agricultural business" },
    formTitle: "Send Us a Message",
    fields: { firstName: "First Name", lastName: "Last Name", email: "Email Address", phone: "Phone Number", interest: "I'm interested in", message: "Message", submit: "Send Message" },
    interests: ["Greenhouses","Precision Irrigation","Substrates & Growing Media","Digital Farming","General Consultation","Partnership"],
    placeholder: "Tell us about your project, crops and goals...",
    officesTitle: "Our Offices", abidjanTitle: "Abidjan Office", capetownTitle: "Cape Town Warehouse",
    whatsappTitle: "Need Immediate Assistance?", whatsappText: "Chat directly with our agricultural experts on WhatsApp for fast support.",
    whatsappBtn: "Chat on WhatsApp", followTitle: "Follow Us"
  },
  fr: {
    meta: { title: "Nous Contacter — Arbre Bio Africa", description: "Contactez Arbre Bio Africa pour une consultation d'experts sur l'agriculture de précision, les serres et les systèmes d'irrigation." },
    hero: { title: "Nous Contacter", subtitle: "Obtenez des conseils d'experts pour transformer votre activité agricole" },
    formTitle: "Envoyez-Nous un Message",
    fields: { firstName: "Prénom", lastName: "Nom", email: "Adresse Email", phone: "Numéro de Téléphone", interest: "Je suis intéressé par", message: "Message", submit: "Envoyer le Message" },
    interests: ["Serres","Irrigation de Précision","Substrats & Milieux de Culture","Agriculture Digitale","Consultation Générale","Partenariat"],
    placeholder: "Parlez-nous de votre projet, vos cultures et vos objectifs...",
    officesTitle: "Nos Bureaux", abidjanTitle: "Bureau d'Abidjan", capetownTitle: "Entrepôt du Cap",
    whatsappTitle: "Besoin d'Aide Immédiate ?", whatsappText: "Discutez directement avec nos experts agricoles sur WhatsApp pour un support rapide.",
    whatsappBtn: "Discuter sur WhatsApp", followTitle: "Suivez-Nous"
  },
  es: {
    meta: { title: "Contáctanos — Arbre Bio Africa", description: "Contacta Arbre Bio Africa para consultoría experta en agricultura de precisión, tecnología de invernaderos y sistemas de riego." },
    hero: { title: "Contáctanos", subtitle: "Obtén asesoramiento experto para transformar tu negocio agrícola" },
    formTitle: "Envíanos un Mensaje",
    fields: { firstName: "Nombre", lastName: "Apellido", email: "Dirección de Email", phone: "Número de Teléfono", interest: "Estoy interesado en", message: "Mensaje", submit: "Enviar Mensaje" },
    interests: ["Invernaderos","Riego de Precisión","Sustratos & Medios de Cultivo","Agricultura Digital","Consulta General","Alianza"],
    placeholder: "Cuéntanos sobre tu proyecto, cultivos y objetivos...",
    officesTitle: "Nuestras Oficinas", abidjanTitle: "Oficina de Abiyán", capetownTitle: "Almacén de Ciudad del Cabo",
    whatsappTitle: "¿Necesitas Ayuda Inmediata?", whatsappText: "Chatea directamente con nuestros expertos agrícolas en WhatsApp para soporte rápido.",
    whatsappBtn: "Chatear en WhatsApp", followTitle: "Síguenos"
  },
  af: {
    meta: { title: "Kontak Ons — Arbre Bio Africa", description: "Kontak Arbre Bio Africa vir deskundige konsultasie oor presisieboerdery, kwekhuistegnologie en besproeiingstelsels." },
    hero: { title: "Kontak Ons", subtitle: "Kry deskundige advies om jou landboubesigheid te transformeer" },
    formTitle: "Stuur Vir Ons 'n Boodskap",
    fields: { firstName: "Voornaam", lastName: "Van", email: "E-posadres", phone: "Telefoonnommer", interest: "Ek stel belang in", message: "Boodskap", submit: "Stuur Boodskap" },
    interests: ["Kweekhuise","Presisie Besproeiing","Substrate & Groeimedia","Digitale Boerdery","Algemene Konsultasie","Vennootskap"],
    placeholder: "Vertel ons van jou projek, gewasse en doelwitte...",
    officesTitle: "Ons Kantore", abidjanTitle: "Abidjan Kantoor", capetownTitle: "Kaapstad Pakhuis",
    whatsappTitle: "Benodig Onmiddellike Hulp?", whatsappText: "Gesels direk met ons landboukundiges op WhatsApp vir vinnige ondersteuning.",
    whatsappBtn: "Gesels op WhatsApp", followTitle: "Volg Ons"
  }
};

// ─── BLOG PAGE ───────────────────────────────────────────────
const blog = {
  en: {
    meta: { title: "Blog & Knowledge Hub | Arbre Bio Africa", description: "Expert insights, practical guides and latest innovations for modern African agriculture. Greenhouses, precision irrigation, digital farming and more." },
    hero: { title: "Blog & Knowledge Hub", subtitle: "Expert insights and practical guides for modern African agriculture" },
    featuredTitle: "Featured Articles", latestTitle: "Latest Articles",
    readMore: "Read More", by: "By", newsletterTitle: "Stay Updated",
    newsletterText: "Subscribe to our newsletter for the latest agricultural insights and tips.",
    newsletterPlaceholder: "Your email address", subscribe: "Subscribe"
  },
  fr: {
    meta: { title: "Blog & Centre de Connaissances | Arbre Bio Africa", description: "Conseils d'experts, guides pratiques et dernières innovations pour l'agriculture africaine moderne. Serres, irrigation de précision, agriculture digitale et plus encore." },
    hero: { title: "Blog & Centre de Connaissances", subtitle: "Conseils d'experts et guides pratiques pour l'agriculture africaine moderne" },
    featuredTitle: "Articles en Vedette", latestTitle: "Derniers Articles",
    readMore: "Lire la Suite", by: "Par", newsletterTitle: "Restez Informé",
    newsletterText: "Abonnez-vous à notre newsletter pour les dernières informations agricoles et conseils.",
    newsletterPlaceholder: "Votre adresse email", subscribe: "S'abonner"
  },
  es: {
    meta: { title: "Blog y Centro de Conocimiento | Arbre Bio Africa", description: "Consejos de expertos, guías prácticas y últimas innovaciones para la agricultura africana moderna." },
    hero: { title: "Blog y Centro de Conocimiento", subtitle: "Consejos de expertos y guías prácticas para la agricultura africana moderna" },
    featuredTitle: "Artículos Destacados", latestTitle: "Últimos Artículos",
    readMore: "Leer Más", by: "Por", newsletterTitle: "Mantente Actualizado",
    newsletterText: "Suscríbete a nuestro boletín para obtener los últimos conocimientos y consejos agrícolas.",
    newsletterPlaceholder: "Tu dirección de email", subscribe: "Suscribirse"
  },
  af: {
    meta: { title: "Blog & Kennissentrum | Arbre Bio Africa", description: "Deskundige insigte, praktiese gidse en nuutste innovasies vir moderne Afrika landbou." },
    hero: { title: "Blog & Kennissentrum", subtitle: "Deskundige insigte en praktiese gidse vir moderne Afrika landbou" },
    featuredTitle: "Uitstaande Artikels", latestTitle: "Nuutste Artikels",
    readMore: "Lees Meer", by: "Deur", newsletterTitle: "Bly Op Hoogte",
    newsletterText: "Teken in op ons nuusbrief vir die nuutste landbou-insigte en wenke.",
    newsletterPlaceholder: "Jou e-posadres", subscribe: "Teken In"
  }
};

// ─── TIMELINE (shared between about/company) ─────────────────
const timeline = {
  en: [
    { year: 2020, event: "Arbre Bio Founded", description: "Founded in Abidjan, Côte d'Ivoire by Sydney Abouna with a bold vision to transform African agriculture through precision farming", icon: "🌱" },
    { year: 2021, event: "First Major Greenhouse Project", description: "Delivered our first large-scale greenhouse installation, setting the standard for modern agriculture in Côte d'Ivoire", icon: "🏗️" },
    { year: 2022, event: "Strategic Partnerships", description: "Key partnerships signed with AZUD, Hortalan, World Bank, GIZ and the Ivorian Ministry of Agriculture", icon: "🤝" },
    { year: 2023, event: "Pan-African Expansion", description: "Expanded to 5 African countries completing 500+ projects across Côte d'Ivoire, Ghana, Burkina Faso, Zimbabwe and Kenya", icon: "🚀" },
    { year: 2024, event: "Digital Farming Launch", description: "Launched smart farming solutions with IoT monitoring and AI-powered analytics for modern farm management", icon: "💻" },
    { year: 2025, event: "Hortalan Joint Venture", description: "Establishing a landmark joint venture with Hortalan to open their first branch in Côte d'Ivoire", icon: "🏆" }
  ],
  fr: [
    { year: 2020, event: "Fondation d'Arbre Bio", description: "Fondée à Abidjan, Côte d'Ivoire par Sydney Abouna avec une vision audacieuse de transformer l'agriculture africaine par l'agriculture de précision", icon: "🌱" },
    { year: 2021, event: "Premier Grand Projet de Serre", description: "Réalisation de notre première installation de serre à grande échelle, établissant la norme pour l'agriculture moderne en Côte d'Ivoire", icon: "🏗️" },
    { year: 2022, event: "Partenariats Stratégiques", description: "Partenariats clés signés avec AZUD, Hortalan, la Banque Mondiale, la GIZ et le Ministère ivoirien de l'Agriculture", icon: "🤝" },
    { year: 2023, event: "Expansion Pan-Africaine", description: "Expansion dans 5 pays africains avec 500+ projets réalisés en Côte d'Ivoire, Ghana, Burkina Faso, Zimbabwe et Kenya", icon: "🚀" },
    { year: 2024, event: "Lancement Agriculture Digitale", description: "Lancement de solutions d'agriculture intelligente avec surveillance IoT et analytique pilotée par IA", icon: "💻" },
    { year: 2025, event: "Joint-Venture Hortalan", description: "Établissement d'une joint-venture avec Hortalan pour ouvrir leur première agence en Côte d'Ivoire", icon: "🏆" }
  ],
  es: [
    { year: 2020, event: "Fundación de Arbre Bio", description: "Fundada en Abiyán, Costa de Marfil por Sydney Abouna con una audaz visión de transformar la agricultura africana a través de la agricultura de precisión", icon: "🌱" },
    { year: 2021, event: "Primer Gran Proyecto de Invernadero", description: "Entregamos nuestra primera instalación de invernadero a gran escala, estableciendo el estándar para la agricultura moderna en Costa de Marfil", icon: "🏗️" },
    { year: 2022, event: "Alianzas Estratégicas", description: "Alianzas clave firmadas con AZUD, Hortalan, el Banco Mundial, GIZ y el Ministerio de Agricultura de Costa de Marfil", icon: "🤝" },
    { year: 2023, event: "Expansión Panafricana", description: "Expansión a 5 países africanos completando 500+ proyectos en Costa de Marfil, Ghana, Burkina Faso, Zimbabue y Kenia", icon: "🚀" },
    { year: 2024, event: "Lanzamiento de Agricultura Digital", description: "Lanzamiento de soluciones de agricultura inteligente con monitoreo IoT y análisis basados en IA", icon: "💻" },
    { year: 2025, event: "Empresa Conjunta con Hortalan", description: "Establecimiento de una empresa conjunta con Hortalan para abrir su primera sucursal en Costa de Marfil", icon: "🏆" }
  ],
  af: [
    { year: 2020, event: "Arbre Bio Gestig", description: "Gestig in Abidjan, Ivoorkus deur Sydney Abouna met 'n gedurfdede visie om Afrika se landbou deur presisieboerdery te transformeer", icon: "🌱" },
    { year: 2021, event: "Eerste Groot Kwekhuis Projek", description: "Ons eerste grootskaalse kwekhuisinstallasie gelewer, die standaard vir moderne landbou in Ivoorkus gestel", icon: "🏗️" },
    { year: 2022, event: "Strategiese Vennootskappe", description: "Sleutelvennootskappe onderteken met AZUD, Hortalan, die Wêreldbank, GIZ en die Ivoorkus Ministerie van Landbou", icon: "🤝" },
    { year: 2023, event: "Pan-Afrika Uitbreiding", description: "Uitgebrei na 5 Afrika-lande met 500+ voltooide projekte in Ivoorkus, Ghana, Burkina Faso, Zimbabwe en Kenia", icon: "🚀" },
    { year: 2024, event: "Digitale Boerdery Bekendstelling", description: "Slim boerdery oplossings bekendgestel met IoT monitering en KI-gedrewe analitiek vir moderne plaasbestuur", icon: "💻" },
    { year: 2025, event: "Hortalan Gesamentlike Onderneming", description: "Stigting van 'n toonaangewende gesamentlike onderneming met Hortalan om hul eerste tak in Ivoorkus te open", icon: "🏆" }
  ]
};

// ─── LEGAL PAGES ─────────────────────────────────────────────
const legal = {
  en: {
    terms: { title: "Terms of Service", subtitle: "Please read these terms carefully before using our services." },
    privacy: { title: "Privacy Policy", subtitle: "How we collect, use and protect your personal information." },
    cookies: { title: "Cookie Policy", subtitle: "How we use cookies to improve your experience." },
    note: "This document is available in English. For questions, please contact us at farms@arbrebio.com"
  },
  fr: {
    terms: { title: "Conditions d'Utilisation", subtitle: "Veuillez lire attentivement ces conditions avant d'utiliser nos services." },
    privacy: { title: "Politique de Confidentialité", subtitle: "Comment nous collectons, utilisons et protégeons vos informations personnelles." },
    cookies: { title: "Politique de Cookies", subtitle: "Comment nous utilisons les cookies pour améliorer votre expérience." },
    note: "Ce document est disponible en anglais. Pour toute question, contactez-nous à farms@arbrebio.com"
  },
  es: {
    terms: { title: "Términos de Servicio", subtitle: "Por favor lea estos términos cuidadosamente antes de usar nuestros servicios." },
    privacy: { title: "Política de Privacidad", subtitle: "Cómo recopilamos, usamos y protegemos su información personal." },
    cookies: { title: "Política de Cookies", subtitle: "Cómo usamos las cookies para mejorar su experiencia." },
    note: "Este documento está disponible en inglés. Para preguntas, contáctenos en farms@arbrebio.com"
  },
  af: {
    terms: { title: "Diensbepalings", subtitle: "Lees asseblief hierdie bepalings noukeurig deur voordat u ons dienste gebruik." },
    privacy: { title: "Privaatheidsbeleid", subtitle: "Hoe ons u persoonlike inligting insamel, gebruik en beskerm." },
    cookies: { title: "Koekiesbeleid", subtitle: "Hoe ons koekies gebruik om u ervaring te verbeter." },
    note: "Hierdie dokument is in Engels beskikbaar. Vir vrae, kontak ons by farms@arbrebio.com"
  }
};

// ─── MAIN EXPORT ─────────────────────────────────────────────
export const T = { about, company, projects, solutions, contact, blog, timeline, legal };

export function pt(lang: Lang) {
  const l = (SUPPORTED_LANGS.includes(lang) ? lang : 'en') as Lang;
  return {
    about: T.about[l],
    company: T.company[l],
    projects: T.projects[l],
    solutions: T.solutions[l],
    contact: T.contact[l],
    blog: T.blog[l],
    timeline: T.timeline[l],
    legal: T.legal[l],
  };
}
