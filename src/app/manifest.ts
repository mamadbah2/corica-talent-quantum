import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Corica Talent Quantum v8.0',
        short_name: 'Corica Talent Quantum',
        description: 'Application de gestion des talents et de la performance',
        start_url: '/',
        display: 'standalone',
        background_color: '#E3E1DB',
        theme_color: '#F26322',
        icons: [
            {
                src: '/icon',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
