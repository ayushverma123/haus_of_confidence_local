/*
{
  "data": {
    "createWebhook": {
      "webhook": {
        "id": "urn:blvd:Webhook:47ddad57-74bc-4f3f-b102-d42b0c918adb",
        "subscriptions": [
          {
            "id": "0148d3a1-d651-4b8e-b8d6-513d44ecdee6",
            "eventType": "APPOINTMENT_CREATED",
            "enabled": true
          }
        ]
      }
    }
  }
}
*/

import { WebhookSubscriptionInput } from "./WebhookSubscriptionInput"

export type CreateWebhookResponse = {
    // data: {
        createWebhook: {
            webhook: {
                id: string,
                enabled: boolean,
                subscriptions: WebhookSubscriptionInput[]
            }
        }
    // }
}