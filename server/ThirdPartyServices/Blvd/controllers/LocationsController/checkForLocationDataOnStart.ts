import { StateProperties, getValue, modifyValue } from "../../StateManager/BlvdStateManager"
import { Location } from "../../model/Location"
import { getAllLocations } from "./getAllLocations"

export const checkForLocationDataOnStart = async (): Promise<boolean> => {
    try {
        if (typeof(await getValue<Location>(StateProperties.location)) === 'undefined') {
            //! Get Boulevard location data on start
            const locations = await getAllLocations()

            if (locations && locations.length > 0) {
                const location = locations[0]
                if (typeof(location) !== 'undefined') {
                    modifyValue<Location>(StateProperties.location, location).then(success => console.log(success))
                }
            }
        }

        return new Promise<boolean>((resolve, reject) => resolve(true))
    } catch (error) {
        console.error(`Unable to check for location data on start`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}