const FSPromises = require('fs').promises

const ACCUMULATED_LEVELS_FILE_PATH = `./accumulated_levels.json`;
const VAT = 0.08

async function readFile(path) {
    let result = {
        status: '',
        content: '',
        description: ''
    }
    try {
        let data_buffer = await FSPromises.readFile(path)
        result.content = data_buffer.toString();
        result.status = 'Success';
    }
    catch (error) {
        result.status = 'Failed';
        result.description = error;
    }
    return result;
}

async function writeFile(path,content) {
    let result = {
        status: '',
        description: ''
    }
    try {
        result.status = 'Success';
    }
    catch (error) {
        result.status = 'Failed';
        result.description = error;
    }
    return result;
}

async function sortAccumulatedLevels(data) {

}

async function getAccumulatedLevels(path) {
    let result = {
        status: '',
        content: '',
        description: ''
    }
    try {
        result = await readFile(path);
        result.content = JSON.parse(result.content)
    }
    catch (error) {
        result.status = "Failed";
        result.description = error;
    }
    return result;
}

async function calculateElectricityBill(used_bill,accumulated_levels) {
    let accumulated_values = []
    for (let i in accumulated_levels) {
        i = parseInt(i);
        let tmp = {
            level: i+1,
            billed: '',
            accumulated_price: '',
            accumulated_values: ''
        };
        if (i+1 == accumulated_levels.length || used_bill <= accumulated_levels[i+1].from) {
            tmp.billed = used_bill - (accumulated_levels[i].from - 1);
            tmp.accumulated_price = accumulated_levels[i].accumulated_price;
            tmp.accumulated_values = tmp.billed * tmp.accumulated_price;
            accumulated_values.push(tmp);
            break;
        }
        else {
            tmp.billed = accumulated_levels[i+1].from - accumulated_levels[i].from;
            tmp.accumulated_price = accumulated_levels[i].accumulated_price;
            tmp.accumulated_values = tmp.billed * tmp.accumulated_price;
            accumulated_values.push(tmp);
        }
    }
    return accumulated_values;
}

async function generateReport(calculated_data) {
    let result = {
        billed : calculated_data,
        beforevat: 0,
        vat: 0,
        total: 0
    };
    for (let i in calculated_data) {
        i = parseInt(i);
        result.beforevat +=  calculated_data[i].accumulated_values;
    }
    result.vat = Math.round(result.beforevat * VAT);
    result.total = Math.round(result.beforevat + result.vat);
    return result;
}

async function main() {
    let accumulated_levels = await getAccumulatedLevels(ACCUMULATED_LEVELS_FILE_PATH);
    let accumulated_values = await  calculateElectricityBill(59,accumulated_levels.content);
    let final_report = await generateReport(accumulated_values);
    console.log(final_report);
}
main()