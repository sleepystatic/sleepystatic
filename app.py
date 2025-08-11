import os
import subprocess
from flask import Flask, render_template, request, send_file
from PIL import Image, ImageSequence
import numpy as np

app = Flask(__name__)
UPLOAD_FOLDER = os.path.join("static", "uploads")
OUTPUT_FOLDER = os.path.join("static", "processed")
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/music')
def music():
    return render_template("music.html")

@app.route('/games')
def clothes():
    return render_template("games.html")

@app.route('/instagram')
def instagram():
    return render_template("instagram.html")

@app.route('/contact')
def contact():
    return render_template("contact.html")

@app.route('/about')
def about():
    return render_template("about.html")
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        file = request.files.get('file')
        if file and file.filename:
            input_path = os.path.join(UPLOAD_FOLDER, file.filename)
            # output_path = os.path.join(OUTPUT_FOLDER, "output.mp4")
            output_name_raw = request.form.get('output_name', 'output')
            output_name = ''.join(c for c in output_name_raw if c.isalnum() or c in ('_', '-')).strip()
            if not output_name:
                output_name = 'output'
            output_path = os.path.join(OUTPUT_FOLDER, f"{output_name}.mp4")
            file.save(input_path)

            ffmpeg_cmd = [
                "ffmpeg", "-i", input_path, "-i", "static/zzzlogo.mov", "-filter_complex",
                "[1:v]scale=iw/7:ih/7,format=yuva420p[logo];"
                "[0:v][logo]overlay="
                "x='if(lt(mod(150*t\\,(W-w)*2)\\,W-w)\\,mod(150*t\\,(W-w)*2)\\,(W-w)*2-mod(150*t\\,(W-w)*2))':"
                "y='if(lt(mod(75*t\\,(H-h)*2)\\,H-h)\\,mod(75*t\\,(H-h)*2)\\,(H-h)*2-mod(75*t\\,(H-h)*2))'",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-y", output_path
            ]
        try:
            subprocess.run(ffmpeg_cmd, check=True)
            return send_file(output_path, as_attachment=True)
        except subprocess.CalledProcessError as e:
            return f"Error processing video: {e}", 500
    return render_template("upload.html")


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)