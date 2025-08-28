const fs = require('fs');
const bigInt = require('big-integer');
const readline = require('readline');

function readJson(filename) {
    const raw = fs.readFileSync(filename, 'utf8');
    return JSON.parse(raw);
}

// Convert number from given base to decimal using big-integer
function convertToDecimal(value, base) {
    let result = bigInt(0);
    let power = bigInt(1);
    
    // Process digits from right to left
    for (let i = value.length - 1; i >= 0; i--) {
        const char = value[i];
        let digitValue;
        
        // Convert character to numeric value
        if (char >= '0' && char <= '9') {
            digitValue = char.charCodeAt(0) - '0'.charCodeAt(0);
        } else if (char >= 'A' && char <= 'Z') {
            digitValue = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else if (char >= 'a' && char <= 'z') {
            digitValue = char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        } else {
            throw new Error(`Invalid digit: ${char}`);
        }
        
        if (digitValue >= base) {
            throw new Error(`Digit ${char} is invalid for base ${base}`);
        }
        
        result = result.add(bigInt(digitValue).multiply(power));
        power = power.multiply(base);
    }
    
    return result;
}

function lagrangeInterpolation(points, k) {
    let secret = bigInt(0);

    console.log('Lagrange interpolation calculation:');
    console.log('f(0) = Σ[y_i * L_i(0)] where L_i(0) is the Lagrange coefficient\n');

    for (let j = 0; j < k; j++) {
        const xj = bigInt(points[j].x);
        const yj = points[j].y;
        
        // Calculate Lagrange coefficient L_j(0)
        let numerator = bigInt(1);
        let denominator = bigInt(1);

        for (let m = 0; m < k; m++) {
            if (m !== j) {
                const xm = bigInt(points[m].x);
                // For f(0): numerator *= (0 - xm) = -xm
                // denominator *= (xj - xm)
                numerator = numerator.multiply(xm.negate());
                denominator = denominator.multiply(xj.subtract(xm));
            }
        }

        // Calculate the Lagrange coefficient
        const lagrangeCoeff = numerator.divide(denominator);
        const contribution = yj.multiply(lagrangeCoeff);
        
        console.log(`For point (${points[j].x}, ${yj.toString()}):`);
        console.log(`  L_${j}(0) = ${lagrangeCoeff.toString()}`);
        console.log(`  Contribution: ${yj.toString()} × ${lagrangeCoeff.toString()} = ${contribution.toString()}`);
        
        secret = secret.add(contribution);
    }
    
    console.log(`\nTotal: f(0) = ${secret.toString()}`);
    return secret;
}

// Main execution
console.log('=== SECRET SHARING POLYNOMIAL SOLVER ===');
console.log('This program reads JSON test cases and finds the secret constant c');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter JSON filename: ', (filename) => {
    rl.close();
    
    // Default to testcase.json if user just presses Enter
    const inputFile = filename.trim() || 'testcase.json';
    
    try {
        console.log(`\nReading from: ${inputFile}`);
        
        const input = readJson(inputFile);
        const n = input.keys.n;
        const k = input.keys.k;
        
        console.log(`\n=== TEST CASE SUMMARY ===`);
        console.log(`Number of roots (n): ${n}`);
        console.log(`Minimum required roots (k): ${k}`);
        console.log(`Polynomial degree: ${k - 1}\n`);

        // Extract and decode points
        console.log('=== DECODING ROOTS ===');
        const points = [];
        for (const key in input) {
            if (key === 'keys') continue;
            
            const x = parseInt(key, 10);
            const yval = input[key].value;
            const base = parseInt(input[key].base, 10);
            
            // Convert to decimal using our custom function
            const y = convertToDecimal(yval, base);
            
            points.push({ x, y });
            console.log(`Root ${x}: base=${base}, value="${yval}" -> decimal=${y.toString()}`);
            
            // Stop when we have k points
            if (points.length === k) break;
        }

        // Sort points by x value for consistency
        points.sort((a, b) => a.x - b.x);

        console.log(`\n=== FINDING SECRET USING LAGRANGE INTERPOLATION ===`);
        console.log(`Using the following ${k} points to find the secret:`);
        for (const p of points) {
            console.log(`  (x: ${p.x}, y: ${p.y.toString()})`);
        }
        console.log();

        // Calculate the secret
        const secret = lagrangeInterpolation(points, k);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔑 SECRET FOUND!`);
        console.log(`The constant term c = ${secret.toString()}`);
        console.log(`${'='.repeat(60)}`);

    } catch (e) {
        if (e.code === 'ENOENT') {
            console.error(`\n❌ Error: File '${inputFile}' not found!`);
            console.error('Please make sure the file exists in the current directory.');
        } else if (e instanceof SyntaxError) {
            console.error(`\n❌ Error: Invalid JSON in '${inputFile}'`);
            console.error('Please check your JSON syntax.');
        } else {
            console.error('\n❌ An error occurred:', e.message);
        }
        process.exit(1);
    }
});
