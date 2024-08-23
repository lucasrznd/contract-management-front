export function clearPhoneNumber(number) {
    const formattedNumber = number.replace(/\D/g, '');
    return formattedNumber;
}

export function clearRegistrationNumber(registrationNumber) {
    const registrationNumberFmt = registrationNumber.replace(/[^\w\s]/gi, '');
    return registrationNumberFmt;
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

export function formatRegistrationNumberDt(rowData, columnName) {
    const registrationNumberFmt = rowData[columnName].replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    return registrationNumberFmt;
}

export function buildEncodedStringAddress(rowData) {
    const addressString = rowData.streetName + ', ' + rowData.number + ', ' + rowData.avenueName + ', ' + rowData.zipCode;
    const encodedAddress = encodeURI(addressString);

    return encodedAddress;
}

export function dateFormatDt(rowData, columnName) {
    if (rowData && rowData[columnName]) {
        const [year, month, day] = rowData[columnName].split('-').map(Number);
        const data = new Date(year, month - 1, day);
        return data.toLocaleDateString('pt-BR');
    }
    return '';
}

export function parseDate(date) {
    const [year, month, day] = date.split('-').map(Number);
    // month is 0-based in JavaScript Date, so we subtract 1 from month
    return new Date(year, month - 1, day);
}

export function dateNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

export function daysBetweenEndDate(endDate) {
    return Math.round((new Date(endDate) - new Date(dateNow())) / (1000 * 60 * 60 * 24))
}