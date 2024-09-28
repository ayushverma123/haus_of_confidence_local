import { onNSecondsEveryMinute } from "../../../constants/cronIntervals";
import { generateWebhooksMaintenanceTask } from "../../../controllers/WebhooksController/webhookRegistrationDefaultFunction";
import { ThirdPartyService } from "../../../model/ThirdPartyService";

const taskName = "Register Podium Webhooks"

module.exports = generateWebhooksMaintenanceTask(ThirdPartyService.Podium, taskName, onNSecondsEveryMinute(55))