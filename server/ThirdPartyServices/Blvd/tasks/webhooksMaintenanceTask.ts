import { onNSecondsEveryMinute } from "../../../constants/cronIntervals"
import { generateWebhooksMaintenanceTask } from "../../../controllers/WebhooksController/webhookRegistrationDefaultFunction"
import { ThirdPartyService } from "../../../model/ThirdPartyService"

const taskName = "Register Boulevard Webhooks"

module.exports = generateWebhooksMaintenanceTask(ThirdPartyService.Boulevard, taskName, onNSecondsEveryMinute(55))