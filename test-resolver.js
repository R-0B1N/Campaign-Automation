const assert = require('assert');
const config = require('./config.js');

console.log("Running Event Config Resolution Tests...\n");

// Test 1: 10% Deposit Bonus + TradFi Bonus (Non-VIP)
const res1 = config.resolveEventConfig("10% Deposit Bonus", "TradFi Bonus", false);
assert.strictEqual(res1, "10% Deposit TradFi Bonus", "Test 1 Failed: Expected '10% Deposit TradFi Bonus'");
console.log("✅ Test 1 Passed: '10% Deposit Bonus' + 'TradFi Bonus' (Non-VIP) => '10% Deposit TradFi Bonus'");

// Test 2: 10% Deposit Bonus + TradFi Bonus (VIP)
const res2 = config.resolveEventConfig("10% Deposit Bonus", "TradFi Bonus", true);
assert.strictEqual(res2, "10% Deposit TradFi Bonus (VIP)", "Test 2 Failed: Expected '10% Deposit TradFi Bonus (VIP)'");
console.log("✅ Test 2 Passed: '10% Deposit Bonus' + 'TradFi Bonus' (VIP) => '10% Deposit TradFi Bonus (VIP)'");

// Test 3: 10% Deposit Bonus + Futures Bonus (Non-VIP)
const res3 = config.resolveEventConfig("10% Deposit Bonus", "Futures Bonus", false);
assert.strictEqual(res3, "10% Deposit Futures Bonus", "Test 3 Failed: Expected '10% Deposit Futures Bonus'");
console.log("✅ Test 3 Passed: '10% Deposit Bonus' + 'Futures Bonus' (Non-VIP) => '10% Deposit Futures Bonus'");

// Test 4: 10% Deposit Bonus + Futures Bonus (VIP)
const res4 = config.resolveEventConfig("10% Deposit Bonus", "Futures Bonus", true);
assert.strictEqual(res4, "10% Deposit Futures Bonus (VIP)", "Test 4 Failed: Expected '10% Deposit Futures Bonus (VIP)'");
console.log("✅ Test 4 Passed: '10% Deposit Bonus' + 'Futures Bonus' (VIP) => '10% Deposit Futures Bonus (VIP)'");

// Test 5: Direct alias '10% Deposit TradFi' (Non-VIP & VIP)
const res5a = config.resolveEventConfig("10% Deposit TradFi", null, false);
assert.strictEqual(res5a, "10% Deposit TradFi Bonus", "Test 5a Failed: Expected '10% Deposit TradFi Bonus'");
const res5b = config.resolveEventConfig("10% Deposit TradFi", null, true);
assert.strictEqual(res5b, "10% Deposit TradFi Bonus (VIP)", "Test 5b Failed: Expected '10% Deposit TradFi Bonus (VIP)'");
console.log("✅ Test 5 Passed: Direct alias '10% Deposit TradFi' maps to '10% Deposit TradFi Bonus'");

// Test 6: Direct alias 'Deposit Futures Bonus' (Non-VIP & VIP)
const res6a = config.resolveEventConfig("Deposit Futures Bonus", null, false);
assert.strictEqual(res6a, "10% Deposit Futures Bonus", "Test 6a Failed: Expected '10% Deposit Futures Bonus'");
const res6b = config.resolveEventConfig("Deposit Futures Bonus", null, true);
assert.strictEqual(res6b, "10% Deposit Futures Bonus (VIP)", "Test 6b Failed: Expected '10% Deposit Futures Bonus (VIP)'");
console.log("✅ Test 6 Passed: Direct alias 'Deposit Futures Bonus' maps to '10% Deposit Futures Bonus'");

// Test 7: New 250% Deposit Bonus (Non-VIP & VIP)
const res7a = config.resolveEventConfig("250% Deposit Bonus", null, false);
assert.strictEqual(res7a, "250% Deposit Bonus", "Test 7a Failed: Expected '250% Deposit Bonus'");
const res7b = config.resolveEventConfig("250% Deposit Bonus", null, true);
assert.strictEqual(res7b, "250% Deposit Bonus (VIP)", "Test 7b Failed: Expected '250% Deposit Bonus (VIP)'");
const res7c = config.resolveEventConfig("250% Deposit Bonus", "TradFi Bonus", true);
assert.strictEqual(res7c, "250% Deposit Bonus (VIP)", "Test 7c Failed: Expected '250% Deposit Bonus (VIP)'");
console.log("✅ Test 7 Passed: '250% Deposit Bonus' (Non-VIP & VIP) resolves cleanly");

// Test 8: Legacy 10% Deposit Bonus without Event Type (Non-VIP & VIP)
const res8a = config.resolveEventConfig("10% Deposit Bonus", null, false);
assert.strictEqual(res8a, "10% Deposit Bonus", "Test 8a Failed: Expected '10% Deposit Bonus'");
const res8b = config.resolveEventConfig("10% Deposit Bonus", "", true);
assert.strictEqual(res8b, "10% Deposit Bonus (VIP)", "Test 8b Failed: Expected '10% Deposit Bonus (VIP)'");
console.log("✅ Test 8 Passed: '10% Deposit Bonus' + null/empty resolves to legacy background");

// Test 9: Unknown Event returns null
const res9 = config.resolveEventConfig("Non Existent Campaign", "Unknown Type", false);
assert.strictEqual(res9, null, "Test 9 Failed: Expected null");
console.log("✅ Test 9 Passed: Unknown Event returns null");

// Verify all background configurations exist on disk
console.log("\nVerifying image background assets existence...");
const fs = require('fs');
const path = require('path');
const bgKeys = [
    "10% Deposit TradFi Bonus",
    "10% Deposit TradFi Bonus (VIP)",
    "10% Deposit Futures Bonus",
    "10% Deposit Futures Bonus (VIP)",
    "250% Deposit Bonus",
    "250% Deposit Bonus (VIP)",
    "10% Deposit Bonus",
    "10% Deposit Bonus (VIP)"
];

for (const key of bgKeys) {
    const bgConf = config.backgrounds[key];
    assert(bgConf, `Missing config for '${key}'`);
    for (const format of ['SignUp', 'Twitter']) {
        const fConf = bgConf[format];
        if (fConf) {
            const bgFile = typeof fConf === 'string' ? fConf : fConf.bg;
            const bgPath = path.join(__dirname, 'image-template', 'backgrounds', bgFile);
            assert(fs.existsSync(bgPath), `Missing background file '${bgFile}' at '${bgPath}'`);
            console.log(`✅ Asset verified for ${key} [${format}]: ${bgFile}`);
        }
    }
}

console.log("\n🎉 All 9 unit test suites and asset verifications passed successfully!");
