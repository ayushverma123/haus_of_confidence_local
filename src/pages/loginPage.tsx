import React, { useState, useEffect } from 'react'
import { UIGeneratedForm } from '../components/forms/UIGeneratedForm'
import { LoginFormInputConfiguration } from '../config/generatedForms/login'
import { StateDictionary } from '../helpers/stateFunctions'
import { storeContext as userAccountStoreContext } from '../stores/userAccountStore'
import { Button } from 'semantic-ui-react'

export const LoginPage: React.FC = () => {
    const userAccountStore = React.useContext(userAccountStoreContext)
    if (!userAccountStore) throw Error("UserAccountStore shouldn't be null")

    const [formData, setFormData] = useState<StateDictionary<any>>({})
    const [formDataValid, setFormDataValid] = useState<boolean>(false)

    const handleFormReturn = (formData: StateDictionary<any>) => {
        setFormData(formData)
    }

    const handleValidationStateChange = (valid: boolean) => {
        setFormDataValid(valid)
    }

    const handleSubmitButtonClick = () => {
        userAccountStore.attemptLogin(formData[LoginFormInputConfiguration[0].id])
    }

    return (
        <div 
            style={{
                display: 'flex',
                flexDirection: 'column',
                margin: 'auto',
                width: '80vw',
                minWidth: '200px',
                maxWidth: '500px'
            }}
        >
            <UIGeneratedForm
                inputConfig={LoginFormInputConfiguration}
                formDataHandler={handleFormReturn}
                setValidationState={handleValidationStateChange}
                submitFunction={handleSubmitButtonClick}
                labelWidth="91px"
            />
            <div id="loginActionButtons"
                style={{
                    borderTop: '1px solid rgb(204, 204, 204)',
                    marginTop: 'auto',
                    paddingTop: '20px',
                    flexBasis: '20px',
                    // ...payoutResultsModalStyles.flexChildMargins,
                    display: 'flex',
                    flexDirection: 'row-reverse'
                }}
            >
                <div>
                    <Button
                        positive
                        onClick={handleSubmitButtonClick}
                        disabled={!formDataValid}    
                    >
                        Login
                    </Button>

                </div>
            </div>
        </div>
    )
}