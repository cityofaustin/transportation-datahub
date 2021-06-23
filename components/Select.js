import React from "react";
import Select, { createFilter } from "react-select";

const customStyles = {
	menu: (provided, state) => ({
		...provided,
		zIndex: 9,
	}),
};

export const MySelect = (props) => (
	<Select
		styles={customStyles}
		filterOption={createFilter({ ignoreAccents: false })}
		instanceId="pizza"
		{...props}
	/>
);
