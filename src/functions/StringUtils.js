export function clearPhoneNumber(number) {
    const formattedNumber = number.replace(/\D/g, '');
    return formattedNumber;
}

export function formatPhoneNumberDt(rowData, columnName) {
    const cleanNumber = rowData[columnName].replace(/\D/g, '');

    if (cleanNumber.length < 10) {
        return rowData[columnName];
    }

    const areaCode = cleanNumber.substring(0, 2);
    const part1 = cleanNumber.substring(2, 3);
    const part2 = cleanNumber.substring(3, 7);
    const part3 = cleanNumber.substring(7, 11);

    const formattedNumber = `(${areaCode}) ${part1} ${part2}-${part3}`;
    return formattedNumber;
}