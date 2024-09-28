import { AutomatedMessageContactCriteria } from "../../../model/AutomatedMessages/AutomatedMessageContactCriteria";

export const automatedMessageContactCriteriaValueToTextUiMap: { [key in AutomatedMessageContactCriteria]: string } = {
    [AutomatedMessageContactCriteria.All]: "All Contacts",
    [AutomatedMessageContactCriteria.Custom]: "Use Custom Criteria",
    [AutomatedMessageContactCriteria.CurrentAction]: "Current Action's Data",
    [AutomatedMessageContactCriteria.CurrentActionWithFunction]: "Current Action's Data w / Custom Criteria ",
}