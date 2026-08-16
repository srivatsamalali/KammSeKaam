const { google } = require('googleapis')
const fs = require('fs')

/**
 * Google Drive API Service for uploading candidate resumes
 * 
 * Required environment variables in backend/.env:
 * 
 * GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
 * GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
 * GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j-klmnopqrstuvwxyz
 */

const getDriveClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!email || !privateKey) {
    console.warn('⚠️ Google Drive credentials missing in environment variables. Falling back to local storage.')
    return null
  }

  try {
    const auth = new google.auth.JWT(
      email,
      null,
      privateKey.replace(/\\n/g, '\n'), // Replace escaped newlines
      ['https://www.googleapis.com/auth/drive.file']
    )
    return google.drive({ version: 'v3', auth })
  } catch (error) {
    console.error('❌ Failed to initialize Google Drive client:', error.message)
    return null
  }
}

/**
 * Uploads a local file to Google Drive and returns the file web view link and file ID
 * @param {string} localFilePath Path to the local file
 * @param {string} fileName Name of the file on Google Drive
 * @returns {Promise<{fileId: string, webViewLink: string}>}
 */
const uploadToGoogleDrive = async (localFilePath, fileName) => {
  const drive = getDriveClient()
  if (!drive) {
    throw new Error('Google Drive API client is not configured.')
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : []
  }

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(localFilePath)
  }

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    })

    // Optional: Share the file publicly so recruiters/clients can view it directly
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink
    }
  } catch (error) {
    console.error('❌ Google Drive upload failed:', error.message)
    throw error
  }
}

module.exports = {
  uploadToGoogleDrive
}
