#!/usr/bin/env python3
"""
Script to help add translation keys to i18n.ts for all languages
This helps speed up the massive translation effort
"""

# Homepage additional keys needed
homepage_keys = {
    'en': {
        'hero.cta.primaryDesc': 'Contact us to get started with agricultural solutions',
        'hero.cta.secondaryDesc': 'Explore our agricultural solutions and products',
        'hero.heroAlt': 'Hero Background',
        'partners.title': 'Our Trusted Partners',
        'partners.subtitle': 'Working together with leading organizations to transform African agriculture',
        'accessibility.impactStats': 'Our Impact Statistics',
        'accessibility.consultationDesc': 'Schedule a free consultation with our agricultural experts',
        'accessibility.whatsappDesc': 'Chat with our experts on WhatsApp for immediate assistance'
    },
    'fr': {
        'hero.cta.primaryDesc': 'Contactez-nous pour commencer avec des solutions agricoles',
        'hero.cta.secondaryDesc': 'Explorez nos solutions et produits agricoles',
        'hero.heroAlt': 'Arrière-plan héros',
        'partners.title': 'Nos Partenaires de Confiance',
        'partners.subtitle': 'Travailler ensemble avec des organisations de premier plan pour transformer l\'agriculture africaine',
        'accessibility.impactStats': 'Nos Statistiques d\'Impact',
        'accessibility.consultationDesc': 'Planifiez une consultation gratuite avec nos experts agricoles',
        'accessibility.whatsappDesc': 'Discutez avec nos experts sur WhatsApp pour une assistance immédiate'
    },
    'es': {
        'hero.cta.primaryDesc': 'Contáctanos para comenzar con soluciones agrícolas',
        'hero.cta.secondaryDesc': 'Explora nuestras soluciones y productos agrícolas',
        'hero.heroAlt': 'Fondo héroe',
        'partners.title': 'Nuestros Socios de Confianza',
        'partners.subtitle': 'Trabajando juntos con organizaciones líderes para transformar la agricultura africana',
        'accessibility.impactStats': 'Nuestras Estadísticas de Impacto',
        'accessibility.consultationDesc': 'Programa una consulta gratuita con nuestros expertos agrícolas',
        'accessibility.whatsappDesc': 'Chatea con nuestros expertos en WhatsApp para asistencia inmediata'
    },
    'af': {
        'hero.cta.primaryDesc': 'Kontak ons om te begin met landbou oplossings',
        'hero.cta.secondaryDesc': 'Verken ons landbou oplossings en produkte',
        'hero.heroAlt': 'Held Agtergrond',
        'partners.title': 'Ons Vertroude Vennote',
        'partners.subtitle': 'Saamwerk met toonaangewende organisasies om Afrika-landbou te transformeer',
        'accessibility.impactStats': 'Ons Impak Statistieke',
        'accessibility.consultationDesc': 'Skeduleer \'n gratis konsultasie met ons landboukundiges',
        'accessibility.whatsappDesc': 'Gesels met ons kundiges op WhatsApp vir onmiddellike hulp'
    }
}

print("Homepage translation keys ready to add")
print(f"Total keys per language: {len(homepage_keys['en'])}")
