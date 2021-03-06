const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1];
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;
  console.log('filename:', filename, 'ext:', ext);

  try {
    const s3Object = await s3.getObject({
      Bucket,
      Key
    }).promise();
    console.log('original size:', s3Object.Body.length);

    const resizedImage = await sharp(s3Object.Body)
      .resize(100, 100, { fit: 'inside' })
      .toFormat(requiredFormat)
      .toBuffer();
    console.log('Resized size:', resizedImage.length);

    const path = `avatars/thumb/${filename}`;
    await s3.putObject({
      Bucket,
      Key: path,
      Body: resizedImage
    }).promise();

    return callback(null, path);
  } catch (error) {
    console.error(error);
    return callback(error);
  }
};
