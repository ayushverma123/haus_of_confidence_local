import { Client } from "../../../ThirdPartyServices/Blvd/model/Client"
import { Contact } from "../../../ThirdPartyServices/Podium/model/Contact"
import { ThirdPartyService, thirdPartyServiceFromLowercaseServiceName, ThirdPartyServiceMap } from "../../../model/ThirdPartyService"
import tableName from "../constants/tableName"

export const insertRow = (_sourceService: ThirdPartyService, destinationService: ThirdPartyService, contactObject: any) => {
    const sourceService = thirdPartyServiceFromLowercaseServiceName[_sourceService]

    // console.log("SOURCE SERVICE:", sourceService)
    // console.log("DESTINATION SERVICE:", ThirdPartyService[destinationService])

    const name = ((): string => { 
        const data: ThirdPartyServiceMap<() => string> = {
            [ThirdPartyService.Boulevard]: () => `${(contactObject as Client).firstName} ${(contactObject as Client).lastName}`,
            [ThirdPartyService.Podium]: () => (contactObject as Contact).name,
            [ThirdPartyService.GoHighLevel]: () => {
                throw new Error("Not Implemented")
            },
        }
        // console.log("TYPE:")
        // console.log(typeof(data[sourceService]))

        return data[sourceService]()
    })()

    const phone = ((): string => {

        const data: ThirdPartyServiceMap<() => string> = {
            [ThirdPartyService.Boulevard]: () => (contactObject as Client).mobilePhone || "",
            [ThirdPartyService.Podium]: () => (contactObject as Contact).phoneNumbers[0] || "",
            [ThirdPartyService.GoHighLevel]: () => {
                throw new Error("Not Implemented")
            },
        }

        // console.log("TYPE:")
        // console.log(typeof(data[sourceService]))

        return data[sourceService]()
    })()


    const email = ((): string => {

        const data: ThirdPartyServiceMap<() => string> = {
            [ThirdPartyService.Boulevard]: () => (contactObject as Client).email || "",
            [ThirdPartyService.Podium]: () => (contactObject as Contact).emails[0] || "",
            [ThirdPartyService.GoHighLevel]: () => {
                throw new Error("Not Implemented")
            },
        }

        // console.log("TYPE:")
        // console.log(typeof(data[sourceService]))

        return data[sourceService]()
    })()

    /*
    ${typeof(name) !== 'undefined' ? ',name' : ''}
    ${typeof(phone) !== 'undefined' ? ',phone': ''}
    ${typeof(email) !== 'undefined' ? ',email' : ''}
    */

    return {
        text: `
            INSERT INTO ${tableName} (
                source_service,
                destination_service,
                contact_object,
                name,
                phone,
                email
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;`,
        values: [
            _sourceService,
            destinationService.toLowerCase(),
            JSON.stringify(contactObject),
            name,
            phone,
            email
        ]
    }
}