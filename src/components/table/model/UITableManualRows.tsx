import { ChildrenProp } from "./ChildrenProp";
import { TableHeaderProps } from "./TableHeaderProps";
import { TableProps } from "./TableProps";

export type UITableManualRows <sortType> = TableProps & TableHeaderProps<sortType> & ChildrenProp
