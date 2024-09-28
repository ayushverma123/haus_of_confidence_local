import { Button, Icon, Input, Label } from "semantic-ui-react"

interface SearchBarProps {
    searchTerms: string,
    onSearchTermsChange: (newValue: string) => void,
}

// interface ModalGeneral {
//     closeModal: () => void,
// }

interface MessageDefaultsEditorModalProps {
    openDefaultsEditorModal: () => void,
}

type ActionBarProps = SearchBarProps & MessageDefaultsEditorModalProps & { 
    onAddButtonPress: () => void,
    reloadItems: () => void
}

export const ActionBar: React.FC<ActionBarProps> = (props: ActionBarProps) => {
    const { 
        searchTerms, 
        onSearchTermsChange, 
        onAddButtonPress, 
        reloadItems,
        openDefaultsEditorModal,
    } = props

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row-reverse', 
                // borderTop: '1px solid rgb(204, 204, 204)',
                // borderRight: '1px solid rgb(204, 204, 204)',
                marginTop: 'auto',
                paddingTop: '20px',
                flexBasis: '20px',
                width: '100%',
                // marginRight: '24px',
                // marginLeft: '24px',
                // paddingLeft: '12px',
                // paddingRight: '12px',
            }}
        >
        
            <Button
                positive
                onClick={onAddButtonPress}
                icon='add'
                style={{
                    marginRight: '0px'
                }}
            />
            <SearchBar searchTerms={searchTerms} onSearchTermsChange={onSearchTermsChange} />
            <Button
                icon='settings'
                onClick={openDefaultsEditorModal}
            />
            <Button
                icon='refresh'
                onClick={reloadItems}    
            />
        </div>
    )
}

const SearchBar: React.FC<SearchBarProps> = (props: SearchBarProps) => {
    const { searchTerms, onSearchTermsChange } = props

    return (          
        <Input
            value={searchTerms} 
            onChange={(e) => onSearchTermsChange(e.target.value)} 
            fluid
            style={{width: '100%'}}
            placeholder="Type Here to Search..."
            label={(
                <Label style={{width: '44px'}}>
                    <Icon size="large" name="search"/>
                </Label>
            )}
        />
    )
}