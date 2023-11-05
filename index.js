const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require('sharp');

exports.handler = async (event, context) => {
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = decodeURIComponent(
        event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );
    const dstBucket = srcBucket;
    const dstKey = `resized/${srcKey}`;

    const s3Client = new S3Client({
        region: "us-east-1",
        endpoint: "http://localhost:4566", 
        forcePathStyle: true
    });

    try {
        // Fetch the original image from S3
        const getObjectParams = { 
            Bucket: srcBucket, 
            Key: srcKey,
        };
        const imageData = await s3Client.send(new GetObjectCommand(getObjectParams));

        // Resize the image using Sharp.
        const resizedImage = await sharp(imageData.Body).resize(200, 200).toBuffer();

        // Upload the resized image back to S3
        const putObjectParams = {
            Bucket: dstBucket,
            Key: dstKey,
            Body: resizedImage,
        };
        await s3Client.send(new PutObjectCommand(putObjectParams));

        return 'Image resized and saved';
    }   catch (err) {
            console.error('Error:', err);
        throw err;
    }
};
