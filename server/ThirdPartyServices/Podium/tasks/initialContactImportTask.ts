import { onNSecondsEveryMinute, onNSecondsEveryNMinutes } from "../../../constants/cronIntervals"
import { convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, storeGeneralContactInDatabase } from "../../../controllers/GeneralContactsController"
import { MutexTypes, getMutex, modifyMutex } from "../../../controllers/MutexController"
import { CronTask, announceToConsole as _announceToConsole, skippingTaskPrefix } from "../../../lib/CronTask"
import { GeneralContact } from "../../../model/GeneralContact"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { getInitialTagTrackerPull, getTagTracker } from "../../Blvd/StateManager/BlvdStateManager"
import { TagTracker } from "../../../controllers/StateManager/model/TagTracker"
import { getTagTracker as getBoulevardTagTracker } from "../../Blvd/StateManager/BlvdStateManager"
import { getPodiumAccessTokenValue, getPodiumInitialContactSyncCompletedValue, updatePodiumInitialContactSyncCompletedValue } from "../stateManager"
import { getAllContacts } from "../controllers/ContactController"
import { getAllTags } from "../controllers/ContactTagsController"
import { Contact } from "../model/Contact"
import { ContactTag } from "../model/ContactTag"
import { titleAndIdDict } from "../controllers/ContactTagsController/model/TitleAndId"
import { justTitleAndId } from "../controllers/ContactTagsController/justTitleAndId"
import { Tag } from "../../Blvd/model/Tag"
import { createNewTag } from "../../Blvd/controllers/TagsController"
import { Id } from "../../Blvd/model/Id"
import { refreshTagTracker } from "../tagTracker/refreshTagTracker"
import { refreshTagTracker as refreshBoulevardTagTracker } from "../../Blvd/StateManager/TagTracker"
import { getContactObjectTagArrayFromTagTracker } from "../tagTracker/getContactObjectTagArrayFromTagTracker"
import { contactHasIdentityFilter } from "../helpers/contactHasIdentityFilter"
import { makePlural } from "../../../helpers/StringHelper"

const taskName = "Import Podium Contacts"
const service = ThirdPartyService.Podium
const mutexType = MutexTypes.ContactImport

const importPodiumContactsTask = CronTask(onNSecondsEveryMinute(10), taskName, async () => {
    
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false)

    // Check for podium access token
    if (!await getPodiumAccessTokenValue()) {
        announceToConsole(`${skippingTaskPrefix} missing Podium access token`)

        return
    }

    // Check that Boulevard tags have been pulled already
    if (!await getInitialTagTrackerPull()) {
        announceToConsole(`${skippingTaskPrefix} Boulevard tags have not been retrieved`)
    }

    // Check that initial contact import has not already been completed
    if (await getPodiumInitialContactSyncCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} initial contact import has already been completed`)

        return
    }

    //Check for mute
    if (!await getMutex(service, mutexType)) {
        try {
           // Lock mutex
            await lockMutex() 

            //? Refresh Boulevard and Podium tag trackers
            //? Get all podium tags and compare them against the boulevard tags
            // TODO -- Tags that exist already on the Podium end but not boulevard end need to be created
            // TODO -- Tags from Boulevard to Podium are automatically created on contact import
            // TODO -- So if the label in each item above prduces an undefined when used as a key for tagTracker, the tag needs to be added to boulevard

            // Refresh Podium Tag Tracker
            await refreshTagTracker()

            // Refresh Boulevard Tag Tracker
            await refreshBoulevardTagTracker()

            // Get all tags from Podium
            // const allTags: ContactTag[] =  //await getAllTags()

            //? Boulevard Tag Tracker
            const tagTracker: TagTracker = await getBoulevardTagTracker()

            const justTagNamesAndLabels: titleAndIdDict = justTitleAndId(await getContactObjectTagArrayFromTagTracker()) //justTitleAndId(allTags)

            //? Tags to Add to Boulevard
            const tagsToAdd: Tag[] = Object.keys(justTagNamesAndLabels).reduce((newTags: Tag[], tagName: string): Tag[] => 
                typeof(tagTracker[tagName]) !== 'undefined' ? newTags : [
                    ...newTags,
                    {
                        name: justTagNamesAndLabels[tagName].label
                    }
                ],[])
            
            type _tagAddResultEntry = {
                name: string,
                id?: Id,
                success: boolean,
                error?: Error
            } 

            // console.log("TAGS TO ADD")
            // console.log(tagsToAdd)

            //@ts-ignore
            const tagAddResults: _tagAddResultEntry[] = await tagsToAdd.reduce(async (all: Promise<_tagAddResultEntry[]>, tag: Tag): Promise<_tagAddResultEntry[]> => {
                const existing: _tagAddResultEntry[] = await all
                try {
                    const newTag: Tag = await createNewTag(tag)
                    return [
                        ...existing,
                        {
                            name: newTag.name,
                            id: newTag.id,
                            success: true
                        }
                    ]
                } catch (error) {
                    return [
                        ...existing,
                        {
                            name: tag.name,
                            success: false,
                            error: error as Error
                        }
                    ]
                }
            }, [])

            const tagAddFailures: _tagAddResultEntry[] = tagAddResults.filter((result: _tagAddResultEntry) => !result.success)
            const numberOfFailures = tagAddFailures.length

            if (numberOfFailures > 0) {
                console.error(`Failed to create ${numberOfFailures} new Podium ${makePlural("tag", numberOfFailures)}`)
                tagAddFailures.forEach((failure: _tagAddResultEntry) => {
                    const { name, id, error } = failure
                    console.group(`================ ${name} - ${id} =================`)
                    console.error(failure)
                    console.groupEnd()
                })
            }

            // console.log("TAG ADD RESULTS")
            // console.log(tagAddResults)

            /// Get Podium contacts from server
            const allContacts: Contact[] = (await getAllContacts())
                .filter(contactHasIdentityFilter)

            //@ts-ignore
            const generalContacts: GeneralContact[] = (await allContacts.reduce(async (allContacts: GeneralContact[], contact: Contact): Promise<GeneralContact[]> => {
                //@ts-ignore
                const newContact: GeneralContact = await convertThirdPartyContactToGeneralContact(service, contact, generateSyncedWithServiceObject(service))
                const existingContacts = await allContacts

                return new Promise((resolve) => resolve([...existingContacts, newContact]))
            }, []) as GeneralContact[])
            // .filter((contact: GeneralContact) => !Object.keys(contact.tags).includes("Lash"))

            
            // Add contacts to database
            generalContacts.forEach(async (generalContact: GeneralContact) => {
                await storeGeneralContactInDatabase(service, generalContact)
            })

            await unlockMutex()
            await updatePodiumInitialContactSyncCompletedValue(true)
        
            console.log("Initial Podium Contact Import Complete")
            
        } catch (error) {
            console.error(new Date().toLocaleString(), "--- Error importing Podium tags and contacts")
            // console.error(error)

            // Unlock mutex
            await unlockMutex()
        }
    } else {
        announceToConsole(`${skippingTaskPrefix} Podium Contact Import Locked`)
    }
})

module.exports = importPodiumContactsTask