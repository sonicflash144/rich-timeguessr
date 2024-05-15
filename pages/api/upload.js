import { createRouter } from 'next-connect';
import multer from 'multer';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = createRouter();

router.use(upload.array('file'));

router.post(async (req, res) => {
  const folderName = new Date().toLocaleDateString().replace(/\//g, '-') + '_' + new Date().toLocaleTimeString().replace(/:/g, '-');
  const uploads = req.files.map(async (file) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folderName}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    return s3.upload(params).promise();
  });

  await Promise.all(uploads);
  res.json({ folderName });

  try {
    const results = await Promise.all(uploads);
    res.status(200).json({ data: results });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router.handler();

export const config = {
  api: {
    bodyParser: false,
  },
};
