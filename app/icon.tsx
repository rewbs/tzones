import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '50%',
                    position: 'relative',
                }}
            >
                {/* Globe/Clock decorative elements */}
                <div
                    style={{
                        position: 'absolute',
                        top: 2,
                        left: 15,
                        width: 2,
                        height: 14,
                        background: '#06b6d4', // cyan-500
                        borderRadius: 1,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: 15,
                        left: 15,
                        width: 10,
                        height: 2,
                        background: '#3b82f6', // blue-500
                        borderRadius: 1,
                    }}
                />
                <div
                    style={{
                        borderRadius: '50%',
                        border: '2px solid #06b6d4',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: 0.5
                    }}
                />
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}
