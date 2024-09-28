import { getAllGraphQlPages } from "../../../../helpers/GraphQLPaginationHelper";
import { Location, graphQlBody } from "../../model/Location";

export const getAllLocations = async (): Promise<Location[]> => {

    try {
        const allLocations: Location[] = await getAllGraphQlPages<Location>(
            'locations',
            100,
            graphQlBody
        )

        return new Promise(resolve => resolve(allLocations))

    } catch (error) {
        console.error(`Unable to fetch locations from Boulevard`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}