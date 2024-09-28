import React, { useState, useEffect, ReactElement } from 'react'
import { Modal, Header } from 'semantic-ui-react'

type Props = {
    open: boolean,
    onClose?: (event: React.MouseEvent) => void,
    onOpen?: (event: React.MouseEvent) => void
    modalTitle: string,
    children: ReactElement,
    closeOnEscape?: boolean,
    closeOnDimmerClick?: boolean
}

export const UIModal: React.FC<Props> = (props: Props) => {
    const { onClose, onOpen, open, modalTitle, children, closeOnEscape, closeOnDimmerClick } = props

    return (
        <Modal
            onClose={onClose}
            onOpen={onOpen}
            open={open}
            closeOnEscape={closeOnEscape ? true : false}
            closeOnDimmerClick={closeOnDimmerClick ? true : false}
        >
            <Modal.Header>{modalTitle}</Modal.Header>
            <Modal.Content>
                {children}
            </Modal.Content>
        </Modal>
    )
}