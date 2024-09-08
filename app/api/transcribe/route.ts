import { NextResponse } from 'next/server'

const FLASK_API_URL = 'https://helloworld-599251896324.asia-southeast1.run.app'

export async function POST(request: Request) {
  const { youtube_url } = await request.json()

  try {
    const response = await fetch(`${FLASK_API_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ youtube_url }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ transcript: data.transcript })
  } catch (error) {
    console.error('An error occurred:', error)
    return NextResponse.json({ error: `An error occurred: ${(error as Error).message}` }, { status: 500 })
  }
}
