import { gql } from "graphql-request";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { Tag } from "../../model/Tag";
import { gqlClient } from "../../gqlClient";
import { getAllGraphQlPages } from "../../../../helpers/GraphQLPaginationHelper";

const service: ThirdPartyService = ThirdPartyService.Boulevard

export const createNewTag = async (tag: Tag): Promise<Tag> => {
    const mutation = gql`
        mutation createNewTag($name: String!) {
            createTag(input: {
                name: $name
            }) {
                tag {
                    id
                    name
                    symbol
                }
            }
        }
    `

    const { name }: {name: string} = tag

    const variables = { name }

    try {
        const { createTag } = await gqlClient().request<{createTag:{tag: Tag}}>(mutation, variables)
        const { tag: newTag } = createTag

        return new Promise((resolve) => resolve(newTag))
    } catch (error) {
        console.error(`Could not create new Boulevard tag`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getAllTags = async (): Promise<Tag[]> => {
    try {
        const tags = await getAllGraphQlPages<Tag>('tags', 100, `
            id
            name
            symbol
        `)

        return new Promise((resolve) => resolve(tags))
    } catch (error) {
        console.error("Error: Could net get all Boulevard tags from server")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}