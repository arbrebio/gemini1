export const languages = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  af: 'Afrikaans',
};

export type Language = 'en' | 'fr' | 'es' | 'af';

export const defaultLang: Language = 'en';

export function getLangFromUrl(url: URL): Language {
  const pathSegments = url.pathname.split('/');
  // Check if the first path segment is a valid language code
  if (pathSegments.length > 1 && Object.keys(languages).includes(pathSegments[1])) {
    return pathSegments[1] as Language;
  }
  return defaultLang;
}

// Alias for backward compatibility
const getLanguageFromUrl = getLangFromUrl;

// Get localized path for a given language
export function getLocalizedPath(path: string, lang: Language): string {
  // If it's the default language and we don't prefix it
  if (lang === defaultLang) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // For other languages, add the language prefix
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}

// Remove locale prefix from path
export function removeLocaleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);

  // If first segment is a language code, remove it
  if (segments.length > 0 && Object.keys(languages).includes(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  
  return path;
}

// Generate static paths for all languages
export function getStaticPaths() {
  return Object.keys(languages).map(lang => ({ params: { lang: lang } }));
}

export function useTranslations(lang: Language) {
  return function t(key: string): string {
    const keys = key.split('.');
    // First try with the requested language
    let value: any = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Translation not found in requested language, try fallback
        value = null;
        break;
      }
    }
    
    // If translation was found, return it
    if (typeof value === 'string') {
      return value;
    }
    
    // Otherwise try with fallback language
    return getFallbackTranslation(key) || key;
  };
}

// Helper function to get fallback translation
function getFallbackTranslation(key: string): string | null {
  try {
    const keys = key.split('.');
    let value: any = translations[defaultLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return typeof value === 'string' ? value : null;
  } catch (error) {
    return null;
  }
}

const translations: Record<Language, Record<string, any>> = {
  en: {
    nav: {
      greenhouses: 'Greenhouses',
      irrigation: 'Irrigation',
      substrates: 'Substrates',
      projects: 'Projects',
      company: 'Company',
      blog: 'Blog',
      contact: 'Contact',
      highTech: 'High-Tech Solutions',
      accessories: 'Accessories',
      dripSystems: 'Drip Systems',
      sprinklers: 'Sprinklers',
      controllers: 'Controllers',
      growingSolutions: 'Growing Solutions'
    },
    hero: {
      title: 'Transforming African Agriculture Through Precision Farming Solutions',
      subtitle: 'Increase your yields by up to 10x with our modern agricultural technology',
      getStarted: 'Get Started',
      exploreSolutions: 'Explore Solutions',
      cta: {
        primary: 'Get Started',
        secondary: 'Explore Solutions'
      }
    },
    services: {
      title: 'Our Services',
      subtitle: 'Comprehensive agricultural solutions designed for African conditions',
      greenhouses: {
        title: 'High-Tech Greenhouses',
        description: 'State-of-the-art greenhouse solutions optimized for African climate conditions.'
      },
      greenhouse: {
        title: 'High-Tech Greenhouses',
        description: 'State-of-the-art greenhouse solutions optimized for African climate conditions.'
      },
      irrigation: {
        title: 'Precision Irrigation',
        description: 'Smart irrigation systems that maximize water efficiency and crop yields.'
      },
      substrates: {
        title: 'Growing Solutions',
        description: 'Premium coco peat and substrates for optimal plant growth and development.'
      },
      learnMore: 'Learn More'
    },
    stats: {
      yieldIncrease: 'Yield Increase',
      waterSavings: 'Water Savings',
      projectsCompleted: 'Projects Completed',
      africanCountries: 'African Countries',
      yield: 'Yield Increase',
      water: 'Water Savings',
      projects: 'Projects Completed',
      countries: 'African Countries'
    },
    cta: {
      title: 'Ready to Transform Your Farm?',
      subtitle: 'Join hundreds of successful farmers across Africa who have revolutionized their agricultural practices with our solutions.',
      consultation: 'Get a Free Consultation',
      whatsapp: 'Chat on WhatsApp'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Get expert advice on transforming your agricultural business',
      form: {
        title: 'Send Us a Message',
        firstname: 'First Name',
        lastname: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        interest: 'I\'m interested in',
        message: 'Message',
        required: '*',
        submit: 'Send Message'
      },
      offices: 'Our Offices',
      whatsapp: {
        title: 'Need Immediate Assistance?',
        subtitle: 'Chat with our agricultural experts on WhatsApp for quick responses.'
      }
    },
    blog: {
      hero: {
        title: 'Blog & Knowledge Hub',
        subtitle: 'Expert insights and practical guides for modern African agriculture'
      },
      newsletter: {
        title: 'Stay Updated',
        subtitle: 'Subscribe to our newsletter for the latest agricultural insights and tips.',
        placeholder: 'Enter your email',
        subscribe: 'Subscribe'
      },
      featured: {
        title: 'Featured Articles'
      },
      latest: {
        title: 'Latest Articles'
      }
    },
    office: {
      abidjan: 'Abidjan Office',
      capetown: 'Cape Town Warehouse'
    },
    common: {
      'learn-more': 'Learn More',
      'request-quote': 'Request Quote',
      'view-products': 'View Products',
      'download': 'Download',
      'loading': 'Loading...',
      'back': 'Back',
      'view-technical-specs': 'View Technical Specs',
      'submit-quote-request': 'Submit Quote Request',
      'select-category': 'Select a category',
      'project-details': 'Project Details',
      'tell-us-about': 'Tell us about your project and specific requirements...',
      'need-expert-advice': 'Need Expert Advice?',
      'contact-today': 'Contact us today for technical consultation and custom solutions.',
      'technical-specs': 'Technical Specifications',
      'installation-guide': 'Installation Guide',
      'cad-files': 'CAD Files',
      'complete-product-specs': 'Complete product specifications',
      'step-by-step': 'Step-by-step installation instructions',
      'technical-drawings': 'Technical drawings and 3D models',
      'quality-certifications': 'Quality Certifications',
      'quality-management': 'Quality Management System',
      'structural-steel': 'Structural Steel Components',
      'greenhouse-covering': 'Greenhouse Covering Materials',
      'professional-greenhouse': 'Professional Greenhouse Components',
      'quality-certified': 'Quality-Certified Accessories & Supplies',
      'technical-documentation': 'Technical Documentation'
    },
    footer: {
      description: 'Transforming African agriculture through precision farming solutions.',
      quickLinks: 'Quick Links',
      aboutUs: 'About Us',
      about: 'About Us',
      solutions: 'Solutions',
      contactUs: 'Contact Us',
      contact: 'Contact Us',
      contactInfo: 'Contact Us',
      newsletter: 'Newsletter',
      subscribe: 'Subscribe',
      emailPlaceholder: 'Your email address',
      copyright: 'All rights reserved.',
      terms: 'Terms',
      privacy: 'Privacy',
      cookies: 'Cookies'
    },
    errors: {
      pageNotFound: 'Page Not Found',
      serverError: 'Server Error',
      networkError: 'Network Error',
      tryAgain: 'Try Again',
      goHome: 'Go Home'
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      minLength: 'Minimum {min} characters required',
      maxLength: 'Maximum {max} characters allowed'
    },
    greenhouse: {
      categories: {
        structural: 'Structural Components',
        arches: 'Arches & Trusses',
        support: 'Support Systems',
        fasteners: 'Fasteners & Connections',
        connectors: 'Structural Connectors',
        coverage: 'Coverage Materials & Climate Control',
        films: 'Films & Sheets',
        screens: 'Insect Screens',
        growing: 'Growing Accessories'
      },
      specs: {
        material: 'Material',
        thickness: 'Thickness',
        loadCapacity: 'Load Capacity',
        span: 'Span',
        coating: 'Coating',
        size: 'Size',
        torque: 'Torque',
        standard: 'Standard',
        dimensions: 'Dimensions',
        climate: 'Climate',
        lifespan: 'Lifespan',
        installation: 'Installation',
        lightTransmission: 'Light Transmission',
        uvStability: 'UV Stability',
        thermalRetention: 'Thermal Retention',
        lightDiffusion: 'Light Diffusion',
        mesh: 'Mesh',
        airflow: 'Airflow',
        shading: 'Shading',
        diameter: 'Diameter',
        wireSpacing: 'Wire Spacing',
        postHeight: 'Post Height',
        rollLength: 'Roll Length',
        strength: 'Strength'
      },
      products: {
        premiumArch: 'Premium Arch 9600',
        reinforcedTruss: 'Reinforced Truss System',
        heavyDutyColumn: 'Heavy-Duty Column',
        crossBracing: 'Cross Bracing Kit',
        heavyDutyBolt: 'Heavy-Duty Bolt Set',
        channelConnector: 'Channel Connector',
        ultraClearFilm: 'Ultra-Clear EVA Film',
        diffusedFilm: 'Diffused Light Film',
        antiThripNet: 'Anti-Thrip Net',
        cropSupportWire: 'Crop Support Wire',
        trellisSupport: 'Trellis Support System'
      },
      applications: {
        archConnections: 'Arch connections',
        mainFrame: 'Main frame assembly',
        supportBracing: 'Support bracing',
        purlinConnections: 'Purlin connections',
        crossMember: 'Cross member joining',
        gutterSupport: 'Gutter support',
        tomatoSupport: 'Tomato support',
        cucumberTraining: 'Cucumber training',
        vineCrops: 'Vine crops',
        verticalGrowing: 'Vertical growing',
        plantTraining: 'Plant training',
        rowCrops: 'Row crops'
      }
    },
    specs: {
      dimensions: 'Dimensions',
      materials: 'Materials',
      loadCapacity: 'Load Capacity',
      thickness: 'Thickness',
      coating: 'Coating',
      span: 'Span',
      size: 'Size',
      torque: 'Torque',
      standard: 'Standard',
      material: 'Material'
    },
    pages: {
      greenhouse: {
        hero: {
          title: 'Premium Agricultural Greenhouses',
          subtitle: 'Built for Africa\'s Climate',
          builtForAfrica: 'Built for Africa\'s Climate',
          tagline: '20+ Years Lifespan • Maximum Crop Protection • Industry-Leading Technology',
          requestQuote: 'Request Custom Quote',
          viewSpecs: 'View Technical Specs',
          viewSpecifications: 'View Specifications'
        },
        features: {
          climateAdaptive: {
            title: 'Climate-Adaptive Design',
            description: 'Engineered specifically for African climate conditions, our greenhouses maintain optimal growing conditions year-round.',
            stats: {
              cooler: '40% cooler interior',
              humidity: '60% humidity control',
              light: '92% light transmission'
            }
          },
          structural: {
            title: 'Structural Durability',
            description: 'Built with hot-dip galvanized steel and our patented bolt-lock system for unmatched strength and longevity.',
            stats: {
              lifespan: '20+ years lifespan',
              wind: '150 km/h wind resistance',
              load: '25 kg/m² load capacity'
            }
          },
          coverage: {
            title: 'Advanced Coverage System',
            description: 'Multi-layer UV-stabilized polyethylene with IR heat retention technology for optimal crop protection.',
            stats: {
              warranty: '5-year UV warranty',
              light: '92% light transmission',
              heat: '25% better heat retention'
            }
          },
          ventilation: {
            title: 'Smart Ventilation',
            description: 'Automated ventilation system with precision climate control for perfect growing conditions.',
            stats: {
              airChanges: '60 air changes/hour',
              insect: '50-mesh insect protection',
              smart: 'Smart climate control'
            }
          }
        },
        specifications: {
          title: 'Technical Specifications',
          structure: {
            category: 'Structure',
            frameMaterial: 'Frame Material',
            frameMaterialValue: 'Hot-dip galvanized steel',
            frameMaterialAdvantage: 'Superior corrosion resistance, 20+ years lifespan',
            connectionSystem: 'Connection System',
            connectionSystemValue: 'Patented bolt-lock technology',
            connectionSystemAdvantage: '300% stronger than traditional welded joints',
            windResistance: 'Wind Resistance',
            windResistanceValue: 'Up to 150 km/h',
            windResistanceAdvantage: 'Exceeds industry standards by 50%',
            snowLoad: 'Snow Load',
            snowLoadValue: '25 kg/m²',
            snowLoadAdvantage: 'Designed for varied climate conditions'
          },
          coverage: {
            category: 'Coverage',
            material: 'Material',
            materialValue: 'Multi-layer UV-stabilized polyethylene',
            materialAdvantage: '92% light transmission',
            uvProtection: 'UV Protection',
            uvProtectionValue: 'Advanced UV-A/B/C blocking',
            uvProtectionAdvantage: 'Extended crop protection and film life',
            thermal: 'Thermal Properties',
            thermalValue: 'IR heat retention technology',
            thermalAdvantage: '25% better temperature regulation',
            warranty: 'Warranty',
            warrantyValue: '5-year UV warranty',
            warrantyAdvantage: 'Industry-leading coverage guarantee'
          },
          ventilation: {
            category: 'Ventilation',
            systemType: 'System Type',
            systemTypeValue: 'Automated ridge and side ventilation',
            systemTypeAdvantage: 'Perfect climate control',
            airExchange: 'Air Exchange Rate',
            airExchangeValue: '45-60 air changes/hour',
            airExchangeAdvantage: '50% better than standard systems',
            control: 'Control System',
            controlValue: 'Smart climate controller',
            controlAdvantage: 'Automated response to weather changes',
            insectProtection: 'Insect Protection',
            insectProtectionValue: '50-mesh anti-insect screens',
            insectProtectionAdvantage: 'Maximum pest protection'
          }
        },
        comparison: {
          title: 'Why Choose Our Technology',
          connection: {
            title: 'Connection System',
            standard: 'Standard Welded Joints',
            standardPoints: {
              point1: 'Limited strength under stress',
              point2: 'Prone to failure at weld points',
              point3: 'Cannot be easily repaired',
              point4: 'Shorter lifespan'
            },
            premium: 'Arbre Bio Bolt-Lock System',
            premiumPoints: {
              point1: '300% stronger connection points',
              point2: 'Distributed stress load',
              point3: 'Easy maintenance and repairs',
              point4: '20+ years lifespan'
            }
          },
          coverageTech: {
            title: 'Coverage Technology',
            standard: 'Basic UV Film',
            standardPoints: {
              point1: 'Basic UV protection',
              point2: 'Limited light diffusion',
              point3: '2-3 year lifespan',
              point4: 'Poor heat retention'
            },
            premium: 'Multi-Layer Smart Film',
            premiumPoints: {
              point1: 'Complete UV-A/B/C blocking',
              point2: 'Optimal light diffusion',
              point3: '5-year warranty',
              point4: 'Advanced IR heat retention'
            }
          }
        },
        quoteForm: {
          title: 'Request a Custom Quote',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          phone: 'Phone Number',
          projectLocation: 'Project Location',
          locationPlaceholder: 'City, Country',
          greenhouseSize: 'Greenhouse Size (Square Meters)',
          timeline: 'Project Timeline',
          timelineImmediate: 'Immediate (1-3 months)',
          timelineSoon: 'Soon (3-6 months)',
          timelinePlanning: 'Planning Phase (6+ months)',
          additionalRequirements: 'Additional Requirements',
          additionalPlaceholder: 'Tell us about your specific needs, crops you plan to grow, or any special requirements...',
          submit: 'Submit Quote Request'
        },
        trustIndicators: {
          iso: {
            title: 'ISO 9001:2015 Certified',
            description: 'Quality Management System'
          },
          warranty: {
            title: '5-Year Warranty',
            description: 'Industry-Leading Coverage'
          },
          projects: {
            title: '500+ Projects',
            description: 'Across Africa'
          }
        },
        finalCta: {
          title: 'Ready to Transform Your Farm?',
          description: 'Contact us today for expert advice and custom solutions.',
          getStarted: 'Get Started',
          whatsapp: 'Chat on WhatsApp'
        },
        sections: {
          structural: 'Structural Components',
          fasteners: 'Fasteners & Connection Systems',
          coverage: 'Coverage Materials & Climate Control',
          growing: 'Growing Accessories',
          certifications: 'Quality Certifications',
          documentation: 'Technical Documentation',
          quoteForm: 'Request a Quote',
          technicalSpecs: 'Technical Specifications',
          whyChoose: 'Why Choose Our Technology'
        },
        form: {
          category: 'Product Category',
          selectCategory: 'Select a category',
          projectLocation: 'Project Location',
          locationPlaceholder: 'City, Country',
          greenhouseSize: 'Greenhouse Size (Square Meters)',
          projectTimeline: 'Project Timeline',
          immediate: 'Immediate (1-3 months)',
          soon: 'Soon (3-6 months)',
          planning: 'Planning Phase (6+ months)',
          additionalReq: 'Additional Requirements',
          additionalPlaceholder: 'Tell us about your specific needs, crops you plan to grow, or any special requirements...',
          submitQuote: 'Submit Quote Request'
        },
        cta: {
          needAdvice: 'Need Expert Advice?',
          contactToday: 'Contact us today for technical consultation and custom solutions.',
          contactUs: 'Contact Us',
          whatsapp: 'Chat on WhatsApp'
        },
        trust: {
          isoTitle: 'ISO 9001:2015 Certified',
          isoDesc: 'Quality Management System',
          warrantyTitle: '5-Year Warranty',
          warrantyDesc: 'Industry-Leading Coverage',
          supportTitle: 'Expert Support',
          supportDesc: 'Technical Assistance Included'
        }
      },
      irrigation: {
        hero: {
          title: 'Precision Irrigation Solutions',
          subtitle: 'For African Agriculture',
          tagline: 'Precision Water Management',
          transform: 'Transform your farm with water-efficient irrigation systems designed for African conditions',
          calculateSavings: 'Calculate Your Savings',
          exploreSolutions: 'Explore Solutions'
        },
        stats: {
          waterSavings: 'Average Water Savings',
          projectsCompleted: 'Projects Completed',
          yieldIncrease: 'Yield Increase',
          satisfaction: 'Client Satisfaction'
        },
        technologies: {
          title: 'Our Irrigation Technologies',
          drip: {
            title: 'Drip Irrigation Systems',
            description: 'State-of-the-art drip irrigation technology that delivers precise amounts of water directly to plant roots, maximizing efficiency and crop yields while minimizing water waste. Our systems are designed specifically for African agricultural conditions.',
            specs: {
              flowRate: 'Flow Rate',
              flowRateValue: '1-8 L/hour',
              spacing: 'Spacing Options',
              spacingValue: '20-100 cm',
              pressure: 'Operating Pressure',
              pressureValue: '1-4 bar',
              filtration: 'Filtration',
              filtrationValue: '120 mesh'
            },
            benefits: {
              water: 'Up to 70% water savings compared to traditional irrigation',
              uniform: 'Uniform water distribution across all crops',
              fertilizer: 'Reduced fertilizer leaching',
              erosion: 'Minimal soil erosion and weed growth'
            },
            caseStudy: {
              title: 'Tomato Farm in Ghana',
              result: '65% increase in yield, 40% reduction in water usage'
            }
          },
          sprinklers: {
            title: 'Sprinkler Systems',
            description: 'Advanced sprinkler systems featuring precision water distribution and smart pressure regulation. Ideal for larger fields and specific crop types requiring overhead irrigation, our systems ensure optimal coverage and water efficiency.',
            specs: {
              coverage: 'Coverage Radius',
              coverageValue: '5-25 meters',
              flowRate: 'Flow Rate',
              flowRateValue: '500-2000 L/hour',
              pressure: 'Pressure Range',
              pressureValue: '2-5 bar',
              rotation: 'Rotation',
              rotationValue: '360° coverage'
            },
            benefits: {
              pattern: 'Even water distribution pattern',
              adjustable: 'Adjustable spray patterns for different crops',
              durable: 'Durable construction for long service life',
              maintenance: 'Low maintenance requirements'
            },
            caseStudy: {
              title: 'Maize Farm in Kenya',
              result: '45% increase in crop uniformity, 30% water savings'
            }
          },
          fertigation: {
            title: 'Fertigation Solutions',
            description: 'Integrated fertigation systems that combine irrigation with fertilizer application, ensuring precise nutrient delivery while maximizing resource efficiency. Our smart dosing technology adapts to crop needs and growth stages.',
            specs: {
              injection: 'Injection Rate',
              injectionValue: '0.2-40 L/hour',
              mixing: 'Mixing Ratio',
              mixingValue: '1:50 - 1:1000',
              tank: 'Tank Capacity',
              tankValue: '50-1000 L',
              control: 'Control',
              controlValue: 'EC/pH automated'
            },
            benefits: {
              precise: 'Precise nutrient delivery to crop root zone',
              automated: 'Automated pH and EC control',
              monitoring: 'Real-time monitoring and adjustment',
              waste: 'Reduced fertilizer waste'
            },
            caseStudy: {
              title: 'Vegetable Farm in Côte d\'Ivoire',
              result: '50% reduction in fertilizer use, 40% yield increase'
            }
          },
          digital: {
            title: 'Digital Farming Tools',
            description: 'Smart irrigation management systems powered by IoT sensors and advanced analytics. Monitor soil moisture, weather conditions, and crop health in real-time to optimize irrigation scheduling and resource usage.',
            specs: {
              range: 'Sensor Range',
              rangeValue: 'Up to 5 km',
              update: 'Data Update',
              updateValue: 'Every 15 min',
              battery: 'Battery Life',
              batteryValue: '5 years',
              accuracy: 'Accuracy',
              accuracyValue: '±2% VWC'
            },
            benefits: {
              monitoring: 'Real-time monitoring and alerts',
              datadriven: 'Data-driven irrigation decisions',
              remote: 'Remote system control via mobile app',
              predictive: 'Predictive maintenance alerts'
            },
            caseStudy: {
              title: 'Tech-enabled Farm in Nigeria',
              result: '35% water savings through smart scheduling'
            }
          },
          treatment: {
            title: 'Water Treatment & Filtration',
            description: 'Comprehensive water treatment solutions that ensure irrigation water quality meets crop requirements. Our systems remove contaminants, prevent clogging, and maintain system efficiency throughout the growing season.',
            specs: {
              capacity: 'Flow Capacity',
              capacityValue: '10-200 m³/hour',
              filtration: 'Filtration Level',
              filtrationValue: '20-200 micron',
              pressure: 'Pressure Loss',
              pressureValue: '<0.3 bar',
              backwash: 'Backwash',
              backwashValue: 'Automated'
            },
            benefits: {
              clogging: 'Prevents emitter clogging',
              contaminants: 'Removes harmful contaminants',
              lifespan: 'Extends system lifespan',
              cleaning: 'Automated self-cleaning'
            },
            caseStudy: {
              title: 'Large Scale Farm in Tanzania',
              result: '90% reduction in system maintenance needs'
            }
          },
          mass: {
            title: 'Mass Production Methods',
            description: 'Scalable irrigation solutions designed for large-scale agricultural operations. Our systems can be customized to meet the specific needs of commercial farms while maintaining efficiency and ease of management.',
            specs: {
              capacity: 'System Capacity',
              capacityValue: '50-1000 ha',
              pump: 'Pump Station',
              pumpValue: 'Up to 500 HP',
              zones: 'Control Zones',
              zonesValue: 'Up to 100',
              automation: 'Automation',
              automationValue: 'Full system'
            },
            benefits: {
              scalable: 'Scalable system design',
              centralized: 'Centralized control system',
              zonespecific: 'Zone-specific management',
              integration: 'Integration with farm operations'
            },
            caseStudy: {
              title: 'Commercial Farm in Ethiopia',
              result: '85% efficiency in 500-hectare operation'
            }
          }
        },
        calculator: {
          title: 'Calculate Your Potential Savings',
          area: 'Land Area (Hectares)',
          crop: 'Crop Type',
          cropVegetables: 'Vegetables',
          cropCereals: 'Cereals',
          cropFruits: 'Fruits',
          cropOther: 'Other',
          waterUsage: 'Current Water Usage (m³/ha/year)',
          yield: 'Current Yield (tons/ha)',
          calculate: 'Calculate Savings',
          results: {
            title: 'Your Potential Savings',
            waterSavings: 'Water Savings',
            waterUnit: 'm³/year',
            yieldIncrease: 'Yield Increase'
          }
        },
        finalCta: {
          title: 'Ready to Transform Your Farm?',
          description: 'Contact us today for expert advice and custom solutions.',
          getStarted: 'Get Started',
          whatsapp: 'Chat on WhatsApp'
        }
      },
      substrates: {
        hero: {
          title: 'Premium Growing Solutions',
          subtitle: 'For Professional Agriculture',
          description: 'Engineered for maximum yield and sustainable growth',
          explore: 'Explore Solutions'
        },
        benefits: {
          quality: 'Quality Assured',
          qualityDesc: 'All products undergo rigorous testing and meet international quality standards',
          sustainable: 'Sustainable',
          sustainableDesc: 'Environmentally responsible production methods and materials',
          support: 'Expert Support',
          supportDesc: 'Technical guidance and support from our agricultural specialists'
        },
        features: {
          waterRetention: 'Superior water retention',
          aeration: 'Optimal aeration',
          phBalanced: 'pH balanced',
          organic: '100% organic'
        }
      }
    }
  },
  fr: {
    nav: {
      greenhouses: 'Serres',
      irrigation: 'Irrigation',
      substrates: 'Substrats',
      projects: 'Projets',
      company: 'Entreprise',
      blog: 'Blog',
      contact: 'Contact',
      highTech: 'Solutions High-Tech',
      accessories: 'Accessoires',
      dripSystems: 'Systèmes Goutte-à-Goutte',
      sprinklers: 'Arroseurs',
      controllers: 'Contrôleurs',
      growingSolutions: 'Solutions de Culture'
    },
    hero: {
      title: 'Transformer l\'Agriculture Africaine Grâce aux Solutions d\'Agriculture de Précision',
      subtitle: 'Augmentez vos rendements jusqu\'à 10 fois avec notre technologie agricole moderne',
      getStarted: 'Commencer',
      exploreSolutions: 'Explorer les Solutions',
      cta: {
        primary: 'Commencer',
        secondary: 'Explorer les Solutions'
      }
    },
    services: {
      title: 'Nos Services',
      subtitle: 'Solutions agricoles complètes conçues pour les conditions africaines',
      greenhouses: {
        title: 'Serres High-Tech',
        description: 'Solutions de serres de pointe optimisées pour les conditions climatiques africaines.'
      },
      greenhouse: {
        title: 'Serres High-Tech',
        description: 'Solutions de serres de pointe optimisées pour les conditions climatiques africaines.'
      },
      irrigation: {
        title: 'Irrigation de Précision',
        description: 'Systèmes d\'irrigation intelligents qui maximisent l\'efficacité de l\'eau et les rendements des cultures.'
      },
      substrates: {
        title: 'Solutions de Culture',
        description: 'Fibre de coco premium et substrats pour une croissance et un développement optimaux des plantes.'
      },
      learnMore: 'En Savoir Plus'
    },
    stats: {
      yieldIncrease: 'Augmentation du Rendement',
      waterSavings: 'Économies d\'Eau',
      projectsCompleted: 'Projets Réalisés',
      africanCountries: 'Pays Africains',
      yield: 'Augmentation du Rendement',
      water: 'Économies d\'Eau',
      projects: 'Projets Réalisés',
      countries: 'Pays Africains'
    },
    cta: {
      title: 'Prêt à Transformer Votre Ferme ?',
      subtitle: 'Rejoignez des centaines d\'agriculteurs prospères à travers l\'Afrique qui ont révolutionné leurs pratiques agricoles avec nos solutions.',
      consultation: 'Obtenir une Consultation Gratuite',
      whatsapp: 'Discuter sur WhatsApp'
    },
    contact: {
      title: 'Nous Contacter',
      subtitle: 'Obtenez des conseils d\'experts pour transformer votre entreprise agricole',
      form: {
        title: 'Envoyez-Nous un Message',
        firstname: 'Prénom',
        lastname: 'Nom',
        email: 'Adresse Email',
        phone: 'Numéro de Téléphone',
        interest: 'Je suis intéressé par',
        message: 'Message',
        required: '*',
        submit: 'Envoyer le Message'
      },
      offices: 'Nos Bureaux',
      whatsapp: {
        title: 'Besoin d\'Assistance Immédiate?',
        subtitle: 'Discutez avec nos experts agricoles sur WhatsApp pour des réponses rapides.'
      }
    },
    blog: {
      hero: {
        title: 'Blog & Centre de Connaissances',
        subtitle: 'Conseils d\'experts et guides pratiques pour l\'agriculture africaine moderne'
      },
      newsletter: {
        title: 'Restez Informé',
        subtitle: 'Abonnez-vous à notre newsletter pour les dernières informations agricoles et conseils.',
        placeholder: 'Entrez votre email',
        subscribe: 'S\'abonner'
      },
      featured: {
        title: 'Articles en Vedette'
      },
      latest: {
        title: 'Derniers Articles'
      }
    },
    office: {
      abidjan: 'Bureau d\'Abidjan',
      capetown: 'Entrepôt du Cap'
    },
    common: {
      'learn-more': 'En Savoir Plus',
      'request-quote': 'Demander un Devis',
      'view-products': 'Voir les Produits',
      'download': 'Télécharger',
      'loading': 'Chargement...',
      'back': 'Retour',
      'view-technical-specs': 'Voir les Spécifications Techniques',
      'submit-quote-request': 'Soumettre une Demande de Devis',
      'select-category': 'Sélectionner une catégorie',
      'project-details': 'Détails du Projet',
      'tell-us-about': 'Parlez-nous de votre projet et de vos besoins spécifiques...',
      'need-expert-advice': 'Besoin de Conseils d\'Experts ?',
      'contact-today': 'Contactez-nous dès aujourd\'hui pour une consultation technique et des solutions personnalisées.',
      'technical-specs': 'Spécifications Techniques',
      'installation-guide': 'Guide d\'Installation',
      'cad-files': 'Fichiers CAO',
      'complete-product-specs': 'Spécifications complètes du produit',
      'step-by-step': 'Instructions d\'installation étape par étape',
      'technical-drawings': 'Dessins techniques et modèles 3D',
      'quality-certifications': 'Certifications de Qualité',
      'quality-management': 'Système de Gestion de la Qualité',
      'structural-steel': 'Composants en Acier Structurel',
      'greenhouse-covering': 'Matériaux de Couverture de Serre',
      'professional-greenhouse': 'Composants Professionnels de Serre',
      'quality-certified': 'Accessoires et Fournitures Certifiés Qualité',
      'technical-documentation': 'Documentation Technique'
    },
    footer: {
      description: 'Transformer l\'agriculture africaine grâce aux solutions d\'agriculture de précision.',
      quickLinks: 'Liens Rapides',
      aboutUs: 'À Propos',
      about: 'À Propos',
      solutions: 'Solutions',
      contactUs: 'Nous Contacter',
      contact: 'Nous Contacter',
      contactInfo: 'Nous Contacter',
      newsletter: 'Newsletter',
      subscribe: 'S\'abonner',
      emailPlaceholder: 'Votre adresse email',
      copyright: 'Tous droits réservés.',
      terms: 'Conditions',
      privacy: 'Confidentialité',
      cookies: 'Cookies'
    },
    errors: {
      pageNotFound: 'Page Non Trouvée',
      serverError: 'Erreur Serveur',
      networkError: 'Erreur Réseau',
      tryAgain: 'Réessayer',
      goHome: 'Accueil'
    },
    validation: {
      required: 'Ce champ est obligatoire',
      email: 'Veuillez entrer une adresse email valide',
      phone: 'Veuillez entrer un numéro de téléphone valide',
      minLength: 'Minimum {min} caractères requis',
      maxLength: 'Maximum {max} caractères autorisés'
    },
    greenhouse: {
      categories: {
        structural: 'Composants Structurels',
        arches: 'Arcs et Fermes',
        support: 'Systèmes de Support',
        fasteners: 'Attaches et Connexions',
        connectors: 'Connecteurs Structurels',
        coverage: 'Matériaux de Couverture et Contrôle Climatique',
        films: 'Films et Feuilles',
        screens: 'Filets Anti-Insectes',
        growing: 'Accessoires de Culture'
      },
      specs: {
        material: 'Matériau',
        thickness: 'Épaisseur',
        loadCapacity: 'Capacité de Charge',
        span: 'Portée',
        coating: 'Revêtement',
        size: 'Taille',
        torque: 'Couple',
        standard: 'Norme',
        dimensions: 'Dimensions',
        climate: 'Climat',
        lifespan: 'Durée de Vie',
        installation: 'Installation',
        lightTransmission: 'Transmission Lumineuse',
        uvStability: 'Stabilité UV',
        thermalRetention: 'Rétention Thermique',
        lightDiffusion: 'Diffusion Lumineuse',
        mesh: 'Maille',
        airflow: 'Débit d\'Air',
        shading: 'Ombrage',
        diameter: 'Diamètre',
        wireSpacing: 'Espacement des Fils',
        postHeight: 'Hauteur du Poteau',
        rollLength: 'Longueur du Rouleau',
        strength: 'Résistance'
      },
      products: {
        premiumArch: 'Arc Premium 9600',
        reinforcedTruss: 'Système de Ferme Renforcé',
        heavyDutyColumn: 'Colonne Extra-Résistante',
        crossBracing: 'Kit de Contreventement',
        heavyDutyBolt: 'Ensemble de Boulons Extra-Résistants',
        channelConnector: 'Connecteur de Canal',
        ultraClearFilm: 'Film EVA Ultra-Transparent',
        diffusedFilm: 'Film à Lumière Diffuse',
        antiThripNet: 'Filet Anti-Thrips',
        cropSupportWire: 'Fil de Support de Culture',
        trellisSupport: 'Système de Support en Treillis'
      },
      applications: {
        archConnections: 'Connexions d\'arc',
        mainFrame: 'Assemblage du cadre principal',
        supportBracing: 'Contreventement de support',
        purlinConnections: 'Connexions de panne',
        crossMember: 'Assemblage de traverse',
        gutterSupport: 'Support de gouttière',
        tomatoSupport: 'Support de tomate',
        cucumberTraining: 'Formation de concombre',
        vineCrops: 'Cultures de vigne',
        verticalGrowing: 'Culture verticale',
        plantTraining: 'Formation des plantes',
        rowCrops: 'Cultures en rangées'
      }
    },
    specs: {
      dimensions: 'Dimensions',
      materials: 'Matériaux',
      loadCapacity: 'Capacité de Charge',
      thickness: 'Épaisseur',
      coating: 'Revêtement',
      span: 'Portée',
      size: 'Taille',
      torque: 'Couple',
      standard: 'Norme',
      material: 'Matériau'
    },
    pages: {
      greenhouse: {
        hero: {
          title: 'Serres Agricoles Premium',
          subtitle: 'Conçues pour le Climat de l\'Afrique',
          builtForAfrica: 'Conçu pour le Climat Africain',
          tagline: 'Durée de Vie de 20+ Ans • Protection Maximale des Cultures • Technologie de Pointe',
          requestQuote: 'Demander un Devis Personnalisé',
          viewSpecs: 'Voir les Spécifications Techniques',
          viewSpecifications: 'Voir les Spécifications'
        },
        features: {
          climateAdaptive: {
            title: 'Conception Climatique Adaptative',
            description: 'Conçues spécifiquement pour les conditions climatiques africaines, nos serres maintiennent des conditions de croissance optimales toute l\'année.',
            stats: {
              cooler: '40% intérieur plus frais',
              humidity: '60% contrôle de l\'humidité',
              light: '92% transmission lumineuse'
            }
          },
          structural: {
            title: 'Durabilité Structurelle',
            description: 'Construites avec de l\'acier galvanisé à chaud et notre système breveté de verrouillage par boulons pour une résistance et une longévité inégalées.',
            stats: {
              lifespan: 'Durée de vie de 20+ ans',
              wind: 'Résistance au vent de 150 km/h',
              load: 'Capacité de charge de 25 kg/m²'
            }
          },
          coverage: {
            title: 'Système de Couverture Avancé',
            description: 'Polyéthylène multicouche stabilisé aux UV avec technologie de rétention thermique IR pour une protection optimale des cultures.',
            stats: {
              warranty: 'Garantie UV de 5 ans',
              light: '92% transmission lumineuse',
              heat: '25% meilleure rétention thermique'
            }
          },
          ventilation: {
            title: 'Ventilation Intelligente',
            description: 'Système de ventilation automatisé avec contrôle climatique de précision pour des conditions de croissance parfaites.',
            stats: {
              airChanges: '60 changements d\'air/heure',
              insect: 'Protection anti-insectes 50 mailles',
              smart: 'Contrôle climatique intelligent'
            }
          }
        },
        specifications: {
          title: 'Spécifications Techniques',
          structure: {
            category: 'Structure',
            frameMaterial: 'Matériau du Cadre',
            frameMaterialValue: 'Acier galvanisé à chaud',
            frameMaterialAdvantage: 'Résistance supérieure à la corrosion, durée de vie de 20+ ans',
            connectionSystem: 'Système de Connexion',
            connectionSystemValue: 'Technologie brevetée de verrouillage par boulons',
            connectionSystemAdvantage: '300% plus fort que les joints soudés traditionnels',
            windResistance: 'Résistance au Vent',
            windResistanceValue: 'Jusqu\'à 150 km/h',
            windResistanceAdvantage: 'Dépasse les normes de l\'industrie de 50%',
            snowLoad: 'Charge de Neige',
            snowLoadValue: '25 kg/m²',
            snowLoadAdvantage: 'Conçu pour des conditions climatiques variées'
          },
          coverage: {
            category: 'Couverture',
            material: 'Matériau',
            materialValue: 'Polyéthylène multicouche stabilisé aux UV',
            materialAdvantage: '92% de transmission lumineuse',
            uvProtection: 'Protection UV',
            uvProtectionValue: 'Blocage avancé UV-A/B/C',
            uvProtectionAdvantage: 'Protection prolongée des cultures et durée de vie du film',
            thermal: 'Propriétés Thermiques',
            thermalValue: 'Technologie de rétention thermique IR',
            thermalAdvantage: '25% meilleure régulation de la température',
            warranty: 'Garantie',
            warrantyValue: 'Garantie UV de 5 ans',
            warrantyAdvantage: 'Couverture de garantie leader de l\'industrie'
          },
          ventilation: {
            category: 'Ventilation',
            systemType: 'Type de Système',
            systemTypeValue: 'Ventilation automatisée par faîtage et latérale',
            systemTypeAdvantage: 'Contrôle climatique parfait',
            airExchange: 'Taux d\'Échange d\'Air',
            airExchangeValue: '45-60 changements d\'air/heure',
            airExchangeAdvantage: '50% meilleur que les systèmes standard',
            control: 'Système de Contrôle',
            controlValue: 'Contrôleur climatique intelligent',
            controlAdvantage: 'Réponse automatisée aux changements météorologiques',
            insectProtection: 'Protection Anti-Insectes',
            insectProtectionValue: 'Mailles anti-insectes de 50',
            insectProtectionAdvantage: 'Protection maximale contre les ravageurs'
          }
        },
        comparison: {
          title: 'Pourquoi Choisir Notre Technologie',
          connection: {
            title: 'Système de Connexion',
            standard: 'Joints Soudés Standard',
            standardPoints: {
              point1: 'Résistance limitée sous stress',
              point2: 'Sujet aux défaillances aux points de soudure',
              point3: 'Difficile à réparer',
              point4: 'Durée de vie plus courte'
            },
            premium: 'Système de Verrouillage par Boulons Arbre Bio',
            premiumPoints: {
              point1: 'Points de connexion 300% plus forts',
              point2: 'Charge de stress distribuée',
              point3: 'Entretien et réparations faciles',
              point4: 'Durée de vie de 20+ ans'
            }
          },
          coverageTech: {
            title: 'Technologie de Couverture',
            standard: 'Film UV de Base',
            standardPoints: {
              point1: 'Protection UV de base',
              point2: 'Diffusion lumineuse limitée',
              point3: 'Durée de vie de 2-3 ans',
              point4: 'Mauvaise rétention thermique'
            },
            premium: 'Film Intelligent Multicouche',
            premiumPoints: {
              point1: 'Blocage complet UV-A/B/C',
              point2: 'Diffusion lumineuse optimale',
              point3: 'Garantie de 5 ans',
              point4: 'Rétention thermique IR avancée'
            }
          }
        },
        quoteForm: {
          title: 'Demander un Devis Personnalisé',
          firstName: 'Prénom',
          lastName: 'Nom',
          email: 'Adresse Email',
          phone: 'Numéro de Téléphone',
          projectLocation: 'Emplacement du Projet',
          locationPlaceholder: 'Ville, Pays',
          greenhouseSize: 'Taille de la Serre (Mètres Carrés)',
          timeline: 'Calendrier du Projet',
          timelineImmediate: 'Immédiat (1-3 mois)',
          timelineSoon: 'Bientôt (3-6 mois)',
          timelinePlanning: 'Phase de Planification (6+ mois)',
          additionalRequirements: 'Exigences Supplémentaires',
          additionalPlaceholder: 'Parlez-nous de vos besoins spécifiques, des cultures que vous prévoyez de cultiver ou de toute exigence particulière...',
          submit: 'Soumettre une Demande de Devis'
        },
        trustIndicators: {
          iso: {
            title: 'Certifié ISO 9001:2015',
            description: 'Système de Gestion de la Qualité'
          },
          warranty: {
            title: 'Garantie de 5 Ans',
            description: 'Couverture Leader du Secteur'
          },
          projects: {
            title: '500+ Projets',
            description: 'À Travers l\'Afrique'
          }
        },
        finalCta: {
          title: 'Prêt à Transformer Votre Ferme ?',
          description: 'Contactez-nous dès aujourd\'hui pour des conseils d\'experts et des solutions personnalisées.',
          getStarted: 'Commencer',
          whatsapp: 'Discuter sur WhatsApp'
        },
        sections: {
          structural: 'Composants Structurels',
          fasteners: 'Attaches et Systèmes de Connexion',
          coverage: 'Matériaux de Couverture et Contrôle Climatique',
          growing: 'Accessoires de Culture',
          certifications: 'Certifications de Qualité',
          documentation: 'Documentation Technique',
          quoteForm: 'Demander un Devis',
          technicalSpecs: 'Spécifications Techniques',
          whyChoose: 'Pourquoi Choisir Notre Technologie'
        },
        form: {
          category: 'Catégorie de Produit',
          selectCategory: 'Sélectionner une catégorie',
          projectLocation: 'Emplacement du Projet',
          locationPlaceholder: 'Ville, Pays',
          greenhouseSize: 'Taille de la Serre (Mètres Carrés)',
          projectTimeline: 'Calendrier du Projet',
          immediate: 'Immédiat (1-3 mois)',
          soon: 'Bientôt (3-6 mois)',
          planning: 'Phase de Planification (6+ mois)',
          additionalReq: 'Exigences Supplémentaires',
          additionalPlaceholder: 'Parlez-nous de vos besoins spécifiques, des cultures que vous prévoyez de cultiver ou de toute exigence particulière...',
          submitQuote: 'Soumettre une Demande de Devis'
        },
        cta: {
          needAdvice: 'Besoin de Conseils d\'Experts ?',
          contactToday: 'Contactez-nous dès aujourd\'hui pour une consultation technique et des solutions personnalisées.',
          contactUs: 'Nous Contacter',
          whatsapp: 'Discuter sur WhatsApp'
        },
        trust: {
          isoTitle: 'Certifié ISO 9001:2015',
          isoDesc: 'Système de Gestion de la Qualité',
          warrantyTitle: 'Garantie de 5 Ans',
          warrantyDesc: 'Couverture Leader du Secteur',
          supportTitle: 'Support Expert',
          supportDesc: 'Assistance Technique Incluse'
        }
      },
      irrigation: {
        hero: {
          title: 'Contrôleurs d\'Irrigation Intelligents',
          subtitle: 'Solutions de Gestion Précise de l\'Eau',
          tagline: 'Gestion Précise de l\'Eau',
          transform: 'Transformez votre ferme avec des solutions de gestion d\'eau efficaces'
        },
        drip: {
          title: 'Systèmes d\'Irrigation Goutte-à-Goutte',
          subtitle: 'Distribution d\'Eau Efficace pour Chaque Culture'
        },
        sprinklers: {
          title: 'Systèmes d\'Arrosage',
          subtitle: 'Couverture Uniforme pour Grandes Surfaces'
        },
        benefits: {
          waterEfficiency: 'Efficacité de l\'Eau',
          waterEfficiencyDesc: 'Jusqu\'à 95% d\'efficacité d\'utilisation de l\'eau par rapport à l\'irrigation traditionnelle',
          yieldIncrease: 'Augmentation du Rendement',
          yieldIncreaseDesc: 'Augmentation de 30-100% des rendements des cultures',
          costSavings: 'Économies de Coûts',
          costSavingsDesc: 'Réduction des coûts de main-d\'œuvre et opérationnels',
          precisionControl: 'Contrôle de Précision',
          precisionControlDesc: 'Distribution précise de l\'eau et des nutriments'
        }
      },
      substrates: {
        hero: {
          title: 'Solutions de Culture Premium',
          subtitle: 'Pour l\'Agriculture Professionnelle',
          description: 'Conçues pour un rendement maximal et une croissance durable',
          explore: 'Explorer les Solutions'
        },
        benefits: {
          quality: 'Qualité Assurée',
          qualityDesc: 'Tous les produits sont soumis à des tests rigoureux et répondent aux normes de qualité internationales',
          sustainable: 'Durable',
          sustainableDesc: 'Méthodes de production et matériaux respectueux de l\'environnement',
          support: 'Support Expert',
          supportDesc: 'Guidance technique et support de nos spécialistes agricoles'
        },
        features: {
          waterRetention: 'Rétention d\'eau supérieure',
          aeration: 'Aération optimale',
          phBalanced: 'pH équilibré',
          organic: '100% organique'
        }
      }
    }
  },
  es: {
    nav: {
      greenhouses: 'Invernaderos',
      irrigation: 'Riego',
      substrates: 'Sustratos',
      projects: 'Proyectos',
      company: 'Empresa',
      blog: 'Blog',
      contact: 'Contacto',
      highTech: 'Soluciones High-Tech',
      accessories: 'Accesorios',
      dripSystems: 'Sistemas de Goteo',
      sprinklers: 'Aspersores',
      controllers: 'Controladores',
      growingSolutions: 'Soluciones de Cultivo'
    },
    hero: {
      title: 'Transformando la Agricultura Africana a Través de Soluciones de Agricultura de Precisión',
      subtitle: 'Aumenta tus rendimientos hasta 10 veces con nuestra tecnología agrícola moderna',
      getStarted: 'Comenzar',
      exploreSolutions: 'Explorar Soluciones',
      cta: {
        primary: 'Comenzar',
        secondary: 'Explorar Soluciones'
      }
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Soluciones agrícolas integrales diseñadas para las condiciones africanas',
      greenhouses: {
        title: 'Invernaderos High-Tech',
        description: 'Soluciones de invernaderos de vanguardia optimizadas para las condiciones climáticas africanas.'
      },
      greenhouse: {
        title: 'Invernaderos High-Tech',
        description: 'Soluciones de invernaderos de vanguardia optimizadas para las condiciones climáticas africanas.'
      },
      irrigation: {
        title: 'Riego de Precisión',
        description: 'Sistemas de riego inteligentes que maximizan la eficiencia del agua y los rendimientos de los cultivos.'
      },
      substrates: {
        title: 'Soluciones de Cultivo',
        description: 'Fibra de coco premium y sustratos para un crecimiento y desarrollo óptimo de las plantas.'
      },
      learnMore: 'Saber Más'
    },
    stats: {
      yieldIncrease: 'Aumento del Rendimiento',
      waterSavings: 'Ahorro de Agua',
      projectsCompleted: 'Proyectos Completados',
      africanCountries: 'Países Africanos',
      yield: 'Aumento del Rendimiento',
      water: 'Ahorro de Agua',
      projects: 'Proyectos Completados',
      countries: 'Países Africanos'
    },
    cta: {
      title: '¿Listo para Transformar tu Granja?',
      subtitle: 'Únete a cientos de agricultores exitosos en toda África que han revolucionado sus prácticas agrícolas con nuestras soluciones.',
      consultation: 'Obtener una Consulta Gratuita',
      whatsapp: 'Chatear en WhatsApp'
    },
    contact: {
      title: 'Contáctanos',
      subtitle: 'Obtén asesoramiento experto para transformar tu negocio agrícola',
      form: {
        title: 'Envíanos un Mensaje',
        firstname: 'Nombre',
        lastname: 'Apellido',
        email: 'Dirección de Email',
        phone: 'Número de Teléfono',
        interest: 'Estoy interesado en',
        message: 'Mensaje',
        required: '*',
        submit: 'Enviar Mensaje'
      },
      offices: 'Nuestras Oficinas',
      whatsapp: {
        title: '¿Necesitas Asistencia Inmediata?',
        subtitle: 'Chatea con nuestros expertos agrícolas en WhatsApp para respuestas rápidas.'
      }
    },
    blog: {
      hero: {
        title: 'Blog y Centro de Conocimiento',
        subtitle: 'Consejos de expertos y guías prácticas para la agricultura africana moderna'
      },
      newsletter: {
        title: 'Mantente Actualizado',
        subtitle: 'Suscríbete a nuestro boletín para obtener los últimos conocimientos y consejos agrícolas.',
        placeholder: 'Ingresa tu email',
        subscribe: 'Suscribirse'
      },
      featured: {
        title: 'Artículos Destacados'
      },
      latest: {
        title: 'Últimos Artículos'
      }
    },
    office: {
      abidjan: 'Oficina de Abidjan',
      capetown: 'Almacén de Ciudad del Cabo'
    },
    common: {
      'learn-more': 'Saber Más',
      'request-quote': 'Solicitar Presupuesto',
      'view-products': 'Ver Productos',
      'download': 'Descargar',
      'loading': 'Cargando...',
      'back': 'Atrás',
      'view-technical-specs': 'Ver Especificaciones Técnicas',
      'submit-quote-request': 'Enviar Solicitud de Presupuesto',
      'select-category': 'Seleccionar una categoría',
      'project-details': 'Detalles del Proyecto',
      'tell-us-about': 'Cuéntanos sobre tu proyecto y requisitos específicos...',
      'need-expert-advice': '¿Necesitas Asesoramiento Experto?',
      'contact-today': 'Contáctanos hoy para consultas técnicas y soluciones personalizadas.',
      'technical-specs': 'Especificaciones Técnicas',
      'installation-guide': 'Guía de Instalación',
      'cad-files': 'Archivos CAD',
      'complete-product-specs': 'Especificaciones completas del producto',
      'step-by-step': 'Instrucciones de instalación paso a paso',
      'technical-drawings': 'Dibujos técnicos y modelos 3D',
      'quality-certifications': 'Certificaciones de Calidad',
      'quality-management': 'Sistema de Gestión de Calidad',
      'structural-steel': 'Componentes de Acero Estructural',
      'greenhouse-covering': 'Materiales de Cobertura de Invernadero',
      'professional-greenhouse': 'Componentes Profesionales de Invernadero',
      'quality-certified': 'Accesorios y Suministros Certificados de Calidad',
      'technical-documentation': 'Documentación Técnica'
    },
    footer: {
      description: 'Transformando la agricultura africana a través de soluciones de agricultura de precisión.',
      quickLinks: 'Enlaces Rápidos',
      aboutUs: 'Acerca de Nosotros',
      about: 'Acerca de Nosotros',
      solutions: 'Soluciones',
      contactUs: 'Contáctanos',
      contact: 'Contáctanos',
      contactInfo: 'Contáctanos',
      newsletter: 'Boletín',
      subscribe: 'Suscribirse',
      emailPlaceholder: 'Tu dirección de email',
      copyright: 'Todos los derechos reservados.',
      terms: 'Términos',
      privacy: 'Privacidad',
      cookies: 'Cookies'
    },
    errors: {
      pageNotFound: 'Página No Encontrada',
      serverError: 'Error del Servidor',
      networkError: 'Error de Red',
      tryAgain: 'Intentar de Nuevo',
      goHome: 'Ir al Inicio'
    },
    validation: {
      required: 'Este campo es obligatorio',
      email: 'Por favor ingrese una dirección de email válida',
      phone: 'Por favor ingrese un número de teléfono válido',
      minLength: 'Mínimo {min} caracteres requeridos',
      maxLength: 'Máximo {max} caracteres permitidos'
    },
    greenhouse: {
      categories: {
        structural: 'Componentes Estructurales',
        arches: 'Arcos y Armaduras',
        support: 'Sistemas de Soporte',
        fasteners: 'Sujetadores y Conexiones',
        connectors: 'Conectores Estructurales',
        coverage: 'Materiales de Cobertura y Control Climático',
        films: 'Películas y Láminas',
        screens: 'Mallas Anti-Insectos',
        growing: 'Accesorios de Cultivo'
      },
      specs: {
        material: 'Material',
        thickness: 'Espesor',
        loadCapacity: 'Capacidad de Carga',
        span: 'Tramo',
        coating: 'Revestimiento',
        size: 'Tamaño',
        torque: 'Torque',
        standard: 'Estándar',
        dimensions: 'Dimensiones',
        climate: 'Clima',
        lifespan: 'Vida Útil',
        installation: 'Instalación',
        lightTransmission: 'Transmisión de Luz',
        uvStability: 'Estabilidad UV',
        thermalRetention: 'Retención Térmica',
        lightDiffusion: 'Difusión de Luz',
        mesh: 'Malla',
        airflow: 'Flujo de Aire',
        shading: 'Sombreado',
        diameter: 'Diámetro',
        wireSpacing: 'Espaciado de Alambre',
        postHeight: 'Altura del Poste',
        rollLength: 'Longitud del Rollo',
        strength: 'Resistencia'
      },
      products: {
        premiumArch: 'Arco Premium 9600',
        reinforcedTruss: 'Sistema de Armadura Reforzada',
        heavyDutyColumn: 'Columna de Servicio Pesado',
        crossBracing: 'Kit de Arriostramiento Cruzado',
        heavyDutyBolt: 'Conjunto de Pernos de Servicio Pesado',
        channelConnector: 'Conector de Canal',
        ultraClearFilm: 'Película EVA Ultra Transparente',
        diffusedFilm: 'Película de Luz Difusa',
        antiThripNet: 'Malla Anti-Trips',
        cropSupportWire: 'Alambre de Soporte de Cultivo',
        trellisSupport: 'Sistema de Soporte de Espaldera'
      },
      applications: {
        archConnections: 'Conexiones de arco',
        mainFrame: 'Ensamblaje del marco principal',
        supportBracing: 'Arriostramiento de soporte',
        purlinConnections: 'Conexiones de correa',
        crossMember: 'Unión de travesaño',
        gutterSupport: 'Soporte de canalón',
        tomatoSupport: 'Soporte de tomate',
        cucumberTraining: 'Entrenamiento de pepino',
        vineCrops: 'Cultivos de vid',
        verticalGrowing: 'Cultivo vertical',
        plantTraining: 'Entrenamiento de plantas',
        rowCrops: 'Cultivos en hileras'
      }
    },
    specs: {
      dimensions: 'Dimensiones',
      materials: 'Materiales',
      loadCapacity: 'Capacidad de Carga',
      thickness: 'Espesor',
      coating: 'Revestimiento',
      span: 'Tramo',
      size: 'Tamaño',
      torque: 'Torque',
      standard: 'Estándar',
      material: 'Material'
    },
    pages: {
      greenhouse: {
        hero: {
          title: 'Componentes Profesionales de Invernadero',
          subtitle: 'Accesorios y Suministros Certificados de Calidad',
          builtForAfrica: 'Diseñado para el Clima de África',
          tagline: 'Vida Útil de 20+ Años • Máxima Protección de Cultivos • Tecnología Líder en la Industria',
          requestQuote: 'Solicitar Presupuesto',
          viewSpecs: 'Ver Especificaciones Técnicas',
          viewSpecifications: 'Ver Especificaciones'
        },
        sections: {
          structural: 'Componentes Estructurales',
          fasteners: 'Sujetadores y Sistemas de Conexión',
          coverage: 'Materiales de Cobertura y Control Climático',
          growing: 'Accesorios de Cultivo',
          certifications: 'Certificaciones de Calidad',
          documentation: 'Documentación Técnica',
          quoteForm: 'Solicitar un Presupuesto',
          technicalSpecs: 'Especificaciones Técnicas',
          whyChoose: 'Por Qué Elegir Nuestra Tecnología'
        },
        form: {
          category: 'Categoría de Producto',
          selectCategory: 'Seleccionar una categoría',
          projectLocation: 'Ubicación del Proyecto',
          locationPlaceholder: 'Ciudad, País',
          greenhouseSize: 'Tamaño del Invernadero (Metros Cuadrados)',
          projectTimeline: 'Cronograma del Proyecto',
          immediate: 'Inmediato (1-3 meses)',
          soon: 'Pronto (3-6 meses)',
          planning: 'Fase de Planificación (6+ meses)',
          additionalReq: 'Requisitos Adicionales',
          additionalPlaceholder: 'Cuéntanos sobre tus necesidades específicas, los cultivos que planeas cultivar o cualquier requisito especial...',
          submitQuote: 'Enviar Solicitud de Presupuesto'
        },
        cta: {
          needAdvice: '¿Necesitas Asesoramiento Experto?',
          contactToday: 'Contáctanos hoy para consultas técnicas y soluciones personalizadas.',
          contactUs: 'Contáctanos',
          whatsapp: 'Chatear en WhatsApp'
        },
        trust: {
          isoTitle: 'Certificado ISO 9001:2015',
          isoDesc: 'Sistema de Gestión de Calidad',
          warrantyTitle: 'Garantía de 5 Años',
          warrantyDesc: 'Cobertura Líder en la Industria',
          supportTitle: 'Soporte Experto',
          supportDesc: 'Asistencia Técnica Incluida'
        }
      },
      irrigation: {
        hero: {
          title: 'Controladores de Riego Inteligentes',
          subtitle: 'Soluciones de Gestión Precisa del Agua',
          tagline: 'Gestión Precisa del Agua',
          transform: 'Transforma tu granja con soluciones eficientes de gestión del agua'
        },
        drip: {
          title: 'Sistemas de Riego por Goteo',
          subtitle: 'Entrega Eficiente de Agua para Cada Cultivo'
        },
        sprinklers: {
          title: 'Sistemas de Aspersores',
          subtitle: 'Cobertura Uniforme para Grandes Áreas'
        },
        benefits: {
          waterEfficiency: 'Eficiencia del Agua',
          waterEfficiencyDesc: 'Hasta 95% de eficiencia en el uso del agua comparado con el riego tradicional',
          yieldIncrease: 'Aumento del Rendimiento',
          yieldIncreaseDesc: 'Aumento del 30-100% en los rendimientos de los cultivos',
          costSavings: 'Ahorro de Costos',
          costSavingsDesc: 'Reducción de costos laborales y operacionales',
          precisionControl: 'Control de Precisión',
          precisionControlDesc: 'Entrega precisa de agua y nutrientes'
        }
      },
      substrates: {
        hero: {
          title: 'Soluciones de Cultivo Premium',
          subtitle: 'Para Agricultura Profesional',
          description: 'Diseñadas para máximo rendimiento y crecimiento sostenible',
          explore: 'Explorar Soluciones'
        },
        benefits: {
          quality: 'Calidad Asegurada',
          qualityDesc: 'Todos los productos se someten a pruebas rigurosas y cumplen con los estándares de calidad internacionales',
          sustainable: 'Sostenible',
          sustainableDesc: 'Métodos de producción y materiales ambientalmente responsables',
          support: 'Soporte Experto',
          supportDesc: 'Orientación técnica y soporte de nuestros especialistas agrícolas'
        },
        features: {
          waterRetention: 'Retención de agua superior',
          aeration: 'Aireación óptima',
          phBalanced: 'pH equilibrado',
          organic: '100% orgánico'
        }
      }
    }
  },
  af: {
    nav: {
      greenhouses: 'Kweekhuise',
      irrigation: 'Besproeiing',
      substrates: 'Substrate',
      projects: 'Projekte',
      company: 'Maatskappy',
      blog: 'Blog',
      contact: 'Kontak',
      highTech: 'Hoë-Tegnologie Oplossings',
      accessories: 'Toebehore',
      dripSystems: 'Drup Stelsels',
      sprinklers: 'Sproeiers',
      controllers: 'Beheerders',
      growingSolutions: 'Groei Oplossings'
    },
    hero: {
      title: 'Transformeer Afrika se Landbou Deur Presisie Boerdery Oplossings',
      subtitle: 'Verhoog jou opbrengste tot 10 keer met ons moderne landbou tegnologie',
      getStarted: 'Begin',
      exploreSolutions: 'Verken Oplossings',
      cta: {
        primary: 'Begin',
        secondary: 'Verken Oplossings'
      }
    },
    services: {
      title: 'Ons Dienste',
      subtitle: 'Omvattende landbou oplossings ontwerp vir Afrika toestande',
      greenhouses: {
        title: 'Hoë-Tegnologie Kweekhuise',
        description: 'Gevorderde kweekhuise oplossings geoptimaliseer vir Afrika klimaat toestande.'
      },
      greenhouse: {
        title: 'Hoë-Tegnologie Kweekhuise',
        description: 'Gevorderde kweekhuise oplossings geoptimaliseer vir Afrika klimaat toestande.'
      },
      irrigation: {
        title: 'Presisie Besproeiing',
        description: 'Slim besproeiing stelsels wat water doeltreffendheid en gewas opbrengste maksimeer.'
      },
      substrates: {
        title: 'Groei Oplossings',
        description: 'Premium koko turfmoss en substrate vir optimale plant groei en ontwikkeling.'
      },
      learnMore: 'Leer Meer'
    },
    stats: {
      yieldIncrease: 'Opbrengs Verhoging',
      waterSavings: 'Water Besparing',
      projectsCompleted: 'Projekte Voltooi',
      africanCountries: 'Afrika Lande',
      yield: 'Opbrengs Verhoging',
      water: 'Water Besparing',
      projects: 'Projekte Voltooi',
      countries: 'Afrika Lande'
    },
    cta: {
      title: 'Gereed om Jou Plaas te Transformeer?',
      subtitle: 'Sluit aan by honderde suksesvolle boere regoor Afrika wat hul landbou praktyke revolusioneer het met ons oplossings.',
      consultation: 'Kry \'n Gratis Konsultasie',
      whatsapp: 'Gesels op WhatsApp'
    },
    contact: {
      title: 'Kontak Ons',
      subtitle: 'Kry deskundige advies om jou landboubesigheid te transformeer',
      form: {
        title: 'Stuur Vir Ons \'n Boodskap',
        firstname: 'Voornaam',
        lastname: 'Van',
        email: 'E-posadres',
        phone: 'Telefoonnommer',
        interest: 'Ek stel belang in',
        message: 'Boodskap',
        required: '*',
        submit: 'Stuur Boodskap'
      },
      offices: 'Ons Kantore',
      whatsapp: {
        title: 'Benodig Onmiddellike Hulp?',
        subtitle: 'Gesels met ons landboukundiges op WhatsApp vir vinnige antwoorde.'
      }
    },
    blog: {
      hero: {
        title: 'Blog en Kennis Sentrum',
        subtitle: 'Deskundige insigte en praktiese gidse vir moderne Afrika landbou'
      },
      newsletter: {
        title: 'Bly Op Hoogte',
        subtitle: 'Teken in op ons nuusbrief vir die nuutste landbou-insigte en wenke.',
        placeholder: 'Voer jou e-pos in',
        subscribe: 'Teken In'
      },
      featured: {
        title: 'Uitstaande Artikels'
      },
      latest: {
        title: 'Nuutste Artikels'
      }
    },
    office: {
      abidjan: 'Abidjan Kantoor',
      capetown: 'Kaapstad Pakhuis'
    },
    common: {
      'learn-more': 'Leer Meer',
      'request-quote': 'Versoek Kwotasie',
      'view-products': 'Bekyk Produkte',
      'download': 'Aflaai',
      'loading': 'Laai...',
      'back': 'Terug',
      'view-technical-specs': 'Bekyk Tegniese Spesifikasies',
      'submit-quote-request': 'Dien Kwotasie Versoek In',
      'select-category': 'Kies \'n kategorie',
      'project-details': 'Projekbesonderhede',
      'tell-us-about': 'Vertel ons van jou projek en spesifieke vereistes...',
      'need-expert-advice': 'Benodig Deskundige Advies?',
      'contact-today': 'Kontak ons vandag vir tegniese konsultasie en aangepaste oplossings.',
      'technical-specs': 'Tegniese Spesifikasies',
      'installation-guide': 'Installasiegids',
      'cad-files': 'CAD Lêers',
      'complete-product-specs': 'Volledige produk spesifikasies',
      'step-by-step': 'Stap-vir-stap installasie instruksies',
      'technical-drawings': 'Tegniese tekeninge en 3D modelle',
      'quality-certifications': 'Kwaliteit Sertifisering',
      'quality-management': 'Kwaliteit Bestuur Stelsel',
      'structural-steel': 'Strukturele Staal Komponente',
      'greenhouse-covering': 'Kwekhuis Bedekking Materiale',
      'professional-greenhouse': 'Professionele Kwekhuis Komponente',
      'quality-certified': 'Kwaliteit-Gesertifiseerde Toebehore en Voorrade',
      'technical-documentation': 'Tegniese Dokumentasie'
    },
    footer: {
      description: 'Transformeer Afrika landbou deur presisie boerdery oplossings.',
      quickLinks: 'Vinnige Skakels',
      aboutUs: 'Oor Ons',
      about: 'Oor Ons',
      solutions: 'Oplossings',
      contactUs: 'Kontak Ons',
      contact: 'Kontak Ons',
      contactInfo: 'Kontak Ons',
      newsletter: 'Nuusbrief',
      subscribe: 'Teken In',
      emailPlaceholder: 'Jou email adres',
      copyright: 'Alle regte voorbehou.',
      terms: 'Voorwaardes',
      privacy: 'Privaatheid',
      cookies: 'Koekies'
    },
    errors: {
      pageNotFound: 'Bladsy Nie Gevind Nie',
      serverError: 'Bediener Fout',
      networkError: 'Netwerk Fout',
      tryAgain: 'Probeer Weer',
      goHome: 'Gaan Huis Toe'
    },
    validation: {
      required: 'Hierdie veld is verplig',
      email: 'Voer asseblief \'n geldige e-posadres in',
      phone: 'Voer asseblief \'n geldige telefoonnommer in',
      minLength: 'Minimum {min} karakters vereis',
      maxLength: 'Maksimum {max} karakters toegelaat'
    },
    greenhouse: {
      categories: {
        structural: 'Strukturele Komponente',
        arches: 'Boograme en Spante',
        support: 'Ondersteuningstelsels',
        fasteners: 'Hegters en Verbindings',
        connectors: 'Strukturele Konnektors',
        coverage: 'Bedekkingsmateriaal en Klimaatbeheer',
        films: 'Films en Blaaie',
        screens: 'Insek Skerms',
        growing: 'Kweek Toebehore'
      },
      specs: {
        material: 'Materiaal',
        thickness: 'Dikte',
        loadCapacity: 'Laai Kapasiteit',
        span: 'Span',
        coating: 'Deklaag',
        size: 'Grootte',
        torque: 'Wringkrag',
        standard: 'Standaard',
        dimensions: 'Afmetings',
        climate: 'Klimaat',
        lifespan: 'Lewensduur',
        installation: 'Installasie',
        lightTransmission: 'Lig Oordrag',
        uvStability: 'UV Stabiliteit',
        thermalRetention: 'Termiese Retensie',
        lightDiffusion: 'Lig Verspreiding',
        mesh: 'Maas',
        airflow: 'Lugvloei',
        shading: 'Skadu',
        diameter: 'Deursnee',
        wireSpacing: 'Draad Spasiëring',
        postHeight: 'Paal Hoogte',
        rollLength: 'Rol Lengte',
        strength: 'Sterkte'
      },
      products: {
        premiumArch: 'Premium Boog 9600',
        reinforcedTruss: 'Versterkte Spant Stelsel',
        heavyDutyColumn: 'Swaar Plig Kolom',
        crossBracing: 'Kruis Verstewiging Stel',
        heavyDutyBolt: 'Swaar Plig Bout Stel',
        channelConnector: 'Kanaal Konnektor',
        ultraClearFilm: 'Ultra Helder EVA Film',
        diffusedFilm: 'Verspreide Lig Film',
        antiThripNet: 'Anti-Trips Net',
        cropSupportWire: 'Gewas Ondersteuning Draad',
        trellisSupport: 'Raamwerk Ondersteuning Stelsel'
      },
      applications: {
        archConnections: 'Boog verbindings',
        mainFrame: 'Hoofras montering',
        supportBracing: 'Ondersteuning verstewiging',
        purlinConnections: 'Dakspar verbindings',
        crossMember: 'Dwarsstaaf verbinding',
        gutterSupport: 'Geut ondersteuning',
        tomatoSupport: 'Tamatie ondersteuning',
        cucumberTraining: 'Komkommer opleiding',
        vineCrops: 'Wingerd gewasse',
        verticalGrowing: 'Vertikale kweek',
        plantTraining: 'Plant opleiding',
        rowCrops: 'Ry gewasse'
      }
    },
    specs: {
      dimensions: 'Afmetings',
      materials: 'Materiale',
      loadCapacity: 'Laai Kapasiteit',
      thickness: 'Dikte',
      coating: 'Deklaag',
      span: 'Span',
      size: 'Grootte',
      torque: 'Wringkrag',
      standard: 'Standaard',
      material: 'Materiaal'
    },
    pages: {
      greenhouse: {
        hero: {
          title: 'Professionele Kwekhuis Komponente',
          subtitle: 'Kwaliteit-Gesertifiseerde Toebehore en Voorrade',
          builtForAfrica: 'Gebou vir Afrika se Klimaat',
          tagline: 'Lewensduur van 20+ Jaar • Maksimum Gewas Beskerming • Voorste Industrie Tegnologie',
          requestQuote: 'Versoek Kwotasie',
          viewSpecs: 'Bekyk Tegniese Spesifikasies',
          viewSpecifications: 'Bekyk Spesifikasies'
        },
        sections: {
          structural: 'Strukturele Komponente',
          fasteners: 'Hegters en Verbindingstelsels',
          coverage: 'Bedekkingsmateriaal en Klimaatbeheer',
          growing: 'Kweek Toebehore',
          certifications: 'Kwaliteit Sertifisering',
          documentation: 'Tegniese Dokumentasie',
          quoteForm: 'Versoek \'n Kwotasie',
          technicalSpecs: 'Tegniese Spesifikasies',
          whyChoose: 'Waarom Kies Ons Tegnologie'
        },
        form: {
          category: 'Produk Kategorie',
          selectCategory: 'Kies \'n kategorie',
          projectLocation: 'Projek Ligging',
          locationPlaceholder: 'Stad, Land',
          greenhouseSize: 'Kwekhuis Grootte (Vierkante Meters)',
          projectTimeline: 'Projek Tydlyn',
          immediate: 'Onmiddellik (1-3 maande)',
          soon: 'Binnekort (3-6 maande)',
          planning: 'Beplanning Fase (6+ maande)',
          additionalReq: 'Addisionele Vereistes',
          additionalPlaceholder: 'Vertel ons van jou spesifieke behoeftes, gewasse wat jy beplan om te kweek of enige spesiale vereistes...',
          submitQuote: 'Dien Kwotasie Versoek In'
        },
        cta: {
          needAdvice: 'Benodig Deskundige Advies?',
          contactToday: 'Kontak ons vandag vir tegniese konsultasie en aangepaste oplossings.',
          contactUs: 'Kontak Ons',
          whatsapp: 'Gesels op WhatsApp'
        },
        trust: {
          isoTitle: 'ISO 9001:2015 Gesertifiseer',
          isoDesc: 'Kwaliteit Bestuur Stelsel',
          warrantyTitle: '5-Jaar Waarborg',
          warrantyDesc: 'Voorste Industrie Dekking',
          supportTitle: 'Deskundige Ondersteuning',
          supportDesc: 'Tegniese Bystand Ingesluit'
        }
      },
      irrigation: {
        hero: {
          title: 'Slim Besproeiing Beheerders',
          subtitle: 'Presiese Water Bestuur Oplossings',
          tagline: 'Presiese Water Bestuur',
          transform: 'Transformeer jou plaas met doeltreffende water bestuur oplossings'
        },
        drip: {
          title: 'Drup Besproeiing Stelsels',
          subtitle: 'Doeltreffende Water Aflewering vir Elke Gewas'
        },
        sprinklers: {
          title: 'Sproeier Stelsels',
          subtitle: 'Uniforme Dekking vir Groot Gebiede'
        },
        benefits: {
          waterEfficiency: 'Water Doeltreffendheid',
          waterEfficiencyDesc: 'Tot 95% water gebruik doeltreffendheid vergeleke met tradisionele besproeiing',
          yieldIncrease: 'Opbrengs Toename',
          yieldIncreaseDesc: '30-100% toename in gewas opbrengste',
          costSavings: 'Koste Besparings',
          costSavingsDesc: 'Verminderde arbeid en operasionele koste',
          precisionControl: 'Presisie Beheer',
          precisionControlDesc: 'Presiese water en voedingstof aflewering'
        }
      },
      substrates: {
        hero: {
          title: 'Premium Groei Oplossings',
          subtitle: 'Vir Professionele Landbou',
          description: 'Ontwerp vir maksimum opbrengs en volhoubare groei',
          explore: 'Verken Oplossings'
        },
        benefits: {
          quality: 'Kwaliteit Verseker',
          qualityDesc: 'Alle produkte ondergaan streng toetsing en voldoen aan internasionale kwaliteitstandaarde',
          sustainable: 'Volhoubaar',
          sustainableDesc: 'Omgewingsverantwoordelike produksiemetodes en materiale',
          support: 'Deskundige Ondersteuning',
          supportDesc: 'Tegniese leiding en ondersteuning van ons landboukundiges'
        },
        features: {
          waterRetention: 'Superieure water retensie',
          aeration: 'Optimale belugting',
          phBalanced: 'pH gebalanseer',
          organic: '100% organies'
        }
      }
    }
  }
};