const fs = require('fs')

/**
 * Google Drive API Service for uploading candidate resumes
 *
 * Required environment variables:
 *
 * GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-drive-service-account.json
 * GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
 */

const getDriveClient = () => {
  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (!credentialsPath) {
    console.warn(
      '⚠️ Google Drive credentials path is missing.'
    )
    return null
  }

  try {
    if (!fs.existsSync(credentialsPath)) {
      console.error(
        `❌ Google credentials file not found: ${credentialsPath}`
      )
      return null
    }

    const { google } = require('googleapis')

    const credentials = JSON.parse(
      fs.readFileSync(credentialsPath, 'utf8')
    )

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/drive'
      ],
    })

    return google.drive({
      version: 'v3',
      auth,
    })
  } catch (error) {
    console.error(
      '❌ Failed to initialize Google Drive client:',
      error.message
    )
    return null
  }
}

/**
 * Uploads a resume to Google Drive
 *
 * @param {string} localFilePath
 * @param {string} fileName
 *
 * @returns {Promise<{
 *   fileId: string,
 *   webViewLink: string
 * }>}
 */
const uploadToGoogleDrive = async (
  localFilePath,
  fileName
) => {
  const drive = getDriveClient()

  if (!drive) {
    throw new Error(
      'Google Drive API client is not configured.'
    )
  }

  const folderId =
    process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!folderId) {
    throw new Error(
      'Google Drive Folder ID is not configured.'
    )
  }

  if (!fs.existsSync(localFilePath)) {
    throw new Error(
      `Local resume file not found: ${localFilePath}`
    )
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  }

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(localFilePath),
  }

  try {
    console.log(
      `Uploading ${fileName} to Google Drive...`
    )

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
    })

    // Allow the generated link to be viewed by anyone
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    console.log(
      `Resume uploaded successfully. File ID: ${response.data.id}`
    )

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    }
  } catch (error) {
    console.error(
      '❌ Google Drive upload failed:',
      error.message
    )

    throw error
  }
}

module.exports = {
  uploadToGoogleDrive,
}