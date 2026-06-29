import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 80,
            color: 'white',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: 'serif',
          }}
        >
          $
        </div>
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            fontFamily: 'sans-serif',
          }}
        >
          C & I
        </div>
      </div>
    ),
    { ...size },
  )
}
