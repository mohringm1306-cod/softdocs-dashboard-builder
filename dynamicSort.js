// sorting functions to allow for multidimensional array sort
function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0; // changing the < & > will reverse the order of the sort
        return result * sortOrder;
    };
}

function dynamicSortMultiple() {
    // note that arguments object is an array-like object
    // consisting of the names of the properties to sort by
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        //try getting a different result from 0 (equal)
        //as long as we have extra properties to compare
        while (result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    };
}