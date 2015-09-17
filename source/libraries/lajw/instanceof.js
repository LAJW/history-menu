/**
* Checks if value is instance of supplied constructor(s) or in specified range
* of values. Also check structures of types with {param1: Type1, param2: Type2}
* @param {Mixed} value 
* @param {Function | Object | Array} type 
* @param {Boolean} loose - don't return false on unexpected object parameters
* @return {Boolean}
*/
function instanceOf(value, type, loose) {
	if (arguments.length < 2 || type === value)
	   	return true;
	if (!type)
	   	return false;
	if (type instanceof Function) 
		return value && value instanceof type
		|| type == String && typeof value == "string" 
		|| type == Boolean && typeof value == "boolean" 
		|| type == Number && typeof value == "number";
	if (type instanceof Array)
		return type.some(function (type) {
			return instanceOf(value, type, loose);
		});	
	return !!value
		&& type instanceof Object 
		&& Object.keys(type).every(function (key) {
			return instanceOf(value[key], type[key], loose);
		}) 
		&& (loose || Object.keys(value).every(type.hasOwnProperty.bind(type)));
}

