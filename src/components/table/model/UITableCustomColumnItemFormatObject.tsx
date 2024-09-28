import { ReactElement } from "react";

export type UITableCustomColumnItemFormatObject = {[key in string]: (value: any) => string | Element | ReactElement}