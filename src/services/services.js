import { generateUUID } from '@/utils/helper/helper';

export const getPresignedURL = async (fileName) => {
  try {
    const fileNameParts = fileName.split('.');
    const fileExtension = fileNameParts.pop();
    const fileNameWithoutExtension = fileNameParts.join('.');
    const uniqueFileName = `${fileNameWithoutExtension}_${generateUUID()}.${fileExtension}`;
    const preSignedURLResponse = await fetch(
      `https://data.api.codelos.io/v7/signed-url/${uniqueFileName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination_bucket: 'codelos-flowrunner-results',
          filePath: uniqueFileName,
          prefix: 'page-builder',
        }),
      }
    );
    if (
      preSignedURLResponse.status >= 400 &&
      preSignedURLResponse.status < 500
    ) {
      const errorRepsponse = await preSignedURLResponse.json();
      throw new Error(errorRepsponse.message);
    }
    const preSignedURL = await preSignedURLResponse.json();
    return preSignedURL;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const uploadFileToS3Bucket = async (signedUrl, file) => {
  try {
    const formData = new FormData();
    formData.append('Content-Type', signedUrl['signature']['Content-Type']);
    formData.append('Policy', signedUrl['signature']['Policy']);
    formData.append(
      'X-Amz-Algorithm',
      signedUrl['signature']['X-Amz-Algorithm']
    );
    formData.append(
      'X-Amz-Credential',
      signedUrl['signature']['X-Amz-Credential']
    );
    formData.append('X-Amz-Date', signedUrl['signature']['X-Amz-Date']);
    formData.append(
      'X-amz-signature',
      signedUrl['signature']['X-amz-signature']
    );
    formData.append('acl', signedUrl['signature']['acl']);
    formData.append('bucket', signedUrl['signature']['bucket']);
    formData.append('key', signedUrl['signature']['key']);
    formData.append(
      'success_action_status',
      signedUrl['signature']['success_action_status']
    );
    formData.append('file', file);

    return await fetch(`https:${signedUrl['postEndpoint']}`, {
      body: formData,
      method: 'POST',
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
export const getFile = async (bucketKey) => {
  try {
    const preSignedURLResponse = await fetch(
      `https://0kqc0pdwzh.execute-api.eu-central-1.amazonaws.com/v2/get-file`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: bucketKey,
        }),
      }
    );
    if (
      preSignedURLResponse.status >= 400 &&
      preSignedURLResponse.status < 500
    ) {
      const errorRepsponse = await preSignedURLResponse.json();
      throw new Error(errorRepsponse.message);
    }
    const fileResponse = await preSignedURLResponse.json();
    return fileResponse;
  } catch (error) {
    throw new Error(error.message);
  }
};
