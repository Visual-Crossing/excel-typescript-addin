export function transposeArray(array: any[][]){
    let newArray: any[][] = [];

    for(let i = 0; i < array.length; i++){
        for(let j = 0; j < array[i].length; j++){
            if (newArray.length < j + 1) {
                newArray.push([]);
            }

            newArray[j].push(array[i][j]);
        };
    };

    return newArray;
}