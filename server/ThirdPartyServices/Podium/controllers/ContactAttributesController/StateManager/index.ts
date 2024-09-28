import { StateStore } from '../../../../../controllers/StateManager'
import { Maybe } from '../../../../../model/Maybe'
import { ThirdPartyService } from '../../../../../model/ThirdPartyService'
import { ContactAttribute } from '../../../model/ContactAttribute'
import listContactAttributes from '../listContactAttributes'

const stateId = `${ThirdPartyService.Podium}__ContactAttributes`

type ServiceState = {
    allAttributes: ContactAttribute[],
    birthdateAttributeId: string
}

export enum StateProperties {
    allAttributes = 'attributes',
    birthdateAttributeId = 'birthdateAttributeId'
}

export const _stateStore = StateStore<ServiceState>(stateId)
export const modifyValue = _stateStore.modifyValue
export const getValue = _stateStore.getValue

export const getStateObject = async (): Promise<ServiceState> => {
    try {
        const stateObject = await _stateStore.getObject()

        return new Promise((resolve) => resolve(stateObject))
    } catch (error) {

        return new Promise((_, reject) => reject(error))
    }
}

export const getAllContactAttributes = async (): Promise<ContactAttribute[]> => {
    try {
        const attributes = await getValue<ContactAttribute[]>(StateProperties.allAttributes)
        
        if (typeof(attributes) === 'undefined' || Object.is(attributes, null)) return new Promise((resolve) => resolve([]))

        return new Promise((resolve) => resolve(attributes))

    } catch (error) {
        console.error("ERROR: Could not retrieve contact attributes from Podium contact attributes state store")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateContactAttributes = async (attributes: ContactAttribute[]): Promise<boolean> => {
    try {
        await modifyValue<ContactAttribute[]>(StateProperties.allAttributes, attributes)

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error("ERROR: Unable to update contact attributes in Podium contact attributes state store")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getBirthdateAttributeId = async (): Promise<string> => {
    const expectedAttributeLabel: string = 'birthday'

    try {
        const existingValue: Maybe<string> = await getValue<string>(StateProperties.birthdateAttributeId)

        if (typeof(existingValue) === 'undefined' || Object.is(existingValue, null) || (existingValue ?? '').length <= 0) {
            const attributes: ContactAttribute[] = await listContactAttributes()

            await updateContactAttributes(attributes)

            const attribute = attributes.find(attribute => attribute.label.toLowerCase() === expectedAttributeLabel)

            if (typeof(attribute) === 'undefined' || Object.is(attribute, null)) {
                throw new Error(`Could not find contact attribute with label ${expectedAttributeLabel}`)
            }

            const birthdateUid = attribute.uid!

            await modifyValue<string>(StateProperties.birthdateAttributeId, birthdateUid)

            return new Promise((resolve) => resolve(birthdateUid))

        }

        return new Promise((resolve) => resolve(existingValue))

    } catch (error) {
        console.error("ERROR: Unable to retrieve birthdate contact attributes from Podium contact attributes state store")
        console.error(error)

        // return new Promise((_, reject) => reject(error))
        return new Promise((resolve) => resolve(''))
    }
}