// ================================================================
// ARBRE BIO AFRICA — CAREER SYSTEM TRANSLATIONS
// EN / FR / ES / AF
// ================================================================

export type CareerLang = 'en' | 'fr' | 'es' | 'af';

export interface CareerTranslations {
  // Nav / Page titles
  careers: string;
  careerPageTitle: string;
  careerPageSubtitle: string;
  careerPageDesc: string;
  // Job listing
  openPositions: string;
  noOpenPositions: string;
  noOpenPositionsDesc: string;
  allDepartments: string;
  allTypes: string;
  filterBy: string;
  department: string;
  jobType: string;
  location: string;
  deadline: string;
  positions: string;
  applyNow: string;
  viewDetails: string;
  fullTime: string;
  partTime: string;
  contract: string;
  internship: string;
  volunteer: string;
  // Job detail
  jobDescription: string;
  requirements: string;
  howToApply: string;
  applyForPosition: string;
  shareJob: string;
  backToJobs: string;
  closingDate: string;
  availablePositions: string;
  // Application form
  applicationForm: string;
  applicationFormDesc: string;
  personalInfo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  birthDate: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  coverLetter: string;
  coverLetterPlaceholder: string;
  uploadDocuments: string;
  uploadCV: string;
  uploadIDCard: string;
  uploadDiploma: string;
  uploadOther: string;
  cvRequired: string;
  idRequired: string;
  fileFormats: string;
  maxFileSize: string;
  submitApplication: string;
  submitting: string;
  applicationSuccess: string;
  applicationSuccessDesc: string;
  applicationRef: string;
  trackApplication: string;
  // Portal
  applicantPortal: string;
  portalDesc: string;
  enterEmail: string;
  enterToken: string;
  accessPortal: string;
  portalEmailHint: string;
  portalTokenHint: string;
  applicationStatus: string;
  yourDocuments: string;
  statusSubmitted: string;
  statusUnderReview: string;
  statusInterviewScheduled: string;
  statusInterviewDone: string;
  statusOfferSent: string;
  statusHired: string;
  statusRejected: string;
  statusWithdrawn: string;
  timeline: string;
  congratulations: string;
  workerIDAssigned: string;
  downloadContract: string;
  downloadCertificate: string;
  yourWorkerID: string;
  employeePortal: string;
  // Admin translations
  adminCareers: string;
  adminCareersDesc: string;
  postJob: string;
  editJob: string;
  deleteJob: string;
  publishJob: string;
  closeJob: string;
  jobTitle: string;
  jobSlug: string;
  jobStatus: string;
  jobDeadline: string;
  allApplications: string;
  applicantName: string;
  appliedFor: string;
  appliedDate: string;
  reviewApplication: string;
  updateStatus: string;
  generateWorkerID: string;
  sendContract: string;
  employees: string;
  workerID: string;
  hireDate: string;
  contractType: string;
  sendCredentials: string;
  searchApplications: string;
  // Process steps
  processTitle: string;
  processDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
  // Why join
  whyJoinTitle: string;
  whyJoinDesc: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  benefit4Title: string;
  benefit4Desc: string;
}

const en: CareerTranslations = {
  careers: 'Careers',
  careerPageTitle: 'Join Our Team — Arbre Bio Africa',
  careerPageSubtitle: 'Build the Future of African Agriculture',
  careerPageDesc: 'Join a passionate team dedicated to transforming agriculture across Africa through innovation, sustainability, and technology.',
  openPositions: 'Open Positions',
  noOpenPositions: 'No Open Positions',
  noOpenPositionsDesc: 'There are currently no open positions. Please check back soon or send us your unsolicited application.',
  allDepartments: 'All Departments',
  allTypes: 'All Types',
  filterBy: 'Filter by',
  department: 'Department',
  jobType: 'Job Type',
  location: 'Location',
  deadline: 'Application Deadline',
  positions: 'position(s)',
  applyNow: 'Apply Now',
  viewDetails: 'View Details',
  fullTime: 'Full Time',
  partTime: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  volunteer: 'Volunteer',
  jobDescription: 'Job Description',
  requirements: 'Requirements',
  howToApply: 'How to Apply',
  applyForPosition: 'Apply for this Position',
  shareJob: 'Share this Job',
  backToJobs: 'Back to Jobs',
  closingDate: 'Closing Date',
  availablePositions: 'Available Positions',
  applicationForm: 'Job Application',
  applicationFormDesc: 'Complete the form below to submit your application. All fields marked * are required.',
  personalInfo: 'Personal Information',
  firstName: 'First Name',
  middleName: 'Middle Name',
  lastName: 'Last Name',
  emailAddress: 'Email Address',
  phoneNumber: 'Phone Number',
  birthDate: 'Date of Birth',
  nationality: 'Nationality',
  address: 'Address',
  city: 'City',
  country: 'Country',
  coverLetter: 'Cover Letter',
  coverLetterPlaceholder: 'Tell us why you want to join Arbre Bio Africa and what makes you the ideal candidate...',
  uploadDocuments: 'Upload Documents',
  uploadCV: 'Curriculum Vitae (CV) *',
  uploadIDCard: 'National ID Card *',
  uploadDiploma: 'Diploma / Degree',
  uploadOther: 'Other Documents',
  cvRequired: 'CV is required',
  idRequired: 'ID card is required',
  fileFormats: 'Accepted formats: PDF, JPEG, PNG, DOC, DOCX',
  maxFileSize: 'Maximum file size: 10 MB',
  submitApplication: 'Submit Application',
  submitting: 'Submitting...',
  applicationSuccess: 'Application Submitted Successfully!',
  applicationSuccessDesc: 'Thank you for applying. We will review your application and contact you within 5–10 business days.',
  applicationRef: 'Your reference token',
  trackApplication: 'Track Your Application',
  applicantPortal: 'Applicant Portal',
  portalDesc: 'Track the status of your job application and access your employment documents.',
  enterEmail: 'Enter your email address',
  enterToken: 'Enter your reference token',
  accessPortal: 'Access Portal',
  portalEmailHint: 'Use the email address you applied with',
  portalTokenHint: 'Received in your confirmation email',
  applicationStatus: 'Application Status',
  yourDocuments: 'Your Documents',
  statusSubmitted: 'Application Submitted',
  statusUnderReview: 'Under Review',
  statusInterviewScheduled: 'Interview Scheduled',
  statusInterviewDone: 'Interview Completed',
  statusOfferSent: 'Offer Sent',
  statusHired: 'Hired',
  statusRejected: 'Not Selected',
  statusWithdrawn: 'Withdrawn',
  timeline: 'Application Timeline',
  congratulations: 'Congratulations!',
  workerIDAssigned: 'Your Worker ID has been assigned. Welcome to the Arbre Bio Africa family!',
  downloadContract: 'Download Contract',
  downloadCertificate: 'Download Certificate',
  yourWorkerID: 'Your Worker ID',
  employeePortal: 'Employee Portal',
  adminCareers: 'Career Management',
  adminCareersDesc: 'Manage job postings, applications, and employee records.',
  postJob: 'Post a Job',
  editJob: 'Edit Job',
  deleteJob: 'Delete Job',
  publishJob: 'Publish Job',
  closeJob: 'Close Job',
  jobTitle: 'Job Title',
  jobSlug: 'URL Slug',
  jobStatus: 'Status',
  jobDeadline: 'Application Deadline',
  allApplications: 'All Applications',
  applicantName: 'Applicant Name',
  appliedFor: 'Applied For',
  appliedDate: 'Applied Date',
  reviewApplication: 'Review Application',
  updateStatus: 'Update Status',
  generateWorkerID: 'Generate Worker ID',
  sendContract: 'Send Contract',
  employees: 'Employees',
  workerID: 'Worker ID',
  hireDate: 'Hire Date',
  contractType: 'Contract Type',
  sendCredentials: 'Send Credentials',
  searchApplications: 'Search applications...',
  processTitle: 'Our Hiring Process',
  processDesc: 'A transparent and fair process to find the right talent for our team.',
  step1Title: 'Online Application',
  step1Desc: 'Submit your application and documents through our online portal.',
  step2Title: 'Document Review',
  step2Desc: 'Our HR team reviews all applications within 5–10 business days.',
  step3Title: 'Interview',
  step3Desc: 'Selected candidates are invited for an interview (in-person or video call).',
  step4Title: 'Job Offer',
  step4Desc: 'Successful candidates receive a formal job offer and employment contract.',
  step5Title: 'Onboarding',
  step5Desc: 'Receive your Worker ID, contract, and all necessary documents online.',
  whyJoinTitle: 'Why Join Arbre Bio Africa?',
  whyJoinDesc: 'We offer a stimulating work environment and exciting career growth opportunities.',
  benefit1Title: 'Innovation & Impact',
  benefit1Desc: 'Work on projects that truly transform African agriculture and communities.',
  benefit2Title: 'Professional Growth',
  benefit2Desc: 'Continuous training, mentorship, and career advancement opportunities.',
  benefit3Title: 'Inclusive Culture',
  benefit3Desc: 'A diverse and inclusive workplace that values every individual.',
  benefit4Title: 'Competitive Compensation',
  benefit4Desc: 'Competitive salary, benefits, and performance-based bonuses.',
};

const fr: CareerTranslations = {
  careers: 'Carrières',
  careerPageTitle: 'Rejoignez Notre Équipe — Arbre Bio Africa',
  careerPageSubtitle: "Construisez l'Avenir de l'Agriculture Africaine",
  careerPageDesc: "Rejoignez une équipe passionnée dédiée à transformer l'agriculture africaine grâce à l'innovation, la durabilité et la technologie.",
  openPositions: 'Postes Ouverts',
  noOpenPositions: 'Aucun Poste Ouvert',
  noOpenPositionsDesc: "Il n'y a actuellement aucun poste ouvert. Revenez bientôt ou envoyez-nous une candidature spontanée.",
  allDepartments: 'Tous les Départements',
  allTypes: 'Tous les Types',
  filterBy: 'Filtrer par',
  department: 'Département',
  jobType: "Type d'Emploi",
  location: 'Lieu',
  deadline: 'Date Limite',
  positions: 'poste(s)',
  applyNow: 'Postuler Maintenant',
  viewDetails: 'Voir les Détails',
  fullTime: 'Temps Plein',
  partTime: 'Temps Partiel',
  contract: 'Contrat',
  internship: 'Stage',
  volunteer: 'Bénévolat',
  jobDescription: 'Description du Poste',
  requirements: 'Prérequis',
  howToApply: 'Comment Postuler',
  applyForPosition: 'Postuler à ce Poste',
  shareJob: 'Partager ce Poste',
  backToJobs: 'Retour aux Offres',
  closingDate: 'Date de Clôture',
  availablePositions: 'Postes Disponibles',
  applicationForm: 'Formulaire de Candidature',
  applicationFormDesc: 'Remplissez le formulaire ci-dessous pour soumettre votre candidature. Les champs marqués * sont obligatoires.',
  personalInfo: 'Informations Personnelles',
  firstName: 'Prénom',
  middleName: 'Deuxième Prénom',
  lastName: 'Nom de Famille',
  emailAddress: 'Adresse Email',
  phoneNumber: 'Numéro de Téléphone',
  birthDate: 'Date de Naissance',
  nationality: 'Nationalité',
  address: 'Adresse',
  city: 'Ville',
  country: 'Pays',
  coverLetter: 'Lettre de Motivation',
  coverLetterPlaceholder: "Dites-nous pourquoi vous souhaitez rejoindre Arbre Bio Africa et ce qui fait de vous le candidat idéal...",
  uploadDocuments: 'Télécharger les Documents',
  uploadCV: 'Curriculum Vitae (CV) *',
  uploadIDCard: "Carte d'Identité Nationale *",
  uploadDiploma: 'Diplôme / Attestation',
  uploadOther: 'Autres Documents',
  cvRequired: 'Le CV est obligatoire',
  idRequired: "La carte d'identité est obligatoire",
  fileFormats: 'Formats acceptés : PDF, JPEG, PNG, DOC, DOCX',
  maxFileSize: 'Taille maximale : 10 Mo',
  submitApplication: 'Soumettre la Candidature',
  submitting: 'Envoi en cours...',
  applicationSuccess: 'Candidature Soumise avec Succès !',
  applicationSuccessDesc: 'Merci pour votre candidature. Nous examinerons votre dossier et vous contacterons dans un délai de 5 à 10 jours ouvrables.',
  applicationRef: 'Votre token de référence',
  trackApplication: 'Suivre ma Candidature',
  applicantPortal: 'Portail Candidat',
  portalDesc: 'Suivez le statut de votre candidature et accédez à vos documents d\'emploi.',
  enterEmail: 'Entrez votre adresse email',
  enterToken: 'Entrez votre token de référence',
  accessPortal: 'Accéder au Portail',
  portalEmailHint: "Utilisez l'email avec lequel vous avez postulé",
  portalTokenHint: 'Reçu dans votre email de confirmation',
  applicationStatus: 'Statut de la Candidature',
  yourDocuments: 'Vos Documents',
  statusSubmitted: 'Candidature Soumise',
  statusUnderReview: 'En Cours de Révision',
  statusInterviewScheduled: 'Entretien Planifié',
  statusInterviewDone: 'Entretien Effectué',
  statusOfferSent: 'Offre Envoyée',
  statusHired: 'Recruté(e)',
  statusRejected: 'Non Retenu(e)',
  statusWithdrawn: 'Retirée',
  timeline: 'Historique de Candidature',
  congratulations: 'Félicitations !',
  workerIDAssigned: 'Votre Identifiant Employé a été attribué. Bienvenue dans la famille Arbre Bio Africa !',
  downloadContract: 'Télécharger le Contrat',
  downloadCertificate: "Télécharger l'Attestation",
  yourWorkerID: 'Votre Identifiant Employé',
  employeePortal: 'Espace Employé',
  adminCareers: 'Gestion des Carrières',
  adminCareersDesc: 'Gérez les offres d\'emploi, les candidatures et les dossiers des employés.',
  postJob: 'Publier une Offre',
  editJob: "Modifier l'Offre",
  deleteJob: "Supprimer l'Offre",
  publishJob: 'Publier',
  closeJob: 'Clôturer',
  jobTitle: 'Intitulé du Poste',
  jobSlug: 'Slug URL',
  jobStatus: 'Statut',
  jobDeadline: 'Date Limite',
  allApplications: 'Toutes les Candidatures',
  applicantName: 'Nom du Candidat',
  appliedFor: 'A Postulé Pour',
  appliedDate: 'Date de Candidature',
  reviewApplication: 'Examiner la Candidature',
  updateStatus: 'Mettre à Jour le Statut',
  generateWorkerID: "Générer l'Identifiant",
  sendContract: 'Envoyer le Contrat',
  employees: 'Employés',
  workerID: 'Identifiant Employé',
  hireDate: "Date d'Embauche",
  contractType: 'Type de Contrat',
  sendCredentials: 'Envoyer les Identifiants',
  searchApplications: 'Rechercher des candidatures...',
  processTitle: 'Notre Processus de Recrutement',
  processDesc: 'Un processus transparent et équitable pour trouver les bons talents.',
  step1Title: 'Candidature en Ligne',
  step1Desc: 'Soumettez votre candidature et vos documents via notre portail en ligne.',
  step2Title: 'Examen des Dossiers',
  step2Desc: "Notre équipe RH examine toutes les candidatures dans un délai de 5 à 10 jours ouvrables.",
  step3Title: 'Entretien',
  step3Desc: 'Les candidats sélectionnés sont invités à un entretien (en personne ou par vidéoconférence).',
  step4Title: "Offre d'Emploi",
  step4Desc: 'Les candidats retenus reçoivent une offre d\'emploi formelle et un contrat de travail.',
  step5Title: 'Intégration',
  step5Desc: 'Recevez votre Identifiant Employé, votre contrat et tous les documents nécessaires en ligne.',
  whyJoinTitle: 'Pourquoi Rejoindre Arbre Bio Africa ?',
  whyJoinDesc: 'Nous offrons un environnement de travail stimulant et des opportunités de carrière passionnantes.',
  benefit1Title: 'Innovation & Impact',
  benefit1Desc: 'Travaillez sur des projets qui transforment réellement l\'agriculture africaine et les communautés.',
  benefit2Title: 'Croissance Professionnelle',
  benefit2Desc: 'Formation continue, mentorat et opportunités d\'avancement professionnel.',
  benefit3Title: 'Culture Inclusive',
  benefit3Desc: 'Un milieu de travail diversifié et inclusif qui valorise chaque individu.',
  benefit4Title: 'Rémunération Compétitive',
  benefit4Desc: 'Salaire compétitif, avantages sociaux et primes basées sur la performance.',
};

const es: CareerTranslations = {
  careers: 'Carreras',
  careerPageTitle: 'Únete a Nuestro Equipo — Arbre Bio Africa',
  careerPageSubtitle: 'Construye el Futuro de la Agricultura Africana',
  careerPageDesc: 'Únete a un equipo apasionado dedicado a transformar la agricultura africana a través de la innovación, la sostenibilidad y la tecnología.',
  openPositions: 'Posiciones Abiertas',
  noOpenPositions: 'Sin Posiciones Abiertas',
  noOpenPositionsDesc: 'Actualmente no hay posiciones abiertas. Vuelve pronto o envíanos una solicitud espontánea.',
  allDepartments: 'Todos los Departamentos',
  allTypes: 'Todos los Tipos',
  filterBy: 'Filtrar por',
  department: 'Departamento',
  jobType: 'Tipo de Empleo',
  location: 'Ubicación',
  deadline: 'Fecha Límite',
  positions: 'posición(es)',
  applyNow: 'Aplicar Ahora',
  viewDetails: 'Ver Detalles',
  fullTime: 'Tiempo Completo',
  partTime: 'Medio Tiempo',
  contract: 'Contrato',
  internship: 'Pasantía',
  volunteer: 'Voluntario',
  jobDescription: 'Descripción del Puesto',
  requirements: 'Requisitos',
  howToApply: 'Cómo Aplicar',
  applyForPosition: 'Aplicar a esta Posición',
  shareJob: 'Compartir este Trabajo',
  backToJobs: 'Volver a Trabajos',
  closingDate: 'Fecha de Cierre',
  availablePositions: 'Posiciones Disponibles',
  applicationForm: 'Formulario de Solicitud',
  applicationFormDesc: 'Complete el formulario a continuación para enviar su solicitud. Los campos marcados con * son obligatorios.',
  personalInfo: 'Información Personal',
  firstName: 'Nombre',
  middleName: 'Segundo Nombre',
  lastName: 'Apellido',
  emailAddress: 'Correo Electrónico',
  phoneNumber: 'Número de Teléfono',
  birthDate: 'Fecha de Nacimiento',
  nationality: 'Nacionalidad',
  address: 'Dirección',
  city: 'Ciudad',
  country: 'País',
  coverLetter: 'Carta de Presentación',
  coverLetterPlaceholder: 'Cuéntenos por qué desea unirse a Arbre Bio Africa y qué le hace el candidato ideal...',
  uploadDocuments: 'Subir Documentos',
  uploadCV: 'Currículum Vitae (CV) *',
  uploadIDCard: 'Documento de Identidad *',
  uploadDiploma: 'Diploma / Título',
  uploadOther: 'Otros Documentos',
  cvRequired: 'El CV es obligatorio',
  idRequired: 'El documento de identidad es obligatorio',
  fileFormats: 'Formatos aceptados: PDF, JPEG, PNG, DOC, DOCX',
  maxFileSize: 'Tamaño máximo: 10 MB',
  submitApplication: 'Enviar Solicitud',
  submitting: 'Enviando...',
  applicationSuccess: '¡Solicitud Enviada con Éxito!',
  applicationSuccessDesc: 'Gracias por su solicitud. Revisaremos su candidatura y nos pondremos en contacto en 5–10 días hábiles.',
  applicationRef: 'Su token de referencia',
  trackApplication: 'Seguir mi Solicitud',
  applicantPortal: 'Portal de Candidatos',
  portalDesc: 'Realice un seguimiento del estado de su solicitud y acceda a sus documentos de empleo.',
  enterEmail: 'Ingrese su correo electrónico',
  enterToken: 'Ingrese su token de referencia',
  accessPortal: 'Acceder al Portal',
  portalEmailHint: 'Utilice el correo con el que aplicó',
  portalTokenHint: 'Recibido en su correo de confirmación',
  applicationStatus: 'Estado de la Solicitud',
  yourDocuments: 'Sus Documentos',
  statusSubmitted: 'Solicitud Enviada',
  statusUnderReview: 'En Revisión',
  statusInterviewScheduled: 'Entrevista Programada',
  statusInterviewDone: 'Entrevista Completada',
  statusOfferSent: 'Oferta Enviada',
  statusHired: 'Contratado(a)',
  statusRejected: 'No Seleccionado(a)',
  statusWithdrawn: 'Retirada',
  timeline: 'Historial de Solicitud',
  congratulations: '¡Felicitaciones!',
  workerIDAssigned: 'Su ID de Empleado ha sido asignado. ¡Bienvenido a la familia Arbre Bio Africa!',
  downloadContract: 'Descargar Contrato',
  downloadCertificate: 'Descargar Certificado',
  yourWorkerID: 'Su ID de Empleado',
  employeePortal: 'Portal de Empleados',
  adminCareers: 'Gestión de Carreras',
  adminCareersDesc: 'Gestione ofertas de empleo, solicitudes y registros de empleados.',
  postJob: 'Publicar Trabajo',
  editJob: 'Editar Trabajo',
  deleteJob: 'Eliminar Trabajo',
  publishJob: 'Publicar',
  closeJob: 'Cerrar',
  jobTitle: 'Título del Puesto',
  jobSlug: 'Slug URL',
  jobStatus: 'Estado',
  jobDeadline: 'Fecha Límite',
  allApplications: 'Todas las Solicitudes',
  applicantName: 'Nombre del Candidato',
  appliedFor: 'Aplicó Para',
  appliedDate: 'Fecha de Solicitud',
  reviewApplication: 'Revisar Solicitud',
  updateStatus: 'Actualizar Estado',
  generateWorkerID: 'Generar ID de Empleado',
  sendContract: 'Enviar Contrato',
  employees: 'Empleados',
  workerID: 'ID de Empleado',
  hireDate: 'Fecha de Contratación',
  contractType: 'Tipo de Contrato',
  sendCredentials: 'Enviar Credenciales',
  searchApplications: 'Buscar solicitudes...',
  processTitle: 'Nuestro Proceso de Contratación',
  processDesc: 'Un proceso transparente y justo para encontrar el talento adecuado.',
  step1Title: 'Solicitud en Línea',
  step1Desc: 'Envíe su solicitud y documentos a través de nuestro portal en línea.',
  step2Title: 'Revisión de Documentos',
  step2Desc: 'Nuestro equipo de RRHH revisa todas las solicitudes en 5–10 días hábiles.',
  step3Title: 'Entrevista',
  step3Desc: 'Los candidatos seleccionados son invitados a una entrevista (presencial o por videollamada).',
  step4Title: 'Oferta de Empleo',
  step4Desc: 'Los candidatos exitosos reciben una oferta de trabajo formal y contrato.',
  step5Title: 'Incorporación',
  step5Desc: 'Reciba su ID de Empleado, contrato y todos los documentos necesarios en línea.',
  whyJoinTitle: '¿Por Qué Unirse a Arbre Bio Africa?',
  whyJoinDesc: 'Ofrecemos un entorno de trabajo estimulante y emocionantes oportunidades de crecimiento.',
  benefit1Title: 'Innovación e Impacto',
  benefit1Desc: 'Trabaje en proyectos que transforman realmente la agricultura africana y las comunidades.',
  benefit2Title: 'Crecimiento Profesional',
  benefit2Desc: 'Formación continua, tutoría y oportunidades de avance profesional.',
  benefit3Title: 'Cultura Inclusiva',
  benefit3Desc: 'Un lugar de trabajo diverso e inclusivo que valora a cada individuo.',
  benefit4Title: 'Compensación Competitiva',
  benefit4Desc: 'Salario competitivo, beneficios y bonificaciones por rendimiento.',
};

const af: CareerTranslations = {
  careers: 'Loopbane',
  careerPageTitle: 'Sluit by Ons Span aan — Arbre Bio Africa',
  careerPageSubtitle: 'Bou die Toekoms van Afrika-Landbou',
  careerPageDesc: "Sluit aan by 'n passionele span toegewy aan die transformasie van Afrika-landbou deur innovasie, volhoudbaarheid en tegnologie.",
  openPositions: 'Oop Poste',
  noOpenPositions: 'Geen Oop Poste',
  noOpenPositionsDesc: 'Daar is tans geen oop poste nie. Kom gou terug of stuur ons \'n ongereelde aansoek.',
  allDepartments: 'Alle Departemente',
  allTypes: 'Alle Tipes',
  filterBy: 'Filter deur',
  department: 'Departement',
  jobType: 'Werktipe',
  location: 'Ligging',
  deadline: 'Aansoeksperdatum',
  positions: 'pos(te)',
  applyNow: 'Doen Nou Aansoek',
  viewDetails: 'Sien Besonderhede',
  fullTime: 'Voltydse',
  partTime: 'Deeltydse',
  contract: 'Kontrak',
  internship: 'Internskap',
  volunteer: 'Vrywilliger',
  jobDescription: 'Werksomskrywing',
  requirements: 'Vereistes',
  howToApply: 'Hoe om Aansoek te Doen',
  applyForPosition: 'Doen Aansoek vir Hierdie Pos',
  shareJob: 'Deel Hierdie Werk',
  backToJobs: 'Terug na Werk',
  closingDate: 'Sluitingsdatum',
  availablePositions: 'Beskikbare Poste',
  applicationForm: 'Aansoekvorm',
  applicationFormDesc: 'Vul die onderstaande vorm in om u aansoek in te dien. Velde gemerk * is verpligtend.',
  personalInfo: 'Persoonlike Inligting',
  firstName: 'Voornaam',
  middleName: 'Tweede Naam',
  lastName: 'Van',
  emailAddress: 'E-posadres',
  phoneNumber: 'Telefoonnommer',
  birthDate: 'Geboortedatum',
  nationality: 'Nasionaliteit',
  address: 'Adres',
  city: 'Stad',
  country: 'Land',
  coverLetter: 'Begeleidende Brief',
  coverLetterPlaceholder: 'Vertel ons waarom u by Arbre Bio Africa wil aansluit en wat u die ideale kandidaat maak...',
  uploadDocuments: 'Laai Dokumente op',
  uploadCV: 'Kurrikulum Vitae (CV) *',
  uploadIDCard: 'Nasionale ID-kaart *',
  uploadDiploma: 'Diploma / Graad',
  uploadOther: 'Ander Dokumente',
  cvRequired: 'CV is verpligtend',
  idRequired: 'ID-kaart is verpligtend',
  fileFormats: 'Aanvaarde formate: PDF, JPEG, PNG, DOC, DOCX',
  maxFileSize: 'Maksimum lêergrootte: 10 MB',
  submitApplication: 'Dien Aansoek in',
  submitting: 'Indien...',
  applicationSuccess: 'Aansoek suksesvol ingedien!',
  applicationSuccessDesc: 'Dankie vir u aansoek. Ons sal u aansoek hersien en u binne 5–10 werksdae kontak.',
  applicationRef: 'U verwysingstoken',
  trackApplication: 'Volg my Aansoek',
  applicantPortal: 'Aansoekerportaal',
  portalDesc: "Volg die status van u werksaansoek en kry toegang tot u indiensnemingsdokumente.",
  enterEmail: 'Voer u e-posadres in',
  enterToken: 'Voer u verwysingstoken in',
  accessPortal: 'Toegang tot Portaal',
  portalEmailHint: 'Gebruik die e-pos waarmee u aansoek gedoen het',
  portalTokenHint: 'Ontvang in u bevestigingse-pos',
  applicationStatus: 'Aansoekstatus',
  yourDocuments: 'U Dokumente',
  statusSubmitted: 'Aansoek Ingedien',
  statusUnderReview: 'Onder Hersiening',
  statusInterviewScheduled: 'Onderhoud Geskeduleer',
  statusInterviewDone: 'Onderhoud Voltooi',
  statusOfferSent: 'Aanbod Gestuur',
  statusHired: 'Aangestel',
  statusRejected: 'Nie Gekies',
  statusWithdrawn: 'Teruggetrek',
  timeline: 'Aansoekgeskiedenis',
  congratulations: 'Geluk!',
  workerIDAssigned: 'U Werknemer-ID is toegewys. Welkom by die Arbre Bio Africa-familie!',
  downloadContract: 'Laai Kontrak af',
  downloadCertificate: 'Laai Sertifikaat af',
  yourWorkerID: 'U Werknemer-ID',
  employeePortal: 'Werknemerportaal',
  adminCareers: 'Loopbaanbestuur',
  adminCareersDesc: 'Bestuur werksposplasings, aansoeke en werknemerrekords.',
  postJob: 'Plaas Werk',
  editJob: 'Wysig Werk',
  deleteJob: 'Verwyder Werk',
  publishJob: 'Publiseer',
  closeJob: 'Sluit',
  jobTitle: 'Werktitel',
  jobSlug: 'URL Slug',
  jobStatus: 'Status',
  jobDeadline: 'Sperdatum',
  allApplications: 'Alle Aansoeke',
  applicantName: 'Naam van Aansoeker',
  appliedFor: 'Aansoek gedoen vir',
  appliedDate: 'Aansoekdatum',
  reviewApplication: 'Hersien Aansoek',
  updateStatus: 'Dateer Status op',
  generateWorkerID: 'Genereer Werknemer-ID',
  sendContract: 'Stuur Kontrak',
  employees: 'Werknemers',
  workerID: 'Werknemer-ID',
  hireDate: 'Datum van Indiensneming',
  contractType: 'Kontraktipe',
  sendCredentials: 'Stuur Geloofsbriewe',
  searchApplications: 'Soek aansoeke...',
  processTitle: 'Ons Aanstellingsproses',
  processDesc: 'N deursigtige en regverdige proses om die regte talent te vind.',
  step1Title: 'Aanlyn Aansoek',
  step1Desc: 'Dien u aansoek en dokumente in via ons aanlynportaal.',
  step2Title: 'Dokumenthersiening',
  step2Desc: 'Ons HR-span hersien alle aansoeke binne 5–10 werksdae.',
  step3Title: 'Onderhoud',
  step3Desc: 'Geselekteerde kandidate word uitgenooi vir \'n onderhoud (persoonlik of via video-oproep).',
  step4Title: 'Werkaanbod',
  step4Desc: 'Suksesvolle kandidate ontvang \'n formele werkaanbod en dienskontrak.',
  step5Title: 'Inboarding',
  step5Desc: 'Ontvang u Werknemer-ID, kontrak en alle nodige dokumente aanlyn.',
  whyJoinTitle: 'Waarom by Arbre Bio Africa Aansluit?',
  whyJoinDesc: 'Ons bied \'n stimulerende werksomgewing en opwindende loopbaangroeigeleenthede.',
  benefit1Title: 'Innovasie en Impak',
  benefit1Desc: 'Werk aan projekte wat die Afrika-landbou en gemeenskappe werklik transformeer.',
  benefit2Title: 'Professionele Groei',
  benefit2Desc: 'Deurlopende opleiding, mentorskap en loopbaanvorderingsgeleenthede.',
  benefit3Title: 'Inklusiewe Kultuur',
  benefit3Desc: '\'n Diverse en inklusiewe werkplek wat elke individu waardeer.',
  benefit4Title: 'Mededingende Vergoeding',
  benefit4Desc: 'Mededingende salaris, voordele en prestasiegebaseerde bonusse.',
};

export const careerTranslations: Record<CareerLang, CareerTranslations> = { en, fr, es, af };

export function useCareerT(lang: string): CareerTranslations {
  const l = (lang as CareerLang) in careerTranslations ? (lang as CareerLang) : 'en';
  return careerTranslations[l];
}

// Worker ID generator
// Format: ABA + 2-digit year + CI + DDMMYY birthday + initials (FirstMiddleLast)
export function generateWorkerID(params: {
  birthDate: Date;
  firstName: string;
  middleName?: string;
  lastName: string;
  year?: number;
  countryCode?: string;
}): string {
  const { birthDate, firstName, middleName, lastName, year = new Date().getFullYear(), countryCode = 'CI' } = params;

  const yearDigits = String(year).slice(-2);
  const dd = String(birthDate.getDate()).padStart(2, '0');
  const mm = String(birthDate.getMonth() + 1).padStart(2, '0');
  const yy = String(birthDate.getFullYear()).slice(-2);
  const birthday = `${dd}${mm}${yy}`;

  const initials = [
    firstName.charAt(0).toUpperCase(),
    middleName ? middleName.charAt(0).toUpperCase() : '',
    lastName.charAt(0).toUpperCase(),
  ].filter(Boolean).join('');

  return `ABA${yearDigits}${countryCode}${birthday}${initials}`;
}
