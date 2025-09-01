import os
import subprocess
from flask import Flask, render_template, request, send_file, abort
from werkzeug.utils import secure_filename
import secrets
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 # 100mb max file size

UPLOAD_FOLDER = os.path.join("static", "uploads")
OUTPUT_FOLDER = os.path.join("static", "processed")
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'}

os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_filename(filename):
    """Clean filename for security"""
    # Remove path traversal attempts
    filename = secure_filename(filename)
    # Additional sanitization
    filename = ''.join(c for c in filename if c.isalnum() or c in ('_', '-', '.'))
    return filename[:50] # Limit length

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
        # Check if file is present
        if 'file' not in request.files:
            return "No file uploaded", 400
        file = request.files['file']
        if file.filename == '':
            return "No file selected", 400

        if not allowed_file(file.filename):
            return "File type not allowed", 400

        original_filename = sanitize_filename(file.filename)
        output_name_raw = request.form.get('output_name', 'output')
        output_name = sanitize_filename(output_name_raw)
        if not output_name:
            output_name = 'output'
        # Create secure file paths
        input_path = os.path.join(UPLOAD_FOLDER, original_filename)
        output_path = os.path.join(OUTPUT_FOLDER, f"{output_name}.mp4")

        if os.path.exists(output_path):
            output_name = f"{output_name}_{secrets.token_hex(4)}"
            output_path = os.path.join(OUTPUT_FOLDER, f"{output_name}.mp4")

        try:
            file.save(input_path)

            # Validate file is actually a video (basic check)
            if os.path.getsize(input_path) == 0:
                os.remove(input_path)
                return "Invalid file", 400

            # FFmpeg command with security considerations
            ffmpeg_cmd = [
                "ffmpeg", "-i", input_path, "-i", "static/zzzlogo.mov",
                "-filter_complex",
                "[1:v]scale=iw/7:ih/7,format=yuva420p[logo];"
                "[0:v][logo]overlay="
                "x='if(lt(mod(150*t\\,(W-w)*2)\\,W-w)\\,mod(150*t\\,(W-w)*2)\\,(W-w)*2-mod(150*t\\,(W-w)*2))':"
                "y='if(lt(mod(75*t\\,(H-h)*2)\\,H-h)\\,mod(75*t\\,(H-h)*2)\\,(H-h)*2-mod(75*t\\,(H-h)*2))'",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-t", "30",  # Limit to 30 seconds max
                "-y", output_path
            ]

            # Run with timeout to prevent hanging
            result = subprocess.run(ffmpeg_cmd, check=True, timeout=300,
                                    capture_output=True, text=True)
            # Clean up input file after processing
            if os.path.exists(input_path):
                os.remove(input_path)

            if os.path.exists(output_path):
                return send_file(output_path, as_attachment=True)
            else:
                return "Processing failed", 500
        except subprocess.TimeoutExpired:
            # Clean up on timeout
            if os.path.exists(input_path):
                os.remove(input_path)
            return "Processing timeout - file too large", 408
        except subprocess.CalledProcessError as e:
            if os.path.exists(input_path):
                os.remove(input_path)
            return f"Error processing video: {str(e)[:100]}", 500
        except Exception as e:
            # Clean up on any error
            if os.path.exists(input_path):
                os.remove(input_path)
            return "An error occurred", 500

    return render_template("upload.html")

# Error handlers
@app.errorhandler(413)
def too_large(e):
    return "File too large", 413

@app.errorhandler(404)
def not_found(e):
    return render_template("index.html"), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)