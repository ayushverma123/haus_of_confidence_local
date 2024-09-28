import React, { Fragment, useState } from 'react'
import { useObserver } from "mobx-react-lite";
import { UIModalRequiredProps } from "../../../../components/UIModal/model/requiredProps";
import { UIModal } from "../../../../components/UIModal";
import { StateDictionary, defaultValueObjectWithIDs, defaultValueObjectWithIDsGeneric } from '../../../../helpers/stateFunctions';
import { UIGeneratedForm } from '../../../../components/forms/UIGeneratedForm';
// import defaultScheduledMessageTemplateEdit from '../../../../config/generatedForms/defaultAutomatedMessageTemplateEdit';
import { andReduction } from '../../../../helpers/arrayFunctions';

import { io } from 'socket.io-client'
import { AutomatedMessageSortType } from '../../../../model/automatedMessagesSortType';
import { ScheduledMessageType } from '../../../../model/ScheduledMessageType';
const socket = io()

export const _getAllDefaults_requestCallString = `REQUEST_getAllScheduledMessageDefaults`
export const _getAllDefaults_responseCallString = `RESPONSE_getAllScheduledMessageDefaults`

const numberOfLoadingItems = 1

type ScheduledMessageTypeMap <T,> ={[key in ScheduledMessageType]: T}

export const ModifyDefaultMessageTemplatesModal: React.FC<UIModalRequiredProps> = (props: UIModalRequiredProps) => {
    const { onClose, isOpen, closeModal } = props

    const [pageLoading, setPageLoading] = useState<boolean[]>(Array(numberOfLoadingItems).fill(true))
    const [allMessageDefaults, setMessageDefaults] = useState<ScheduledMessageTypeMap<string[]>>(
        defaultValueObjectWithIDsGeneric<string[], ScheduledMessageType>(Object.values(ScheduledMessageType), [''])   
    )

    const [formData, setFormData] = useState<StateDictionary<any>>({})
    const [formDataValid, setFormDataValid] = useState<boolean>(false)
    
    socket.on(_getAllDefaults_requestCallString, (response: string) => {
        const allDefaults = JSON.parse(response)

        setMessageDefaults(allDefaults)

        setPageLoading((oldValue) => {
            const [ defaultsLoading ] = oldValue

            return [false]
        })
    })

    //? Will be called by the form when it updates its data set
    const handleFormReturn = (formData: StateDictionary<any>) => {
        setFormData(formData)
    }

    const handleValidationStateChange = (valid: boolean) => {
        setFormDataValid(valid)
    }

    const pageLoaded = andReduction(pageLoading.map(value => !value))

    return useObserver(() => (
        <UIModal
            onClose={onClose}
            open={isOpen}
            modalTitle={"Modify Default Message Templates"}
        >
            <Fragment>
                { pageLoaded && 
                    // <UIGeneratedForm
                    //     inputConfig={defaultScheduledMessageTemplateEdit(allMessageDefaults)}
                    //     formDataHandler={handleFormReturn}
                    //     setValidationState={handleValidationStateChange}
                    //     showInvalidWithLabels
                    //     submitFunction={() => {}} // TODO
                    // />
                    <Fragment>
                        
                    </Fragment>
                }
            </Fragment>
        </UIModal>
    ))
}