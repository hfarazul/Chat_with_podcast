import os
import logging
from flask import Flask, request, jsonify, send_from_directory
import yt_dlp
import assemblyai as aai
from flask_cors import CORS
import requests
import openai
from math import ceil
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Set your API keys
aai.settings.api_key = os.getenv('YOUR_ASSEMBLY_AI_API_KEY')
openai.api_key = os.getenv('YOUR_OPENAI_API_KEY')

CHUNK_SIZE = 5242880  # 5MB

def requests_retry_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def chunked_upload(audio_file):
    headers = {'authorization': aai.settings.api_key}
    upload_url = "https://api.assemblyai.com/v2/upload"

    def read_file(filename):
        with open(filename, 'rb') as f:
            while True:
                data = f.read(CHUNK_SIZE)
                if not data:
                    break
                yield data

    for attempt in range(5):  # Try up to 5 times
        try:
            upload_response = requests_retry_session().post(
                upload_url,
                headers=headers,
                data=read_file(audio_file)
            )
            upload_response.raise_for_status()  # Raise an exception for bad status codes
            return upload_response.json()['upload_url']
        except requests.exceptions.RequestException as e:
            app.logger.error(f"Upload attempt {attempt + 1} failed: {str(e)}")
            if attempt == 4:  # If this was the last attempt
                raise
            time.sleep(2 ** attempt)  # Exponential backoff

def summarize_text(text):
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that summarizes text."},
            {"role": "user", "content": f"Summarize the following text in one paragraph:\n\n{text}"}
        ]
    )
    return response.choices[0].message.content

@app.route('/')
def serve_html():
    return send_from_directory('.', 'index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_youtube():
    youtube_url = request.json['youtube_url']

    try:
        app.logger.info(f"Attempting to download audio from: {youtube_url}")

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': 'temp/%(id)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            audio_file = f"temp/{info['id']}.mp3"

        app.logger.info("Audio download complete")

        app.logger.info("Uploading audio file to AssemblyAI")
        upload_url = chunked_upload(audio_file)

        app.logger.info("Starting transcription with AssemblyAI")
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(upload_url)

        app.logger.info("Transcription complete")
        os.remove(audio_file)

        # Process transcript and create summaries
        words = transcript.words
        total_duration = words[-1].end if words else 0
        segment_duration = 5 * 60 * 1000  # 5 minutes in milliseconds
        num_segments = ceil(total_duration / segment_duration)

        summaries = []
        for i in range(num_segments):
            start_time = i * segment_duration
            end_time = min((i + 1) * segment_duration, total_duration)
            segment_text = ' '.join([word.text for word in words if start_time <= word.start < end_time])

            if segment_text:
                summary = summarize_text(segment_text)
                summaries.append({
                    'start_time': start_time / 1000,
                    'end_time': end_time/ 1000,
                    'summary': summary
                })

        return jsonify({
            "transcript": transcript.text,
            "summaries": summaries
        })
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
