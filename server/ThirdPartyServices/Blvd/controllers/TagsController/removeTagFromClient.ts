import { gql } from "graphql-request";
import { Id } from "../../model/Id";
import { gqlClient } from "../../gqlClient";
import { incrementServiceIdLock } from "../../../../controllers/WebhookLocksController";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate";
import { Wait } from "../../../../helpers/Wait";
import { secondsToMilliseconds } from "../../../../helpers/UnitConversions";

export const removeTagFromClient = async (clientId: Id, tagId: Id): Promise<boolean> => {
    console.log("Removing tag from Boulevard client")

    const mutation = gql`
        mutation remove_tag($entityId: ID!, $tagId: ID!) {
            removeTag(input: {
                entityId: $entityId,
                tagId: $tagId
            }) {
                tags {
                    id
                    name
                    symbol
                }
            }
        }
    `
    try {
        await gqlClient().request(mutation, { entityId: clientId, tagId: tagId })

        await incrementServiceIdLock( ThirdPartyService.Boulevard, CreateOrUpdate.Update, clientId as string)

        // Wait(secondsToMilliseconds(1))

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Could not remove Boulevard tag ${tagId} from client ${clientId}.`)
        console.error(error) 

        return new Promise((resolve) => resolve(false))
    }
}