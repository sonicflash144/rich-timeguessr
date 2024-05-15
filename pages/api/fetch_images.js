import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export default async function handler(req, res) {
  const { folderName } = req.query;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: folderName + '/',
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const imageUrls = data.Contents.map(item => {
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`;
    });
    res.status(200).json({ imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching images from S3' });
  }
}