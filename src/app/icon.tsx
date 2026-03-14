import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
    width: 512,
    height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#221F20',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg width="340" height="340" viewBox="0 0 88 100" fill="#F26322" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="20" width="10" height="40" />
                    <rect x="13" y="0" width="10" height="80" />
                    <rect x="26" y="0" width="10" height="60" />
                    <rect x="26" y="70" width="10" height="10" />
                    <rect x="39" y="0" width="10" height="100" />
                    <rect x="52" y="0" width="10" height="60" />
                    <rect x="52" y="70" width="10" height="10" />
                    <rect x="65" y="0" width="10" height="80" />
                    <rect x="78" y="20" width="10" height="40" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}
