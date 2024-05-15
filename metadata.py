from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
    
from dotenv import load_dotenv
load_dotenv('.env.local')
import os
import shutil
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
import json
import sys
from PIL import Image
from pillow_heif import register_heif_opener
register_heif_opener()
from PIL.ExifTags import GPSTAGS, IFD
from datetime import datetime
import boto3

def download_images_from_s3(bucket_name, folder_name, local_directory):
    s3 = boto3.client('s3')
    objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
    
    if not os.path.exists(local_directory):
        os.makedirs(local_directory)
    
    for obj in objects.get('Contents', []):
        if obj['Key'].endswith(('/')):
            continue  # Skip directories
        local_path = os.path.join(local_directory, os.path.basename(obj['Key']))
        s3.download_file(bucket_name, obj['Key'], local_path)

    return local_directory

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

def get_image_metadata(image_path):
    image = Image.open(image_path)
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

def get_images_data(directory):
    images_data = {}
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.heic', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.tiff', '.webp')):
            image_path = os.path.join(directory, filename)
            lat, lng, time_taken = get_image_metadata(image_path)
            if lat is None or lng is None or time_taken == "Unknown":
                os.remove(image_path)
            else:
                if filename.lower().endswith('.heic'):
                    image = Image.open(image_path)
                    filename = filename.lower().replace('.heic', '.jpg')
                    new_image_path = os.path.join(directory, filename)
                    image.save(new_image_path, format('png'))
                    os.remove(image_path)
                images_data[filename] = {
                    "lat": lat,
                    "lng": lng,
                    "time": time_taken
                }
    return images_data

def write_to_json(data, filename):
    with open(os.path.join('public', filename), 'w') as f:
        json.dump(data, f)

@app.route('/python/metadata', methods=['GET'])
def metadata():
    bucket_name = 'custom-timeguessr'
    folder_name = request.args.get('folderName')

    local_directory = 'public/images'
    if os.path.exists(local_directory):
        shutil.rmtree(local_directory)
    os.makedirs(local_directory)

    # Download images from S3 to local directory
    download_images_from_s3(bucket_name, folder_name, local_directory)
    
    # Process images in the local directory
    images_data = get_images_data(local_directory)
    
    # Save the processed data to JSON
    write_to_json(images_data, 'autoImageData.json')

    return jsonify(images_data)

@app.route('/python/images', methods=['GET'])
def handler():
    try:
        directory_path = os.path.join(os.getcwd(), 'public', 'images')
        files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]

        image_extensions = ['.heic', '.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg']
        image_files = [file for file in files if os.path.splitext(file)[1].lower() in image_extensions]

        image_data_path = os.path.join(os.getcwd(), 'public', 'autoImageData.json')
        with open(image_data_path, 'r') as f:
            image_data = json.load(f)

        images_with_metadata = []
        for file in image_files:
            metadata = image_data.get(file)
            images_with_metadata.append({
                'file': file,
                'lat': metadata.get('lat') if metadata else None,
                'lng': metadata.get('lng') if metadata else None,
                'time': metadata.get('time') if metadata else None
            })

        return jsonify(images_with_metadata), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(port=5328)