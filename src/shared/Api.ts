/* eslint-disable prettier/prettier */
const HttpService = game.GetService("HttpService");
const Api = HttpService.JSONDecode(
	HttpService.GetAsync("https://raw.githubusercontent.com/crbuch/feedback-server/main/api.json"),
) as ApiDump;

interface EnumItem {
	Name: string;
	Value: number;
}

interface Member {
	Category:string;
	MemberType: string;
	Name: string;
	ValueType: {
		Category: string;
		Name: string;
	};
	Serialization:{
		CanSave:boolean;
		CanLoad:boolean
	};
	Tags?:string[]
}

interface ClassDefenition {
	MemoryCategory: string;
	Superclass?: string;
	Name: string;
	Members: Member[];
}

interface ApiDump {
	Classes: ClassDefenition[];
	Enums: Array<{
		Items: EnumItem[];
		Name: string;
	}>;
	Version: number;
}

function getRecursive(clsName: string, a: Member[]) {
	let classDef: ClassDefenition | undefined;
	Api.Classes.forEach((cd) => {
		if (cd.Name === clsName) {
			classDef = cd;
		}
	});
	if (!classDef) {
		return;
	}
	for (const mbr of classDef.Members) {
		//if the member is a property & its not hidden & its not deprecated
		if (mbr.MemberType === "Property" && !mbr.Tags?.includes("Hidden") && !mbr.Tags?.includes("Deprecated")) {
			a.push(mbr);
		}
	}
	if (classDef.Superclass !== undefined) {
		getRecursive(classDef.Superclass, a);
	}
}

export function GetPropertiesOf(className: string) {
	const allProps = [] as Member[];
	getRecursive(className, allProps);
	return allProps;
}
