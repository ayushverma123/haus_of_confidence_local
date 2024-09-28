import { Fragment } from "react"
import { UIModal } from "../../UIModal"
import { UIModalRequiredProps } from "../../UIModal/model/requiredProps"
// import { GeneralContact } from '@server/model/GeneralContact'

interface Props extends UIModalRequiredProps {
    contactId: number,
    contactData: any// GeneralContact, // TODO -- Change to GeneralContact when I get yarn workspaces set up with Craco
}

// TODO
export const ContactInfoModal: React.FC<Props> = (props: Props) => {
    const { onClose, isOpen, closeModal, contactId, contactData }: Props = props
    const { first_name, last_name } = contactData

    return (
        <UIModal
            onClose={onClose}
            open={isOpen}
            modalTitle={`Contact Info for ${contactId}`}
            closeOnEscape
        >
            <div>
            </div>
        </UIModal>
    )
}