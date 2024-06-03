from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
    
from dotenv import load_dotenv
load_dotenv('.env.local')
import os
import boto3
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
bucket_name = 'custom-timeguessr'
s3 = boto3.client('s3')
import json
from PIL import Image
from pillow_heif import register_heif_opener
register_heif_opener()
from PIL.ExifTags import GPSTAGS, IFD
from datetime import datetime
from io import BytesIO

def get_decimal_from_dms(dms, ref):
    degrees = dms[0]
    minutes = dms[1] / 60.0
    seconds = dms[2] / 3600.0

    if ref in ['S', 'W']:
        degrees = -degrees
        minutes = -minutes
        seconds = -seconds

    return round(degrees + minutes + seconds, 5)

def get_lat_lng(geotags):
    if 'GPSLatitude' in geotags and 'GPSLongitude' in geotags:
        lat = get_decimal_from_dms(geotags['GPSLatitude'], geotags['GPSLatitudeRef'])
        lng = get_decimal_from_dms(geotags['GPSLongitude'], geotags['GPSLongitudeRef'])
    else:
        lat, lng = None, None

    return lat, lng

def get_image_metadata(image_bytes):
    image = Image.open(image_bytes)
    exif = image.getexif()

    geotags = {}
    if IFD.GPSInfo in exif:
        for tag, value in exif.get_ifd(IFD.GPSInfo).items():
            geotag = GPSTAGS.get(tag, tag)
            geotags[geotag] = value
    lat, lng = get_lat_lng(geotags)

    if 306 in exif:
        time_taken = datetime.strptime(exif[306], '%Y:%m:%d %H:%M:%S').isoformat()
    else:
        time_taken = "Unknown"

    return lat, lng, time_taken

def process_images_from_s3(bucket_name, folder_name):
    objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
    images_data = {}

    for obj in objects.get('Contents', []):
        if obj['Key'].endswith('/'):
            continue
        file_stream = BytesIO()
        s3.download_fileobj(bucket_name, obj['Key'], file_stream)
        file_stream.seek(0)

        lat, lng, time_taken = get_image_metadata(file_stream)
        if lat is None or lng is None or time_taken == "Unknown":
            continue  # Skip images without metadata
        else:
            file_name = os.path.basename(obj['Key'])
            file_url = f"https://{bucket_name}.s3.amazonaws.com/{obj['Key']}"
            if file_name.lower().endswith('.heic'):
                image = Image.open(file_stream)
                file_name = file_name.lower().replace('.heic', '.jpg')
                image_bytes = BytesIO()
                image.save(image_bytes, format('JPEG'))
                image_bytes.seek(0)
                new_key = f"{folder_name}/{file_name}"
                s3.put_object(Bucket=bucket_name, Key=new_key, Body=image_bytes, ContentType='image/jpeg')
                s3.delete_object(Bucket=bucket_name, Key=obj['Key'])
                file_url = f"https://{bucket_name}.s3.amazonaws.com/{new_key}"
            images_data[file_name] = {
                "lat": lat,
                "lng": lng,
                "time": time_taken,
                "url": file_url
            }
    return images_data

def write_to_s3(bucket_name, data, filename):
    json_data = json.dumps(data).encode('utf-8')
    s3.put_object(Bucket=bucket_name, Key=filename, Body=json_data, ContentType='application/json')

@app.route('/python/upload', methods=['POST'])
def upload_files():
    if 'file' not in request.files:
        return jsonify({"error": "No files part"}), 400

    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "No files selected"}), 400

    folder_name = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    uploads = []

    for file in files:
        key = f"{folder_name}/{file.filename}"
        try:
            s3.upload_fileobj(
                Fileobj=file,
                Bucket=bucket_name,
                Key=key,
                ExtraArgs={'ContentType': file.mimetype}
            )
            uploads.append(key)
        except Exception as e:
            app.logger.error(f"Error uploading {file.filename} to S3: {e}")
            return jsonify({"error": str(e)}), 500

    return jsonify({"folderName": folder_name, "files": uploads})

@app.route('/python/metadata', methods=['GET'])
def metadata():
    bucket_name = 'custom-timeguessr'
    folder_name = request.args.get('folderName')

    images_data = process_images_from_s3(bucket_name, folder_name)
    write_to_s3(bucket_name, images_data, f'{folder_name}/autoImageData.json')
    return jsonify(images_data)

@app.route('/python/images', methods=['GET'])
def handler():
    try:
        bucket_name = 'custom-timeguessr'
        folder_name = request.args.get('folderName')

        image_data_key = f'{folder_name}/autoImageData.json'
        image_data_obj = s3.get_object(Bucket=bucket_name, Key=image_data_key)
        image_data = json.loads(image_data_obj['Body'].read().decode('utf-8'))

        images_with_metadata = [
            {
                'file': file,
                'lat': metadata.get('lat'),
                'lng': metadata.get('lng'),
                'time': metadata.get('time'),
                'url': metadata.get('url')
            } for file, metadata in image_data.items()
        ]

        return jsonify(images_with_metadata), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal Server Error'}), 500
    
@app.route('/')
def home():
    return "Hello, World!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)