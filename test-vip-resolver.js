const assert = require('assert');
const { resolveVipLevel } = require('./index.js');
const config = require('./config.js');

console.log("=== VIP Dynamic Resolution Unit Tests ===\n");

const mockVipMap = {
    "opt_new_vip1": "VIP 1",
    "opt_new_vip4": "VIP 4",
    "opt_old_vip2": "VIP 2",
    "opt_old_vip5": "VIP 5"
};

// Test 1: Only New VIP system present as plain string
const rec1 = { vip_level: "VIP 3", vip_level_old: null, ticket_id: "TCK-001" };
assert.strictEqual(resolveVipLevel(rec1, mockVipMap), 3, "Test 1 Failed: Should parse plain new VIP string");
console.log("✅ Test 1 Passed: New VIP plain string ('VIP 3') => 3");

// Test 2: Only Old VIP system present as plain string (legacy KOL)
const rec2 = { vip_level: null, vip_level_old: "VIP 2", ticket_id: "TCK-002" };
assert.strictEqual(resolveVipLevel(rec2, mockVipMap), 2, "Test 2 Failed: Should resolve legacy VIP string");
console.log("✅ Test 2 Passed: Legacy VIP plain string ('VIP 2') => 2");

// Test 3: New VIP system present as Lark Option ID
const rec3 = { vip_level: "opt_new_vip4", vip_level_old: null, ticket_id: "TCK-003" };
assert.strictEqual(resolveVipLevel(rec3, mockVipMap), 4, "Test 3 Failed: Should map new option ID to tier");
console.log("✅ Test 3 Passed: New VIP Option ID ('opt_new_vip4') => 4");

// Test 4: Old VIP system present as Lark Option ID (legacy KOL)
const rec4 = { vip_level: null, vip_level_old: "opt_old_vip5", ticket_id: "TCK-004" };
assert.strictEqual(resolveVipLevel(rec4, mockVipMap), 5, "Test 4 Failed: Should map legacy option ID to tier");
console.log("✅ Test 4 Passed: Legacy VIP Option ID ('opt_old_vip5') => 5");

// Test 5: Both New and Old populated, New takes precedence
const rec5 = { vip_level: "VIP 4", vip_level_old: "VIP 2", ticket_id: "TCK-005" };
assert.strictEqual(resolveVipLevel(rec5, mockVipMap), 4, "Test 5 Failed: New VIP must take precedence over Old VIP");
console.log("✅ Test 5 Passed: Discrepancy handled (New 'VIP 4' vs Old 'VIP 2') => 4");

// Test 6: Neither populated (Non-VIP)
const rec6 = { vip_level: null, vip_level_old: null, ticket_id: "TCK-006" };
assert.strictEqual(resolveVipLevel(rec6, mockVipMap), 0, "Test 6 Failed: Missing VIP should resolve to 0");
console.log("✅ Test 6 Passed: Non-VIP record (both null) => 0");

// Test 7: Backward compatibility with vip_level_copy
const rec7 = { vip_level: null, vip_level_copy: "VIP 1", ticket_id: "TCK-007" };
assert.strictEqual(resolveVipLevel(rec7, mockVipMap), 1, "Test 7 Failed: vip_level_copy fallback should work");
console.log("✅ Test 7 Passed: Backward compatibility alias vip_level_copy ('VIP 1') => 1");

console.log("\n🎉 All 7 VIP Dynamic Resolution tests passed successfully!");
