import { LEGAL_VERSION, type LegalDocument } from './version'

/**
 * CMS-ready legal copy. Swap this module for a remote CMS later
 * without changing screen components.
 */
export const LEGAL_DOCS: Record<LegalDocument['id'], LegalDocument> = {
  terms: {
    id: 'terms',
    title: 'Términos y condiciones',
    lastUpdated: '2026-08-03',
    version: LEGAL_VERSION,
    sections: [
      {
        heading: '1. Uso de la plataforma',
        paragraphs: [
          'Trivai es una plataforma de descubrimiento de negocios y experiencias. Al crear una cuenta o usar la app, aceptas estos Términos.',
          'Puedes explorar contenido sin iniciar sesión. Para crear contenido, reclamar un negocio o interactuar, debes registrarte y aceptar estos Términos.',
          'Trivai puede modificar funciones, suspender el servicio o actualizar estos Términos. Los cambios materiales se comunican mediante una nueva versión legal que debes aceptar para seguir usando la app con tu cuenta.',
        ],
      },
      {
        heading: '2. Cuentas de usuario',
        paragraphs: [
          'Eres responsable de la exactitud de la información de tu cuenta y de mantener la confidencialidad de tus credenciales.',
          'Debes tener capacidad legal para celebrar este acuerdo. Si usas Trivai en nombre de un negocio, declaras tener autoridad para hacerlo.',
          'Una cuenta puede ser personal (turista) o de empresa. El reclamo de un negocio está sujeto a las reglas de verificación de la plataforma.',
        ],
      },
      {
        heading: '3. Contenido generado por usuarios (UGC)',
        paragraphs: [
          'Todo el contenido que publiques (reseñas, tips, fotos, descripciones y demás) te pertenece. Concedes a Trivai una licencia mundial, no exclusiva y libre de regalías para alojar, mostrar y distribuir ese contenido dentro de la plataforma.',
          'Trivai actúa únicamente como plataforma intermediaria. No respalda ni garantiza la veracidad del contenido de usuarios o negocios.',
          'Eres el único responsable del contenido que creas. No debes publicar información ilegal, engañosa, ofensiva o que infrinja derechos de terceros.',
        ],
      },
      {
        heading: '4. Limitación de responsabilidad',
        paragraphs: [
          'Trivai se proporciona “tal cual”. En la máxima medida permitida por la ley, no somos responsables de daños indirectos, incidentales o derivados del uso de la app.',
          'La información de lugares puede basarse en datos de terceros (incluida Google Maps Platform). Trivai no garantiza la exactitud, disponibilidad u horarios de negocios mostrados.',
          'Las interacciones entre usuarios y negocios ocurren bajo su propia responsabilidad.',
        ],
      },
      {
        heading: '5. Eliminación de contenido',
        paragraphs: [
          'Trivai puede eliminar, ocultar o restringir cualquier contenido sin previo aviso si viola estos Términos, las Normas de contenido, o si es reportado de forma reiterada.',
          'Puedes solicitar la eliminación de tu propio contenido contactando soporte o usando las herramientas disponibles en la app cuando existan.',
        ],
      },
      {
        heading: '6. Suspensión de cuentas',
        paragraphs: [
          'Podemos suspender o cerrar cuentas que abusen de la plataforma, publiquen spam, intenten manipular reseñas o incumplan estos Términos.',
          'La suspensión puede ser temporal o permanente según la gravedad, sin obligación de aviso previo en casos de riesgo o abuso evidente.',
        ],
      },
      {
        heading: '7. Contacto',
        paragraphs: [
          'Para consultas legales o de soporte: survirtualnet@gmail.com',
        ],
      },
    ],
  },

  privacy: {
    id: 'privacy',
    title: 'Política de privacidad',
    lastUpdated: '2026-08-03',
    version: LEGAL_VERSION,
    sections: [
      {
        heading: '1. Datos que recogemos',
        paragraphs: [
          'Recogemos datos que nos proporcionas al registrarte: email, nombre, nombre de usuario y, si lo indicas, teléfono.',
          'También recogemos actividad dentro de la app: lugares guardados, reseñas, reclamos de negocio, preferencias y uso básico para mejorar el servicio.',
          'Si otorgas permiso, podemos usar datos de ubicación para mostrarte lugares cercanos. Puedes denegar o revocar este permiso en tu dispositivo.',
        ],
      },
      {
        heading: '2. Uso de los datos',
        paragraphs: [
          'Usamos tus datos para operar la plataforma, autenticarte, personalizar descubrimiento, permitir reclamo de negocios y comunicarnos contigo sobre tu cuenta.',
          'No vendemos tus datos personales a terceros.',
        ],
      },
      {
        heading: '3. Almacenamiento',
        paragraphs: [
          'Los datos se almacenan en infraestructura segura (incluido Supabase) con controles de acceso y cifrado en tránsito.',
          'Conservamos la información mientras tu cuenta esté activa o el tiempo necesario para cumplir obligaciones legales y de seguridad.',
        ],
      },
      {
        heading: '4. Derechos del usuario (enfoque GDPR)',
        paragraphs: [
          'Puedes solicitar acceso, rectificación o eliminación de tus datos personales contactando a survirtualnet@gmail.com.',
          'Puedes retirar consentimientos opcionales (como ubicación) desde tu dispositivo o configuración de la app.',
          'Si resides en una jurisdicción con derechos adicionales de privacidad, haremos lo razonable para atender solicitudes válidas.',
        ],
      },
      {
        heading: '5. Servicios externos',
        paragraphs: [
          'Usamos Google Maps Platform / Google Places para búsqueda y datos base de lugares (nombre, ubicación, fotos y rating base). El uso de esos servicios está sujeto a las políticas de Google.',
          'También podemos usar proveedores de autenticación (p. ej. Google OAuth) y analítica mínima necesaria para el funcionamiento del producto.',
        ],
      },
      {
        heading: '6. Menores',
        paragraphs: [
          'Trivai no está dirigido a menores de la edad mínima legal en tu jurisdicción para consentir el tratamiento de datos. Si detectamos una cuenta de un menor sin consentimiento adecuado, la eliminaremos.',
        ],
      },
    ],
  },

  'content-policy': {
    id: 'content-policy',
    title: 'Normas de contenido',
    lastUpdated: '2026-08-03',
    version: LEGAL_VERSION,
    sections: [
      {
        heading: '1. Propósito',
        paragraphs: [
          'Estas Normas protegen a la comunidad. Todo contenido generado por usuarios debe ser útil, respetuoso y veraz en la medida de lo razonable.',
        ],
      },
      {
        heading: '2. Contenido prohibido',
        paragraphs: [
          'Está prohibido el contenido ofensivo, de odio, amenazante, sexualmente explícito no contextual, o que acose a personas o grupos.',
          'Está prohibido el spam, la autopromoción excesiva no relacionada, enlaces maliciosos y manipulación de reseñas (incluyendo reseñas falsas o pagadas no divulgadas).',
          'Está prohibido el contenido deliberadamente falso o engañoso sobre negocios, horarios, precios o seguridad.',
        ],
      },
      {
        heading: '3. Moderación automática',
        paragraphs: [
          'Cualquier usuario puede reportar contenido. Si un elemento recibe más de 3 reportes, puede ocultarse automáticamente sin revisión humana previa.',
          'Trivai puede eliminar o restringir contenido sin previo aviso cuando viole estas Normas o los Términos.',
        ],
      },
      {
        heading: '4. Responsabilidad',
        paragraphs: [
          'El contenido pertenece al usuario que lo crea. Trivai solo actúa como plataforma de alojamiento y difusión.',
          'Al publicar, confirmas que tienes derecho a compartir ese contenido y que no infringe derechos de terceros.',
        ],
      },
    ],
  },
}

export function getLegalDocument(id: LegalDocument['id']): LegalDocument {
  return LEGAL_DOCS[id]
}
