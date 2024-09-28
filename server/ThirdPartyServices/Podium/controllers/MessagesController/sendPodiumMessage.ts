import { GeneralContact } from "../../../../model/GeneralContact";
import { Maybe } from "../../../../model/Maybe";
import { PodiumMessageChannel } from "./model/PodiumMessageChannel";
import { PodiumMessageSendRequestObject } from "./model/PodiumMessageSendRequestObject";
import apiUrl from './constants/apiUrl'
import { podiumHttpHeader } from "../../constants/podiumHttpHeader";
import { addNewMessageToQueue } from "../../../../controllers/MessageQueueController/tableController/addNewMessageToQueue";
import { MessageStatus } from "../../../../controllers/MessageQueueController/model/MessageStatus";
import { removeMessageQueueEntry } from "../../../../controllers/MessageQueueController/tableController/removeMessageQueueEntry";

const axios = require("axios")

const channelTypeToContactIdentifierMap: {[key in PodiumMessageChannel]: string} = {
    [PodiumMessageChannel.Email]: 'emails',
    [PodiumMessageChannel.Phone]: 'phone_numbers'
}

const channelTypeToOtherChannelTypeMap: {[key in PodiumMessageChannel]: PodiumMessageChannel} = {
    [PodiumMessageChannel.Email]: PodiumMessageChannel.Phone,
    [PodiumMessageChannel.Phone]: PodiumMessageChannel.Email
}

export type SendPodiumMessageResult = {
    success: boolean,
    channel: PodiumMessageChannel,
}

export const sendPodiumMessage = async (
    contact: GeneralContact, 
    channel: PodiumMessageChannel,
    message: string, 
    senderName: Maybe<string> = undefined, 
    subject: Maybe<string> = undefined,
    createNewMessageQueueEntry: Maybe<boolean> = false, // TODO -- Change this to true once the message queue is implemented
    //! When implementing the message queue, this should always be set to false when called from the message queue processor or it will get stuck in a loop
    setAsOpenInInbox: Maybe<boolean> = true
): Promise<SendPodiumMessageResult> => {
    try {
        // The idea for this is to use the channel value unless the contact does not have an identifier for that type
        const [recipientId, channelToUse]: [string, PodiumMessageChannel] = (() => {
            const contactIdentifierKey: string = channelTypeToContactIdentifierMap[channel]

            // Check intended channel first
            if (typeof(contact[contactIdentifierKey]) !== 'undefined') {
                const id = contact[contactIdentifierKey]

                if (id.length > 0) return [id[0], channel]
            }

            // Check for other channel identifier
            if (typeof(contact[channelTypeToContactIdentifierMap[channelTypeToOtherChannelTypeMap[channel]]]) !== 'undefined') {
                const id: string[] = contact[channelTypeToContactIdentifierMap[channelTypeToOtherChannelTypeMap[channel]]]

                if (id.length > 0) return [id[0], channelTypeToOtherChannelTypeMap[channel]]
            }
        
            throw new Error('Could not determine contact id for messaging')
        })()

        const contactName = `${contact.first_name} ${contact.last_name}`
    
        const requestObject: PodiumMessageSendRequestObject = {
            body: message,
            channel: {
                type: channelToUse,
                identifier: recipientId
            },
            contactName: contactName.length <= 0 ? undefined : contactName,
            locationUid: process.env.PODIUM_LOCATION_ID!,
            senderName,
            subject,
            setOpenInbox: setAsOpenInInbox
        }

        // TODO - Test
        try {

            //! The order of this and the below API call needs to be tested for possible race conditions, and with
            //! addNewMesageToQueue being before the API call, it's currently possible for a message to be in the queue but fail to be sent to the API.
            //! However, since sending a message will result in a webhook being triggered, if this was in a different order, it would be possible
            //! for the webhook to be triggered before the message was added to the queue, resulting in an error.
            if (createNewMessageQueueEntry) {
                try {
                    await addNewMessageToQueue(contact, channelToUse, MessageStatus.Pending, message) 
                } catch (error) {
                    console.error(`Could not add new message to queue for contact ${contact.id}`)
                    console.error(error)
                }
            } else {                
                await axios.post(apiUrl, requestObject, await podiumHttpHeader())
            }


            return new Promise((resolve) => resolve({
                success: true,
                channel: channelToUse,
            }))
        } catch (error) {
            console.error(`Unable to complete Send Podium Message request`)

            throw error
        }


    } catch (error) {
        console.error(`Error sending podium message to GeneralContact ${contact.id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}