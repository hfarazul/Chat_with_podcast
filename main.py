from flask import Flask
import os
import logging
from flask import Flask, request, jsonify, send_from_directory, send_file
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import openai
from math import ceil
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Set your OpenAI API key
openai.api_key = os.getenv('YOUR_OPENAI_API_KEY')

@app.route('/hello-world')
def hello_world():
    return 'Hello, World!, welcome to GC'

def get_video_id(url):
    # Extract video ID from YouTube URL
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if video_id_match:
        return video_id_match.group(1)
    return None

def summarize_text(text):
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that summarizes podcast content. Please format your summary with proper structure, including:\n- Use <h3> tags for main headings\n- Use <strong> tags for important concepts\n- Use <p> tags for paragraphs\n- Use <ul> and <li> tags for lists if needed"},
            {"role": "user", "content": f"Summarize the following podcast segment in a structured format with multiple paragraphs:\n\n{text}"}
        ]
    )
    return response.choices[0].message.content

@app.route('/')
def serve_html():
    return send_from_directory('.', 'index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_youtube():
    youtube_url = request.json['youtube_url']
    video_id = get_video_id(youtube_url)

    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    try:
        app.logger.info(f"Attempting to transcribe video: {video_id}")

        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        formatter = TextFormatter()
        text_transcript = formatter.format_transcript(transcript)

        app.logger.info("Transcription complete")

        # Process transcript and create summaries
        total_duration = transcript[-1]['start'] + transcript[-1]['duration']
        segment_duration = 15 * 60  # 15 minutes in seconds
        num_segments = ceil(total_duration / segment_duration)

        summaries = []
        for i in range(num_segments):
            start_time = i * segment_duration
            end_time = min((i + 1) * segment_duration, total_duration)
            segment_text = ' '.join([t['text'] for t in transcript if start_time <= t['start'] < end_time])

            if segment_text:
                summary = summarize_text(segment_text)
                summaries.append({
                    'start_time': start_time,
                    'end_time': end_time,
                    'summary': summary
                })

        return jsonify({
            "transcript": text_transcript,
            "summaries": summaries
        })
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

def get_chat_response(transcript, question):
    system_prompt = """You are an AI assistant tasked with answering questions about a podcast.
    Your answers should be:
    - Strictly based on the podcast content
    - Crisp and precise
    - Include the tone of the speaker when relevant

    Format your responses with:
    - Use <h3> tags for main headings
    - Use <strong> tags for important concepts
    - Use <p> tags for paragraphs
    - Use <ul> and <li> tags for lists if needed

    If the answer is not in the podcast content, say so politely."""

    response = openai.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Podcast content: {transcript}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    transcript = data['transcript']
    question = data['question']

    try:
        answer = get_chat_response(transcript, question)
        return jsonify({"answer": answer})
    except Exception as e:
        app.logger.error(f"An error occurred during chat: {str(e)}", exc_info=True)
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
