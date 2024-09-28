import { AutomatedMessageTrigger } from "../../model/AutomatedMessages/AutomatedMessageTrigger";
import { UIGeneratedFormInputConfiguration, InputFieldType } from "../../model/inputFields";
import { automatedMessageTriggerTypeValueToTextUiMap } from "../../pages/automatedMessagesPage/data/automatedMessageTriggerTypeValueToUIText";


export default (allMessageDefaults: {[key in AutomatedMessageTrigger]: string}): UIGeneratedFormInputConfiguration => {

    return Object.keys(AutomatedMessageTrigger).reduce((acc: UIGeneratedFormInputConfiguration, enumKey: string): UIGeneratedFormInputConfiguration => {
        //@ts-ignore
        const type: AutomatedMessageTrigger = AutomatedMessageTrigger[enumKey]
        
        return [
            ...acc,
            {
                id: type,
                label: automatedMessageTriggerTypeValueToTextUiMap[type],
                // placeholderText: "Ayyyyyy",
                inputType: InputFieldType.text,
                invalidInputMessage: "This is a text input box lol why would there be an error",
                options: {
                    submitOnEnter: false,
                    required: true
                },
                defaultValue: allMessageDefaults[type]
            }
        ] as UIGeneratedFormInputConfiguration
    }, []) as UIGeneratedFormInputConfiguration
} 
