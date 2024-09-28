import { UIGeneratedFormInputConfiguration, InputFieldType } from "../../model/inputFields";

export const LoginFormInputConfiguration: UIGeneratedFormInputConfiguration = [
    {
        id: "password",
        label: "Password",
        placeholderText: "Password",
        inputType: InputFieldType.password,
        invalidInputMessage: "The input password is invalid",
        options: {
            submitOnEnter: true,
            required: true
        }
    }
]