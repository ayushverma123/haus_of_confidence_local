import { gql } from "graphql-request"
import { gqlClient } from "../ThirdPartyServices/Blvd/gqlClient"
import { Maybe } from "graphql/jsutils/Maybe"
import { Wait } from "./Wait"

export const getAllGraphQlPages = async <T,>(
        queryAction: string, 
        itemsPerPage: number, 
        queryNodeBody: string,
        additionalParameters: Maybe<string> = undefined,
        waitForMsBetweenPages: Maybe<number> = undefined
    ): Promise<T[]> => {
    var counter = 0
    var accumulatedItems: T[] = []
    var cursor: string | undefined
    var _hasNextPage: boolean = false

    const hasAdditionalParameters = typeof(additionalParameters) !== 'undefined'

    try {
        do {
            if (typeof(waitForMsBetweenPages) !== 'undefined') {
                await Wait(waitForMsBetweenPages!)
            }
            const firstIteration = counter === 0
            
            const query = gql`
            {
                ${queryAction}(first: ${itemsPerPage}${firstIteration ? '' : `,after: "${cursor}"`}${hasAdditionalParameters ? `,${additionalParameters}` : ''}) {
                    edges {
                        cursor
                        node {
                            ${queryNodeBody}
                        }
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }          
                }
            }
            `

            const result = (await gqlClient().request(query) as any)[queryAction]
            const { edges, pageInfo } = result

            const items: T[] = edges.map(edge => edge.node)

            const { hasNextPage, endCursor } = pageInfo

            accumulatedItems = [
                ...accumulatedItems,
                ...items
            ]

            counter += 1
            _hasNextPage = hasNextPage
            cursor = endCursor

        } while(_hasNextPage)

        return new Promise<T[]>(resolve => resolve(accumulatedItems))

    } catch (error) {
        console.error(`Could not get all graphql pages for ${queryAction}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

} 