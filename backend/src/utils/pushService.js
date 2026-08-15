const webpush = require('web-push')
const { PushSubscription } = require('../models')

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:Contact@astonrecruitment.in'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  )
}

const sendPushNotification = async (userId, payload) => {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('⚡ [PUSH DEV MODE] VAPID keys not configured. Push skipped for:', userId)
      return
    }

    const subscriptions = await PushSubscription.findAll({ where: { userId } })
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user: ${userId}`)
      return
    }

    const payloadString = JSON.stringify(payload)

    const promises = subscriptions.map(async (sub) => {
      try {
        const subObject = {
          endpoint: sub.endpoint,
          keys: sub.keys
        }
        await webpush.sendNotification(subObject, payloadString)
        console.log(`Successfully sent push notification to subscription: ${sub.id}`)
      } catch (error) {
        // If the subscription is no longer valid (e.g. 410 Gone or 404 Not Found), delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Deleting expired push subscription: ${sub.id}`)
          await sub.destroy()
        } else {
          console.error(`Error sending push notification to subscription ${sub.id}:`, error.message)
        }
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('sendPushNotification error:', error)
  }
}

module.exports = { sendPushNotification }
