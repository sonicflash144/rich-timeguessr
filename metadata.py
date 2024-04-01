import os
import json
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from datetime import datetime

def get_geotagging(exif):
    if not exif:
        raise ValueError("No EXIF metadata found")

    geotagging = {}
    for (idx, tag) in TAGS.items():
        if tag == 'GPSInfo':
            if idx not in exif:
                raise ValueError("No EXIF geotagging found")

            for (t, value) in GPSTAGS.items():
                if t in exif[idx]:
                    geotagging[value] = exif[idx][t]

    return geotagging

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
    lat = get_decimal_from_dms(geotags['GPSLatitude'], geotags['GPSLatitudeRef'])
    lng = get_decimal_from_dms(geotags['GPSLongitude'], geotags['GPSLongitudeRef'])

    return lat, lng

def get_image_metadata(image_path):
    image = Image.open(image_path)
    image.verify()
    exif = image._getexif()

    try:
        geotags = get_geotagging(exif)
        lat, lng = get_lat_lng(geotags)
    except ValueError:
        lat, lng = None, None

    # Extract the time the photo was taken
    if 36867 in exif:
        time_taken = datetime.strptime(exif[36867], '%Y:%m:%d %H:%M:%S').isoformat()
    else:
        time_taken = "Unknown"

    return lat, lng, time_taken

def get_images_data(directory):
    images_data = {}
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.tiff', '.webp')):
            image_path = os.path.join(directory, filename)
            lat, lng, time_taken = get_image_metadata(image_path)
            if lat is None or lng is None or time_taken == "Unknown":
                os.remove(image_path)
            else:
                images_data[filename] = {
                    "lat": lat,
                    "lng": lng,
                    "time": time_taken
                }
    return images_data

def write_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

directory = "public/images"
data = get_images_data(directory)
write_to_json(data, 'autoImageData.json')