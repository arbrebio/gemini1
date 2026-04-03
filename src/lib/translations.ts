// ================================================================
// ARBRE BIO AFRICA — COMPLETE SITE TRANSLATIONS
// EN / FR / ES / AF — every page, every string
// Used by [lang] dynamic pages — lang param selects the right set
// ================================================================

export type Lang = 'fr' | 'es' | 'af';

export interface SiteTranslations {
  // Global
  learnMore: string;
  getStarted: string;
  exploreSolutions: string;
  freeConsultation: string;
  chatWhatsApp: string;
  requestQuote: string;
  readMore: string;
  byAuthor: string;
  subscribe: string;
  enterEmail: string;
  sendMessage: string;
  workWithUs: string;
  whatsappDirect: string;
  viewProjects: string;
  startProject: string;
  getInTouch: string;

  // Nav
  navGreenhouses: string;
  navIrrigation: string;
  navSubstrates: string;
  navProjects: string;
  navCompany: string;
  navBlog: string;
  navContact: string;
  navHighTech: string;
  navAccessories: string;
  navDripSystems: string;
  navSprinklers: string;
  navControllers: string;
  navGrowingSolutions: string;

  // Home
  heroTitle: string;
  heroSubtitle: string;
  ourServices: string;
  servicesSubtitle: string;
  greenhouseServiceTitle: string;
  greenhouseServiceDesc: string;
  irrigationServiceTitle: string;
  irrigationServiceDesc: string;
  substratesServiceTitle: string;
  substratesServiceDesc: string;
  yieldIncrease: string;
  waterSavings: string;
  projectsCompleted: string;
  africanCountries: string;
  trustedPartners: string;
  partnersSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;

  // About
  aboutPageTitle: string;
  aboutPageSubtitle: string;
  theFounder: string;
  founderP1: string;
  founderP2: string;
  founderP3: string;
  founderP4: string;
  founderTitleCard: string;
  // About page - Leadership team (correct version)
  whoWeAre: string;
  whoWeAreText: string;
  ourMissionShort: string;
  ourMissionShortText: string;
  ourLeadership: string;
  ceoTitle: string;
  cooTitle: string;
  marketingTitle: string;
  ceoName: string;
  cooName: string;
  marketingName: string;
  ceoBio: string;
  cooBio: string;
  marketingBio: string;
  ourValues: string;
  value1Title: string;
  value1Desc: string;
  value2Title: string;
  value2Desc: string;
  value3Title: string;
  value3Desc: string;
  joinUsTitle: string;
  joinUsSubtitle: string;
  // Company page translations
  companyHeroTitle: string;
  companyHeroSubtitle: string;
  companyHeroTagline: string;
  companyMissionText: string;
  whatWeDo: string;
  gcTitle: string;
  gcDesc: string;
  piTitle: string;
  piDesc: string;
  gsTitle: string;
  gsDesc: string;
  ourMission: string;
  missionText: string;
  ourVision: string;
  visionText: string;
  ourJourney: string;
  y2020t: string; y2020d: string;
  y2021t: string; y2021d: string;
  y2022t: string; y2022d: string;
  y2023t: string; y2023d: string;
  y2024t: string; y2024d: string;
  y2025t: string; y2025d: string;
  readyTogether: string;
  readyTogetherSub: string;

  // Contact
  contactTitle: string;
  contactSubtitle: string;
  sendMessageTitle: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  interestedIn: string;
  selectOption: string;
  optGreenhouses: string;
  optIrrigation: string;
  optGrowing: string;
  optProjects: string;
  optOther: string;
  messageLabel: string;
  sendBtn: string;
  respondTime: string;
  successMsg: string;
  ourOffices: string;
  immediateAssistance: string;
  waChatExperts: string;

  // Projects
  projectsHeroTitle: string;
  projectsHeroSubtitle: string;
  projectsHeroDesc: string;
  hectaresMgmt: string;
  clientSatisfaction: string;
  featuredProjects: string;
  locationLabel: string;
  areaLabel: string;
  readyStart: string;
  readyStartSub: string;

  // Blog
  blogTitle: string;
  blogSubtitle: string;
  featuredArticles: string;
  latestArticles: string;
  stayUpdated: string;
  newsletterSub: string;

  // Solutions
  solutionsTitle: string;
  solutionsSubtitle: string;
  protectedFarming: string;
  protectedFarmingSub: string;
  protectedFarmingDesc: string;
  pfB1: string; pfB2: string; pfB3: string; pfB4: string;
  waterMgmt: string;
  waterMgmtSub: string;
  waterMgmtDesc: string;
  wmB1: string; wmB2: string; wmB3: string; wmB4: string;
  substrateSolutions: string;
  substrateSolutionsSub: string;
  substrateSolutionsDesc: string;
  ssB1: string; ssB2: string; ssB3: string; ssB4: string;

  // Greenhouses
  ghHeroTitle: string;
  ghHeroSub: string;
  ghTagline: string;
  viewSpecs: string;
  climateAdaptive: string;
  climateAdaptiveDesc: string;
  structuralDurability: string;
  structuralDurabilityDesc: string;
  advancedCoverage: string;
  advancedCoverageDesc: string;
  smartVentilation: string;
  smartVentilationDesc: string;
  techSpecs: string;
  whyChoose: string;
  stdWelded: string;
  boltLock: string;
  basicUV: string;
  smartFilm: string;

  // Irrigation
  irrHeroTitle: string;
  irrHeroSub: string;
  irrTagline: string;
  calculateSavings: string;
  dripTitle: string;
  dripDesc: string;
  sprinklerTitle: string;
  sprinklerDesc: string;
  fertigationTitle: string;
  fertigationDesc: string;
  digitalTitle: string;
  digitalDesc: string;
  waterTreatmentTitle: string;
  waterTreatmentDesc: string;
  caseStudy: string;

  // Substrates
  subHeroTitle: string;
  subHeroSub: string;
  subTagline: string;
  qualityAssured: string;
  qualityAssuredDesc: string;
  sustainable: string;
  sustainableDesc: string;
  expertSupport: string;
  expertSupportDesc: string;
  superiorWater: string;
  optimalAeration: string;
  phBalanced: string;
  organic100: string;

  // Success Stories
  ssHeroTitle: string;
  ssHeroSubtitle: string;
  ssHeroDesc: string;
  challenge: string;
  solution: string;
  results: string;
  whatClientSays: string;
  beforeLabel: string;
  afterLabel: string;
  transformFarm: string;
  joinFarmers: string;

  // Legal
  termsTitle: string;
  privacyTitle: string;
  cookiesTitle: string;
  legalNote: string;
  legalViewFull: string;
  legalContact: string;

  // Company page
  companyMission: string;
  exploreOurSolutions: string;
}

const FR: SiteTranslations = {
  learnMore: "En Savoir Plus",
  getStarted: "Commencer",
  exploreSolutions: "Explorer les Solutions",
  freeConsultation: "Obtenir une Consultation Gratuite",
  chatWhatsApp: "Discuter sur WhatsApp",
  requestQuote: "Demander un Devis Personnalisé",
  readMore: "Lire la Suite",
  byAuthor: "Par",
  subscribe: "S'abonner",
  enterEmail: "Entrez votre email",
  sendMessage: "Envoyer le Message",
  workWithUs: "Travailler avec Nous",
  whatsappDirect: "WhatsApp Direct",
  viewProjects: "Voir les Projets",
  startProject: "Démarrer Votre Projet",
  getInTouch: "Nous Contacter",

  navGreenhouses: "Serres",
  navIrrigation: "Irrigation",
  navSubstrates: "Substrats",
  navProjects: "Projets",
  navCompany: "Entreprise",
  navBlog: "Blog",
  navContact: "Contact",
  navHighTech: "Solutions High-Tech",
  navAccessories: "Accessoires",
  navDripSystems: "Systèmes Goutte-à-Goutte",
  navSprinklers: "Arroseurs",
  navControllers: "Contrôleurs",
  navGrowingSolutions: "Solutions de Culture",

  heroTitle: "Transformer l'Agriculture Africaine par l'Agriculture de Précision",
  heroSubtitle: "Augmentez vos rendements jusqu'à 10 fois avec notre technologie agricole moderne",
  ourServices: "Nos Services",
  servicesSubtitle: "Solutions agricoles complètes conçues pour les conditions africaines",
  greenhouseServiceTitle: "Serres High-Tech",
  greenhouseServiceDesc: "Solutions de serres de pointe optimisées pour les conditions climatiques africaines.",
  irrigationServiceTitle: "Irrigation de Précision",
  irrigationServiceDesc: "Systèmes d'irrigation intelligents qui maximisent l'efficacité de l'eau et les rendements des cultures.",
  substratesServiceTitle: "Solutions de Culture",
  substratesServiceDesc: "Fibre de coco premium et substrats pour une croissance et un développement optimaux des plantes.",
  yieldIncrease: "Augmentation du Rendement",
  waterSavings: "Économies d'Eau",
  projectsCompleted: "Projets Réalisés",
  africanCountries: "Pays Africains",
  trustedPartners: "Nos Partenaires de Confiance",
  partnersSubtitle: "Travailler ensemble avec des organisations leaders pour transformer l'agriculture africaine",
  ctaTitle: "Prêt à Transformer Votre Ferme ?",
  ctaSubtitle: "Rejoignez des centaines d'agriculteurs prospères à travers l'Afrique qui ont révolutionné leurs pratiques agricoles avec nos solutions.",

  aboutPageTitle: "À Propos d'Arbre Bio Africa",
  aboutPageSubtitle: "L'histoire derrière le leader de l'agriculture de précision en Afrique — construit depuis zéro à Abidjan, Côte d'Ivoire",
  theFounder: "La Fondatrice",
  founderP1: "Je suis Sydney Abouna. J'ai fondé Arbre Bio Africa, Arbre Bio Côte d'Ivoire et l'Organic Tree Group avec une vision claire : faire de l'Afrique le continent possédant l'écosystème agricole le plus avancé, productif et durable au monde.",
  founderP2: "J'ai construit cette entreprise de zéro — seule, gérant tout moi-même depuis les opérations et la gestion de projets jusqu'aux relations clients, au marketing et aux partenariats. Chaque serre que nous construisons, chaque système d'irrigation que nous installons, chaque agriculteur que nous aidons est le fruit d'un engagement personnel envers l'excellence et l'innovation.",
  founderP3: "Je cherche sans relâche les meilleures techniques agricoles du monde — les solutions les plus innovantes pour augmenter les rendements, améliorer la qualité alimentaire et rendre l'agriculture rentable et durable dans les conditions climatiques uniques de l'Afrique. Je ne crois pas que les agriculteurs africains devraient se contenter de méthodes dépassées quand la technologie de classe mondiale existe.",
  founderP4: "Aujourd'hui, Arbre Bio opère dans 5 pays africains avec 500+ projets réalisés, des partenariats avec la Banque Mondiale, la BAD, la GIZ, la FAO, le Ministère ivoirien de l'Agriculture et des entreprises agritech mondiales de premier plan. Nous ne faisons que commencer.",
  founderTitleCard: "Fondatrice & PDG — Arbre Bio Africa · Arbre Bio Côte d'Ivoire · Organic Tree Group",
  // Leadership team
  whoWeAre: "Qui Nous Sommes",
  whoWeAreText: "Arbre Bio Africa est un leader de l'innovation agricole, fournissant des solutions d'irrigation de précision, de serres et de substrats de culture biologique à travers l'Afrique. Notre engagement envers les pratiques agricoles durables et la technologie de pointe nous a positionnés à l'avant-garde de la transformation agricole dans la région.",
  ourMissionShort: "Notre Mission",
  ourMissionShortText: "Notre objectif est de transformer l'agriculture africaine en rendant les technologies agricoles modernes accessibles et durables pour chaque agriculteur à travers le continent.",
  ourLeadership: "Notre Direction",
  ceoTitle: "Directeur Général",
  cooTitle: "Directeur des Opérations",
  marketingTitle: "Responsable Stratégie Marketing",
  ceoName: "Lethabo Ndhlovu",
  cooName: "Sydney Abouna",
  marketingName: "Viviane BROU",
  ceoBio: "Avec plus de 25 ans d'expérience en ingénierie agricole et spécialisé dans l'agriculture intensive, Lethabo dirige notre mission de transformation de l'agriculture africaine.",
  cooBio: "Sydney apporte une expertise opérationnelle approfondie dans la gestion de projets agricoles à grande échelle à travers l'Afrique.",
  marketingBio: "Formée en hôtellerie, maintenant dans le marketing digital et le produit — focalisée sur l'aide aux clients pour se connecter aux produits avec clarté, empathie et passion pour la durabilité.",
  ourValues: "Nos Valeurs",
  value1Title: "Durabilité",
  value1Desc: "Engagés dans des pratiques agricoles respectueuses de l'environnement qui préservent les ressources naturelles pour les générations futures.",
  value2Title: "Innovation",
  value2Desc: "Avancer continuellement la technologie agricole pour apporter les meilleures solutions d'agriculture mondiale aux agriculteurs africains.",
  value3Title: "Partenariat",
  value3Desc: "Construire des relations solides et durables avec les agriculteurs, les institutions et les communautés à travers le continent.",
  joinUsTitle: "Rejoignez-Nous pour Transformer l'Agriculture Africaine",
  joinUsSubtitle: "Travaillons ensemble pour construire un avenir plus durable et productif pour l'agriculture.",
  // Company page
  companyHeroTitle: "Transformer l'Agriculture",
  companyHeroSubtitle: "Par l'Innovation",
  companyHeroTagline: "Autonomiser les agriculteurs à travers l'Afrique avec une technologie de pointe et des solutions durables.",
  companyMissionText: "Chez Arbre Bio Africa, nous sommes engagés à révolutionner l'agriculture grâce à une technologie innovante et des pratiques durables. Notre mission est d'autonomiser les agriculteurs avec des solutions qui augmentent la productivité tout en préservant les ressources naturelles.",
  whatWeDo: "Ce Que Nous Faisons",
  gcTitle: "Construction de Serres",
  gcDesc: "Serres sawtooth et tunnel haute technologie conçues pour les conditions tropicales africaines, avec contrôle climatique complet et irrigation goutte-à-goutte intégrée.",
  piTitle: "Irrigation de Précision",
  piDesc: "Systèmes goutte-à-goutte et d'aspersion intelligents qui économisent jusqu'à 60% d'eau tout en augmentant considérablement les rendements agricoles. Conçus et installés pour les fermes africaines.",
  gsTitle: "Solutions de Culture",
  gsDesc: "Substrats premium à base de coco peat et milieux de culture organiques pour la culture hydroponique et en sol de légumes et fruits à haut rendement.",
  ourMission: "Notre Mission",
  missionText: "Transformer l'agriculture africaine en donnant à chaque agriculteur accès aux meilleures technologies d'agriculture de précision au monde — augmenter les rendements, réduire les déchets et créer des systèmes alimentaires durables à travers le continent.",
  ourVision: "Notre Vision",
  visionText: "Être la n°1 des entreprises d'innovation agricole en Afrique — le nom le plus fiable pour la culture en serre moderne, l'irrigation de précision et les solutions d'agriculture intelligente d'Abidjan à Nairobi.",
  ourJourney: "Notre Parcours",
  y2020t: "Fondation à Abidjan", y2020d: "Sydney Abouna lance Arbre Bio Africa avec la mission de transformer l'agriculture à travers le continent.",
  y2021t: "Premier Grand Projet", y2021d: "Première installation de serre à grande échelle réalisée en Côte d'Ivoire, dépassant tous les objectifs de rendement.",
  y2022t: "Partenariats Stratégiques", y2022d: "Partenariats signés avec AZUD, Hortalan, Banque Mondiale, GIZ et le Ministère ivoirien de l'Agriculture.",
  y2023t: "Expansion Pan-Africaine", y2023d: "500+ projets réalisés dans 5 pays : Côte d'Ivoire, Ghana, Burkina Faso, Zimbabwe et Kenya.",
  y2024t: "Lancement Agriculture Digitale", y2024d: "Solutions d'agriculture intelligente alimentées par IoT et analytique IA déployées pour la gestion moderne des fermes.",
  y2025t: "Joint-Venture Hortalan", y2025d: "Établissement d'une joint-venture avec Hortalan pour ouvrir leur première agence en Côte d'Ivoire — une étape majeure pour l'agriculture ouest-africaine.",
  readyTogether: "Prêt à Travailler Ensemble ?",
  readyTogetherSub: "Que vous soyez agriculteur, investisseur, institution ou partenaire gouvernemental — nous voulons vous entendre.",

  contactTitle: "Nous Contacter",
  contactSubtitle: "Obtenez des conseils d'experts pour transformer votre activité agricole",
  sendMessageTitle: "Envoyez-Nous un Message",
  firstName: "Prénom",
  lastName: "Nom",
  emailAddress: "Adresse Email",
  phoneNumber: "Numéro de Téléphone",
  interestedIn: "Je suis intéressé par",
  selectOption: "Sélectionner une option",
  optGreenhouses: "Serres",
  optIrrigation: "Systèmes d'Irrigation",
  optGrowing: "Milieux de Culture",
  optProjects: "Gestion de Projet",
  optOther: "Autre",
  messageLabel: "Message",
  sendBtn: "Envoyer le Message",
  respondTime: "Nous répondrons dans les 24-48 heures",
  successMsg: "Merci pour votre message ! Nous vous répondrons bientôt.",
  ourOffices: "Nos Bureaux",
  immediateAssistance: "Besoin d'Aide Immédiate ?",
  waChatExperts: "Discutez avec nos experts agricoles sur WhatsApp pour des réponses rapides.",

  projectsHeroTitle: "Nos Projets",
  projectsHeroSubtitle: "Transformer l'Agriculture Africaine",
  projectsHeroDesc: "Découvrez notre portefeuille de projets agricoles réussis à travers l'Afrique",
  hectaresMgmt: "Hectares Gérés",
  clientSatisfaction: "Satisfaction Client",
  featuredProjects: "Projets en Vedette",
  locationLabel: "Localisation :",
  areaLabel: "Surface :",
  readyStart: "Prêt à Démarrer Votre Projet ?",
  readyStartSub: "Contactez-nous dès aujourd'hui pour une consultation d'experts et une planification de projet.",

  blogTitle: "Blog & Centre de Connaissances",
  blogSubtitle: "Conseils d'experts et guides pratiques pour l'agriculture africaine moderne",
  featuredArticles: "Articles en Vedette",
  latestArticles: "Derniers Articles",
  stayUpdated: "Restez Informé",
  newsletterSub: "Abonnez-vous à notre newsletter pour les dernières informations agricoles et conseils.",

  solutionsTitle: "Nos Solutions",
  solutionsSubtitle: "Solutions agricoles complètes conçues pour les conditions africaines",
  protectedFarming: "Solutions de Culture Protégée",
  protectedFarmingSub: "Technologie de serre intelligente pour une production annuelle",
  protectedFarmingDesc: "Nos solutions de serres sont spécifiquement conçues pour les conditions climatiques africaines, permettant aux agriculteurs de cultiver des cultures à forte valeur ajoutée toute l'année tout en les protégeant contre les intempéries, les nuisibles et les maladies.",
  pfB1: "Rendements jusqu'à 10 fois supérieurs à l'agriculture en plein champ",
  pfB2: "Production toute l'année quelle que soit la météo extérieure",
  pfB3: "Réduction significative de l'utilisation d'eau grâce à l'irrigation de précision",
  pfB4: "Protection contre les nuisibles et maladies, réduisant l'usage de pesticides jusqu'à 90%",
  waterMgmt: "Solutions de Gestion de l'Eau",
  waterMgmtSub: "Technologie d'irrigation de précision pour une efficacité optimale",
  waterMgmtDesc: "Nos solutions d'irrigation aident les agriculteurs africains à maximiser les rendements tout en préservant les précieuses ressources en eau. Des systèmes goutte-à-goutte simples aux solutions automatisées avancées, nous fournissons une technologie qui augmente l'efficacité et réduit les coûts.",
  wmB1: "Jusqu'à 60% de réduction de l'utilisation d'eau par rapport aux méthodes traditionnelles",
  wmB2: "Rendements accrus grâce à une livraison précise de l'eau et des nutriments",
  wmB3: "Réduction des coûts de main-d'œuvre grâce à l'automatisation et aux commandes intelligentes",
  wmB4: "Adaptable à toutes les tailles de ferme, des petits exploitants aux grandes opérations commerciales",
  substrateSolutions: "Solutions de Substrats de Culture",
  substrateSolutionsSub: "Substrats premium pour une croissance et un développement optimaux",
  substrateSolutionsDesc: "Nos produits de milieux de culture premium sont conçus pour offrir l'environnement parfait aux racines des plantes, assurant une rétention d'eau, une aération et une disponibilité des nutriments optimales pour une santé et une productivité maximales des cultures.",
  ssB1: "Rétention d'eau supérieure réduisant la fréquence d'irrigation jusqu'à 50%",
  ssB2: "Excellente aération favorisant le développement sain des racines et la croissance des plantes",
  ssB3: "pH équilibré pour une absorption optimale des nutriments et une bonne santé des plantes",
  ssB4: "100% biologique et écologiquement durable",

  ghHeroTitle: "Serres Agricoles Premium",
  ghHeroSub: "Conçues pour le Climat de l'Afrique",
  ghTagline: "Durée de Vie 20+ Ans • Protection Maximale des Cultures • Technologie de Pointe",
  viewSpecs: "Voir les Spécifications",
  climateAdaptive: "Conception Climatique Adaptative",
  climateAdaptiveDesc: "Conçues spécifiquement pour les conditions climatiques africaines, nos serres maintiennent des conditions de croissance optimales toute l'année.",
  structuralDurability: "Durabilité Structurelle",
  structuralDurabilityDesc: "Construites avec de l'acier galvanisé à chaud et notre système breveté de verrouillage par boulons pour une résistance et une longévité inégalées.",
  advancedCoverage: "Système de Couverture Avancé",
  advancedCoverageDesc: "Polyéthylène multicouche stabilisé aux UV avec technologie de rétention thermique IR pour une protection optimale des cultures.",
  smartVentilation: "Ventilation Intelligente",
  smartVentilationDesc: "Système de ventilation automatisé avec contrôle climatique de précision pour des conditions de croissance parfaites.",
  techSpecs: "Spécifications Techniques",
  whyChoose: "Pourquoi Choisir Notre Technologie",
  stdWelded: "Joints Soudés Standard",
  boltLock: "Système de Verrouillage Arbre Bio",
  basicUV: "Film UV de Base",
  smartFilm: "Film Intelligent Multicouche",

  irrHeroTitle: "Solutions d'Irrigation de Précision",
  irrHeroSub: "Pour l'Agriculture Africaine",
  irrTagline: "Transformez votre ferme avec des systèmes d'irrigation économes en eau conçus pour les conditions africaines",
  calculateSavings: "Calculer Vos Économies",
  dripTitle: "Systèmes d'Irrigation Goutte-à-Goutte",
  dripDesc: "Technologie d'irrigation goutte-à-goutte de pointe qui délivre des quantités précises d'eau directement aux racines des plantes, maximisant l'efficacité et les rendements tout en minimisant le gaspillage d'eau. Nos systèmes sont spécialement conçus pour les conditions agricoles africaines.",
  sprinklerTitle: "Systèmes d'Aspersion",
  sprinklerDesc: "Systèmes d'aspersion avancés avec distribution d'eau de précision et régulation intelligente de la pression. Idéaux pour les grandes surfaces et les types de cultures nécessitant une irrigation par aspersion.",
  fertigationTitle: "Solutions de Fertirrigation",
  fertigationDesc: "Systèmes de fertirrigation intégrés qui combinent l'irrigation avec l'application d'engrais, assurant une livraison précise des nutriments tout en maximisant l'efficacité des ressources.",
  digitalTitle: "Outils d'Agriculture Digitale",
  digitalDesc: "Systèmes de gestion intelligente de l'irrigation alimentés par des capteurs IoT et des analyses avancées. Surveillez l'humidité du sol, les conditions météorologiques et la santé des cultures en temps réel.",
  waterTreatmentTitle: "Traitement et Filtration de l'Eau",
  waterTreatmentDesc: "Solutions complètes de traitement de l'eau garantissant que la qualité de l'eau d'irrigation répond aux exigences des cultures. Nos systèmes éliminent les contaminants, préviennent le colmatage et maintiennent l'efficacité du système.",
  caseStudy: "Étude de Cas",

  subHeroTitle: "Solutions de Culture Premium",
  subHeroSub: "Pour l'Agriculture Professionnelle",
  subTagline: "Conçues pour un rendement maximal et une croissance durable",
  qualityAssured: "Qualité Assurée",
  qualityAssuredDesc: "Tous les produits sont soumis à des tests rigoureux et répondent aux normes de qualité internationales",
  sustainable: "Durable",
  sustainableDesc: "Méthodes de production et matériaux respectueux de l'environnement",
  expertSupport: "Support Expert",
  expertSupportDesc: "Guidance technique et support de nos spécialistes agricoles",
  superiorWater: "Rétention d'eau supérieure",
  optimalAeration: "Aération optimale",
  phBalanced: "pH équilibré",
  organic100: "100% biologique",

  ssHeroTitle: "Histoires de Succès",
  ssHeroSubtitle: "Résultats Réels d'Agriculteurs Africains",
  ssHeroDesc: "Découvrez comment les solutions d'Arbre Bio Africa ont transformé des fermes à travers l'Afrique",
  challenge: "Défi",
  solution: "Solution",
  results: "Résultats",
  whatClientSays: "Ce que dit notre client",
  beforeLabel: "Avant",
  afterLabel: "Après",
  transformFarm: "Prêt à Transformer Votre Ferme ?",
  joinFarmers: "Rejoignez des centaines d'agriculteurs prospères à travers l'Afrique.",

  termsTitle: "Conditions d'Utilisation",
  privacyTitle: "Politique de Confidentialité",
  cookiesTitle: "Politique de Cookies",
  legalNote: "Ce document est disponible en anglais. Pour toute question, contactez-nous à",
  legalViewFull: "Pour consulter la version complète de ce document, visitez",
  legalContact: "Nous Contacter pour toute question",

  companyMission: "Notre Mission",
  exploreOurSolutions: "Explorer nos Solutions",
};

const ES: SiteTranslations = {
  learnMore: "Saber Más",
  getStarted: "Comenzar",
  exploreSolutions: "Explorar Soluciones",
  freeConsultation: "Obtener una Consulta Gratuita",
  chatWhatsApp: "Chatear en WhatsApp",
  requestQuote: "Solicitar Presupuesto Personalizado",
  readMore: "Leer Más",
  byAuthor: "Por",
  subscribe: "Suscribirse",
  enterEmail: "Ingresa tu email",
  sendMessage: "Enviar Mensaje",
  workWithUs: "Trabajar con Nosotros",
  whatsappDirect: "WhatsApp Directo",
  viewProjects: "Ver Proyectos",
  startProject: "Iniciar tu Proyecto",
  getInTouch: "Ponerse en Contacto",

  navGreenhouses: "Invernaderos",
  navIrrigation: "Riego",
  navSubstrates: "Sustratos",
  navProjects: "Proyectos",
  navCompany: "Empresa",
  navBlog: "Blog",
  navContact: "Contacto",
  navHighTech: "Soluciones High-Tech",
  navAccessories: "Accesorios",
  navDripSystems: "Sistemas de Goteo",
  navSprinklers: "Aspersores",
  navControllers: "Controladores",
  navGrowingSolutions: "Soluciones de Cultivo",

  heroTitle: "Transformando la Agricultura Africana a través de la Agricultura de Precisión",
  heroSubtitle: "Aumenta tus rendimientos hasta 10 veces con nuestra tecnología agrícola moderna",
  ourServices: "Nuestros Servicios",
  servicesSubtitle: "Soluciones agrícolas integrales diseñadas para las condiciones africanas",
  greenhouseServiceTitle: "Invernaderos High-Tech",
  greenhouseServiceDesc: "Soluciones de invernaderos de vanguardia optimizadas para las condiciones climáticas africanas.",
  irrigationServiceTitle: "Riego de Precisión",
  irrigationServiceDesc: "Sistemas de riego inteligentes que maximizan la eficiencia del agua y los rendimientos de los cultivos.",
  substratesServiceTitle: "Soluciones de Cultivo",
  substratesServiceDesc: "Fibra de coco premium y sustratos para un crecimiento y desarrollo óptimo de las plantas.",
  yieldIncrease: "Aumento del Rendimiento",
  waterSavings: "Ahorro de Agua",
  projectsCompleted: "Proyectos Completados",
  africanCountries: "Países Africanos",
  trustedPartners: "Nuestros Socios de Confianza",
  partnersSubtitle: "Trabajando juntos con organizaciones líderes para transformar la agricultura africana",
  ctaTitle: "¿Listo para Transformar tu Granja?",
  ctaSubtitle: "Únete a cientos de agricultores exitosos en toda África que han revolucionado sus prácticas agrícolas con nuestras soluciones.",

  aboutPageTitle: "Sobre Arbre Bio Africa",
  aboutPageSubtitle: "La historia detrás del líder en agricultura de precisión de África — construida desde cero en Abiyán, Costa de Marfil",
  theFounder: "La Fundadora",
  founderP1: "Mi nombre es Sydney Abouna. Fundé Arbre Bio Africa, Arbre Bio Costa de Marfil y el Organic Tree Group con una visión clara: convertir a África en el continente con el ecosistema agrícola más avanzado, productivo y sostenible del mundo.",
  founderP2: "Construí esta empresa desde cero — sola, gestionando todo desde las operaciones y la gestión de proyectos hasta las relaciones con clientes, marketing y alianzas. Cada invernadero que construimos, cada sistema de riego que instalamos, cada agricultor al que ayudamos es el resultado de un compromiso personal con la excelencia y la innovación.",
  founderP3: "Busco incansablemente las mejores técnicas agrícolas del mundo — las soluciones más innovadoras para aumentar los rendimientos, mejorar la calidad alimentaria y hacer que la agricultura sea rentable y sostenible en las condiciones climáticas únicas de África. No creo que los agricultores africanos deban conformarse con métodos obsoletos cuando existe tecnología de clase mundial.",
  founderP4: "Hoy, Arbre Bio opera en 5 países africanos con más de 500 proyectos completados, alianzas con el Banco Mundial, el Banco Africano de Desarrollo, GIZ, FAO, el Ministerio de Agricultura de Costa de Marfil y empresas agrotecnológicas líderes a nivel mundial. Acabamos de empezar.",
  founderTitleCard: "Fundadora & CEO — Arbre Bio Africa · Arbre Bio Costa de Marfil · Organic Tree Group",
  // Leadership team
  whoWeAre: "Quiénes Somos",
  whoWeAreText: "Arbre Bio Africa es líder en innovación agrícola, proporcionando soluciones de riego de precisión, invernaderos y sustratos de cultivo orgánico en toda África. Nuestro compromiso con las prácticas agrícolas sostenibles y la tecnología de vanguardia nos ha posicionado a la vanguardia de la transformación agrícola en la región.",
  ourMissionShort: "Nuestra Misión",
  ourMissionShortText: "Nuestro objetivo es transformar la agricultura africana haciendo que las tecnologías agrícolas modernas sean accesibles y sostenibles para cada agricultor en todo el continente.",
  ourLeadership: "Nuestro Liderazgo",
  ceoTitle: "Director Ejecutivo",
  cooTitle: "Director de Operaciones",
  marketingTitle: "Representante de Estrategia de Marketing",
  ceoName: "Lethabo Ndhlovu",
  cooName: "Sydney Abouna",
  marketingName: "Viviane BROU",
  ceoBio: "Con más de 25 años de experiencia en ingeniería agrícola y especialización en agricultura intensiva, Lethabo lidera nuestra misión de transformar la agricultura africana.",
  cooBio: "Sydney aporta una amplia experiencia operativa en la gestión de proyectos agrícolas a gran escala en toda África.",
  marketingBio: "Formada en hospitalidad, ahora en marketing digital y producto — enfocada en ayudar a los clientes a conectarse con los productos con claridad, empatía y pasión por la sostenibilidad.",
  ourValues: "Nuestros Valores",
  value1Title: "Sostenibilidad",
  value1Desc: "Comprometidos con prácticas agrícolas respetuosas con el medio ambiente que preservan los recursos naturales para las generaciones futuras.",
  value2Title: "Innovación",
  value2Desc: "Avanzando continuamente la tecnología agrícola para llevar las mejores soluciones agrícolas mundiales a los agricultores africanos.",
  value3Title: "Asociación",
  value3Desc: "Construyendo relaciones sólidas y duraderas con agricultores, instituciones y comunidades en todo el continente.",
  joinUsTitle: "Únete a Nosotros para Transformar la Agricultura Africana",
  joinUsSubtitle: "Trabajemos juntos para construir un futuro más sostenible y productivo para la agricultura.",
  // Company page
  companyHeroTitle: "Transformando la Agricultura",
  companyHeroSubtitle: "A través de la Innovación",
  companyHeroTagline: "Empoderando a los agricultores de toda África con tecnología de vanguardia y soluciones sostenibles.",
  companyMissionText: "En Arbre Bio Africa, estamos comprometidos a revolucionar la agricultura a través de tecnología innovadora y prácticas sostenibles. Nuestra misión es empoderar a los agricultores con soluciones que aumenten la productividad mientras se preservan los recursos naturales.",
  whatWeDo: "Lo Que Hacemos",
  gcTitle: "Construcción de Invernaderos",
  gcDesc: "Invernaderos sawtooth y túnel de alta tecnología diseñados para las condiciones tropicales africanas, con control climático completo e irrigación por goteo integrada.",
  piTitle: "Riego de Precisión",
  piDesc: "Sistemas de goteo y aspersión inteligentes que ahorran hasta un 60% de agua y aumentan drásticamente los rendimientos. Diseñados e instalados para granjas africanas.",
  gsTitle: "Soluciones de Cultivo",
  gsDesc: "Sustratos premium de fibra de coco y medios de cultivo orgánicos para el cultivo hidropónico y en suelo de hortalizas y frutas de alto rendimiento.",
  ourMission: "Nuestra Misión",
  missionText: "Transformar la agricultura africana proporcionando a cada agricultor acceso a las mejores tecnologías de agricultura de precisión del mundo — aumentar los rendimientos, reducir desperdicios y crear sistemas alimentarios sostenibles en todo el continente.",
  ourVision: "Nuestra Visión",
  visionText: "Ser la empresa de innovación agrícola n°1 en África — el nombre más confiable para la agricultura en invernadero moderno, el riego de precisión y las soluciones de agricultura inteligente desde Abiyán hasta Nairobi.",
  ourJourney: "Nuestro Camino",
  y2020t: "Fundación en Abiyán", y2020d: "Sydney Abouna lanza Arbre Bio Africa con la misión de transformar la agricultura en todo el continente.",
  y2021t: "Primer Gran Proyecto", y2021d: "Primera instalación de invernadero a gran escala completada en Costa de Marfil, superando todos los objetivos de rendimiento.",
  y2022t: "Alianzas Estratégicas", y2022d: "Alianzas firmadas con AZUD, Hortalan, Banco Mundial, GIZ y el Ministerio de Agricultura de Costa de Marfil.",
  y2023t: "Expansión Panafricana", y2023d: "500+ proyectos completados en 5 países: Costa de Marfil, Ghana, Burkina Faso, Zimbabue y Kenia.",
  y2024t: "Lanzamiento de Agricultura Digital", y2024d: "Soluciones de agricultura inteligente impulsadas por IoT e IA desplegadas para la gestión moderna de granjas.",
  y2025t: "Empresa Conjunta con Hortalan", y2025d: "Establecimiento de una empresa conjunta con Hortalan para abrir su primera sucursal en Costa de Marfil — un hito para la agricultura de África Occidental.",
  readyTogether: "¿Listo para Trabajar Juntos?",
  readyTogetherSub: "Ya seas agricultor, inversor, institución o socio gubernamental — queremos escucharte.",

  contactTitle: "Contáctanos",
  contactSubtitle: "Obtén asesoramiento experto para transformar tu negocio agrícola",
  sendMessageTitle: "Envíanos un Mensaje",
  firstName: "Nombre",
  lastName: "Apellido",
  emailAddress: "Dirección de Email",
  phoneNumber: "Número de Teléfono",
  interestedIn: "Estoy interesado en",
  selectOption: "Seleccionar una opción",
  optGreenhouses: "Invernaderos",
  optIrrigation: "Sistemas de Riego",
  optGrowing: "Medios de Cultivo",
  optProjects: "Gestión de Proyectos",
  optOther: "Otro",
  messageLabel: "Mensaje",
  sendBtn: "Enviar Mensaje",
  respondTime: "Responderemos en 24-48 horas",
  successMsg: "¡Gracias por tu mensaje! Te responderemos pronto.",
  ourOffices: "Nuestras Oficinas",
  immediateAssistance: "¿Necesitas Ayuda Inmediata?",
  waChatExperts: "Chatea con nuestros expertos agrícolas en WhatsApp para respuestas rápidas.",

  projectsHeroTitle: "Nuestros Proyectos",
  projectsHeroSubtitle: "Transformando la Agricultura Africana",
  projectsHeroDesc: "Descubre nuestra cartera de proyectos agrícolas exitosos en toda África",
  hectaresMgmt: "Hectáreas en Gestión",
  clientSatisfaction: "Satisfacción del Cliente",
  featuredProjects: "Proyectos Destacados",
  locationLabel: "Ubicación:",
  areaLabel: "Área:",
  readyStart: "¿Listo para Iniciar tu Proyecto?",
  readyStartSub: "Contáctanos hoy para consultoría experta y planificación de proyectos.",

  blogTitle: "Blog y Centro de Conocimiento",
  blogSubtitle: "Consejos de expertos y guías prácticas para la agricultura africana moderna",
  featuredArticles: "Artículos Destacados",
  latestArticles: "Últimos Artículos",
  stayUpdated: "Mantente Actualizado",
  newsletterSub: "Suscríbete a nuestro boletín para obtener los últimos conocimientos y consejos agrícolas.",

  solutionsTitle: "Nuestras Soluciones",
  solutionsSubtitle: "Soluciones agrícolas integrales diseñadas para las condiciones africanas",
  protectedFarming: "Soluciones de Cultivo Protegido",
  protectedFarmingSub: "Tecnología de invernadero inteligente para producción anual",
  protectedFarmingDesc: "Nuestras soluciones de invernadero están específicamente diseñadas para las condiciones climáticas africanas, permitiendo a los agricultores cultivar cultivos de alto valor durante todo el año mientras se protegen contra el clima extremo, plagas y enfermedades.",
  pfB1: "Rendimientos hasta 10 veces mayores en comparación con la agricultura al aire libre",
  pfB2: "Producción anual independientemente de las condiciones climáticas externas",
  pfB3: "Reducción significativa del uso de agua mediante riego de precisión",
  pfB4: "Protección contra plagas y enfermedades, reduciendo el uso de pesticidas hasta en un 90%",
  waterMgmt: "Soluciones de Gestión del Agua",
  waterMgmtSub: "Tecnología de riego de precisión para eficiencia hídrica óptima",
  waterMgmtDesc: "Nuestras soluciones de riego ayudan a los agricultores africanos a maximizar los rendimientos mientras conservan los preciosos recursos hídricos. Desde sistemas de goteo simples hasta soluciones automatizadas avanzadas, proporcionamos tecnología que aumenta la eficiencia y reduce los costos.",
  wmB1: "Hasta 60% de reducción en el uso de agua en comparación con los métodos tradicionales",
  wmB2: "Mayores rendimientos a través de la entrega precisa de agua y nutrientes",
  wmB3: "Reducción de costos laborales mediante automatización y controles inteligentes",
  wmB4: "Adaptable a varios tamaños de granja, desde pequeños agricultores hasta grandes operaciones comerciales",
  substrateSolutions: "Soluciones de Sustratos de Cultivo",
  substrateSolutionsSub: "Sustratos premium para crecimiento y desarrollo óptimo de plantas",
  substrateSolutionsDesc: "Nuestros productos de medios de cultivo premium están diseñados para proporcionar el ambiente perfecto para las raíces de las plantas, asegurando retención de agua, aireación y disponibilidad de nutrientes óptimas para la máxima salud y productividad de los cultivos.",
  ssB1: "Retención de agua superior que reduce la frecuencia de riego hasta un 50%",
  ssB2: "Excelente aireación que promueve el desarrollo saludable de raíces y el crecimiento de plantas",
  ssB3: "pH equilibrado para una absorción óptima de nutrientes y salud de las plantas",
  ssB4: "100% orgánico y ecológicamente sostenible",

  ghHeroTitle: "Invernaderos Agrícolas Premium",
  ghHeroSub: "Construidos para el Clima de África",
  ghTagline: "Vida Útil de 20+ Años • Máxima Protección de Cultivos • Tecnología Líder",
  viewSpecs: "Ver Especificaciones",
  climateAdaptive: "Diseño Climático Adaptativo",
  climateAdaptiveDesc: "Diseñados específicamente para las condiciones climáticas africanas, nuestros invernaderos mantienen condiciones de crecimiento óptimas durante todo el año.",
  structuralDurability: "Durabilidad Estructural",
  structuralDurabilityDesc: "Construidos con acero galvanizado en caliente y nuestro sistema patentado de bloqueo por pernos para una resistencia y longevidad inigualables.",
  advancedCoverage: "Sistema de Cobertura Avanzado",
  advancedCoverageDesc: "Polietileno multicapa estabilizado con UV con tecnología de retención de calor IR para la protección óptima de los cultivos.",
  smartVentilation: "Ventilación Inteligente",
  smartVentilationDesc: "Sistema de ventilación automatizado con control climático de precisión para condiciones de crecimiento perfectas.",
  techSpecs: "Especificaciones Técnicas",
  whyChoose: "Por Qué Elegir Nuestra Tecnología",
  stdWelded: "Juntas Soldadas Estándar",
  boltLock: "Sistema de Bloqueo Arbre Bio",
  basicUV: "Película UV Básica",
  smartFilm: "Película Inteligente Multicapa",

  irrHeroTitle: "Soluciones de Riego de Precisión",
  irrHeroSub: "Para la Agricultura Africana",
  irrTagline: "Transforma tu granja con sistemas de riego eficientes en agua diseñados para las condiciones africanas",
  calculateSavings: "Calcular tus Ahorros",
  dripTitle: "Sistemas de Riego por Goteo",
  dripDesc: "Tecnología de riego por goteo de última generación que entrega cantidades precisas de agua directamente a las raíces de las plantas, maximizando la eficiencia y los rendimientos mientras se minimiza el desperdicio de agua.",
  sprinklerTitle: "Sistemas de Aspersores",
  sprinklerDesc: "Sistemas de aspersores avanzados con distribución precisa del agua y regulación inteligente de la presión. Ideales para campos más grandes y tipos de cultivos que requieren riego por aspersión.",
  fertigationTitle: "Soluciones de Fertigación",
  fertigationDesc: "Sistemas de fertigación integrados que combinan el riego con la aplicación de fertilizantes, asegurando una entrega precisa de nutrientes mientras se maximiza la eficiencia de los recursos.",
  digitalTitle: "Herramientas de Agricultura Digital",
  digitalDesc: "Sistemas de gestión de riego inteligentes impulsados por sensores IoT y análisis avanzados. Monitorea la humedad del suelo, las condiciones climáticas y la salud de los cultivos en tiempo real.",
  waterTreatmentTitle: "Tratamiento y Filtración del Agua",
  waterTreatmentDesc: "Soluciones integrales de tratamiento del agua que garantizan que la calidad del agua de riego cumpla con los requisitos de los cultivos. Nuestros sistemas eliminan contaminantes, previenen obstrucciones y mantienen la eficiencia del sistema.",
  caseStudy: "Caso de Estudio",

  subHeroTitle: "Soluciones de Cultivo Premium",
  subHeroSub: "Para Agricultura Profesional",
  subTagline: "Diseñadas para máximo rendimiento y crecimiento sostenible",
  qualityAssured: "Calidad Asegurada",
  qualityAssuredDesc: "Todos los productos se someten a pruebas rigurosas y cumplen con los estándares de calidad internacionales",
  sustainable: "Sostenible",
  sustainableDesc: "Métodos de producción y materiales ambientalmente responsables",
  expertSupport: "Soporte Experto",
  expertSupportDesc: "Orientación técnica y soporte de nuestros especialistas agrícolas",
  superiorWater: "Retención de agua superior",
  optimalAeration: "Aireación óptima",
  phBalanced: "pH equilibrado",
  organic100: "100% orgánico",

  ssHeroTitle: "Historias de Éxito",
  ssHeroSubtitle: "Resultados Reales de Agricultores Africanos",
  ssHeroDesc: "Descubre cómo las soluciones de Arbre Bio Africa han transformado granjas en toda África",
  challenge: "Desafío",
  solution: "Solución",
  results: "Resultados",
  whatClientSays: "Lo que dice nuestro cliente",
  beforeLabel: "Antes",
  afterLabel: "Después",
  transformFarm: "¿Listo para Transformar tu Granja?",
  joinFarmers: "Únete a cientos de agricultores exitosos en toda África.",

  termsTitle: "Términos de Servicio",
  privacyTitle: "Política de Privacidad",
  cookiesTitle: "Política de Cookies",
  legalNote: "Este documento está disponible en inglés. Para preguntas, contáctenos en",
  legalViewFull: "Para leer la versión completa, por favor visite",
  legalContact: "Contáctanos con cualquier pregunta",

  companyMission: "Nuestra Misión",
  exploreOurSolutions: "Explorar nuestras Soluciones",
};

const AF: SiteTranslations = {
  learnMore: "Leer Meer",
  getStarted: "Begin",
  exploreSolutions: "Verken Oplossings",
  freeConsultation: "Kry 'n Gratis Konsultasie",
  chatWhatsApp: "Gesels op WhatsApp",
  requestQuote: "Versoek Aangepaste Kwotasie",
  readMore: "Lees Meer",
  byAuthor: "Deur",
  subscribe: "Teken In",
  enterEmail: "Voer jou e-pos in",
  sendMessage: "Stuur Boodskap",
  workWithUs: "Saamwerk",
  whatsappDirect: "WhatsApp My Direk",
  viewProjects: "Bekyk Projekte",
  startProject: "Begin Jou Projek",
  getInTouch: "Kontak Ons",

  navGreenhouses: "Kweekhuise",
  navIrrigation: "Besproeiing",
  navSubstrates: "Substrate",
  navProjects: "Projekte",
  navCompany: "Maatskappy",
  navBlog: "Blog",
  navContact: "Kontak",
  navHighTech: "Hoë-Tegnologie Oplossings",
  navAccessories: "Toebehore",
  navDripSystems: "Drup Stelsels",
  navSprinklers: "Sproeiers",
  navControllers: "Beheerders",
  navGrowingSolutions: "Groei Oplossings",

  heroTitle: "Transformeer Afrika se Landbou deur Presisieboerdery Oplossings",
  heroSubtitle: "Verhoog jou opbrengste tot 10 keer met ons moderne landboutegnologie",
  ourServices: "Ons Dienste",
  servicesSubtitle: "Omvattende landbou-oplossings ontwerp vir Afrika se toestande",
  greenhouseServiceTitle: "Hoë-Tegnologie Kweekhuise",
  greenhouseServiceDesc: "Gevorderde kwekhuisoplossings geoptimaliseer vir Afrika se klimaattoestande.",
  irrigationServiceTitle: "Presisie Besproeiing",
  irrigationServiceDesc: "Slim besproeiingstelsels wat watereffektiwiteit en gewasopbrengste maksimeer.",
  substratesServiceTitle: "Groei Oplossings",
  substratesServiceDesc: "Premium koko-turfmos en substrate vir optimale plantgroei en -ontwikkeling.",
  yieldIncrease: "Opbrengs Verhoging",
  waterSavings: "Water Besparing",
  projectsCompleted: "Projekte Voltooi",
  africanCountries: "Afrika Lande",
  trustedPartners: "Ons Vertroude Vennote",
  partnersSubtitle: "Saamwerk met toonaangewende organisasies om Afrika se landbou te transformeer",
  ctaTitle: "Gereed om Jou Plaas te Transformeer?",
  ctaSubtitle: "Sluit aan by honderde suksesvolle boere regoor Afrika wat hul landboupraktyke revolusioneer het met ons oplossings.",

  aboutPageTitle: "Oor Arbre Bio Africa",
  aboutPageSubtitle: "Die verhaal agter Afrika se presisieboerdery leier — gebou van niks af in Abidjan, Ivoorkus",
  theFounder: "Die Stigter",
  founderP1: "My naam is Sydney Abouna. Ek het Arbre Bio Africa, Arbre Bio Ivoorkus en die Organic Tree Group gestig met een duidelike visie: om Afrika die kontinent te maak met die mees gevorderde, produktiewe en volhoubare landbou-ekosisteem ter wêreld.",
  founderP2: "Ek het hierdie maatskappy van niks af gebou — alleen, en alles self bestuur van bedrywighede en projekbestuur tot kliënteverhoudings, bemarking en vennootskappe. Elke kwekhuis wat ons bou, elke besproeiingstelsel wat ons installeer, elke boer wat ons help, is die resultaat van 'n persoonlike toewyding aan uitnemendheid en innovasie.",
  founderP3: "Ek soek onverpoos na die wêreld se beste landboutegnieke — die mees innoverende oplossings om opbrengste te verhoog, voedsekwaliteit te verbeter en boerdery winsgewend en volhoubaar te maak in Afrika se unieke klimaattoestande. Ek glo nie dat Afrika se boere met verouderde metodes tevrede moet wees as wêreldklas-tegnologie bestaan nie.",
  founderP4: "Vandag werk Arbre Bio in 5 Afrika-lande met 500+ voltooide projekte, vennootskappe met die Wêreldbank, die Afrikaanse Ontwikkelingsbank, GIZ, FAO, die Ivoorkus Ministerie van Landbou en toonaangewende globale agritech-maatskappye. Ons het pas begin.",
  founderTitleCard: "Stigter & Uitvoerende Hoof — Arbre Bio Africa · Arbre Bio Ivoorkus · Organic Tree Group",
  // Leadership team
  whoWeAre: "Wie Ons Is",
  whoWeAreText: "Arbre Bio Africa is 'n leier in landbou-innovasie, wat presisiebesproeiing, kwekhuisoplossings en organiese groeimedia regoor Afrika verskaf. Ons toewyding aan volhoubare boerderypraktyke en nuutste tegnologie het ons aan die voorpunt van landboutransformasie in die streek geplaas.",
  ourMissionShort: "Ons Missie",
  ourMissionShortText: "Ons doel is om Afrika se landbou te transformeer deur moderne boerdery-tegnologieë toeganklik en volhoubaar te maak vir elke boer regoor die kontinent.",
  ourLeadership: "Ons Leierskap",
  ceoTitle: "Uitvoerende Hoof",
  cooTitle: "Hoof van Bedrywighede",
  marketingTitle: "Bemarkingsstrategie Verteenwoordiger",
  ceoName: "Lethabo Ndhlovu",
  cooName: "Sydney Abouna",
  marketingName: "Viviane BROU",
  ceoBio: "Met meer as 25 jaar ervaring in landbou-ingenieurswese en spesialisasie in intensiewe boerdery, lei Lethabo ons missie om Afrika se landbou te transformeer.",
  cooBio: "Sydney bring uitgebreide operasionele kundigheid in die bestuur van grootskaalse landbouprojekte regoor Afrika.",
  marketingBio: "Opgelei in gasvryheid, nou in digitale bemarking en produk — gefokus op die help van kliënte om met produkte te skakel deur duidelikheid, empatie en passie vir volhoubaarheid.",
  ourValues: "Ons Waardes",
  value1Title: "Volhoubaarheid",
  value1Desc: "Toegewyd aan omgewingsverantwoordelike boerderypraktyke wat natuurlike hulpbronne vir toekomstige geslagte bewaar.",
  value2Title: "Innovasie",
  value2Desc: "Deurlopende vordering van landboutegnologie om die beste wêreldse landbou-oplossings na Afrika se boere te bring.",
  value3Title: "Vennootskap",
  value3Desc: "Bou sterk, blywende verhoudings met boere, instellings en gemeenskappe regoor die kontinent.",
  joinUsTitle: "Sluit Aan by Ons om Afrika se Landbou te Transformeer",
  joinUsSubtitle: "Kom ons werk saam om 'n meer volhoubare en produktiewe toekoms vir boerdery te bou.",
  // Company page
  companyHeroTitle: "Transformeer Landbou",
  companyHeroSubtitle: "Deur Innovasie",
  companyHeroTagline: "Bemagtig boere regoor Afrika met nuutste tegnologie en volhoubare oplossings.",
  companyMissionText: "By Arbre Bio Africa is ons verbind tot die rewolusionering van landbou deur innoverende tegnologie en volhoubare praktyke. Ons missie is om boere te bemagtig met oplossings wat produktiwiteit verhoog terwyl natuurlike hulpbronne bewaar word.",
  whatWeDo: "Wat Ons Doen",
  gcTitle: "Kwekhuis Konstruksie",
  gcDesc: "Hoë-tegnologie sawtooth en tonnel kweekhuise ontwerp vir Afrika se tropiese toestande, met volledige klimaatbeheer en drup besproeiing integrasie.",
  piTitle: "Presisie Besproeiing",
  piDesc: "Slim drup- en sproeistelsels wat tot 60% water bespaar terwyl gewasopbrengste dramaties verhoog word. Ontwerp en geïnstalleer vir Afrika se plase.",
  gsTitle: "Groei Oplossings",
  gsDesc: "Premium koko-turfmos substrate en organiese groeimedia vir hidroponies en grondgebaseerde verbouing van hoë-opbrengs groente en vrugte.",
  ourMission: "Ons Missie",
  missionText: "Om Afrika se landbou te transformeer deur elke boer toegang te gee tot die beste presisieboerdery tegnologieë ter wêreld — opbrengste verhoog, vermorsing verminder en volhoubare voedselsisteme oor die kontinent skep.",
  ourVision: "Ons Visie",
  visionText: "Om die nommer 1 landbou-innovasie maatskappy in Afrika te wees — die mees vertroude naam vir moderne kwekhuis boerdery, presisie besproeiing en slim landbou oplossings van Abidjan tot Nairobi.",
  ourJourney: "Ons Reis",
  y2020t: "Gestig in Abidjan", y2020d: "Sydney Abouna stig Arbre Bio Africa met die missie om landbou oor die kontinent te transformeer.",
  y2021t: "Eerste Groot Projek", y2021d: "Eerste grootskaalse kwekhuisinstallasie voltooi in Ivoorkus, wat alle opbrengs teikens oortref het.",
  y2022t: "Strategiese Vennootskappe", y2022d: "Vennootskappe onderteken met AZUD, Hortalan, Wêreldbank, GIZ en die Ivoorkus Ministerie van Landbou.",
  y2023t: "Pan-Afrika Uitbreiding", y2023d: "500+ projekte voltooi in 5 lande: Ivoorkus, Ghana, Burkina Faso, Zimbabwe en Kenia.",
  y2024t: "Digitale Boerdery Bekendstelling", y2024d: "IoT-aangedrewe slim boerdery oplossings en KI-analitiek ontplooi vir moderne plaasbestuur.",
  y2025t: "Hortalan Gesamentlike Onderneming", y2025d: "Stigting van 'n toonaangewende gesamentlike onderneming met Hortalan om hul eerste tak in Ivoorkus te open — 'n mylpaal vir Wes-Afrika se landbou.",
  readyTogether: "Gereed om Saam te Werk?",
  readyTogetherSub: "Of jy 'n boer, belegger, instelling of regeringsvennoot is — ons wil van jou hoor.",

  contactTitle: "Kontak Ons",
  contactSubtitle: "Kry deskundige advies om jou landboubesigheid te transformeer",
  sendMessageTitle: "Stuur Vir Ons 'n Boodskap",
  firstName: "Voornaam",
  lastName: "Van",
  emailAddress: "E-posadres",
  phoneNumber: "Telefoonnommer",
  interestedIn: "Ek stel belang in",
  selectOption: "Kies 'n opsie",
  optGreenhouses: "Kweekhuise",
  optIrrigation: "Besproeiingstelsels",
  optGrowing: "Groeimedia",
  optProjects: "Projekbestuur",
  optOther: "Ander",
  messageLabel: "Boodskap",
  sendBtn: "Stuur Boodskap",
  respondTime: "Ons sal binne 24-48 uur reageer",
  successMsg: "Dankie vir jou boodskap! Ons sal jou gou antwoord.",
  ourOffices: "Ons Kantore",
  immediateAssistance: "Benodig Onmiddellike Hulp?",
  waChatExperts: "Gesels met ons landboukundiges op WhatsApp vir vinnige antwoorde.",

  projectsHeroTitle: "Ons Projekte",
  projectsHeroSubtitle: "Transformeer Afrika se Landbou",
  projectsHeroDesc: "Ontdek ons portefeulje van suksesvolle landbouprojekte regoor Afrika",
  hectaresMgmt: "Hektaar Bestuur",
  clientSatisfaction: "Kliënttevredenheid",
  featuredProjects: "Uitgestalde Projekte",
  locationLabel: "Ligging:",
  areaLabel: "Oppervlak:",
  readyStart: "Gereed om Jou Projek te Begin?",
  readyStartSub: "Kontak ons vandag vir deskundige konsultasie en projekbeplanning.",

  blogTitle: "Blog & Kennissentrum",
  blogSubtitle: "Deskundige insigte en praktiese gidse vir moderne Afrika landbou",
  featuredArticles: "Uitstaande Artikels",
  latestArticles: "Nuutste Artikels",
  stayUpdated: "Bly Op Hoogte",
  newsletterSub: "Teken in op ons nuusbrief vir die nuutste landbou-insigte en wenke.",

  solutionsTitle: "Ons Oplossings",
  solutionsSubtitle: "Omvattende landbou-oplossings ontwerp vir Afrika se toestande",
  protectedFarming: "Beskermde Boerdery Oplossings",
  protectedFarmingSub: "Slim kwekhuistegnologie vir jaarrondse produksie",
  protectedFarmingDesc: "Ons kwekhuisoplossings is spesifiek ontwerp vir Afrika se klimaattoestande, wat boere in staat stel om hoëwaarde gewasse die hele jaar deur te groei terwyl hulle teen ekstreme weer, plae en siektes beskerm word.",
  pfB1: "Tot 10 keer hoër opbrengste in vergelyking met oopveldboerdery",
  pfB2: "Jaarrondse produksie ongeag eksterne weerstoestande",
  pfB3: "Beduidende vermindering in watergebruik deur presisiebesproeiing",
  pfB4: "Beskerming teen plae en siektes, wat die gebruik van plaagdoders tot 90% verminder",
  waterMgmt: "Waterbestuur Oplossings",
  waterMgmtSub: "Presisie besproeiing tegnologie vir optimale watereffektiwiteit",
  waterMgmtDesc: "Ons besproeiing oplossings help Afrika se boere om gewasopbrengste te maksimeer terwyl hulle kosbare waterbronne bewaar. Van eenvoudige drupstelsels tot gevorderde outomatiese oplossings, ons verskaf tegnologie wat doeltreffendheid verhoog en koste verminder.",
  wmB1: "Tot 60% vermindering in watergebruik in vergelyking met tradisionele metodes",
  wmB2: "Verhoogde gewasopbrengste deur presiese water- en voedingstofaflewering",
  wmB3: "Verminderde arbeidskoste deur outomatisering en slim beheerstelsels",
  wmB4: "Aanpasbaar vir verskeie plaasgroottes, van kleinsaalboere tot groot kommersiële bedrywighede",
  substrateSolutions: "Groei Substraat Oplossings",
  substrateSolutionsSub: "Premium substrate vir optimale plantgroei en -ontwikkeling",
  substrateSolutionsDesc: "Ons premium groeimedia produkte is ontwerp om die perfekte omgewing vir plantwortels te bied, wat optimale waterretensie, belugting en voedingstofbeskikbaarheid vir maksimale gewasgesondheid en produktiwiteit verseker.",
  ssB1: "Superieure waterretensie wat die besproeiingsfrekwensie met tot 50% verminder",
  ssB2: "Uitstekende belugting wat gesonde wortelontwikkeling en plantgroei bevorder",
  ssB3: "pH-gebalanseer vir optimale voedingstofopname en plantgesondheid",
  ssB4: "100% organies en omgewingsvolhoubaar",

  ghHeroTitle: "Premium Landbou Kweekhuise",
  ghHeroSub: "Gebou vir Afrika se Klimaat",
  ghTagline: "Lewensduur van 20+ Jaar • Maksimum Gewas Beskerming • Voorste Industrie Tegnologie",
  viewSpecs: "Bekyk Spesifikasies",
  climateAdaptive: "Klimaat-Aanpasende Ontwerp",
  climateAdaptiveDesc: "Ontwerp spesifiek vir Afrika se klimaattoestande, handhaaf ons kweekhuise optimale groeitoestande die hele jaar.",
  structuralDurability: "Strukturele Duursaamheid",
  structuralDurabilityDesc: "Gebou met warm-gedompelde gegalvaniseerde staal en ons gepatenteerde boutsluitingstelsel vir ongeëwenaarde sterkte en langlewendheid.",
  advancedCoverage: "Gevorderde Bedekking Stelsel",
  advancedCoverageDesc: "Meerlae UV-gestabiliseerde polietileenfilm met IR-warmteretensie tegnologie vir optimale gewasbeskerming.",
  smartVentilation: "Slim Ventilasie",
  smartVentilationDesc: "Geoutomatiseerde ventilasiestelsel met presisie klimaatbeheer vir perfekte groeitoestande.",
  techSpecs: "Tegniese Spesifikasies",
  whyChoose: "Waarom Ons Tegnologie Kies",
  stdWelded: "Standaard Gesweisde Verbindings",
  boltLock: "Arbre Bio Boutsluitingstelsel",
  basicUV: "Basiese UV Film",
  smartFilm: "Meerlae Slim Film",

  irrHeroTitle: "Presisie Besproeiing Oplossings",
  irrHeroSub: "Vir Afrika se Landbou",
  irrTagline: "Transformeer jou plaas met watereffektiewe besproeiingstelsels ontwerp vir Afrika se toestande",
  calculateSavings: "Bereken Jou Besparings",
  dripTitle: "Drup Besproeiing Stelsels",
  dripDesc: "Nuutste drup besproeiing tegnologie wat presiese hoeveelhede water direk na plantworwels lewer, wat doeltreffendheid en gewasopbrengste maksimeer terwyl watervermorsing geminimaliseer word.",
  sprinklerTitle: "Sproeier Stelsels",
  sprinklerDesc: "Gevorderde sproeier stelsels met presisie waterverspreiding en slim drukregulering. Ideaal vir groter velde en spesifieke gewastipes wat oorhoofse besproeiing benodig.",
  fertigationTitle: "Fertirrigation Oplossings",
  fertigationDesc: "Geïntegreerde fertirrigation stelsels wat besproeiing met voedingstoftoediening kombineer, wat presiese voedingstofaflewering verseker terwyl brondoeltreffendheid gemaximaliseer word.",
  digitalTitle: "Digitale Boerdery Gereedskap",
  digitalDesc: "Slim besproeiingbestuurstelsel aangedryf deur IoT-sensors en gevorderde analitiek. Monitor grondvog, weerstoestande en gewasgesondheid in werklike tyd.",
  waterTreatmentTitle: "Waterbehandeling en Filtrasie",
  waterTreatmentDesc: "Omvattende waterbehandeling oplossings wat verseker dat die besproeiingswaterkwaliteit aan gewas vereistes voldoen. Ons stelsels verwyder kontaminante, voorkom verstoppings en handhaaf stelseleffektiwiteit.",
  caseStudy: "Gevallestudie",

  subHeroTitle: "Premium Groei Oplossings",
  subHeroSub: "Vir Professionele Landbou",
  subTagline: "Ontwerp vir maksimum opbrengs en volhoubare groei",
  qualityAssured: "Kwaliteit Verseker",
  qualityAssuredDesc: "Alle produkte ondergaan streng toetsing en voldoen aan internasionale kwaliteitstandaarde",
  sustainable: "Volhoubaar",
  sustainableDesc: "Omgewingsverantwoordelike produksiemetodes en materiale",
  expertSupport: "Deskundige Ondersteuning",
  expertSupportDesc: "Tegniese leiding en ondersteuning van ons landboukundiges",
  superiorWater: "Superieure waterretensie",
  optimalAeration: "Optimale belugting",
  phBalanced: "pH gebalanseer",
  organic100: "100% organies",

  ssHeroTitle: "Suksesverhale",
  ssHeroSubtitle: "Werklike Resultate van Afrika se Boere",
  ssHeroDesc: "Ontdek hoe Arbre Bio Africa se oplossings plase regoor Afrika getransformeer het",
  challenge: "Uitdaging",
  solution: "Oplossing",
  results: "Resultate",
  whatClientSays: "Wat ons kliënt sê",
  beforeLabel: "Voor",
  afterLabel: "Na",
  transformFarm: "Gereed om Jou Plaas te Transformeer?",
  joinFarmers: "Sluit aan by honderde suksesvolle boere regoor Afrika.",

  termsTitle: "Diensbepalings",
  privacyTitle: "Privaatheidsbeleid",
  cookiesTitle: "Koekiesbeleid",
  legalNote: "Hierdie dokument is in Engels beskikbaar. Vir vrae, kontak ons by",
  legalViewFull: "Om die volledige weergawe te lees, besoek asseblief",
  legalContact: "Kontak Ons vir enige vrae",

  companyMission: "Ons Missie",
  exploreOurSolutions: "Verken ons Oplossings",
};

export const TRANSLATIONS: Record<Lang, SiteTranslations> = { fr: FR, es: ES, af: AF };

export function useT(lang: Lang): SiteTranslations {
  return TRANSLATIONS[lang];
}
