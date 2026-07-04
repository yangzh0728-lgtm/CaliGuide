import dotenv from "dotenv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getR2Config } from "../src/lib/r2Upload";
import { getR2MockObjects } from "../src/lib/r2MockStructure";

dotenv.config();

const config = getR2Config(process.env);
const client = new S3Client({
  region: "auto",
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

const objects = getR2MockObjects({
  userId: process.env.R2_MOCK_USER_ID,
  postId: process.env.R2_MOCK_POST_ID,
  guideId: process.env.R2_MOCK_GUIDE_ID,
});

console.log(`Uploading ${objects.length} JSON mock objects to R2 bucket "${config.bucketName}"...`);

for (const object of objects) {
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: object.key,
      Body: object.body,
      ContentType: object.contentType,
    }),
  );

  console.log(`uploaded ${object.key}`);
}

console.log("R2 mock folder structure is ready.");
