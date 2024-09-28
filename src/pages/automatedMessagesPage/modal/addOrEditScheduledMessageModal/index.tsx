import { AddOrEdit } from "../../../../model/AddOrEdit"
import { useObserver } from "mobx-react-lite"
import { UIModalRequiredProps } from "../../../../components/UIModal/model/requiredProps"
import { ScheduledMessage } from "../../../../model/ScheduledMessage"

interface Props extends UIModalRequiredProps {
    mode: AddOrEdit,
    messageData?: ScheduledMessage
}

export const AddOrEditScheduledMessageModal: React.FC<Props> = (props: Props) => {
    const { mode, messageData, onClose, isOpen, closeModal }: Props = props


    return useObserver(() => (
        <div>

        </div>
    ))
}